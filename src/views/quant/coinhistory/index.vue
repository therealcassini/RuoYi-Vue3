<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="交易金额" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入交易金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最终价格" prop="finalPrice">
        <el-input
          v-model="queryParams.finalPrice"
          placeholder="请输入最终价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数量" prop="dealCount">
        <el-input
          v-model="queryParams.dealCount"
          placeholder="请输入数量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最高价" prop="high">
        <el-input
          v-model="queryParams.high"
          placeholder="请输入最高价"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最低价" prop="low">
        <el-input
          v-model="queryParams.low"
          placeholder="请输入最低价"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大跌幅百分比" prop="maxDownPrecent">
        <el-input
          v-model="queryParams.maxDownPrecent"
          placeholder="请输入最大跌幅百分比"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大幅度百分比" prop="maxPrecent">
        <el-input
          v-model="queryParams.maxPrecent"
          placeholder="请输入最大幅度百分比"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大涨幅百分比" prop="maxUpPrecent">
        <el-input
          v-model="queryParams.maxUpPrecent"
          placeholder="请输入最大涨幅百分比"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="币种名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入币种名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="初始价格" prop="initialPrice">
        <el-input
          v-model="queryParams.initialPrice"
          placeholder="请输入初始价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="百分比" prop="precent">
        <el-input
          v-model="queryParams.precent"
          placeholder="请输入百分比"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间" prop="collectDate">
        <el-input
          v-model="queryParams.collectDate"
          placeholder="请输入时间"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易量" prop="vol">
        <el-input
          v-model="queryParams.vol"
          placeholder="请输入交易量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="插入时间" prop="insertTime">
        <el-date-picker clearable
          v-model="queryParams.insertTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择插入时间">
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
          v-hasPermi="['quant:coinhistory:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['quant:coinhistory:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['quant:coinhistory:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['quant:coinhistory:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="coinhistoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="自增ID" align="center" prop="id" />
      <el-table-column label="交易金额" align="center" prop="amount" />
      <el-table-column label="最终价格" align="center" prop="finalPrice" />
      <el-table-column label="数量" align="center" prop="dealCount" />
      <el-table-column label="最高价" align="center" prop="high" />
      <el-table-column label="最低价" align="center" prop="low" />
      <el-table-column label="最大跌幅百分比" align="center" prop="maxDownPrecent" />
      <el-table-column label="最大幅度百分比" align="center" prop="maxPrecent" />
      <el-table-column label="最大涨幅百分比" align="center" prop="maxUpPrecent" />
      <el-table-column label="币种名称" align="center" prop="name" />
      <el-table-column label="初始价格" align="center" prop="initialPrice" />
      <el-table-column label="百分比" align="center" prop="precent" />
      <el-table-column label="时间" align="center" prop="collectDate" />
      <el-table-column label="交易量" align="center" prop="vol" />
      <el-table-column label="插入时间" align="center" prop="insertTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.insertTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['quant:coinhistory:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['quant:coinhistory:remove']">删除</el-button>
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

    <!-- 添加或修改加密货币历史数据查看对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="coinhistoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="交易金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入交易金额" />
        </el-form-item>
        <el-form-item label="最终价格" prop="finalPrice">
          <el-input v-model="form.finalPrice" placeholder="请输入最终价格" />
        </el-form-item>
        <el-form-item label="数量" prop="dealCount">
          <el-input v-model="form.dealCount" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="最高价" prop="high">
          <el-input v-model="form.high" placeholder="请输入最高价" />
        </el-form-item>
        <el-form-item label="最低价" prop="low">
          <el-input v-model="form.low" placeholder="请输入最低价" />
        </el-form-item>
        <el-form-item label="最大跌幅百分比" prop="maxDownPrecent">
          <el-input v-model="form.maxDownPrecent" placeholder="请输入最大跌幅百分比" />
        </el-form-item>
        <el-form-item label="最大幅度百分比" prop="maxPrecent">
          <el-input v-model="form.maxPrecent" placeholder="请输入最大幅度百分比" />
        </el-form-item>
        <el-form-item label="最大涨幅百分比" prop="maxUpPrecent">
          <el-input v-model="form.maxUpPrecent" placeholder="请输入最大涨幅百分比" />
        </el-form-item>
        <el-form-item label="币种名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入币种名称" />
        </el-form-item>
        <el-form-item label="初始价格" prop="initialPrice">
          <el-input v-model="form.initialPrice" placeholder="请输入初始价格" />
        </el-form-item>
        <el-form-item label="百分比" prop="precent">
          <el-input v-model="form.precent" placeholder="请输入百分比" />
        </el-form-item>
        <el-form-item label="时间" prop="collectDate">
          <el-input v-model="form.collectDate" placeholder="请输入时间" />
        </el-form-item>
        <el-form-item label="交易量" prop="vol">
          <el-input v-model="form.vol" placeholder="请输入交易量" />
        </el-form-item>
        <el-form-item label="插入时间" prop="insertTime">
          <el-date-picker clearable
            v-model="form.insertTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择插入时间">
          </el-date-picker>
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

