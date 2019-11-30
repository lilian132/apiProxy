/**
 * 模块功能：进入jinkins爬取数据
 */
const puppeteer = require('puppeteer');
// const fetchData = require('./fetchData');
const dataStrategy = require('./dataStrategy');
const fs = require('fs-extra');

// 获取数据的查询队列
let queryList = [];
// 爬取的数据
let data = {};

let page;

// (async function() {
//   const browser = await puppeteer.launch({
//     headless: true,
//     ignoreHTTPSErrors: true,
//   });
//   page = await browser.newPage();
//   await page.goto('http://apimgr.zz.com/login');   
//   await page.waitFor(2000);
//   await page.type('#email', '245943272@qq.com');
//   await page.type('#password', 'lilingyun132');
//   await page.click('button[type=submit]');
//   await page.waitFor(3000);
//   const result = await page.evaluate(fetchData);  
//   console.log(result);
//   const data = await dataStrategy.processData(result);
//   console.log(data);
//   fs.writeJson('./crawler/fileData/1.json', {
//       name: 'file',
//       data,
//     }, err => {
//       if (err) return console.error(err)
//       console.log('success!')
//     })
// })();

const getApiDoc = (url) => {
  return data[url]
}

const init = () => {
  fs.readJson('./crawler/fileData/api.json', (err, packageObj) => {
    if (err) console.error(err)    
    data = dataStrategy.processData(packageObj)
    console.log(data)
  })
}
init()

module.exports = {
  getApiDoc,
  createNewBody: dataStrategy.createNewBody,
}