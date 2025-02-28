<template>
  <div class="app-container">
    <div class="account-layout">
        <el-card class="user-card" shadow="hover" v-if="user.email">
          <div class="user-info">
            <div class="info">
<!--              <img :src="require('@/assets/giao.png')" alt="吴彦祖" class="user-image"/>-->
              <img :src="'/src/assets/giao.png'" alt="吴彦祖" class="user-image"/>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Balance:</strong> {{ user.balance }}</p>
              <p><strong>Status:</strong> {{ user.status }}</p>
              <p><strong>Introduction:</strong> {{ user.introduction || 'No introduction provided.' }}</p>
              <p><strong>Role:</strong> {{ user.role || 'Not assigned' }}</p>
              <p><strong>Charge Balance:</strong> {{ user.chargeBalance }}</p>
              <p><strong>Total Balance:</strong> {{ user.totalBalance }}</p>
              <p><strong>Category:</strong> {{ user.category }}</p>
            </div>
          </div>
        </el-card>
        <el-card class="model-card" shadow="hover">
          <el-table :data="models" style="width: 100%" @row-click="handleRowClick">
            <el-table-column property="id" label="模型ID"></el-table-column>
            <!-- 这里可以继续添加更多的列 -->
          </el-table>
        </el-card>
        <el-card class="agent-card" shadow="hover">
          <el-table :data="agents" style="width: 100%">
            <el-table-column width="130px" property="agent" label="角色名称"></el-table-column>
            <el-table-column property="prompt" label="角色描述"></el-table-column>
          </el-table>
        </el-card>

      </div>
    </div>
</template>
  <script setup>
    import { ref, reactive, toRaw, unref, computed, onMounted } from 'vue'
    import { accountInfo, modelList ,setDefaultModel ,allCharacter } from '@/api/ai/index.js'
    const { proxy } = getCurrentInstance();




    const user = ref({
      id:'',
      name:'',
      image:'',
      email:'',
      isAdmin:'',
      balance:'',
      status:'',
      introduction:'',
      role:'',
      chargeBalance:'',
      totalBalance:'',
      category:''
    })

    const models = ref([])
    const agents = ref([])

    function init(){
      accountInfo().then(res => {
        user.value = res.data;
      })
      modelList().then(res => {
        models.value = res.data;
      })
      allCharacter().then(res => {
        agents.value = res.data;
      })
    }

    init();

    function handleRowClick(row) {
      console.log(row.id)
      setDefaultModel({ modelName: row.id });
      proxy.$modal.msgSuccess('模型设置成功：'+ row.id)
    }


  </script>

<style lang="scss" scoped>

.account-layout{
  display: flex;
}

.user-card {
  width: 23%;
  margin-right: 20px;
}

.model-card {
  width: 25%;
  margin-right: 20px;
}
.agent-card {
  width: 57%;
}


.header-title {
  font-size: 18px;
  font-weight: 600;
}

.button {
  float: right;
}

.user-info {
  display: flex;
  margin-top: 20px;
}

.user-image {
  width: 100%;
  height: 100%;
  margin-top: 30px;
  margin-bottom: 60px;
  object-fit: cover; /* 适应容器的图像比例 */
  //border-radius: 50%; /* 变成圆形 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
}


.info {
  display: flex;
  flex-direction: column;
}

.info p {
  margin: 5px 0;
}
</style>