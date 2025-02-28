<template>
  <div class="user-field-manager">
    <div class="left-panel">
      <div class="panel-header">
        <button class="add-table-btn" @click="showAddTable = true">
          <span class="plus-icon">+</span>
          新增表
        </button>
      </div>
      <div class="menu-list">
        <div
            v-for="table in tableList"
            :key="table"
            :class="['menu-item', selectedMenu === table ? 'active' : '']"
            @click="handleClick(table)"
        >
          {{ table }}
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="field-table">
        <div class="table-header">
          <h3>{{ selectedMenu }}字段列表</h3>
          <div class="button-group">
            <button class="add-btn" @click="showNewField = true" >新增字段</button>

            <!-- 字典字段新增 -->
            <div class="field-selector">
              <button class="add-btn dictionary-btn" @click="toggleTreeSelect">
                新增字典字段
              </button>

              <!-- 树形选择下拉框 -->
              <div v-if="showTreeSelect" class="dropdown-tree">
                <div class="search-box">
                  <input
                      type="text"
                      placeholder="搜索字段"
                      v-model="searchText"
                      @click.stop
                  >
                </div>
                <div class="tree-wrapper">
                  <!-- 加载状态 -->
                  <div v-if="loading" class="loading-state">
                    加载中...
                  </div>

                  <!-- 错误状态 -->
                  <div v-else-if="error" class="error-state">
                    {{ error }}
                    <button @click="fetchDictionaryFields">重试</button>
                  </div>

                  <!-- 字典字段树 -->
                  <template v-else>
                    <div
                        v-for="group in dictionaryFields"
                        :key="group.name"
                        class="tree-node"
                    >
                      <div class="node-content parent-node" @click="toggleNode(group.name)">
                        <input
                            type="checkbox"
                            v-model="parentNodes[group.name]"
                            @change="handleParentSelect(group.name)"
                            @click.stop
                        >
                        <span class="node-label">{{ group.name }}</span>
                      </div>

                      <transition name="slide">
                        <div v-if="expandedNodes.includes(group.name)" class="node-children">
                          <div
                              v-for="field in group.tableFields"
                              :key="field.fieldName"
                              class="tree-node"
                          >
                            <div class="node-content">
                              <input
                                  type="checkbox"
                                  v-model="selectedFields[field.fieldName]"
                                  @change="handleFieldSelect(field.fieldName, group.name, field.fieldChinese, field.fieldType)"
                              >
                              <span>{{ field.fieldName }}</span>
                            </div>
                          </div>
                        </div>
                      </transition>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 字段表格 -->
        <table>
          <thead>
          <tr>
            <th style="width: 10%">序号</th>
            <th style="width: 30%">字段名称</th>
            <th style="width: 30%">字段中文</th>
            <th style="width: 20%">字段类型</th>
            <th style="width: 10%">操作</th>
          </tr>
          </thead>
          <tbody>
          <!-- 现有字段列表 -->
          <tr
              v-for="(field, index) in tableFields"
              :key="field.fieldName"
              draggable="true"
              @dragstart="dragStart($event, index)"
              @dragover.prevent
              @dragenter.prevent
              @drop="drop($event, index)"
              :class="{ 'dragging': draggedIndex === index }"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <div class="field-content">
                <span class="drag-handle">⋮⋮</span>
                {{ field.fieldName }}
              </div>
            </td>
            <td>{{ field.fieldChinese }}</td>
            <td>{{ field.fieldType }}</td>
            <td>
              <button class="delete-btn" @click="removeField(field)">删除</button>
            </td>
          </tr>

          <!-- 新增字段输入行 -->
          <tr v-if="showNewField" class="new-field-row">
            <td>{{ tableFields.length + 1 }}</td>
            <td>
              <div class="field-content">
                <span class="drag-handle disabled">⋮⋮</span>
                <input v-model="newField.fieldName" placeholder="输入字段名称">
              </div>
            </td>
            <td>
              <input v-model="newField.fieldChinese" placeholder="输入中文名称">
            </td>
            <td>
              <select v-model="newField.fieldType">
                <option value="string">string</option>
                <option value="int">int</option>
                <option value="float">float</option>
                <option value="boolean">boolean</option>
              </select>
            </td>
            <td>
              <div class="action-buttons">
                <button class="confirm-btn" @click="addNewField">添加</button>
                <button class="cancel-btn" @click="showNewField = false">取消</button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 添加提交按钮区域 -->
        <div class="submit-area">
          <el-button type="primary" @click="submitTableData">
            提交表单
          </el-button>
        </div>
      </div>
    </div>

    <!-- 新增表弹窗 -->
    <div v-if="showAddTable" class="modal-overlay" @click="cancelAddTable">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增表</h3>
          <button class="close-btn" @click="cancelAddTable">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label>表名称：</label>
            <input
                v-model="newTableName"
                placeholder="请输入表名称"
                @keyup.enter="confirmAddTable"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="cancelAddTable">取消</button>
          <button class="confirm-btn" @click="confirmAddTable">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="UserTable">
