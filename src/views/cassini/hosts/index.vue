<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="主机地址" prop="host">
          <el-input
            v-model="queryParams.host"
            placeholder="请输入主机地址"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input
            v-model="queryParams.port"
            placeholder="请输入端口"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="queryParams.remarks"
            placeholder="请输入备注"
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
            v-hasPermi="['cassini:hosts:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['cassini:hosts:edit']"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['cassini:hosts:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['cassini:hosts:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
  
      <el-table v-loading="loading" :data="hostsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" />
        <el-table-column label="主机地址" align="center" prop="host" />
        <el-table-column label="用户名" align="center" prop="username" />
        <el-table-column label="密码" align="center" prop="password" />
        <el-table-column label="端口" align="center" prop="port" />
        <el-table-column label="备注" align="center" prop="remarks" />
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
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cassini:hosts:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cassini:hosts:remove']">删除</el-button>
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
  
      <!-- 添加或修改worker管理对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
        <el-form ref="hostsRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="主机地址" prop="host">
            <el-input v-model="form.host" placeholder="请输入主机地址" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="端口" prop="port">
            <el-input v-model="form.port" placeholder="请输入端口" />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="form.remarks" placeholder="请输入备注" />
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
  
  <script setup name="Hosts">
  import { listHosts, getHosts, delHosts, addHosts, updateHosts } from "@/api/cassini/hosts";
  
  const { proxy } = getCurrentInstance();
  
  const hostsList = ref([]);
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
      host: null,
      username: null,
      port: null,
      remarks: null,
      creator: null,
    },
    rules: {
      host: [
        { required: true, message: "主机地址不能为空", trigger: "blur" }
      ],
      username: [
        { required: true, message: "用户名不能为空", trigger: "blur" }
      ],
      password: [
        { required: true, message: "密码不能为空", trigger: "blur" }
      ],
      creator: [
        { required: true, message: "创建人不能为空", trigger: "blur" }
      ],
    }
  });
  
  const { queryParams, form, rules } = toRefs(data);
  
  /** 查询worker管理列表 */
  function getList() {
    loading.value = true;
    listHosts(queryParams.value).then(response => {
      hostsList.value = response.rows;
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
      host: null,
      username: null,
      password: null,
      port: null,
      remarks: null,
      creator: null,
      createdAt: null,
      updatedAt: null
    };
    proxy.resetForm("hostsRef");
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
    title.value = "添加worker管理";
  }
  
  /** 修改按钮操作 */
  function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    getHosts(_id).then(response => {
      form.value = response.data;
      open.value = true;
      title.value = "修改worker管理";
    });
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["hostsRef"].validate(valid => {
      if (valid) {
        if (form.value.id != null) {
          updateHosts(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            getList();
          });
        } else {
          addHosts(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除worker管理编号为"' + _ids + '"的数据项？').then(function() {
      return delHosts(_ids);
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    }).catch(() => {});
  }
  
  /** 导出按钮操作 */
  function handleExport() {
    proxy.download('cassini/hosts/export', {
      ...queryParams.value
    }, `hosts_${new Date().getTime()}.xlsx`)
  }
  
  getList();
  </script>
  