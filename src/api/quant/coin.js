import request from '@/utils/request'

// 查询币种知识库列表
export function listCoin(query) {
  return request({
    url: '/quant/coin/list',
    method: 'get',
    params: query
  })
}

// 查询币种知识库详细
export function getCoin(id) {
  return request({
    url: '/quant/coin/' + id,
    method: 'get'
  })
}

// 新增币种知识库
export function addCoin(data) {
  return request({
    url: '/quant/coin',
    method: 'post',
    data: data
  })
}

// 修改币种知识库
export function updateCoin(data) {
  return request({
    url: '/quant/coin',
    method: 'put',
    data: data
  })
}

// 删除币种知识库
export function delCoin(id) {
  return request({
    url: '/quant/coin/' + id,
    method: 'delete'
  })
}
