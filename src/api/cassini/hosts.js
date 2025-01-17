import request from '@/utils/request'

// 查询worker管理列表
export function listHosts(query) {
  return request({
    url: '/cassini/hosts/list',
    method: 'get',
    params: query
  })
}

// 查询worker管理详细
export function getHosts(id) {
  return request({
    url: '/cassini/hosts/' + id,
    method: 'get'
  })
}

// 获取所有的hosts
export function getAllHosts() {
  return request({
    url: '/cassini/hosts/getAllHosts',
    method: 'get'
  })
}

// 新增worker管理
export function addHosts(data) {
  return request({
    url: '/cassini/hosts',
    method: 'post',
    data: data
  })
}

// 修改worker管理
export function updateHosts(data) {
  return request({
    url: '/cassini/hosts',
    method: 'put',
    data: data
  })
}

// 删除worker管理
export function delHosts(id) {
  return request({
    url: '/cassini/hosts/' + id,
    method: 'delete'
  })
}
