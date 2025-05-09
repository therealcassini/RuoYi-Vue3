<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="作业名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入作业名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程ID" prop="processId">
        <el-input
          v-model="queryParams.processId"
          placeholder="请输入流程ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作业类型" prop="taskType">
        <el-input
          v-model="queryParams.taskType"
          placeholder="请输入作业类型"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务uuid" prop="uuid">
        <el-input
          v-model="queryParams.uuid"
          placeholder="请输入任务uuid"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['cassini:taskdefintion:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['cassini:taskdefintion:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['cassini:taskdefintion:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['cassini:taskdefintion:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskdefintionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="作业ID" align="center" prop="id" />
      <el-table-column label="作业名称" align="center" prop="name" />
      <el-table-column label="流程ID" align="center" prop="processId" />
      <el-table-column label="作业类型" align="center" prop="taskType" />
      <el-table-column label="作业参数" align="center" prop="taskParams" />
      <el-table-column label="任务uuid" align="center" prop="uuid" />
      <el-table-column label="作业脚本" align="center" prop="script" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:taskdefintion:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:taskdefintion:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改任务定义对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="taskdefintionRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="作业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入作业名称" />
        </el-form-item>
        <el-form-item label="流程ID" prop="processId">
          <el-input v-model="form.processId" placeholder="请输入流程ID" />
        </el-form-item>
        <el-form-item label="作业类型" prop="taskType">
          <el-input v-model="form.taskType" placeholder="请输入作业类型" />
        </el-form-item>
        <el-form-item label="作业参数" prop="taskParams">
          <el-input v-model="form.taskParams" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="任务uuid" prop="uuid">
          <el-input v-model="form.uuid" placeholder="请输入任务uuid" />
        </el-form-item>
        <el-form-item label="作业脚本" prop="script">
          <el-input v-model="form.script" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Taskdefintion">
import { listTaskdefinition, getTaskdefinition, delTaskdefintion, addTaskdefinition, updateTaskdefinition } from "@/api/cassini/taskdefinition.js";

const { proxy } = getCurrentInstance();

const taskdefintionList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    processId: null,
    taskType: null,
    taskParams: null,
    uuid: null,
    script: null
  },
  rules: {
    name: [
      { required: true, message: "作业名称不能为空", trigger: "blur" }
    ],
    processId: [
      { required: true, message: "流程ID不能为空", trigger: "blur" }
    ],
    taskType: [
      { required: true, message: "作业类型不能为空", trigger: "blur" }
    ],
    uuid: [
      { required: true, message: "任务uuid不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询任务定义列表 */
function getList() {
  loading.value = true;
  listTaskdefintion(queryParams.value).then(response => {
    taskdefintionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    processId: null,
    taskType: null,
    taskParams: null,
    uuid: null,
    script: null
  };
  proxy.resetForm("taskdefintionRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加任务定义";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTaskdefintion(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务定义";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["taskdefintionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTaskdefintion(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTaskdefintion(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除任务定义编号为"' + _ids + '"的数据项？').then(function() {
    return delTaskdefintion(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('cassini/taskdefintion/export', {
    ...queryParams.value
  }, `taskdefintion_${new Date().getTime()}.xlsx`)
}

getList();
</script>