import { ref, onMounted, onUnmounted } from 'vue'
import { listTableFields, addTable ,listTables, metaTableTree} from '@/api/cassini/tables'
const { proxy } = getCurrentInstance();

const showTreeSelect = ref(false)
const expandedNodes = ref([])
const selectedFields = ref({})
const tableFields = ref([])
const searchText = ref('')
const draggedIndex = ref(null)

// 添加新字段相关的状态
const showNewField = ref(false)
const newField = ref({
  fieldName: '',
  fieldChinese: '',
  fieldType: 'string'
})

// 添加父节点选中状态
const parentNodes = ref({})

// 字典字段数据状态
const dictionaryFields = ref([])
const loading = ref(false)
const error = ref(null)


// 切换树节点展开/收起
const toggleNode = (nodeKey) => {
  const index = expandedNodes.value.indexOf(nodeKey)
  if (index === -1) {
    expandedNodes.value.push(nodeKey)
  } else {
    expandedNodes.value.splice(index, 1)
  }
}

// 处理父节点选择
// const handleParentSelect = (nodeKey) => {
//   const fields = nodeKey === 'ip' ? ipFields : personFields
//   const checked = parentNodes.value[nodeKey]
//
//   // 更新所有子节点的选中状态
//   fields.forEach(field => {
//     selectedFields.value[field.name] = checked
//     if (checked) {
//       // 如果是选中，添加到表格
//       handleFieldSelect(field.name, nodeKey === 'ip' ? 'IP五元组' : '人员字段', field.label, field.type)
//     } else {
//       // 如果是取消选中，从表格中移除
//       const index = tableFields.value.findIndex(f => f.fieldName === field.name)
//       if (index !== -1) {
//         tableFields.value.splice(index, 1)
//       }
//     }
//   })
// }


// 处理父节点选择
const handleParentSelect = (nodeKey) => {
  // 查找对应的组
  const group = dictionaryFields.value.find(group => group.name === nodeKey);
  const checked = parentNodes.value[nodeKey];

  if (!group) return; // 如果没有找到对应的组，直接返回

  // 更新所有子节点的选中状态
  group.tableFields.forEach(field => {
    selectedFields.value[field.fieldName] = checked; // 更新选中状态
    if (checked) {
      // 如果是选中，添加到表格
      handleFieldSelect(field.fieldName, group.name, field.fieldChinese, field.fieldType);
    } else {
      // 如果是取消选中，从表格中移除
      const index = tableFields.value.findIndex(f => f.fieldName === field.fieldName);
      if (index !== -1) {
        tableFields.value.splice(index, 1);
      }
    }
  });
}


// 更新字段选择处理方法
const handleFieldSelect = (fieldName, group, fieldChinese, fieldType) => {
  if (selectedFields.value[fieldName]) {
    const field = { fieldName, group, fieldChinese, fieldType }
    if (!tableFields.value.find(f => f.fieldName === fieldName)) {
      tableFields.value.push(field)
    }
  } else {
    const index = tableFields.value.findIndex(f => f.fieldName === fieldName)
    if (index !== -1) {
      tableFields.value.splice(index, 1)
    }
  }
}

// 更新父节点状态


// 切换树形选择器显示状态
const toggleTreeSelect = () => {
  showTreeSelect.value = !showTreeSelect.value
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const selector = document.querySelector('.field-selector')
  if (selector && !selector.contains(event.target)) {
    showTreeSelect.value = false
  }
}

