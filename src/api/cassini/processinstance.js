import request from '@/utils/request'

// 查询流程实例列表
export function listProcessinstance(query) {
  return request({
    url: '/cassini/processinstance/list',
    method: 'get',
    params: query
  })
}

// 查询流程实例详细
export function getProcessinstance(id) {
  return request({
    url: '/cassini/processinstance/' + id,
    method: 'get'
  })
}

// 新增流程实例
export function addProcessinstance(data) {
  return request({
    url: '/cassini/processinstance',
    method: 'post',
    data: data
  })
}

// 修改流程实例
export function updateProcessinstance(data) {
  return request({
    url: '/cassini/processinstance',
    method: 'put',
    data: data
  })
}

// 删除流程实例
export function delProcessinstance(id) {
  return request({
    url: '/cassini/processinstance/' + id,
    method: 'delete'
  })
}
