<script setup>
import {defineProps} from 'vue'

const props = defineProps({
  msg: String
})

</script>

<template>
<div>这是 Cassini 组件 {{ props.msg }}</div>

  <div>
    <h1>这是 Cassini 组件 {{ props.msg }}</h1>
    <el-collapse>
      <el-collapse-item title="类别 1" name="1">
        <div>这是类别 1 的内容</div>
      </el-collapse-item>
      <el-collapse-item title="类别 2" name="2">
        <div>这是类别 2 的内容</div>
        <div>这是类别 2 的内容</div>
        <div>这是类别 2 的内容</div>
        <div>这是类别 2 的内容</div>
        <div>这是类别 2 的内容</div>
      </el-collapse-item>
      <el-collapse-item title="类别 3" name="3">
        <div>这是类别 3 的内容</div>
      </el-collapse-item>
    </el-collapse>
  </div>

</template>

<style scoped lang="scss">
h1 {
  color: #333;
}

.el-collapse {
  margin-top: 20px;
}

.el-collapse-item__header {
  font-weight: bold;
}

.el-collapse-item__content {
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
}
</style>