// 获取字典字段数据
const fetchDictionaryFields = async () => {
 alert("别重试了，你不行的老弟")
}




// 组件挂载时获取数据
onMounted(() => {
  metaTableTree().then(
      res => {
        dictionaryFields.value = res.data
        res.data.forEach(item => {
          parentNodes.value[item.name] = false
        })
      }
  )
  document.addEventListener('click', handleClickOutside)
})

// 卸载时移除点击事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 移除字段
const removeField = (field) => {
  const index = tableFields.value.findIndex(f => f.fieldName === field.fieldName)
  if (index !== -1) {
    tableFields.value.splice(index, 1)
    selectedFields.value[field.fieldName] = false
  }
}

// 开始拖拽
const dragStart = (e, index) => {
  draggedIndex.value = index
  e.target.classList.add('dragging')
  // 设置拖拽效果
  e.dataTransfer.effectAllowed = 'move'
}

// 处理放置
const drop = (e, index) => {
  e.preventDefault()
  const items = [...tableFields.value]
  const draggedItem = items[draggedIndex.value]

  // 删除拖动项
  items.splice(draggedIndex.value, 1)
  // 插入到新位置
  items.splice(index, 0, draggedItem)

  // 更新数组
  tableFields.value = items

  // 更新选中状态
  const newSelectedFields = {}
  items.forEach(item => {
    newSelectedFields[item.fieldName] = true
  })
  selectedFields.value = newSelectedFields

  draggedIndex.value = null
  e.target.classList.remove('dragging')
}

// 添加新字段
const addNewField = () => {
  if (!newField.value.fieldName || !newField.value.fieldChinese) {
    alert('请填写完整信息')
    return
  }

  if (tableFields.value.some(f => f.fieldName === newField.value.fieldName)) {
    alert('字段名已存在')
    return
  }

  tableFields.value.push({...newField.value})
  resetNewField()
}

// 重置新增字段状态
const resetNewField = () => {
  newField.value = {
    fieldName: '',
    fieldChinese: '',
    fieldType: 'string'
  }
  showNewField.value = false
}

// 新增表相关状态
const showAddTable = ref(false)
const newTableName = ref('')

// 添加表列表状态
const tableList = ref([])


listTables({tableType:"user"}).then(res => {
  tableList.value = res.data
})

const selectedMenu = ref('')
// 绑定一个点击选中的事件,查询 Field 信息保存到 fields里面
const handleClick = (table) => {
  selectedMenu.value = table
  console.log("当前选中了："+ selectedMenu.value )
  listTableFields({name:table}).then(res => {
    tableFields.value = res.data
  });
}

// 取消新增表
const cancelAddTable = () => {
  showAddTable.value = false
  newTableName.value = ''
}

// 确认新增表
const confirmAddTable = () => {
  if (!newTableName.value.trim()) {
    alert('请输入表名称')
    return
  }

  // 检查表名是否重复
  if (tableList.value.includes(newTableName.value)) {
    alert('表名已存在')
    return
  }

  // 添加新表到菜单列表
  tableList.value.push(newTableName.value)

  // 清空右侧列表
  tableFields.value = []
  selectedFields.value = {}

  // 重置状态
  cancelAddTable()
}

// 提交表单数据
const submitTableData = async () => {
  try {
    const data = {
      name: selectedMenu.value,
      type: 'user',
      tableFields: tableFields.value.map((field, index) => ({
        fieldIndex: index + 1,
        fieldName: field.fieldName,
        fieldChinese: field.fieldChinese,
        fieldType: field.fieldType
      }))
    }
    console.log('提交的数据:', JSON.stringify(data, null, 2))
    //添加数据到数据库中
    await addTable(data)
    proxy.$modal.msgSuccess("针对用户表结构修改成功");
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败: ' + error.message)
  }
}
</script>

<style scoped>
.user-field-manager {
  display: flex;
  //height: 80vh;
  overflow: auto;
  padding: 10px;
  gap: 10px;
}

