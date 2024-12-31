import request from '@/utils/request'

// 查询加密货币历史数据查看列表
export function listCoinhistory(query) {
  return request({
    url: '/quant/coinhistory/list',
    method: 'get',
    params: query
  })
}

// 查询加密货币历史数据查看详细
export function getCoinhistory(id) {
  return request({
    url: '/quant/coinhistory/' + id,
    method: 'get'
  })
}

// 新增加密货币历史数据查看
export function addCoinhistory(data) {
  return request({
    url: '/quant/coinhistory',
    method: 'post',
    data: data
  })
}

// 修改加密货币历史数据查看
export function updateCoinhistory(data) {
  return request({
    url: '/quant/coinhistory',
    method: 'put',
    data: data
  })
}

// 删除加密货币历史数据查看
export function delCoinhistory(id) {
  return request({
    url: '/quant/coinhistory/' + id,
    method: 'delete'
  })
}
