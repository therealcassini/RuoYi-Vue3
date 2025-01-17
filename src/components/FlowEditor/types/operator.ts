import {Component} from "vue";
import MysqlDrawer from "../operators/mysql/MysqlDrawer.vue";
import ShellDrawer from "../operators/shell/ShellDrawer.vue";


export const mysqlOperator: OperatorConfig = {
  operatorName: 'MySQL执行',
  viewComponent: 'mysql-exec',
  component: MysqlDrawer
}

export const shellOperator: OperatorConfig = {
  operatorName: 'Shell执行',
  viewComponent: 'shell-exec',
  component: ShellDrawer
}

// 导出所有算子列表
export const operatorList = [
  shellOperator,
  mysqlOperator
]


export interface OperatorConfig {
  operatorName: string
  viewComponent: string
  component: Component
}



