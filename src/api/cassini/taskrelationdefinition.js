import request from '@/utils/request'

// 查询任务定义列表


// 新增任务定义
export function updateProcessRelation(data) {
  return request({
    url: '/cassini/taskrelationdefinition',
    method: 'post',
    data: data
  })
}

