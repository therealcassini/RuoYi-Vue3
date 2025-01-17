<template>
  <div class="app-container">

    <el-text>我来是一个错误</el-text>
    <cassini v-bind:msg/>
    <el-input v-model="msg" placeholder="请输入内容" />

  </div>
</template>
<script setup lang="ts">
import cassini from '@/components/Cassini.vue'
const msg = ref('Hello World')

</script>

