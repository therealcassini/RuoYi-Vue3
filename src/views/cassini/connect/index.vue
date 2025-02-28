<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="IP 地址" prop="ip">
        <el-input
          v-model="queryParams.ip"
          placeholder="请输入IP 地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="端口号" prop="port">
        <el-input
          v-model="queryParams.port"
          placeholder="请输入端口号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="驱动名称" prop="driver">
        <el-input
          v-model="queryParams.driver"
          placeholder="请输入驱动名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input
          v-model="queryParams.category"
          placeholder="请输入分类"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
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
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="queryParams.password"
          placeholder="请输入密码"
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
          v-hasPermi="['cassini:connect:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['cassini:connect:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['cassini:connect:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['cassini:connect:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="connectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="IP 地址" align="center" prop="ip" />
      <el-table-column label="端口号" align="center" prop="port" />
      <el-table-column label="URL 地址" align="center" prop="url" min-width="200"/>
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="密码" align="center" prop="password" />
      <el-table-column label="驱动名称" align="center" prop="driver" />
      <el-table-column label="分类" align="center" prop="category" />
      <el-table-column label="小分类" align="center" prop="dbType" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="创建人" align="center" prop="creator" />
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
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:connect:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:connect:remove']">删除</el-button>
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

    <!-- 添加或修改存储连接信息对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body >
      <el-form ref="connectRef" :model="form" :rules="rules" label-width="130px">

        <el-form-item label="大类" prop="category" >
          <el-select v-model="form.category" placeholder="请输入分类" @change="bigCateChange">
            <el-option v-for="(value,key) in cateMap"
            :key = "key" :label="key" :value="key"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 获取form.category 的值，然后获取cateMap 的值，然后获取cateMap[form.category] 的值，然后获取cateMap[form.category][form.dbType] 的值 -->
        <el-form-item label="分类小类" prop="dbType">
          <el-select 
            v-model="form.dbType" 
            placeholder="请输入分类" 
            @change="smallCateChange"
          >
            <el-option 
              v-for="item in smallCate" 
              :key="item.dbType" 
              :label="item.dbType" 
              :value="item.dbType"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="IP 地址" prop="ip" v-show="showIp">
          <el-input v-model="form.ip" placeholder="请输入IP 地址" />
        </el-form-item>
        <el-form-item label="端口号" prop="port" v-show="showPort">
          <el-input v-model="form.port" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="用户名" prop="username" v-show="showUsername">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-show="showPassword">
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="URL 地址" prop="url" v-show="showUrl">
          <el-input v-model="form.url" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="驱动名称" prop="driver" v-show="showDriver">
          <el-input v-model="form.driver" placeholder="请输入驱动名称" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="创建人" prop="creator">
          <el-input v-model="form.creator" placeholder="请输入创建人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button type="warning" @click="checkForm">测试连接</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Connect">
import { listConnect, getConnect, delConnect, addConnect, updateConnect, checkConnect, categoryMap,showHiddenMap } from "@/api/cassini/connect";

const { proxy } = getCurrentInstance();


const connectList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const selectItem = ref(null);
const showIp=ref(true);
const showPort=ref(true);
const showUsername=ref(true);
const showPassword=ref(true);
const showUrl=ref(true);
const showDriver=ref(true);


