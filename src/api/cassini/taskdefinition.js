import request from '@/utils/request'

// 查询任务定义列表
export function listTaskdefinition(query) {
  return request({
    url: '/cassini/taskdefinition/list',
    method: 'get',
    params: query
  })
}

// 查询任务定义详细
export function getTaskdefinition(id) {
  return request({
    url: '/cassini/taskdefinition/' + id,
    method: 'get'
  })
}


export function getTaskdefinitionByUUID(uuid) {
  return request({
    url: '/cassini/taskdefinition/getInfoByUUID/' + uuid,
    method: 'get'
  })
}

// 新增任务定义
export function addTaskdefinition(data) {
  return request({
    url: '/cassini/taskdefinition',
    method: 'post',
    data: data
  })
}
export function customAddTaskdefinition(data) {
  return request({
    url: '/cassini/taskdefinition/customAdd',
    method: 'post',
    data: data
  })
}


// 修改任务定义
export function updateTaskdefinition(data) {
  return request({
    url: '/cassini/taskdefinition',
    method: 'put',
    data: data
  })
}

// 删除任务定义
export function delTaskdefintion(id) {
  return request({
    url: '/cassini/taskdefintion/' + id,
    method: 'delete'
  })
}
