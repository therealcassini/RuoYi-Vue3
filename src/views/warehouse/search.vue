<template>
  <div class="container">
    <!-- 左侧树形菜单 -->
    <div class="left-menu">
      <el-tree
          :data="treeData"
          :props="defaultProps"
          @node-click="handleNodeClick"
      />
    </div>

    <!-- 右侧内容区域 -->
    <div class="right-content">
      <!-- SQL 查询输入框 -->
      <div class="sql-input">
        <el-input
            v-model="sqlQuery"
            type="textarea"
            :rows="4"
            placeholder="Enter SQL query"
        />
        <el-button type="primary" @click="executeQuery" style="margin-top: 10px">
          执行
        </el-button>
      </div>

      <!-- 表格展示区域 -->
      <div class="table-area">
        <el-table
            :data="tableData"
            style="width: 100%"
            border
            stripe
            v-if="tableColumns.length > 0"
        >
          <el-table-column
              v-for="col in tableColumns"
              :key="col.field"
              :prop="col.field"
              :label="col.header"
          />
        </el-table>
        <div v-else>暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'App',
  setup() {
    // 树形菜单数据
    const treeData = ref([
      {
        label: 'library1',
        children: [
          { label: 'tableA' },
          { label: 'tableB' },
        ],
      },
      {
        label: 'library2',
        children: [
          { label: 'tableC' },
          { label: 'tableD' },
        ],
      },
    ]);

    const defaultProps = {
      children: 'children',
      label: 'label',
    };

    // SQL 查询输入框内容
    const sqlQuery = ref('');

    // 表格数据和列定义
    const tableData = ref([]);
    const tableColumns = ref([]);

    // 处理树节点点击事件
    const handleNodeClick = (node) => {
      if (node.children) return; // 如果是库节点，不处理
      const schemaName = node.parent.label; // 父节点是库
      const tableName = node.label; // 当前节点是表
      sqlQuery.value = `SELECT * FROM ${schemaName}.${tableName};`;
    };

    // 执行 SQL 查询
    const executeQuery = () => {
      axios
          .post('/execute-query', { query: sqlQuery.value })
          .then((response) => {
            tableData.value = response.data.rows;
            tableColumns.value = response.data.columns.map((column) => ({
              field: column,
              header: column,
            }));
          })
          .catch((error) => {
            console.error('查询失败:', error);
          });
    };

    return {
      treeData,
      defaultProps,
      sqlQuery,
      tableData,
      tableColumns,
      handleNodeClick,
      executeQuery,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.left-menu {
  width: 20%;
  padding: 10px;
  border-right: 1px solid #dcdfe6;
}

.right-content {
  width: 80%;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.sql-input {
  margin-bottom: 20px;
}

.table-area {
  flex: 1;
  overflow: auto;
}
</style>