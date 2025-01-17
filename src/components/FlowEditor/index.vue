<template>
  <div class="flow-editor">
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>算子列表</h2>
      </div>
<!--      <div class="operator-categories">-->
<!--        <div-->
<!--          v-for="(value,key) in operatorMap"-->
<!--          :key="key"-->
<!--          class="operator-category"-->
<!--        >-->
<!--          <div class="category-header">-->
<!--            <span class="category-title">-->
<!--                <dict-tag :options="operator_type" :value="key"/>-->
<!--            </span>-->
<!--            <span class="category-count">{{ value.length }}</span>-->
<!--          </div>-->
<!--            <div class="operator-list">-->
<!--              <div-->
<!--                v-for="operator in value"-->
<!--                :key="operator.id"-->
<!--                class="operator-item"-->
<!--                draggable="true"-->
<!--                @dragstart="handleDragStart($event, operator)"-->
<!--              >-->
<!--                <div>-->
<!--                  <img :src= "`${prefix}${operator.operatorIconUrl}`" :width="24" :height="24" alt=""/>-->
<!--                </div>-->
<!--                <div class="operator-info">-->
<!--                  <div class="operator-name">{{ operator.operatorName }}</div>-->
<!--                  <div class="operator-desc">{{ operator.operatorDescription }}</div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--        </div>-->
<!--      </div>-->
      <div class="operator-categories">
          <el-collapse>
        <el-collapse-item
            v-for="(value,key) in operatorMap"
            :key="key"
            class="operator-category"
        >
          <template #title>
            <div class="category-header">
              <span class="category-title">
                  <dict-tag :options="operator_type" :value="key"/>
              </span>
              <span class="category-count">{{ value.length }}</span>
            </div>
          </template>
          <div class="operator-list">
            <div
                v-for="operator in value"
                :key="operator.id"
                class="operator-item"
                draggable="true"
                @dragstart="handleDragStart($event, operator)"
            >
              <div>
                <img :src= "`${prefix}${operator.operatorIconUrl}`" :width="24" :height="24" alt=""/>
              </div>
              <div class="operator-info">
                <div class="operator-name">{{ operator.operatorName }}</div>
                <div class="operator-desc">{{ operator.operatorDescription }}</div>
              </div>
            </div>
          </div>
        </el-collapse-item>
        </el-collapse>
        </div>
      </div>

    <div class="main-content">
      <div class="toolbar">
        <div class="toolbar-left">
          <h2 class="canvas-title">{{ canvasName }}</h2>
          <button class="edit-name-btn" @click="handleEditName">
            <i class="edit-icon"></i>
          </button>
        </div>
        <div class="toolbar-right">
          <button class="save-btn" @click="handleSaveCanvas">
            保存画布
          </button>
        </div>
      </div>
      <div 
        class="graph-container" 
        ref="container"
        @dragover="handleDragOver"
        @drop="handleDrop"
      ></div>
    </div>
    <OperatorDrawer :operatorId="selectedOperatorId" :taskParams="activeNodeData"
      v-model:visible="drawerVisible"
      :operator="selectedOperator"
      @save="handleSaveOperator"
      @changeSelectNodeName="happy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Graph, Node } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import {Snapline} from "@antv/x6-plugin-snapline"
import {
  operatorList,
  type OperatorConfig
} from './types/operator'

import {getOperatordefinitionMap} from "@/api/cassini/operatordefinition"

import OperatorDrawer from './components/OperatorDrawer.vue'
import {  customAddTaskdefinition ,getTaskdefinitionByUUID } from "@/api/cassini/taskdefinition"
import {getProcessdefinitionDetail,updateProcessdefinition} from "@/api/cassini/processdefinition"
import {updateProcessRelation} from "@/api/cassini/taskrelationdefinition"
import {useRoute} from "vue-router";

const { proxy } = getCurrentInstance();
const { operator_type } = proxy.useDict('operator_type');

const prefix=ref("/dev-api/")

const container = ref<HTMLElement | null>(null)
const drawerVisible = ref(false)
const selectedOperator = ref<OperatorConfig | null>(null)
//当前选择的算子ID
const selectedOperatorId = ref('')
let graph: Graph | null = null
const router = useRoute();
const canvasName = ref('未命名画布')
const processDefinitionID = ref()
const graphJSON = ref()

const operatorMap = ref({})

//当前活动的node节点的数据详情
const activeNodeData = ref()
let activeNode = ref()


 async function fetchProcessDefinitionData(){
  const id = router.query.id;
  await getProcessdefinitionDetail(id).then(response => {
    console.log("获取流程定义数据成功："+response.data.name)
    canvasName.value = response.data.name
    processDefinitionID.value = response.data.id
    if(response.data.processJson!=null){
      graphJSON.value = response.data.processJson;
      graph.fromJSON(JSON.parse(graphJSON.value))
    }
  })
}

async function fetchOperatordefinitionMap(){
  await getOperatordefinitionMap().then(response => {
    operatorMap.value = response.data
  })
}