<script setup name="Coinhistory">
import { listCoinhistory, getCoinhistory, delCoinhistory, addCoinhistory, updateCoinhistory } from "@/api/quant/coinhistory";

const { proxy } = getCurrentInstance();

const coinhistoryList = ref([]);
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
    amount: null,
    finalPrice: null,
    dealCount: null,
    high: null,
    low: null,
    maxDownPrecent: null,
    maxPrecent: null,
    maxUpPrecent: null,
    name: null,
    initialPrice: null,
    precent: null,
    collectDate: null,
    vol: null,
    insertTime: null
  },
  rules: {
    amount: [
      { required: true, message: "交易金额不能为空", trigger: "blur" }
    ],
    finalPrice: [
      { required: true, message: "最终价格不能为空", trigger: "blur" }
    ],
    dealCount: [
      { required: true, message: "数量不能为空", trigger: "blur" }
    ],
    high: [
      { required: true, message: "最高价不能为空", trigger: "blur" }
    ],
    low: [
      { required: true, message: "最低价不能为空", trigger: "blur" }
    ],
    maxDownPrecent: [
      { required: true, message: "最大跌幅百分比不能为空", trigger: "blur" }
    ],
    maxPrecent: [
      { required: true, message: "最大幅度百分比不能为空", trigger: "blur" }
    ],
    maxUpPrecent: [
      { required: true, message: "最大涨幅百分比不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "币种名称不能为空", trigger: "blur" }
    ],
    initialPrice: [
      { required: true, message: "初始价格不能为空", trigger: "blur" }
    ],
    precent: [
      { required: true, message: "百分比不能为空", trigger: "blur" }
    ],
    collectDate: [
      { required: true, message: "时间不能为空", trigger: "blur" }
    ],
    vol: [
      { required: true, message: "交易量不能为空", trigger: "blur" }
    ],
    insertTime: [
      { required: true, message: "插入时间不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询加密货币历史数据查看列表 */
function getList() {
  loading.value = true;
  listCoinhistory(queryParams.value).then(response => {
    coinhistoryList.value = response.rows;
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
    amount: null,
    finalPrice: null,
    dealCount: null,
    high: null,
    low: null,
    maxDownPrecent: null,
    maxPrecent: null,
    maxUpPrecent: null,
    name: null,
    initialPrice: null,
    precent: null,
    collectDate: null,
    vol: null,
    insertTime: null
  };
  proxy.resetForm("coinhistoryRef");
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
  title.value = "添加加密货币历史数据查看";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCoinhistory(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改加密货币历史数据查看";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["coinhistoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCoinhistory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCoinhistory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除加密货币历史数据查看编号为"' + _ids + '"的数据项？').then(function() {
    return delCoinhistory(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('quant/coinhistory/export', {
    ...queryParams.value
  }, `coinhistory_${new Date().getTime()}.xlsx`)
}

getList();
</script>
