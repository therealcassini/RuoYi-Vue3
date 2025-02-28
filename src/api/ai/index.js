import request from '@/utils/request'

// 查询存储连接信息列表
export function accountInfo(){
    return request({
        url: '/ai/account',
        method: 'get',
    })
}


export function modelList(){
    return request({
        url: '/ai/modelList',
        method: 'get',
    })
}


export function fakeChat(){
    return request({
        url: '/ai/fakeChat',
        method: 'get',
    })
}


export function createTopic(data){
    return request(
        {
            url: '/ai/createTopic',
            method: 'post',
            data:data
        }
    )
}

export function topicHistory(){
    return request(
        {
            url:'/ai/topicHistory',
            method:'get'
        }
    )
}

export function getTopicDetail(data){
    return request(
        {
            url:'/ai/getTopicDetail',
            method:'get',
            params:data
        }
    )
}


export function setDefaultModel(data){
    return request(
        {
            url:'/ai/setDefaultModel',
            method:'get',
            params:data
        }
    )
}

export function ask(data){
    return request(
        {
            url:'/ai/ask',
            method:'post',
            data:data
        }
    )
}


export function allCharacter(){
    return request(
        {
            url:'/ai/allCharacter',
            method:'get'
        }
    )
}

export function currentModel(){
    return request(
        {
            url:'/ai/currentModel',
            method:'get'
        }
    )
}