// 初始化图形
onMounted(() => {

  if (container.value) {
    graph = new Graph({
      container: container.value,
      grid: true,
      panning:true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        validateConnection({ sourceView, targetView }) {
          if (!sourceView || !targetView) {
            return false
          }
          // 只防止自己连接自己
          if (sourceView === targetView) {
            return false
          }
          return true
        },
        createEdge() {
          return graph!.createEdge({
            shape: 'edge',
            attrs: {
              line: {
                stroke: '#5F95FF',
                strokeWidth: 2,
                targetMarker: {
                  name: 'classic',
                  size: 8,
                },
                strokeDasharray: '5 5',
                style: {
                  animation: 'ant-line 30s infinite linear',
                },
              },
            },
            zIndex: -1,
          })
        },
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            padding: 4,
            attrs: {
              strokeWidth: 4,
              stroke: '#52c41a',
            },
          },
        },
      },
    })

    // graph.use(new Selection(
    //     {
    //       multiple: true,
    //       rubberband: true,
    //       showNodeSelectionBox: true,
    //       enabled: true,
    //     }
    // )).use(new Keyboard())
    //     .use(new Snapline({enable:true}))

    graph.use(new Keyboard())
        .use(new Snapline({enable:true}))
    //重新渲染界面画布 并居中显示
    nextTick(()=>{
      fetchProcessDefinitionData()
      graph.centerContent()
      fetchOperatordefinitionMap()
    })


    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.canUndo()) {
        graph.undo()
      }
      return false
    })

    // 添加连线动画样式
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      @keyframes ant-line {
        to {
          stroke-dashoffset: -1000
        }
      }
    `
    document.head.appendChild(styleElement)

    // 双击节点打开抽屉
    graph.on('node:dblclick', ({ node }) => {
      // 获取节点的原始 ID（去掉时间戳部分）
      const nodeId = node.id
      //通过id来获取需要弹出的 drawer
      const viewComponent  = node.id.split('_')[0]
      const operator = operatorList.find(op => op.viewComponent === viewComponent)
      activeNode = node
      console.log('Double clicked node:', {
        nodeId,
        operator,
        allOperators: operatorList
      })
      //通过API 获取该算子定义的 详细信息
      getTaskdefinitionByUUID(nodeId).then(response => {
        //回显算子信息
        if(response.data !== undefined){
          activeNodeData.value = JSON.parse(response.data.taskParams)
          console.log("获取算子定义数据成功："+response.data.taskParams + " 用于回显")
        }else{
          console.log("获取算子定义数据失败！无法进行回显")
          //青空 activeNodeData
          activeNodeData.value = {}
        }

      })
      if (operator) {
        selectedOperator.value = operator
        drawerVisible.value = true
        selectedOperatorId.value = nodeId
      }
    })


    // 添加连线成功的事件处理
    graph.on('edge:connected', ({ edge }) => {
      const source = edge.getSourceNode()
      const target = edge.getTargetNode()
      if (source && target) {
        console.log('Connected:', {
          from: source.id,
          to: target.id
        })
      }
    })
  }
})

// 拖拽相关方法
const handleDragStart = (event: DragEvent, operator: OperatorConfig) => {
  event.dataTransfer?.setData('operator', JSON.stringify(operator))
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const operatorData = event.dataTransfer?.getData('operator')
  if (operatorData && graph) {
    const operator = JSON.parse(operatorData) as OperatorConfig
    const point = graph.clientToLocal({
      x: event.clientX,
      y: event.clientY,
    })
    
    const node = graph.addNode({
      id: operator.viewComponent +'_'+ Date.now(),
      data: { operator },
      x: point.x,
      y: point.y,
      width: 120,
      height: 60,
      label: operator.operatorName,
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          {
            id: 'port1',
            group: 'top',
          },
          {
            id: 'port2',
            group: 'right',
          },
          {
            id: 'port3',
            group: 'bottom',
          },
          {
            id: 'port4',
            group: 'left',
          },
        ],
      },
      attrs: {
        body: {
          fill: '#fff',
          stroke: '#5F95FF',
          strokeWidth: 2,
          rx: 6,
          ry: 6,
        },
        label: {
          fontSize: 12,
          fill: '#333',
          // refY: 0.5,
          // textAnchor: 'middle',
          // textVerticalAnchor: 'middle',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
          textWidth: 23, // 文本区域宽度
          textHeight: 30 // 文本区域高度
        },
      },
    })
    console.log('Dropped operator:', operator+"------------------"+ node.id)
  }
}

const handleSaveOperator = (data: any) => {
  console.log('Save operator data:', data)
  // drawerVisible.value = false
  //发送请求到后台 记录当前processdefinitionID
  const id = router.query.id;
  if(id !== undefined){
    data.processDefinitionId = id
  }
  customAddTaskdefinition(data).then(response => {
    drawerVisible.value = false
    //proxy.$modal.msgSuccess("新增成功");
    activeNode.label = data.name
  })

}

const happy= (message)=>{
  alert("最外层打开"+ message)
}

const handleEditName = () => {
  const newName = window.prompt('请输入画布名称', canvasName.value)
  if (newName) {
    canvasName.value = newName
  }
}

const handleSaveCanvas = () => {
  if (!graph) return
  
  const json = graph.toJSON()
  const canvasData = {
    name: canvasName.value,
    graph: json
  }
  
  console.log('Canvas saved:', canvasData)
  // 这里可以调用接口保存数据
  updateProcessdefinition({
    name: canvasName.value,
    id: processDefinitionID.value,
    processJson: JSON.stringify(json)
  })

  //更新所有的连线信息
  const taskRelationList  = []
  graph.getEdges().forEach(edge => {
    const source = edge.getSourceCellId();
    const target = edge.getTargetCellId();
    taskRelationList.push({
      processId: processDefinitionID.value,
      preTask: source,
      postTask: target
    })
  });

  updateProcessRelation(taskRelationList).then(response => {
    console.log("更新连线信息成功！")
  })

}
</script>

<style scoped>
@import './styles.css';
</style>