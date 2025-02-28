<template>
  <div class="chat-container">
    <!-- 左侧历史会话面板 -->
    <div class="history-panel">
      <div class="history-header">
        <button class="new-chat-btn" @click="showCreateDialog">
          <span class="plus-icon">+</span>
          新建会话
        </button>
        <el-text>当前模型：{{nowUsingModel}}</el-text>
      </div>
      <div class="history-list">
        <div
            v-for="chat in chatHistory"
            :key="chat.id"
            :class="['history-item',{active: currentChatId == chat.id}]"
            @click="switchChat(chat.id)"
        >
          <span class="chat-title">{{ chat.topic }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <template v-if="currentChat">
          <div
              v-for="message in currentChat.messages"
              :key="message.id"
              :class="['message', message.role]"
          >
            <div class="message-avatar">
<!--              {{ message.role === 'user' ? '👤' : '🤖' }}-->
              <img :src="message.role === 'user' ? '/src/assets/wyz.png' : '/src/assets/zjl.png'" alt="Avatar" class="avatar-image" />
            </div>
            <div class="message-content">
              <div v-if="message.role === 'assistant' && message.isTyping" class="typing-content">
                <span v-html="renderMarkdown(message.content)"></span>
                <span class="typing-cursor">|</span>
              </div>
              <div v-else v-html="renderMarkdown(message.content)"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <textarea
            v-model="inputMessage"
            placeholder="输入您的问题..."
            @keydown.enter.prevent="sendMessage"
            :rows="1"
            ref="inputRef"
            @input="autoResize"
        ></textarea>
        <button
            class="send-btn"
            @click="sendMessage"
            :disabled="!inputMessage.trim()"
        >
          发送
        </button>
      </div>
    </div>

    <!-- 新建会话弹窗 -->
    <div v-if="showNewChatDialog" class="dialog-overlay" @click="cancelCreate">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>新建会话</h3>
          <button class="close-btn" @click="cancelCreate">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label>会话标题</label>
            <input
                v-model="newChatTitle"
                placeholder="请输入会话标题"
                ref="titleInput"
                @keyup.enter="confirmCreate"
            >
            <label>角色</label>
            <el-select v-model="newChatCharacter">
              <el-option v-for="item in allCharacterList" :key="item.agent" :value="item.agent">{{ item.agent }}</el-option>
            </el-select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="cancelCreate">取消</button>
          <button
              class="confirm-btn"
              @click="confirmCreate"
              :disabled="!newChatTitle.trim()"
          >
            确定
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

import {createTopic, fakeChat, topicHistory, getTopicDetail ,ask , allCharacter ,currentModel } from '@/api/ai/index.js'

// 状态管理
const chatHistory = ref([])
const currentChat = ref(null)
const inputMessage = ref('')
const inputRef = ref(null)
const messagesContainer = ref(null)
const currentChatId = ref(null)
const nowUsingModel = ref('')

// 新增状态
const showNewChatDialog = ref(false)
const newChatTitle = ref('')
const titleInput = ref(null)
const allCharacterList = ref([])
//新角色的id
const newChatCharacter = ref('')

currentModel().then(
    response => {
      nowUsingModel.value = response.data.confValue
    }
)

//获取主题列表
topicHistory().then(
    response => {
      chatHistory.value = response.data
    }
)

//获取所有的角色列表
allCharacter().then(
    response => {
      allCharacterList.value = response.data
    }
)


// 切换会话
const switchChat = (chat) => {
  /**
   * currentChat?.id === chat.id
   */
  getTopicDetail({id:chat}).then(
      response => {
        currentChat.value = response.data
        currentChatId.value = response.data.id
        console.log("chat 切换了是："+chat  +"-----"+ currentChatId.value)
      }
  )
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value,
    time: new Date()
  }
  currentChat.value.messages.push(userMessage)

  // 清空输入
  inputMessage.value = ''
  autoResize()

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 添加AI响应消息
  const assistantMessage = reactive({
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    isTyping: true,
    time: new Date()
  })

  ask(currentChat.value).then(response => {

    const content = response.data
    assistantMessage.content = content
    currentChat.value.messages.push(assistantMessage)
    let index = 0
    const typeInterval = setInterval(() => {
      if (index < content.length) {
        // 直接更新响应式对象的 content
        assistantMessage.content = content.slice(0, index + 1)
        index++
        scrollToBottom()
      } else {
        clearInterval(typeInterval)
        assistantMessage.isTyping = false
      }
    }, 30)
  })

}

// 自动调整输入框高度
const autoResize = () => {
  const textarea = inputRef.value
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
// 显示创建对话框
const showCreateDialog = () => {
  showNewChatDialog.value = true
  newChatTitle.value = ''
  nextTick(() => {
    titleInput.value?.focus()
  })
}

// 取消创建
const cancelCreate = () => {
  showNewChatDialog.value = false
  newChatTitle.value = ''
}

// 确认创建
const confirmCreate = () => {
  if (!newChatTitle.value.trim()) return
  const newChat = {
    id: Date.now(),
    topic: newChatTitle.value.trim(),
    character: newChatCharacter.value,
    time: new Date(),
    messages: []
  }
  createTopic({topic: newChatTitle.value , character: newChatCharacter.value}).then(
      response => {
        newChat.id = response.data
        currentChatId.value = newChat.id
      }
  )
  chatHistory.value.unshift(newChat)
  currentChat.value = newChat
  showNewChatDialog.value = false
}

// 渲染Markdown
const renderMarkdown = (content) => {
  if (!content) return ''
  const html = marked(content)
  return DOMPurify.sanitize(html)
}


</script>

<style scoped>
.chat-container {
  display: flex;
  height: 91vh;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-panel {
  width: 260px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.new-chat-btn {
  width: 100%;
  padding: 10px;
  background-color: #5185b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.new-chat-btn:hover {
  background-color: #5185b8;
}

.plus-icon {
  font-weight: bold;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  padding: 12px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background-color: #f5f5f5;
}

.history-item.active {
  background-color: #e0e9f3;
  color: #207edd;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 20px;
  max-width: 85%;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.avatar-image {
  height: 100% ;
  //object-fit: cover; /* 适应容器的图像比例 */
}

.message-content {
  background-color: rgba(98, 186, 82, 0.22);
  padding: 5px 12px 5px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.message.user .message-content {
  background-color: #5185b8;
  color: white;
}

.typing-content {
  display: inline-block;
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.input-area {
  border-top: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  max-height: 150px;
  transition: all 0.3s;
}

textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.send-btn {
  padding: 10px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  height: 42px;
}

.send-btn:hover {
  background-color: #3aa876;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Markdown 样式 */
:deep(.message-content) {
  overflow-x: auto;
}

:deep(.message-content pre) {
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
}

:deep(.message-content code) {
  font-family: monospace;
}

:deep(.message-content p) {
  margin: 8px 0;
}

:deep(.message-content ul),
:deep(.message-content ol) {
  margin: 8px 0;
  padding-left: 20px;
}

:deep(.message.user .message-content pre),
:deep(.message.user .message-content code) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}


/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #666;
}

.dialog-body {
  padding: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  color: #666;
  font-size: 14px;
}

.form-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.confirm-btn {
  background-color: #42b983;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: #3aa876;
}

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
}
</style>