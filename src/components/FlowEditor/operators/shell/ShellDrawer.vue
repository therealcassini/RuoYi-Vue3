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

    <!-- Shell 配置表单 -->
    <div v-show="activeTab === 'config'" class="drawer-body">

      <el-form-item label="Task名称" prop="name" label-width="100px" >
        <el-input v-model="formData.name" placeholder="请输入Task名称" :style="{width: '60%' }"/>
      </el-form-item>


      <el-form-item label="数 据 源" prop="host" label-width="100px">
        <el-select v-model="formData.host" placeholder="请选择主机" :style="{width: '40%'}">
          <el-option v-for="item in hostList"
                     :key = "item" :label="item" :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="shell脚本" prop="script" label-width="100px">
        <el-input v-model="formData.script" placeholder="请输入Shell脚本..." type="textarea"
                  :autosize="{ minRows: 10, maxRows: 20 }" :style="{width: '90%'}"/>
      </el-form-item>


    </div>



    <!-- 日志内容 -->
    <div v-show="activeTab === 'log'" class="drawer-body log-content">
      <div v-if="logs.length === 0" class="empty-log">
        暂无日志记录
      </div>
      <div v-else class="log-list">
        <div 
          v-for="(log, index) in logs" 
          :key="index"
          class="log-item"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
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
import type { LogItem } from '../../types'
import {  getAllHosts } from "@/api/cassini/hosts";

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
}>()

// 表单数据
const formData = ref({
  name: '',
  host: '',
  script: ''
})

const hostList = ref<string[]>([])

// 标签页状态
const activeTab = ref('config')
const hasNewLog = ref(false)
const logs = ref<LogItem[]>([])
const isRunning = ref(false)

// 初始化数据
watch(() => props.data, (newData) => {
  if (newData) {
    formData.value = { ...newData }
    formData.value.taskType= 'shell-exec'
  }
}, { immediate: true })

hostList.value = getAllHosts().then((res) => {
  hostList.value = res.data
})

// 运行处理
const handleRun = async () => {
  if (isRunning.value) return
  
  try {
    isRunning.value = true
    addLog('开始执行Shell脚本...')
    
    // 模拟运行
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    addLog('Shell脚本执行成功', 'success')
    activeTab.value = 'log'
  } catch (error) {
    addLog(error instanceof Error ? error.message : '执行失败', 'error')
    activeTab.value = 'log'
  } finally {
    isRunning.value = false
  }
}

// 添加日志
const addLog = (message: string, type: LogItem['type'] = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ time, message, type })
  if (activeTab.value !== 'log') {
    hasNewLog.value = true
  }
}

// 关闭处理
const handleClose = () => {
  emit('close')
}

// 保存处理
const handleSave = () => {
  emit('save', formData.value)
}

// 切换标签页时清除新日志标记
watch(activeTab, (newTab) => {
  if (newTab === 'log') {
    hasNewLog.value = false
  }
})
</script>

<style scoped>
@import '../../styles.css';
</style> 