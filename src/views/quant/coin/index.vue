<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
          v-hasPermi="['quant:coin:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['quant:coin:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['quant:coin:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['quant:coin:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Refresh"
          @click="handleAddFavorites"
        >添加到自选</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="coinList" @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="ID" align="center" prop="id" />-->
      <el-table-column label="币种符号" align="center" >
        <template #default="scope">
<!--          <el-link :href="'../market/detail/'+scope.row.symbol" target="_blank" :style="{color: '#409EFF' ,fontWeight: 'bold', textDecoration: 'none'}">{{ scope.row.symbol }}</el-link>-->
<!--          <el-link :href="scope.row.symbol" target="_blank" :style="{color: '#409EFF' ,fontWeight: 'bold', textDecoration: 'none'}">{{ scope.row.symbol }}</el-link>-->
          <el-text type="success" @click="toDetailPage(scope.row.symbol,100)">{{ scope.row.symbol }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="币种全称" align="center" prop="name" />
      <el-table-column label="市值" align="center" prop="marketCap" />
      <el-table-column label="当前价格" align="center" prop="price" />
      <el-table-column label="24小时的交易量" align="center" prop="volume24h" />
      <el-table-column label="流通供应量" align="center" prop="circulatingSupply" />
      <el-table-column label="最大供应量" align="center" prop="maxSupply" />
      <el-table-column label="是否自选" align="center" prop="favorite" class-name="favorite-row"/>

      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['quant:coin:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['quant:coin:remove']">删除</el-button>
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

    <!-- 添加或修改币种知识库对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="coinRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="币种符号" prop="symbol">
          <el-input v-model="form.symbol" placeholder="请输入币种符号" />
        </el-form-item>
        <el-form-item label="币种全称" prop="name">
          <el-input v-model="form.name" placeholder="请输入币种全称" />
        </el-form-item>
        <el-form-item label="市值" prop="marketCap">
          <el-input v-model="form.marketCap" placeholder="请输入市值" />
        </el-form-item>
        <el-form-item label="当前价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入当前价格" />
        </el-form-item>
        <el-form-item label="24小时的交易量" prop="volume24h">
          <el-input v-model="form.volume24h" placeholder="请输入24小时的交易量" />
        </el-form-item>
        <el-form-item label="流通供应量" prop="circulatingSupply">
          <el-input v-model="form.circulatingSupply" placeholder="请输入流通供应量" />
        </el-form-item>
        <el-form-item label="最大供应量" prop="maxSupply">
          <el-input v-model="form.maxSupply" placeholder="请输入最大供应量" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createdAt">
          <el-date-picker clearable
            v-model="form.createdAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择创建时间">
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

<script setup name="Coin">
import { listCoin, getCoin, delCoin, addCoin, updateCoin ,addToFavoritesList } from "@/api/quant/coin";

const { proxy } = getCurrentInstance();

const coinList = ref([]);
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
    pageSize: 200,
  },
  rules: {
    symbol: [
      { required: true, message: "币种符号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "币种全称不能为空", trigger: "blur" }
    ],
  }
});


const { queryParams, form, rules } = toRefs(data);

/** 查询币种知识库列表 */
function getList() {
  loading.value = true;
  listCoin(queryParams.value).then(response => {
    coinList.value = response.rows;
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
    symbol: null,
    name: null,
    marketCap: null,
    price: null,
    volume24h: null,
    circulatingSupply: null,
    maxSupply: null,
    createdAt: null
  };
  proxy.resetForm("coinRef");
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
  title.value = "添加币种知识库";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCoin(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改币种知识库";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["coinRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCoin(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCoin(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除币种知识库编号为"' + _ids + '"的数据项？').then(function() {
    return delCoin(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 删除按钮操作 */
function handleAddFavorites(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认添加币种知识库编号为"' + _ids + '"的数据项？').then(function() {
    return addToFavoritesList(_ids);
  }).then(() => {
    proxy.$modal.msgSuccess("添加自选成功");
  }).catch(() => {});
}



/** 导出按钮操作 */
function handleExport() {
  proxy.download('quant/coin/export', {
    ...queryParams.value
  }, `coin_${new Date().getTime()}.xlsx`)
}

getList();

//跳转到新的界面
function toDetailPage(symbol,days){
  // alert("跳转到新的界面"+symbol+days)
  proxy.$router.push(`./detail/${symbol}/${days}`)
}

</script>
