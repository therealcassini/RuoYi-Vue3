<template>
  <div class="metadata-manager">
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
          <button class="add-btn" @click="showNewRow = true">新增字段</button>
        </div>
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
            <tr 
              v-for="(field, index) in currentFields" 
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
                <template v-if="editingIndex === index">
                  <input v-model="editingField.fieldName" placeholder="输入字段名称">
                </template>
                <template v-else>
                  {{ field.fieldName }}
                </template>
              </td>
              <td>
                <template v-if="editingIndex === index">
                  <input v-model="editingField.fieldChinese" placeholder="输入中文名称">
                </template>
                <template v-else>
                  {{ field.fieldChinese }}
                </template>
              </td>
              <td>
                <template v-if="editingIndex === index">
                  <select v-model="editingField.fieldType">
                    <option value="string">string</option>
                    <option value="int">int</option>
                    <option value="float">float</option>
                    <option value="boolean">boolean</option>
                  </select>
                </template>
                <template v-else>
                  {{ field.fieldType }}
                </template>
              </td>
              <td>
                <template v-if="editingIndex === index">
                  <button class="confirm-btn" @click="saveEdit">保存</button>
                  <button class="cancel-btn" @click="cancelEdit">取消</button>
                </template>
                <template v-else>
                  <button @click="startEdit(field, index)">修改</button>
                </template>
              </td>
            </tr>
            <tr v-if="showNewRow" class="new-row">
              <td>{{ currentFields.length + 1 }}</td>
              <td>
                <input v-model="newField.fieldName" placeholder="输入字段名称">
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
                <button class="confirm-btn" @click="addField">添加</button>
                <button class="cancel-btn" @click="cancelAdd">取消</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 添加提交按钮区域 -->
        <div class="submit-area">
          <button class="submit-btn" @click="submitTableData">
            提交表单
          </button>
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

<script setup name="MetaTable">
import { ref, computed } from 'vue'
import { listTables ,listTableFields ,addTable } from "@/api/cassini/tables.js"
const { proxy } = getCurrentInstance();

// 添加表列表状态
const tableList = ref()
//选中表的字段列表
const oldTableFields = ref([])
const currentFields = ref([])

listTables({tableType:"meta"}).then(res => {
  tableList.value = res.data
})

const selectedMenu = ref()

// 绑定一个点击选中的事件,查询 Field 信息保存到 fields里面
const handleClick = (table) => {
  selectedMenu.value = table
  console.log("当前选中了："+ selectedMenu.value )
  listTableFields({name:table}).then(res => {
    oldTableFields.value = res.data
    currentFields.value = oldTableFields.value
  });
}

const showNewRow = ref(false)
const draggedIndex = ref(null)

const newField = ref({
  fieldName: '',
  fieldChinese: '',
  fieldType: 'string'
})

// 添加编辑相关的状态
const editingIndex = ref(null)
const editingField = ref({
  fieldName: '',
  fieldChinese: '',
  fieldType: 'string'
})

// 开始编辑
const startEdit = (field, index) => {
  editingIndex.value = index
  editingField.value = { ...field }
  console.log("开始编辑："+ editingField.value, index)
}

// 保存编辑
const saveEdit = () => {
  if (!editingField.value.fieldName || !editingField.value.fieldChinese) {
    alert('请填写完整信息')
    return
  }

  // const fields = selectedMenu.value === 'ip' ? ipFields : personFields
  currentFields.value[editingIndex.value] = { ...editingField.value }
  cancelEdit()
}

// 取消编辑
const cancelEdit = () => {
  editingIndex.value = null
  editingField.value = {
    fieldName: '',
    fieldChinese: '',
    fieldType: 'string'
  }
}

// 修改原有的拖拽方法，增加编辑状态的判断
const dragStart = (e, index) => {
  if (editingIndex.value !== null) {
    e.preventDefault()
    return
  }
  draggedIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
}

const drop = (e, index) => {
  e.preventDefault()
  // const fields = selectedMenu.value === 'ip' ? ipFields : personFields
  const items = [...currentFields.value]
  const draggedItem = items[draggedIndex.value]
  
  // 删除拖动项
  items.splice(draggedIndex.value, 1)
  // 插入到新位置
  items.splice(index, 0, draggedItem)
  
  // 更新数组
  currentFields.value = items
  draggedIndex.value = null
}

const addField = () => {
  // 验证字段
  if (!newField.value.fieldChinese || !newField.value.fieldName) {
    alert('请填写完整信息')
    return
  }
  
  // 添加到对应的数组中
  currentFields.value.push({ ...newField.value })
  // 重置表单
  resetNewField()
}

const cancelAdd = () => {
  resetNewField()
}

const resetNewField = () => {
  newField.value = {
    fieldName: '',
    fieldChinese: '',
    fieldType: 'string'
  }
  showNewRow.value = false
}

// 新增表相关状态
const showAddTable = ref(false)
const newTableName = ref('')



// 取消新增表
const cancelAddTable = () => {
  showAddTable.value = false
  newTableName.value = ''
}

// 修改确认新增表方法
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

  
  // 选中新建的表
  selectedMenu.value = newTableName.value
  
  // 重置状态
  cancelAddTable()
}

// 修改提交表单数据方法
const submitTableData = async () => {
  try {
    const data = {
      name: selectedMenu.value,
      type: 'meta',
      tableFields: currentFields.value.map((field, index) => ({
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
.metadata-manager {
  display: flex;
  height: 85vh;
  padding: 12px;
  gap: 10px;
}

.left-panel {
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.panel-header {
  padding-top: 12px;
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
  padding: 10px;
  margin: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.active {
  border-color: #42b983;
  color: #30cfb7;
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

/* 新增拖拽相关样式 */
tr[draggable="true"] {
  cursor: move;
}

tr[draggable="true"]:hover {
  background-color: #f5f5f5;
}

tr.dragging {
  opacity: 0.5;
  background-color: #e9e9e9;
}

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

.add-btn {
  padding: 8px 16px;
}

.new-row input, .new-row select {
  width: 90%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.confirm-btn {
  margin-right: 8px;
}

.cancel-btn {
  background-color: #666;
}

.cancel-btn:hover {
  background-color: #555;
}

/* 添加编辑相关样式 */
.editing input, .editing select {
  width: 90%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

tr input, tr select {
  width: 90%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.submit-btn {
  padding: 10px 24px;
  font-size: 16px;
  background-color: #1e88e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background-color: #1976d2;
}

.submit-btn:active {
  transform: translateY(3px);
}
</style> 