import request from '@/utils/request'

// 查询存储连接信息列表
export function searchVocabulary(data){
    return request(
        {
            url:'/word/searchVocabulary',
            method:'get',
            params:data
        }
    )
}

export function getVocabulary(){
    return request(
        {
            url:'/word',
            method:'get'
        }
    )
}

