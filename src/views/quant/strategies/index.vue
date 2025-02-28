<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="策略描述" prop="strategyDescription">
        <el-input
            v-model="queryParams.strategyDescription"
            placeholder="请输入策略描述"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="倍数" prop="leverage">
        <el-input
            v-model="queryParams.leverage"
            placeholder="请输入倍数"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下跌百分比" prop="dropPercentage">
        <el-input
            v-model="queryParams.dropPercentage"
            placeholder="请输入下跌百分比"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上涨百分比" prop="risePercentage">
        <el-input
            v-model="queryParams.risePercentage"
            placeholder="请输入上涨百分比"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下单金额" prop="orderAmount">
        <el-input
            v-model="queryParams.orderAmount"
            placeholder="请输入下单金额"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="预期收益" prop="expectedProfit">
        <el-input
            v-model="queryParams.expectedProfit"
            placeholder="请输入预期收益"
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
            v-hasPermi="['quant:strategies:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['quant:strategies:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['quant:strategies:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['quant:strategies:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="strategiesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="自增ID" align="center" prop="id" />
      <el-table-column label="策略描述" align="center" prop="strategyDescription" />
      <el-table-column label="倍数" align="center" prop="leverage" />
      <el-table-column label="下跌百分比" align="center" prop="dropPercentage" />
      <el-table-column label="上涨百分比" align="center" prop="risePercentage" />
      <el-table-column label="下单金额" align="center" prop="orderAmount" />
      <el-table-column label="预期收益" align="center" prop="expectedProfit" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['quant:strategies:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['quant:strategies:remove']">删除</el-button>
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

    <!-- 添加或修改下单策略对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="strategiesRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="策略描述" prop="strategyDescription">
          <el-input v-model="form.strategyDescription" placeholder="请输入策略描述" />
        </el-form-item>
        <el-form-item label="倍数" prop="leverage">
          <el-input v-model="form.leverage" placeholder="请输入倍数" />
        </el-form-item>
        <el-form-item label="下跌百分比" prop="dropPercentage">
          <el-input v-model="form.dropPercentage" placeholder="请输入下跌百分比" />
        </el-form-item>
        <el-form-item label="上涨百分比" prop="risePercentage">
          <el-input v-model="form.risePercentage" placeholder="请输入上涨百分比" />
        </el-form-item>
        <el-form-item label="下单金额" prop="orderAmount">
          <el-input v-model="form.orderAmount" placeholder="请输入下单金额" />
        </el-form-item>
        <el-form-item label="预期收益" prop="expectedProfit">
          <el-input v-model="form.expectedProfit" placeholder="请输入预期收益" />
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

<script setup name="Strategies">
import { listStrategies, getStrategies, delStrategies, addStrategies, updateStrategies } from "@/api/quant/strategies";

const { proxy } = getCurrentInstance();

const strategiesList = ref([]);
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
    strategyDescription: null,
    leverage: null,
    dropPercentage: null,
    risePercentage: null,
    orderAmount: null,
    expectedProfit: null
  },
  rules: {
    strategyDescription: [
      { required: true, message: "策略描述不能为空", trigger: "blur" }
    ],
    leverage: [
      { required: true, message: "倍数不能为空", trigger: "blur" }
    ],
    dropPercentage: [
      { required: true, message: "下跌百分比不能为空", trigger: "blur" }
    ],
    risePercentage: [
      { required: true, message: "上涨百分比不能为空", trigger: "blur" }
    ],
    orderAmount: [
      { required: true, message: "下单金额不能为空", trigger: "blur" }
    ],
    expectedProfit: [
      { required: true, message: "预期收益不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询下单策略列表 */
function getList() {
  loading.value = true;
  listStrategies(queryParams.value).then(response => {
    strategiesList.value = response.rows;
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
    strategyDescription: null,
    leverage: null,
    dropPercentage: null,
    risePercentage: null,
    orderAmount: null,
    expectedProfit: null
  };
  proxy.resetForm("strategiesRef");
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
  title.value = "添加下单策略";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getStrategies(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改下单策略";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["strategiesRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStrategies(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStrategies(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除下单策略编号为"' + _ids + '"的数据项？').then(function() {
    return delStrategies(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('quant/strategies/export', {
    ...queryParams.value
  }, `strategies_${new Date().getTime()}.xlsx`)
}

getList();
</script>
