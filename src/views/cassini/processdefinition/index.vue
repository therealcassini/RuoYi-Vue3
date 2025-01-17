<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入任务名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="定时表达式" prop="cron">
        <el-input
            v-model="queryParams.cron"
            placeholder="请输入定时表达式"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下次执行时间" prop="nextScheduleTime">
        <el-input
            v-model="queryParams.nextScheduleTime"
            placeholder="请输入下次执行时间"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否上线" prop="onlineFlag">
        <el-select v-model="queryParams.onlineFlag" placeholder="请选择是否上线" clearable style="width: 150px">
          <el-option
              v-for="dict in approve_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"

          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否删除" prop="boolDelete">
        <el-select v-model="queryParams.boolDelete" placeholder="请选择是否删除" clearable style="width: 120px">
          <el-option
              v-for="dict in delete_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"

          />
        </el-select>
      </el-form-item>
      <el-form-item label="定时开始时间" prop="startTime">
        <el-date-picker clearable
                        v-model="queryParams.startTime"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择定时开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="定时结束时间" prop="endTime">
        <el-date-picker clearable
                        v-model="queryParams.endTime"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择定时结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-input
            v-model="queryParams.creator"
            placeholder="请输入创建人"
            clearable
            @keyup.enter="handleQuery"
        />
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
            v-hasPermi="['cassini:processdefintion:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['cassini:processdefintion:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['cassini:processdefintion:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['cassini:processdefintion:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="processdefinitionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务ID" align="center" prop="id" />
      <el-table-column label="任务名称" align="center" prop="name" />
      <el-table-column label="定时表达式" align="center" prop="cron" />
      <el-table-column label="下次执行时间" align="center" prop="nextScheduleTime" />
      <el-table-column label="任务JSON" align="center" prop="processJson" :show-overflow-tooltip="true" />
      <el-table-column label="任务描述" align="center" prop="description" />
      <el-table-column label="是否上线" align="center" prop="onlineFlag">
        <template #default="scope">
          <dict-tag :options="approve_status" :value="scope.row.onlineFlag"/>
        </template>
      </el-table-column>
      <el-table-column label="是否删除" align="center" prop="boolDelete">
        <template #default="scope">
          <dict-tag :options="delete_status" :value="scope.row.boolDelete"/>
        </template>
      </el-table-column>
      <el-table-column label="定时开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="定时结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="creator" />
<!--      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">-->
<!--        <template #default="scope">-->
<!--          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:processdefintion:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:processdefintion:remove']">删除</el-button>
<!--          <el-button link type="primary" icon="Edit" @click="handleDraw(scope.row)" v-hasPermi="['cassini:processdefintion:draw']">流程图编辑</el-button>-->
<!--          <div style="float: right;">-->
<!--            <router-link class="link-type" :to="'/register'">立即注册</router-link>-->
<!--            <router-link class="link-type" :to="'/scheduler/processdefintion/index'">查看新页面</router-link>-->
<!--            <router-link class="link-type" :to="'/scheduler/processdefintion/draw'">画图</router-link>-->
<!--            <router-link class="link-type" :to="'/processdefintion/draw'">第二个画图</router-link>-->
<!--          </div>-->
          <el-button link type="primary" icon="Edit" @click="handleDraw(scope.row)" v-hasPermi="['cassini:processdefintion:draw']">流程图编辑</el-button>
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

    <!-- 添加或修改任务管理对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="processdefinitionRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="定时表达式" prop="cron">
          <el-input v-model="form.cron" placeholder="请输入定时表达式" />
        </el-form-item>
        <el-form-item label="下次执行时间" prop="nextScheduleTime">
          <el-input v-model="form.nextScheduleTime" placeholder="请输入下次执行时间" />
        </el-form-item>
        <el-form-item label="任务JSON" prop="processJson">
          <el-input v-model="form.processJson" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="是否上线" prop="onlineFlag">
          <el-radio-group v-model="form.onlineFlag">
            <el-radio
                v-for="dict in approve_status"
                :key="dict.value"
                :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否删除" prop="boolDelete">
          <el-radio-group v-model="form.boolDelete">
            <el-radio
                v-for="dict in delete_status"
                :key="dict.value"
                :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="定时开始时间" prop="startTime">
          <el-date-picker clearable
                          v-model="form.startTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择定时开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="定时结束时间" prop="endTime">
          <el-date-picker clearable
                          v-model="form.endTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择定时结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="创建人" prop="creator">
          <el-input v-model="form.creator" placeholder="请输入创建人" />
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

<script setup name="Processdefinition">
import { listProcessdefinition, getProcessdefinition, delProcessdefinition, addProcessdefinition, updateProcessdefinition } from "@/api/cassini/processdefinition";
import {processdraw} from '@/api/cassini/processdraw';
import {useRoute, useRouter} from "vue-router";
const router = useRouter()

const { proxy } = getCurrentInstance();
const { delete_status, approve_status } = proxy.useDict('delete_status', 'approve_status');

const processdefinitionList = ref([]);
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
    cron: null,
    nextScheduleTime: null,
    processJson: null,
    description: null,
    onlineFlag: null,
    boolDelete: null,
    startTime: null,
    endTime: null,
    creator: null,
    createdAt: null,
    updatedAt: null
  },
  rules: {
    name: [
      { required: true, message: "任务名称不能为空", trigger: "blur" }
    ],
    creator: [
      { required: true, message: "创建人不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询任务管理列表 */
function getList() {
  loading.value = true;
  listProcessdefinition(queryParams.value).then(response => {
    processdefinitionList.value = response.rows;
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
    cron: null,
    nextScheduleTime: null,
    processJson: null,
    description: null,
    onlineFlag: null,
    boolDelete: null,
    startTime: null,
    endTime: null,
    creator: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("processdefinitionRef");
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
  title.value = "添加任务管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProcessdefinition(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务管理";
  });
}


/** 修改按钮操作 */
function handleDraw(row) {
  router.push({path:"/processDefinition/draw", query:{id:row.id}})
}





/** 提交按钮 */
function submitForm() {
  proxy.$refs["processdefinitionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProcessdefinition(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProcessdefinition(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除任务管理编号为"' + _ids + '"的数据项？').then(function() {
    return delProcessdefinition(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('cassini/processdefintion/export', {
    ...queryParams.value
  }, `processdefinition_${new Date().getTime()}.xlsx`)
}

getList();
</script>

