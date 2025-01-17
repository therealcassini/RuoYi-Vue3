import request from '@/utils/request'

// 查询任务管理列表
export function listProcessdefinition(query) {
  return request({
    url: '/cassini/processdefinition/list',
    method: 'get',
    params: query
  })
}

// 查询任务管理详细
export function getProcessdefinition(id) {
  return request({
    url: '/cassini/processdefinition/' + id,
    method: 'get'
  })
}

export async function getProcessdefinitionDetail(id) {
  return await request({
    url: '/cassini/processdefinition/' + id,
    method: 'get'
  })
}



// 新增任务管理
export function addProcessdefinition(data) {
  return request({
    url: '/cassini/processdefinition',
    method: 'post',
    data: data
  })
}

// 修改任务管理
export function updateProcessdefinition(data) {
  return request({
    url: '/cassini/processdefinition',
    method: 'put',
    data: data
  })
}

// 删除任务管理
export function delProcessdefinition(id) {
  return request({
    url: '/cassini/processdefinition/' + id,
    method: 'delete'
  })
}
