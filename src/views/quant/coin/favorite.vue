<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="clearfix">
          <span style="vertical-align: middle;">关注的币的趋势图表</span>
        </div>
      </template>
      <div class="el-table el-table--enable-row-hover el-table--medium">
        <div ref="coinstatus" style="height: 720px"></div>  <!-- 确保这是一个有效的块级元素 -->
      </div>
    </el-card>
  </div>
</template>

<script setup name="favorite">
import {ref, onMounted} from "vue";
import * as echarts from 'echarts';
import {favoriteChart}  from "@/api/quant/market.js";

const coinstatus = ref(null);
const coinstatusChart = ref(null);
const chartData = ref([])

function showChart() {
  // Dispose previous chart instance
  if (coinstatusChart.value) {
    coinstatusChart.value.dispose();
  }
  // Initialize new chart
  coinstatusChart.value = echarts.init(coinstatus.value);

  let dates = []
  let seriesData = []
  let legendData = []

  for (let coin in chartData.value) {
    legendData.push(coin);
    let coinData = chartData.value[coin];
    let coinDates = [];
    let coinPrices = [];

    // 提取时间和最终价格
    coinData.forEach(data => {
      coinDates.push(data.collectDate);
      coinPrices.push(data.precent);
    });

    // 设置 xAxis 数据（日期）只取第一次出现的
    if (dates.length === 0) {
      dates = coinDates;
    }

    // 构建每个币种的 series 数据
    seriesData.push({
      name: coin,  // 币种名称
      type: 'line',  // 折线图
      data: coinPrices  // 该币种的最终价格数据
    });
  }

  console.log(seriesData)
  console.log(legendData)

  // Set chart options
  coinstatusChart.value.setOption({
    title: {
      text: '相对100天前的趋势'
    },
    tooltip: {
      trigger: 'axis',  // 或 'item' 视具体数据情况而定
      backgroundColor: 'rgba(50,50,50,0.7)',  // 背景颜色
      textStyle: {
        color: '#fff',  // 提示框文本颜色
      }
    },
    legend: {
      data: legendData,  // 所有币种的名称
      orient: 'horizontal',
      left: 'center',
      top: 'top',
      itemGap: 15,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates  // 日期作为 x 轴
    },
    yAxis: {
      type: 'value'
    },
    series: seriesData  //
  });
}

// 使用 onMounted 生命周期钩子确保 DOM 完全渲染后再调用 showChart()
onMounted(() => {
  favoriteChart().then(response => {
    chartData.value = response.data
    console.log(chartData.value)
    showChart();
  })
});

</script>
