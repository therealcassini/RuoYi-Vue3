import request from '@/utils/request'

// 查询算子模板定义列表
export function listOperatordefinition(query) {
  return request({
    url: '/cassini/operatordefinition/list',
    method: 'get',
    params: query
  })
}

// 查询算子模板定义详细
export function getOperatordefinition(id) {
  return request({
    url: '/cassini/operatordefinition/' + id,
    method: 'get'
  })
}

// 新增算子模板定义
export function addOperatordefinition(data) {
  return request({
    url: '/cassini/operatordefinition',
    method: 'post',
    data: data
  })
}

// 修改算子模板定义
export function updateOperatordefinition(data) {
  return request({
    url: '/cassini/operatordefinition',
    method: 'put',
    data: data
  })
}

// 删除算子模板定义
export function delOperatordefinition(id) {
  return request({
    url: '/cassini/operatordefinition/' + id,
    method: 'delete'
  })
}

//算子模版分类及下面的名称列表
export async function getOperatordefinitionMap() {
  return await request({
    url: '/cassini/operatordefinition/getCategoryMap',
    method: 'get'
  })
}