const cateMap = ref([])
//一级大类
const bigCate = ref("");
const smallCate= ref([]);


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ip: null,
    port: null,
    url: null,
    driver: null,
    category: null,
    dbType: null,
    name: null,
    creator: null,
    createdAt: null,
    updatedAt: null,
    username: null,
    password: null
  },
  rules: {
    ip: [
      { required: true, message: "IP 地址不能为空", trigger: "blur" }
    ],
    port: [
      { required: true, message: "端口号不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

//初始化的时候就获取一次map
categoryMap().then(response =>{
  cateMap.value = response.data;
})

showHiddenMap().then(response =>{
  showHiddenMap.value = response.data;
})


function bigCateChange(){
  // console.log("进行了修改 form 选择为："+ form.value)
  console.log("进行了修改 选择为："+ form.value.category)
  smallCate.value = cateMap.value[form.value.category] || [];
  form.value.dbType="";
}

function smallCateChange() {
    selectItem.value = showHiddenMap.value[form.value.dbType]
    console.log("选中的 item 的值为：", selectItem.value)
    
    // 处理显示/隐藏字段
    // ... 其他代码保持不变 ...
    showIp.value = selectItem.value.showFields.includes('showIp')
    showPort.value = selectItem.value.showFields.includes('showPort')
    showUsername.value = selectItem.value.showFields.includes('showUsername')
    showPassword.value = selectItem.value.showFields.includes('showPassword')
    showUrl.value = selectItem.value.showFields.includes('showUrl')
    showDriver.value = selectItem.value.showFields.includes('showDriver')

    showIp.value = !selectItem.value.hiddenFields.includes('showIp')
    showPort.value = !selectItem.value.hiddenFields.includes('showPort')
    showUsername.value = !selectItem.value.hiddenFields.includes('showUsername')
    showPassword.value = !selectItem.value.hiddenFields.includes('showPassword')
    showUrl.value = !selectItem.value.hiddenFields.includes('showUrl')
    showDriver.value = !selectItem.value.hiddenFields.includes('showDriver')

    // 修改这部分赋值代码
    if (selectItem.value) {
      form.value.driver = selectItem.value.defaultDriver
      form.value.port = selectItem.value.defaultPort
      form.value.url = selectItem.value.defaultUrl
      
      // 添加调试日志
      console.log('设置默认值：', {
        driver: selectItem.value.defaultDriver,
        port: selectItem.value.defaultPort,
        url: selectItem.value.defaultUrl
      })
    }
}

/** 查询存储连接信息列表 */
function getList() {
  loading.value = true;
  listConnect(queryParams.value).then(response => {
    connectList.value = response.rows;
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
    ip: null,
    port: null,
    url: null,
    driver: null,
    category: null,
    dbType: null,
    name: null,
    creator: null,
    createdAt: null,
    updatedAt: null,
    username: null,
    password: null
  };
  proxy.resetForm("connectRef");
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
  title.value = "添加存储连接信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  console.log("修改按钮操作"+row.dbType)


    selectItem.value = showHiddenMap.value[row.dbType]
    console.log("选中的 item 的值为：", selectItem.value)
    
    // 处理显示/隐藏字段
    // ... 其他代码保持不变 ...
    showIp.value = selectItem.value.showFields.includes('showIp')
    showPort.value = selectItem.value.showFields.includes('showPort')
    showUsername.value = selectItem.value.showFields.includes('showUsername')
    showPassword.value = selectItem.value.showFields.includes('showPassword')
    showUrl.value = selectItem.value.showFields.includes('showUrl')
    showDriver.value = selectItem.value.showFields.includes('showDriver')

    showIp.value = !selectItem.value.hiddenFields.includes('showIp')
    showPort.value = !selectItem.value.hiddenFields.includes('showPort')
    showUsername.value = !selectItem.value.hiddenFields.includes('showUsername')
    showPassword.value = !selectItem.value.hiddenFields.includes('showPassword')
    showUrl.value = !selectItem.value.hiddenFields.includes('showUrl')
    showDriver.value = !selectItem.value.hiddenFields.includes('showDriver')



  reset();
  const _id = row.id || ids.value
  getConnect(_id).then(response => {
    
    form.value = response.data;
    open.value = true;
    title.value = "修改存储连接信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["connectRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConnect(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addConnect(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}


/** 测试连接按钮 */
function checkForm() {
  alert("检查连接")
  proxy.$refs["connectRef"].validate(valid => {
    if (valid) {
        checkConnect(form.value).then(response => {
          console.log(response.data)
          proxy.$modal.msgSuccess("连接测试成功");
        });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除存储连接信息编号为"' + _ids + '"的数据项？').then(function() {
    return delConnect(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('cassini/connect/export', {
    ...queryParams.value
  }, `connect_${new Date().getTime()}.xlsx`)
}

getList();
</script>
