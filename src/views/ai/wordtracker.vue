<template>
  <div class="word-tracker">
    <h1>记单词</h1>

    <div class="main-layout">
      <!-- 左侧查询区域 -->
      <div class="left-panel">
        <input
            type="text"
            v-model="wordInput"
            @keyup.enter="searchWord"
            placeholder="输入单词并按回车查询"
            class="word-input"
            :disabled="loading"
        />

        <!-- 加载动画 -->
        <div v-if="loading" class="loading-spinner"></div>

        <!-- 单词详情 -->
        <div v-if="meaning && !loading" class="word-details">
          <span v-html="renderMarkdown(meaning)"></span>
        </div>
      </div>

      <!-- 右侧词云区域 -->
      <div class="right-panel">
        <div class="word-cloud">
          <h3>最近学过的单词</h3>
          <div class="cloud">
            <span
                v-for="(wordObj, index) in recentWords"
                :key="index"
                class="word-item"
                :style="{
                fontSize: wordObj.fontSize,
                color: wordObj.color,
                backgroundColor: wordObj.bgColor
              }"
                @click="showDefinition(wordObj.text)"
            >
              {{ wordObj.text }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { searchVocabulary, getVocabulary } from '@/api/ai/vocabulary.js'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const wordInput = ref('');
const meaning = ref(null);
const recentWords = ref([]);
const loading = ref(false);

// 生成随机颜色
const generateColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const getVocabularyData = async () => {
  const response = await getVocabulary();
  recentWords.value = response.data.map(word => ({
    text: word.word,
    fontSize: `${Math.floor(Math.random() * 3 + 14)}px`, // 14-26px
    color: generateColor(),
    bgColor: `hsla(${Math.floor(Math.random() * 360)}, 70%, 80%, 0.2)`
  }));
};

getVocabularyData();

const searchWord = async () => {
  if (!wordInput.value) return;

  try {
    loading.value = true;
    const response = await searchVocabulary({ vocabulary: wordInput.value });
    meaning.value = response.data;

    // 添加新单词到最近列表（去重）
    if (!recentWords.value.some(w => w.text === wordInput.value)) {
      recentWords.value.unshift({
        text: wordInput.value,
        fontSize: '24px',
        color: generateColor(),
        bgColor: `hsla(${Math.floor(Math.random() * 360)}, 70%, 80%, 0.2)`
      });
    }
  } finally {
    loading.value = false;
  }
};

const renderMarkdown = (content) => {
  if (!content) return ''
  const html = marked(content)
  return DOMPurify.sanitize(html)
}

const showDefinition = async (word) => {
  wordInput.value = word;
  await searchWord();
};
</script>

<style scoped>
.word-tracker {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.main-layout {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
}

.left-panel {
  flex: 1;
  width: 60%;
  //min-width: 700px;
}

.right-panel {
  flex: 1;
  min-width: 500px;
}

.word-input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.word-input:focus {
  outline: none;
  border-color: #3498db;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.word-details {
  //background: white;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #e1f3fb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.word-cloud {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 1rem;
}

.word-item {
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.word-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>