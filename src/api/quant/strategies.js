import request from '@/utils/request'

// 查询下单策略列表
export function listStrategies(query) {
    return request({
        url: '/quant/strategies/list',
        method: 'get',
        params: query
    })
}

// 查询下单策略详细
export function getStrategies(id) {
    return request({
        url: '/quant/strategies/' + id,
        method: 'get'
    })
}

// 新增下单策略
export function addStrategies(data) {
    return request({
        url: '/quant/strategies',
        method: 'post',
        data: data
    })
}

// 修改下单策略
export function updateStrategies(data) {
    return request({
        url: '/quant/strategies',
        method: 'put',
        data: data
    })
}

// 删除下单策略
export function delStrategies(id) {
    return request({
        url: '/quant/strategies/' + id,
        method: 'delete'
    })
}