.left-panel {
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.add-table-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.add-table-btn:hover {
  background-color: #3aa876;
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.menu-list {
  padding-top: 8px;
}

.menu-item {
  font-weight: 200;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.active {
  background-color: #e8f5e9;
  color: #42b983;
  margin: 0px 0px 0px 10px;
}

.right-panel {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.field-selector {
  position: relative;
}

.add-btn {
  display: inline-block;
  padding: 8px 16px;
}

.dropdown-tree {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 1px solid #eee;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.tree-wrapper {
  padding: 12px;
  overflow-y: auto;
  max-height: 400px;
}

/* 更新树节点样式 */
.tree-node {
  margin: 4px 0;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.node-content:hover {
  background-color: #f5f5f5;
}

.parent-node {
  font-weight: 500;
}

.expand-icon {
  display: none;
}

.node-label {
  flex: 1;
  user-select: none;
}

input[type="checkbox"] {
  cursor: pointer;
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}

/* 按钮样式 */
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}

.delete-btn {
  background-color: #ff4444;
}

.delete-btn:hover {
  background-color: #cc0000;
}

/* 添加拖拽相关样式 */
tr[draggable="true"] {
  cursor: move;
}

tr[draggable="true"]:hover {
  background-color: #f8f8f8;
}

tr.dragging {
  opacity: 0.5;
  background-color: #f0f0f0;
}

.field-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  color: #999;
  cursor: move;
  user-select: none;
  font-size: 16px;
  line-height: 1;
}

/* 拖拽时的视觉反馈 */
tr[draggable="true"]:hover .drag-handle {
  color: #666;
}

/* 拖拽过程中的样式 */
tbody tr.dragging {
  background-color: #f5f5f5;
  opacity: 0.5;
}

tbody tr.drag-over {
  border-top: 2px solid #42b983;
}

/* 优化表格样式 */
td {
  transition: all 0.2s;
}

tr:hover td {
  background-color: #f8f8f8;
}

/* 动画效果 */
@keyframes dropHighlight {
  from {
    background-color: #e8f5e9;
  }
  to {
    background-color: transparent;
  }
}

tr:not(.dragging) {
  animation: dropHighlight 1s ease;
}

/* 添加新样式 */
.button-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.field-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.field-input input,
.field-input select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.field-input input {
  width: 150px;
}

.field-input select {
  width: 100px;
}

.dictionary-btn {
  background-color: #1e88e5;
}

.dictionary-btn:hover {
  background-color: #1976d2;
}

/* 调整按钮样式 */
.add-btn {
  white-space: nowrap;
}

.confirm-btn {
  background-color: #42b983;
}

.cancel-btn {
  background-color: #666;
}

.confirm-btn:hover {
  background-color: #3aa876;
}

.cancel-btn:hover {
  background-color: #555;
}

/* 输入框焦点样式 */
.field-input input:focus,
.field-input select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

/* 新增字段行样式优化 */
.new-field-row {
  background-color: #f8f8f8;
}

.new-field-row td {
  padding: 4px 8px;
}

.new-field-row input,
.new-field-row select {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: white;
  transition: all 0.2s;
}

.new-field-row .field-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-field-row .drag-handle.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.new-field-row input:focus,
.new-field-row select:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.new-field-row select {
  cursor: pointer;
  appearance: none;
  padding-right: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.new-field-row .action-buttons {
  display: flex;
  gap: 8px;
}

.new-field-row .confirm-btn,
.new-field-row .cancel-btn {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 输入框占位符样式 */
.new-field-row input::placeholder {
  color: #999;
  font-size: 14px;
}

/* 表格整体样式优化 */
td {
  height: 48px; /* 统一行高 */
  vertical-align: middle;
}

.field-content {
  height: 32px; /* 与输入框高度保持一致 */
  line-height: 32px;
}

/* 移除相关样式 */
.arrow {
  display: none;
}

/* 调整节点内容的间距 */
.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px; /* 增加左侧内边距 */
}

.node-children {
  margin-left: 28px; /* 调整子节点缩进 */
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-item label {
  width: 70px;
  color: #666;
}

.form-item input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item input:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 提交按钮区域样式 */
.submit-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #eee;
}



/* 添加加载和错误状态样式 */
.loading-state,
.error-state {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error-state {
  color: #cc0000;
}

.error-state button {
  margin-top: 8px;
  padding: 4px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
}

.error-state button:hover {
  background-color: #e8e8e8;
}
</style> 