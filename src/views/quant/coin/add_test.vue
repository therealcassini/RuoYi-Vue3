<template>
  <div class="app-container">
    <el-form ref="formRef" :model="formData" :rules="rules" size="default" label-width="100px">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" :maxlength="11" show-word-limit clearable
          prefix-icon='Cellphone' :style="{width: '100%'}"></el-input>
      </el-form-item>
      <el-form-item label="级联选择" prop="field102">
        <el-cascader v-model="formData.field102" :options="field102Options" :props="field102Props"
          :style="{width: '100%'}" placeholder="请选择级联选择" clearable></el-cascader>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
const {
  proxy
} = getCurrentInstance()
const formRef = ref()
const data = reactive({
  formData: {
    mobile: '',
    field102: [1, 2],
  },
  rules: {
    mobile: [{
      required: true,
      message: '请输入手机号',
      trigger: 'blur'
    }, {
      pattern: new RegExp(/^1(3|4|5|7|8|9)\d{9}$/),
      message: '手机号格式错误',
      trigger: 'blur'
    }],
    field102: [{
      required: true,
      type: 'array',
      message: '请至少选择一个field102',
      trigger: 'change'
    }],
  }
})
const {
  formData,
  rules
} = toRefs(data)
const field102Options = ref([])
// props设置
const field102Props = ref({
  "multiple": false
})

function getField102Options() {
  // TODO 发起请求获取数据
  field102Options.value
}
/**
 * @name: 表单提交
 * @description: 表单提交方法
 * @return {*}
 */
function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    // TODO 提交表单
  })
}
/**
 * @name: 表单重置
 * @description: 表单重置方法
 * @return {*}
 */
function resetForm() {
  formRef.value.resetFields()
}

</script>
<style>
</style>
