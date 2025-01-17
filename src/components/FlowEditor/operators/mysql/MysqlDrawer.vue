<template>
  <div class="drawer-content">
    <div class="drawer-tabs">
      <div 
        class="tab-item"
        :class="{ active: activeTab === 'config' }"
        @click="activeTab = 'config'"
      >
        配置
      </div>
      <div 
        class="tab-item"
        :class="{ active: activeTab === 'log' }"
        @click="activeTab = 'log'"
      >
        日志
        <span v-if="hasNewLog" class="log-badge"></span>
      </div>
    </div>

    <!-- MySQL 配置表单 -->
    <div v-show="activeTab === 'config'" class="drawer-body">

      <el-form-item label="Task名称" prop="name" label-width="100px" >
        <el-input v-model="formData.name" placeholder="请输入Task名称" :style="{width: '60%' }"/>
      </el-form-item>
      <el-form-item label="数 据 源" prop="datasource" label-width="100px">
        <el-select v-model="formData.datasource" placeholder="请选择数据源" :style="{width: '40%'}" >
          <el-option v-for="item in datasourceMap"
                     :key = "item.id" :label="item.name" :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SQL脚本" prop="sqlScript" label-width="100px">
        <el-input v-model="formData.sqlScript" placeholder="请输入SQL脚本..." type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }" :style="{width: '90%'}"/>
      </el-form-item>

    </div>

    <!-- 日志内容 -->
    <div v-show="activeTab === 'log'" class="drawer-body log-content">

    </div>

    <!-- 底部按钮 -->
    <div class="drawer-footer" v-show="activeTab === 'config'">
      <div class="footer-left">
        <button 
          class="run-btn" 
          @click="handleRun"
          :disabled="isRunning"
        >
          <span class="run-icon" :class="{ 'is-running': isRunning }"></span>
          {{ isRunning ? '运行中...' : '试运行' }}
        </button>
      </div>
      <div class="footer-right">
        <button class="cancel-btn" @click="handleClose">取消</button>
        <button class="save-btn" @click="handleSave">保存</button>
        <button class="save-btn" @click="handleHappy">happy一下</button>
      </div>
    </div>

    <div class="drawer-footer" v-show="activeTab === 'log'">
      <div class="footer-right">
        <button class="cancel-btn" @click="activeTab = 'config'">返回配置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {  getListByType } from "@/api/cassini/connect";

const datasourceMap = ref([])

//初始化datasource数据
getListByType('mysql').then(res => {
  datasourceMap.value = res.data
  console.log(res.data)
})

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
  (e: 'happy', data: any): void
}>()

//初始化表单的数据

interface MysqlEXEC {
  name: string
  datasource: number
  sqlScript: string
}

// 表单数据
const formData = ref<MysqlEXEC>({
  name: '',
  datasource: 0,
  sqlScript: '',
})

// 标签页状态
const activeTab = ref('config')
const hasNewLog = ref(false)
const isRunning = ref(false)

// 初始化数据
watch(() => props.data, (newData) => {
  // console.log("回显接受的数据为："+ props.data.datasource)
  if (newData) {
    formData.value = { ...newData }
    //类型转换进行回显
    formData.value.taskType= 'mysql-exec'
  }
}, { immediate: true })

// 运行处理
const handleRun = async () => {
  alert("模拟运行task")
}


// 关闭处理
const handleClose = () => {
  emit('close')
}

// 保存处理
const handleSave = () => {
  console.log("保存数据为："+ formData.value)
  emit('save', formData.value)
}

const handleHappy = () => {
  emit("happy","gongpeng")
}


</script>

<style scoped>
@import '../../styles.css';
</style> 