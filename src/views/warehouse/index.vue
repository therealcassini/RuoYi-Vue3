<template>
  <div class="data-warehouse">
    <h1>数据仓库统计</h1>

    <!-- 上半部分：卡片 -->
    <div class="card-container">
      <el-card v-for="(db, index) in databases" :key="index" class="db-card">
        <h3>{{ db.name }}</h3>
        <p>数据容量: {{ db.size }} GB</p>
      </el-card>
    </div>

    <!-- 下半部分：柱状图 -->
    <div class="chart-container">
      <el-tabs v-model="activeTab">
        <el-tab-pane
            v-for="(db, index) in databases"
            :key="index"
            :label="db.name"
        >
          <div ref="chart" class="chart"></div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElCard, ElTabs, ElTabPane } from 'element-plus';
import * as echarts from 'echarts';

const databases = ref([
  { name: 'HIVE', size: 120 },
  { name: 'Doris', size: 80 },
  { name: 'ES', size: 50 },
  { name: '文件服务器', size: 200 },
]);

const activeTab = ref(databases.value[0].name);

const renderChart = (db) => {
  const chartDom = document.querySelector('.chart');
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: `${db.name} 数据容量`,
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: ['数据容量'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: db.name,
        type: 'bar',
        data: [db.size],
      },
    ],
  };
  myChart.setOption(option);
};

onMounted(() => {
  renderChart(databases.value[0]);
});

watch(activeTab, (newTab) => {
  const db = databases.value.find(database => database.name === newTab);
  renderChart(db);
});
</script>

<style scoped>
.data-warehouse {
  padding: 20px;
}

.card-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.db-card {
  width: 200px;
}

.chart-container {
  margin-top: 20px;
}
</style>