<template>

  <div class="app-container">

    <el-form :inline="true" :model="queryParams">
    <el-form-item label="symbol">
      <el-input v-model="queryParams.symbol" placeholder="BTC-USDT" clearable />
    </el-form-item>
    <el-form-item label="day">
      <el-input v-model="queryParams.days" placeholder="3" clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getList">查询</el-button>
    </el-form-item>
  </el-form>

    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="clearfix">
<!--              <PieChart style="width: 1em; height: 1em; vertical-align: middle;" />-->
              <span style="vertical-align: middle;">{{queryParams.symbol}}趋势图</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="coinstatus" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>



    <el-table :data="detailList">
      <el-table-column label="日期" align="center" prop="collectDate" />
      <el-table-column label="最终价格" align="center" prop="finalPrice" />
      <el-table-column label="涨跌" align="center" prop="precent" />
    </el-table>


  </div>
</template>

<script setup name="detail">
import { ref, reactive, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { coinDetail } from '@/api/quant/market'
import * as echarts from 'echarts'

const route = useRoute()

const coinstatus = ref(null)
const coinstatusChart = ref(null)
const detailList = ref([])
const queryParams = reactive({
  symbol: '',
  days: ''
})

// Watch route parameters
watch(() => route.params, (newParams) => {
  queryParams.symbol = newParams.symbol || ''
  queryParams.days = newParams.days?.toString() || '' // Ensure days is string if needed
  getList()
}, { immediate: true })

// Fetch data
function getList() {
  //如果days 包含":" 替换为"-"
  if(queryParams.symbol.includes(":")){
    queryParams.days = 100;
    queryParams.symbol = "BTC-USDT";
  }
  coinDetail(queryParams).then(response => {
    detailList.value = response.data
    showChart()
  })
}

// Initialize chart
function showChart() {
  // Dispose previous chart instance
  if (coinstatusChart.value) {
    coinstatusChart.value.dispose()
  }

  // Initialize new chart
// 初始化图表
  coinstatusChart.value = echarts.init(coinstatus.value);

// 设置图表选项
  coinstatusChart.value.setOption({
    title: {
      text: '价格统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    xAxis: {  // 添加 X 轴配置
      type: 'category',
      data: detailList.value.map(item => item.collectDate),  // X 轴数据
    },
    yAxis: {  // 添加 Y 轴配置
      type: 'value',
      name: '价格' // 可以自定义 Y 轴名称
    },
    series: [
      {
        name: '价格分布',
        type: 'line',  // 仍然为折线图
        data: detailList.value.map(item => item.finalPrice),  // 直接使用 Y 轴数据
        smooth: true,  // 添加平滑效果 (可选)
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });

}

// Cleanup on unmount
onUnmounted(() => {
  if (coinstatusChart.value) {
    coinstatusChart.value.dispose()
  }
})
</script>

<style scoped lang="scss">

</style>