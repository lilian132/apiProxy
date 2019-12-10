const fs = require('fs-extra');

const config = {
  apiInsert : true,
}

/**
 * 将API文档元数据转换成需要的数据格式
 * @param {object} data 
 */
const processData = (data) => {
  const newData = {};
  data.map(data => {
    data.list.map(item => {
      newData[item.path] = {}
      if (item.res_body) {
        newData[item.path] = JSON.parse(item.res_body).properties
      }      
    })
  })
  return newData
}

/**
 * 根据旧响应体+api对象返回新的响应体
 * @param {object} body 
 * @param {object} apiObj 
 * @param {string} url 接口地址
 */
const createNewBody = (body, api, apiUrl) => {
  if (!api || Object.getOwnPropertyNames(api).length == 0 || !body.content) {
    body['【注释】'] = '整个接口没有文档，不能忍'
    return body
  }

  if(!config.apiInsert) {
    body['【注释】'] = api
    return body
  }

  function getApiByPath(path) {
    // path: obj[productInfosList][0][productInfoList][0]
    path = path.replace('obj', 'api').replace(/\[0\]/g, '["items"]["properties"]')
    let result;
    try {
      result = eval("("+path+")")
    }catch(e){}
    return result
  }

  const missArr = [] // 文档没有任何记录的字段
  /**
   * 对像遍历，查询API解释文案并插入进对象
   * @param {object} obj 接口数据对象
   * @param {string} path 当前对象的路径字符串
   */
  function mapObj(obj, path) {  
    for(let i in obj) {
      const isObj = isNaN(Number(i))     
      
      // 当前是对象，则直接给每个属性添加注释
      if(isObj) {
        const info = getApiByPath(path)
        if (info && info[i]) {
          obj[`${i}【注释】`]  = `[${info[i].type}] ${info[i].description || '缺失'}`
        }else {
          obj[`${i}【注释】`]  = `缺失`
          if (info && !info[i]) {
            // 文档中没有这个属性的任何记录
            missArr.push(i)
          }
        }
      }
      
      // 子元素也是个对象，则递归遍历
      if(typeof obj[i] == 'object' && obj[i] != null) {
        newPath = isObj ?`${path}["${i}"]` : `${path}[${i}]`
        mapObj(obj[i], newPath)
      }
    }
  }

  mapObj(body.content, 'obj', )
  missArr.length && updateMissFile(missArr, apiUrl)
  return body
}

/**
 * api文档没有属性的记录，更新missInfo文件做记录
 * @param {arr} missArr 
 * @param {string} apiUrl 
 */
function updateMissFile(missArr, apiUrl) {
  fs.readJson('../missInfo.json', (err, packageObj) => { 
    if (!packageObj) {
      packageObj = {}
    }
    packageObj[apiUrl] = missArr.join()
    fs.writeJson('../missInfo.json', packageObj, err => {      
      console.log('updateMissFile success!')
    })
  })
}

module.exports = {
  config,
  processData,
  createNewBody,
}