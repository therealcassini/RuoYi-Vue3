import request from '@/utils/request'


// 查询存储连接信息详细
export function listTables(tableType) {
  return request({
    url: '/cassini/tables/listTable' ,
    method: 'get',
    params:tableType
  })
}

// 查询表格的字段信息
export function listTableFields(name) {
  return request({
    url: '/cassini/tables/listTableFields',
    method: 'get',
    params:name
  })
}

export function addTable(data) {
  return request({
    url: '/cassini/tables/addTable',
    method: 'post',
    data:data
  })
}


// 基础表的下拉
export function metaTableTree() {
  return request({
    url: '/cassini/tables/metaTableTree' ,
    method: 'get'
  })
}