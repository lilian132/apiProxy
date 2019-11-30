const fs = require('fs-extra');
const { jsonToTableHtmlString } = require('json-table-converter')

//  记录每个属性是否有文档
function mapAttributes(properties, missObj){
  for(let i in properties) {
    if (i == 'type' || i == 'description' || i == 'properties' || i == 'required') {
      continue
    }

    if (!properties[i].description) {
      missObj['缺失字段数量'] ++
      missObj['缺失字段'] += `【${i}】 `
    }
    
    if (properties[i].items) {
      // 遍历数组
      mapAttributes(properties[i].items, missObj)
    }else if (properties[i] instanceof Object) {
      // 遍历对象
      mapAttributes(properties[i].properties, missObj)
    }
  }
}

/**
 * 生成API文档质量报告
 * @param {object} data api json 数据
 */
const createApiReport = (data) => {
  const report = {
    total: 0, // api接口数量
    '没有文档': [], // 整个接口没有文档
    '字段缺失': [], // 缺失字段
  };

  data.map(data => {
    data.list.map(item => {
      report.total++
      // 记录缺失文档的API
      const res_body = item.res_body ? JSON.parse(item.res_body) : null
      if (!res_body || !res_body.properties || Object.getOwnPropertyNames(res_body.properties).length == 0) {
        const noApi = {
          '所属模块': data.name, // 所属模块
          path: item.path, // 接口路径          
        }
        report['没有文档'].push(noApi) 
      } else{
        const missObj = {
          '所属模块': data.name, // 所属模块
          path: item.path,          
          '缺失字段数量': 0,
          '缺失字段': '' // 详情
        }
        mapAttributes(res_body.properties, missObj)
        missObj['缺失字段数量'] && report["字段缺失"].push(missObj)
      }
    })
  })  
  return report
}

fs.readJson('./crawler/fileData/api.json', (err, packageObj) => {
  if (err) console.error(err)    
  const reportJson = createApiReport(packageObj)
  const table = jsonToTableHtmlString(reportJson, {
    tableStyle: ''
  })
  const title = `
    <head>
      <meta charset="utf-8"/>  
    </head>
    <style>
    html,body{}
    .title{background: gray; padding:15px; font-size:22px}
    h3,h4{text-align: center}
    h4{line-height: 28px; padding:0; margin:0}
    </style>
    <h3 class="title">接口完整性自动化报告 ${new Date().toLocaleString()}</h3>
    <h4>总接口数：${reportJson.total}</h4>
    <h4>没有文档接口数：${reportJson['没有文档'].length}</h4>
    <h4>API文档有字段但没有解释：${reportJson['字段缺失'].length}</h4>
    <h4>API文档完全没有记录：直接看最后一个表格</h4>
  `
  // 获取API缺失的文档
  const missInfo = fs.readJsonSync('./crawler/fileData/missInfo.json')
  const missTitle = `
  <h3 class="title">以下字段完全在API文档中找不到记录</h3>
  `
  const missInfoTable = jsonToTableHtmlString(missInfo, {
    tableStyle: 'width: 100%'
  })
  fs.writeFileSync('./dist/index.html', `${title}${table}${missTitle}${missInfoTable}`)
})
