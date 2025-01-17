<template>
  <div
    class="operator-drawer"
    :class="{ 'drawer-open': visible }"
    :style="{ height: `${drawerHeight}px`, display: visible ? 'block' : 'none' }"
  >
    <div 
      class="resize-handle"
      @mousedown="handleResizeStart"
    >
      <div class="resize-indicator"></div>
    </div>
    
    <div class="drawer-content" v-if="operator">
      <div class="drawer-header">
        <h3>{{ operator.operatorName }}</h3>
        <button class="close-btn" @click="emit('update:visible', false)">x</button>
      </div>
      
      <!-- 动态加载对应的算子抽屉组件 -->
      <component 
        :is="operator.component"
        :data="taskParams"
        @close="handleClose"
        @save="handleSave"
        @happy="changeActiveNodeName"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { OperatorConfig } from '../types/operator'

const props = defineProps<{
  operatorId: string
  taskParams: any
  visible: boolean
  activeNodeData: any
  operator: OperatorConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: any): void
  (e: 'changeSelectNodeName', data: any): void
}>()

const taskParam = ref<Record<string, any>>({
  name: 'props.activeNodeData.name',
})

// 抽屉高度相关
const drawerHeight = ref(520) // 默认高度
const minHeight = 200 // 最小高度
const maxHeight = 800 // 最大高度
let startY = 0
let startHeight = 0
let isDragging = false

// 开始拖拽
const handleResizeStart = (e: MouseEvent) => {
  isDragging = true
  startY = e.clientY
  startHeight = drawerHeight.value
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
  document.body.classList.add('drawer-resizing')
}

// 拖拽移动
const handleResizeMove = (e: MouseEvent) => {
  if (!isDragging) return
  
  const deltaY = startY - e.clientY
  let newHeight = startHeight + deltaY
  
  newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))
  drawerHeight.value = newHeight
}

// 结束拖拽
const handleResizeEnd = () => {
  isDragging = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
  document.body.classList.remove('drawer-resizing')
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  if (isDragging) {
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
    document.body.classList.remove('drawer-resizing')
  }
})

const handleClose = () => {
  console.log("点击了关闭按钮")
  drawerHeight.value = 300  // 重置为默认高度
  emit('update:visible', false)
}

const handleSave = (data: any) => {
  data.operatorId = props.operatorId
  emit('save', data)
}

const changeActiveNodeName = (data: any) => {
  console.log("点击了happy按钮")
  console.log("当前的详细参数为："+props.taskParams)
  // emit('changeSelectNodeName', data+"operator drawer")
}

// 监听 visible 变化，当抽屉关闭时重置高度
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    drawerHeight.value = 300  // 重置为默认高度
  }
})
</script>

<style scoped>
@import '../styles.css';
</style>