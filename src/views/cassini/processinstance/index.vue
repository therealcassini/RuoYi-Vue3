<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入任务名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程定义ID" prop="processDefinitionId">
        <el-input
          v-model="queryParams.processDefinitionId"
          placeholder="请输入流程定义ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程实例状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功" prop="state">
        <el-select v-model="queryParams.state" placeholder="请选择流程实例状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功" clearable>
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
          v-hasPermi="['cassini:processinstance:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['cassini:processinstance:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['cassini:processinstance:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['cassini:processinstance:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="processinstanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务ID" align="center" prop="id" />
      <el-table-column label="任务名" align="center" prop="name" />
      <el-table-column label="流程定义ID" align="center" prop="processDefinitionId" />
      <el-table-column label="流程实例状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="running_status" :value="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" />
      <el-table-column label="结束时间" align="center" prop="endTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:processinstance:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:processinstance:remove']">删除</el-button>
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

    <!-- 添加或修改流程实例对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="processinstanceRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="任务名" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名" />
        </el-form-item>
        <el-form-item label="流程定义ID" prop="processDefinitionId">
          <el-input v-model="form.processDefinitionId" placeholder="请输入流程定义ID" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-input v-model="form.startTime" placeholder="请输入开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-input v-model="form.endTime" placeholder="请输入结束时间" />
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

<script setup name="Processinstance">
import { listProcessinstance, getProcessinstance, delProcessinstance, addProcessinstance, updateProcessinstance } from "@/api/cassini/processinstance";

const { proxy } = getCurrentInstance();
const { running_status } = proxy.useDict('running_status');

const processinstanceList = ref([]);
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
    processDefinitionId: null,
    state: null,
    startTime: null,
    endTime: null
  },
  rules: {
    name: [
      { required: true, message: "任务名不能为空", trigger: "blur" }
    ],
    processDefinitionId: [
      { required: true, message: "流程定义ID不能为空", trigger: "blur" }
    ],
    state: [
      { required: true, message: "流程实例状态: 0 - 提交成功, 1 - 运行中, 3 - 失败, 4 - 成功不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询流程实例列表 */
function getList() {
  loading.value = true;
  listProcessinstance(queryParams.value).then(response => {
    processinstanceList.value = response.rows;
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
    processDefinitionId: null,
    state: null,
    startTime: null,
    endTime: null
  };
  proxy.resetForm("processinstanceRef");
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
  title.value = "添加流程实例";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProcessinstance(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改流程实例";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["processinstanceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProcessinstance(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProcessinstance(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除流程实例编号为"' + _ids + '"的数据项？').then(function() {
    return delProcessinstance(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('cassini/processinstance/export', {
    ...queryParams.value
  }, `processinstance_${new Date().getTime()}.xlsx`)
}

getList();
</script>
