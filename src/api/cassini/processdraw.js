import request from '@/utils/request'


// 修改任务管理
export function processdraw(id) {
  return request({
    url: '/cassini/processdefintion/draw/'+id,
    method: 'get'
  })
}


