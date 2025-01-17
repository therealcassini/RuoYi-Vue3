<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="算子名称" prop="operatorName">
        <el-input
            v-model="queryParams.operatorName"
            placeholder="请输入算子名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="算子分类" prop="operatorCategory" >
        <el-select v-model="queryParams.operatorCategory" placeholder="选择算子分类" clearable style="width: 200px">
          <el-option
              v-for="dict in operator_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-input
            v-model="queryParams.creator"
            placeholder="请输入创建人"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审批状态" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" placeholder="请选择审批状态" clearable style="width: 150px">
          <el-option
              v-for="dict in approve_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdAt">
        <el-date-picker clearable
                        v-model="queryParams.createdAt"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间" prop="updatedAt">
        <el-date-picker clearable
                        v-model="queryParams.updatedAt"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择更新时间">
        </el-date-picker>
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
            v-hasPermi="['cassini:operatordefinition:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['cassini:operatordefinition:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['cassini:operatordefinition:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['cassini:operatordefinition:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="operatordefinitionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="自增ID" align="center" prop="id" />
      <el-table-column label="算子名称" align="center" prop="operatorName" />
      <el-table-column label="算子描述" align="center" prop="operatorDescription" />
      <el-table-column label="算子图标URL" align="center" prop="operatorIconUrl" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.operatorIconUrl" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="算子脚本模板" align="center" prop="operatorScriptTemplate" />
      <el-table-column label="算子分类" align="center" prop="operatorCategory">
        <template #default="scope">
          <dict-tag :options="operator_type" :value="scope.row.operatorCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="creator" />
      <el-table-column label="审批状态" align="center" prop="approvalStatus">
        <template #default="scope">
          <dict-tag :options="approve_status" :value="scope.row.approvalStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:operatordefinition:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:operatordefinition:remove']">删除</el-button>
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

    <!-- 添加或修改算子模板定义对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="operatordefinitionRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="算子名称" prop="operatorName">
          <el-input v-model="form.operatorName" placeholder="请输入算子名称" />
        </el-form-item>
        <el-form-item label="算子描述" prop="operatorDescription">
          <el-input v-model="form.operatorDescription" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="算子图标URL" prop="operatorIconUrl">
          <image-upload v-model="form.operatorIconUrl"/>
        </el-form-item>
        <el-form-item label="算子脚本模板" prop="operatorScriptTemplate">
          <el-input v-model="form.operatorScriptTemplate" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="算子分类" prop="operatorCategory" >
          <el-select v-model="form.operatorCategory" placeholder="请选择算子分类">
            <el-option
                v-for="dict in operator_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
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

<script setup name="Operatordefinition">
import { listOperatordefinition, getOperatordefinition, delOperatordefinition, addOperatordefinition, updateOperatordefinition } from "@/api/cassini/operatordefinition";

const { proxy } = getCurrentInstance();
const { operator_type, approve_status } = proxy.useDict('operator_type', 'approve_status');

const operatordefinitionList = ref([]);
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
    operatorName: null,
    operatorDescription: null,
    operatorIconUrl: null,
    operatorScriptTemplate: null,
    operatorCategory: null,
    creator: null,
    approvalStatus: null,
    createdAt: null,
    updatedAt: null
  },
  rules: {
    operatorName: [
      { required: true, message: "算子名称不能为空", trigger: "blur" }
    ],
    operatorCategory: [
      { required: true, message: "算子分类不能为空", trigger: "change" }
    ],
    creator: [
      { required: true, message: "创建人不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询算子模板定义列表 */
function getList() {
  loading.value = true;
  listOperatordefinition(queryParams.value).then(response => {
    operatordefinitionList.value = response.rows;
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
    operatorName: null,
    operatorDescription: null,
    operatorIconUrl: null,
    operatorScriptTemplate: null,
    operatorCategory: null,
    creator: null,
    approvalStatus: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("operatordefinitionRef");
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
  title.value = "添加算子模板定义";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOperatordefinition(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改算子模板定义";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["operatordefinitionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOperatordefinition(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOperatordefinition(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除算子模板定义编号为"' + _ids + '"的数据项？').then(function() {
    return delOperatordefinition(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('cassini/operatordefinition/export', {
    ...queryParams.value
  }, `operatordefinition_${new Date().getTime()}.xlsx`)
}

getList();
</script>
