<script setup name="market">

  //定义一个响应对象用于接受刷新的数据
  const market = ref(null);
  const accountInfo = ref(null);
  const exchange = ref(null);
  const itemList = ref(null);
  const wallet = ref(null);

  let intervalId ;


 import {index ,account ,exchangeRate ,refreshCoin ,insert3days ,insert100days}  from "@/api/quant/market.js";
 import {onMounted,onBeforeUnmount} from "vue";

  index().then(response => {
      console.log(response.data);
      market.value = response.data;
    });
  account().then(response => {
    console.log(response.data);
    accountInfo.value = response.data;
    itemList.value = response.data.coinItemList;
    wallet.value = accountInfo.value.wealthStr;
  });
  exchangeRate().then(response => {
    console.log(response.data);
    exchange.value = response.data;
  })

 //每分钟刷新一次
  onMounted(() => {
    intervalId =  setInterval(() => {
      index().then(response => {
        console.log(response.data);
        market.value = response.data;
      });
      account().then(response => {
        console.log(response.data);
        accountInfo.value = response.data;
        itemList.value = response.data.coinItemList;
        wallet.value = accountInfo.value.wealthStr;
      });
    }, 60000);
  })

  onBeforeUnmount(() => {
    console.log('组件销毁');
    clearInterval(intervalId);
  })

  function formatNumber(value) {
    // 如果值为 null 或 undefined，返回空字符串
    if (value === null || value === undefined) {
      return '';
    }
    // 使用 toFixed 保留两位小数
    return Number(value).toFixed(2);
  }

  function checkNewCoin() {
    refreshCoin().then(response => {
      console.log(response.data);
      alert(response.data)
    });
  }

  function insert3daysCoin() {
    insert3days().then(response => {
      alert(response.data)
    });
  }

  function insert100daysCoin() {
    insert100days().then(response => {
      alert(response.data)
    });
  }


</script>

<template>

  <!-- 渲染 index 的页面 -->
  <div class="app-container">

    <div>
      <el-text type="success" > 当前汇率为： {{exchange}}      当前账户信息为：{{wallet}}</el-text>
        <div v-for="(value,key) in itemList">
          <el-text type="primary">{{value.coinName}} 总计为： {{formatNumber(value.total)}} 当前可用： {{formatNumber(value.available)}} 当前冻结：{{formatNumber(value.used)}} 盈亏：{{formatNumber(value.earn)}} 杠杆倍数为： {{formatNumber(value.multiple)}} 杠杆资金为： {{formatNumber(value.realCost)}}</el-text>
        </div>
      <el-button type="primary" @click="checkNewCoin">刷新新币入库</el-button>
      <el-button type="primary" @click="insert3daysCoin">插入3天数据</el-button>
      <el-button type="primary" @click="insert100daysCoin">插入100天数据</el-button>
    </div>

    <el-table :data="market" style="width: 100%">
      <el-table-column prop="instId" label="ID" />
      <el-table-column prop="sodUtc8" label="开盘价格" />
      <el-table-column prop="last" label="最新成交价格" />
<!--      <el-table-column prop="open24h" label="24小时开盘价" />-->
      <el-table-column prop="high24h" label="24小时最高" />
      <el-table-column prop="low24h" label="24小时最低" />
      <el-table-column prop="volCcy24h" label="24小时成交量（法币）" />
      <el-table-column label="涨跌" >
        <template #default="scope">
          <span :class="scope.row.changePct > 0 ? 'up' : 'down'">{{scope.row.changePct}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="amplitude" label="增幅" />
      <el-table-column prop="maxUp" label="最大涨幅" />
      <el-table-column prop="maxDown" label="最大跌幅" />
      <el-table-column prop="ts" label="时间" />
    </el-table>

  </div>
</template>

<style scoped lang="scss">
.up{
  color: green;
}
.down{
  color: red;
}
</style>