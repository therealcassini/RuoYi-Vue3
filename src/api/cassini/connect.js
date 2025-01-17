import request from '@/utils/request'

// 查询存储连接信息列表
export function listConnect(query) {
  return request({
    url: '/cassini/connect/list',
    method: 'get',
    params: query
  })
}

// 查询存储连接信息详细
export function getConnect(id) {
  return request({
    url: '/cassini/connect/' + id,
    method: 'get'
  })
}


export function getListByType(type) {
  return request({
    url: '/cassini/connect/getListByType/' + type,
    method: 'get'
  })
}

// 新增存储连接信息
export function addConnect(data) {
  return request({
    url: '/cassini/connect',
    method: 'post',
    data: data
  })
}

// 修改存储连接信息
export function updateConnect(data) {
  return request({
    url: '/cassini/connect',
    method: 'put',
    data: data
  })
}

// 删除存储连接信息
export function delConnect(id) {
  return request({
    url: '/cassini/connect/' + id,
    method: 'delete'
  })
}


// 删除存储连接信息
export function checkConnect(data) {
  return request({
    url: '/cassini/connect/check',
    method: 'post',
    data:data
  })
}


// 查询存储连接信息详细
export function categoryMap() {
  return request({
    url: '/cassini/connect/categoryMap',
    method: 'get'
  })
}

// 查询显示隐藏字段
export function showHiddenMap() {
  return request({
    url: '/cassini/connect/showHiddenMap',
    method: 'get'
  })
}
