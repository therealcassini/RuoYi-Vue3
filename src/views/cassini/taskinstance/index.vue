<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="作业实例名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入作业实例名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作业定义ID" prop="taskDefinitionId">
        <el-input
          v-model="queryParams.taskDefinitionId"
          placeholder="请输入作业定义ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作业定义UUID" prop="taskDefinitionUuid">
        <el-input
          v-model="queryParams.taskDefinitionUuid"
          placeholder="请输入作业定义UUID"
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
      <el-form-item label="流程实例ID" prop="processInstanceId">
        <el-input
          v-model="queryParams.processInstanceId"
          placeholder="请输入流程实例ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功" prop="state">
        <el-select v-model="queryParams.state" placeholder="请选择任务状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功" clearable>
          <el-option
            v-for="dict in running_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-input
          v-model="queryParams.startTime"
          placeholder="请输入开始时间"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-input
          v-model="queryParams.endTime"
          placeholder="请输入结束时间"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作业执行主机地址" prop="host">
        <el-input
          v-model="queryParams.host"
          placeholder="请输入作业执行主机地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作业日志URL" prop="logsUrl">
        <el-input
          v-model="queryParams.logsUrl"
          placeholder="请输入作业日志URL"
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
          v-hasPermi="['cassini:taskinstance:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['cassini:taskinstance:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['cassini:taskinstance:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['cassini:taskinstance:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskinstanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="作业实例ID" align="center" prop="id" />
      <el-table-column label="作业实例名称" align="center" prop="name" />
      <el-table-column label="作业定义ID" align="center" prop="taskDefinitionId" />
      <el-table-column label="作业定义UUID" align="center" prop="taskDefinitionUuid" />
      <el-table-column label="作业类型" align="center" prop="taskType" />
      <el-table-column label="流程实例ID" align="center" prop="processInstanceId" />
      <el-table-column label="任务状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="running_status" :value="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" />
      <el-table-column label="结束时间" align="center" prop="endTime" />
      <el-table-column label="作业参数" align="center" prop="taskParams" />
      <el-table-column label="作业日志" align="center" prop="logs" />
      <el-table-column label="作业执行脚本" align="center" prop="script" />
      <el-table-column label="作业执行主机地址" align="center" prop="host" />
      <el-table-column label="作业日志URL" align="center" prop="logsUrl" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:taskinstance:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:taskinstance:remove']">删除</el-button>
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

    <!-- 添加或修改任务实例对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="taskinstanceRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="作业实例名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入作业实例名称" />
        </el-form-item>
        <el-form-item label="作业定义ID" prop="taskDefinitionId">
          <el-input v-model="form.taskDefinitionId" placeholder="请输入作业定义ID" />
        </el-form-item>
        <el-form-item label="作业定义UUID" prop="taskDefinitionUuid">
          <el-input v-model="form.taskDefinitionUuid" placeholder="请输入作业定义UUID" />
        </el-form-item>
        <el-form-item label="作业类型" prop="taskType">
          <el-input v-model="form.taskType" placeholder="请输入作业类型" />
        </el-form-item>
        <el-form-item label="流程实例ID" prop="processInstanceId">
          <el-input v-model="form.processInstanceId" placeholder="请输入流程实例ID" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-input v-model="form.startTime" placeholder="请输入开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-input v-model="form.endTime" placeholder="请输入结束时间" />
        </el-form-item>
        <el-form-item label="作业日志" prop="logs">
          <el-input v-model="form.logs" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="作业执行脚本" prop="script">
          <el-input v-model="form.script" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="作业执行主机地址" prop="host">
          <el-input v-model="form.host" placeholder="请输入作业执行主机地址" />
        </el-form-item>
        <el-form-item label="作业日志URL" prop="logsUrl">
          <el-input v-model="form.logsUrl" placeholder="请输入作业日志URL" />
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

<script setup name="Taskinstance">
import { listTaskinstance, getTaskinstance, delTaskinstance, addTaskinstance, updateTaskinstance } from "@/api/cassini/taskinstance";

const { proxy } = getCurrentInstance();
const { running_status } = proxy.useDict('running_status');

const taskinstanceList = ref([]);
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
    taskDefinitionId: null,
    taskDefinitionUuid: null,
    taskType: null,
    processInstanceId: null,
    state: null,
    startTime: null,
    endTime: null,
    taskParams: null,
    logs: null,
    script: null,
    host: null,
    logsUrl: null
  },
  rules: {
    name: [
      { required: true, message: "作业实例名称不能为空", trigger: "blur" }
    ],
    taskDefinitionId: [
      { required: true, message: "作业定义ID不能为空", trigger: "blur" }
    ],
    taskDefinitionUuid: [
      { required: true, message: "作业定义UUID不能为空", trigger: "blur" }
    ],
    taskType: [
      { required: true, message: "作业类型不能为空", trigger: "blur" }
    ],
    processInstanceId: [
      { required: true, message: "流程实例ID不能为空", trigger: "blur" }
    ],
    state: [
      { required: true, message: "任务状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询任务实例列表 */
function getList() {
  loading.value = true;
  listTaskinstance(queryParams.value).then(response => {
    taskinstanceList.value = response.rows;
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
    taskDefinitionId: null,
    taskDefinitionUuid: null,
    taskType: null,
    processInstanceId: null,
    state: null,
    startTime: null,
    endTime: null,
    taskParams: null,
    logs: null,
    script: null,
    host: null,
    logsUrl: null
  };
  proxy.resetForm("taskinstanceRef");
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
  title.value = "添加任务实例";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTaskinstance(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务实例";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["taskinstanceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTaskinstance(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTaskinstance(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除任务实例编号为"' + _ids + '"的数据项？').then(function() {
    return delTaskinstance(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('cassini/taskinstance/export', {
    ...queryParams.value
  }, `taskinstance_${new Date().getTime()}.xlsx`)
}

getList();
</script>
