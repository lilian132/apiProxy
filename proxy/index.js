const http = require('http');
const httpProxy = require('http-proxy');
const modifyResponse = require('node-http-proxy-json');
const crawler = require('../crawler/');

// 新建一个代理 Proxy Server 对象  
var proxy = httpProxy.createProxyServer({});  

// proxy.on('proxyReq', (proxyReq, req, res, option) => {
//   console.log('reqreqreqreq', req)
// }); 

proxy.on('proxyRes', (proxyRes, req, res, option) => {  
  modifyResponse(res, proxyRes, function (body) {
      if (body) {
        const reqUrl = req.url.match(/\/ostrader(.+)\?/)[1]
        const api = crawler.getApiDoc(reqUrl);
        body = crawler.createNewBody(body, api, reqUrl);
      }
      return body; // return value can be a promise
  });
}); 
 
// 在每次请求中，调用 proxy.web(req, res config) 方法进行请求分发  
var server =http.createServer(function(req, res) {
  //console.log('=====代理服务器生效：=====');
  //console.log(req.url);
  proxy.web(req, res, { target: 'https://ehkrd.danarupiah.id', changeOrigin: true, });  
});  

console.log("代理服务器生效")  
server.listen(4009);