import request from '@/utils/request'

// 查询任务实例列表
export function listTaskinstance(query) {
  return request({
    url: '/cassini/taskinstance/list',
    method: 'get',
    params: query
  })
}

// 查询任务实例详细
export function getTaskinstance(id) {
  return request({
    url: '/cassini/taskinstance/' + id,
    method: 'get'
  })
}

// 新增任务实例
export function addTaskinstance(data) {
  return request({
    url: '/cassini/taskinstance',
    method: 'post',
    data: data
  })
}

// 修改任务实例
export function updateTaskinstance(data) {
  return request({
    url: '/cassini/taskinstance',
    method: 'put',
    data: data
  })
}

// 删除任务实例
export function delTaskinstance(id) {
  return request({
    url: '/cassini/taskinstance/' + id,
    method: 'delete'
  })
}
