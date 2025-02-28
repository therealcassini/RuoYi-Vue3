import request from '@/utils/request'


// 查询下单策略详细
export function index() {
    return request({
        url: '/quant/market/index',
        method: 'get'
    })
}

export function exchangeRate() {
    return request({
        url: '/quant/market/exchangeRate',
        method: 'get'
    })
}

export function account() {
    return request({
        url: '/quant/market/account',
        method: 'get'
    })
}

export function refreshCoin() {
    return request({
        url: '/quant/market/insertNewCoin',
        method: 'get'
    })
}

export function insert3days() {
    return request({
        url: '/quant/market/insert3days',
        method: 'get'
    })
}

export function insert100days() {
    return request({
        url: '/quant/market/insert100days',
        method: 'get'
    })
}

export function coinDetail(data){
    return request({
        url: '/quant/market/detail',
        method: 'post',
        data:data
    })
}


export function favoriteChart(){
    return request({
        url: '/quant/market/favoriteChart',
        method: 'get'
    })
}