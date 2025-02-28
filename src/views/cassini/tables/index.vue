<template>
  <div class="app-container">
    <div class="nav-header">
      <div class="nav-tabs">
        <div
            class="tab-item"
            :class="{ active: currentTab === 'metadata' }"
            @click="currentTab = 'metadata'"
        >
          元数据管理
        </div>
        <div
            class="tab-item"
            :class="{ active: currentTab === 'userfield' }"
            @click="currentTab = 'userfield'"
        >
          用户表字段管理
        </div>
      </div>
    </div>

    <div class="content-area">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MetadataManager from './MetaTable.vue'
import UserFieldManager from './UserTable.vue'

const currentTab = ref('metadata')

const currentComponent = computed(() => {
  return currentTab.value === 'metadata' ? MetadataManager : UserFieldManager
})
</script>

<style scoped>
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0px 20px 0 20px;
}

.nav-header h2 {
  margin: 0;
  padding: 16px 0;
  color: #333;
}

.nav-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: -1px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #42b983;
}

.tab-item.active {
  color: #42b983;
  border-bottom-color: #42b983;
}

.content-area {
  flex: 1;
  overflow: auto;
}
</style>