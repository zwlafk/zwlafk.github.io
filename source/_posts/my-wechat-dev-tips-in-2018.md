---
title: 企业微信开发记录
date: 2019-03-06 15:49:50
tags: [javascript,微信相关开发]
categories: web
---
记录与总结去年开发企业微信项目相关。（部分代码应该应该同样可以用于公众号的开发）
<!--more-->
## 签名
调用微信的api第一步应该就是获得微信签名，我自己用node搭建了前端自用的签名服务
node后端代码如下：
```javascript
//server.js
const express = require('express')
const morgan = require('morgan')
const app = express()
const router = require('./router')

app.use(morgan('dev'))
// 只用接口服务，这里不需要托管静态文件了
// app.use(express.static(__dirname + '/dist'))
app.use(router)
app.listen(8086);
```
```javascript
//router.js
const express = require('express')
const getAccessToken = require('./middleware/wx').getAccessToken
const getJsapiToken = require('./middleware/wx').getJsapiToken
const getSignature = require('./middleware/wx').getSignature
const router = express.Router()
router.get('/api/get/signature',
  getAccessToken,
  getJsapiToken,
  getSignature
)
module.exports = router
```
生成微信签名需要先生成token，再生成ticket，然后用sha1生成我们要的signature，每一步生成的值要做好缓存，我用了`'memory-cache'`包处理
```javascript
// middleware/wx.js
const sha1 = require('js-sha1');
const request = require('request');
const cache = require('memory-cache');
let access_token = ""
let jsapi_ticket = ""
const expire_time = 7199999
const getAccessToken = (req, res, next) => {
  const { query: { corpsecret, corpid, url } } = req
  let access_token_cache = cache.get(corpsecret)
  if (access_token_cache) {
    console.log(access_token_cache, 'access_token_cache')
    access_token = access_token_cache
    next()
  } else {
    request('https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      {
        qs: {
          corpid,
          corpsecret
        }
      },
      (error, response, body) => {
        console.log("***********getAccessToken middle**********")
        let info = JSON.parse(body)
        access_token = info.access_token
        cache.put(corpsecret, access_token, expire_time);
        next()
      });
  }
}
const getJsapiToken = (req, res, next) => {
  let jsapi_ticket_cache = cache.get(access_token)
  if (jsapi_ticket_cache) {
    console.log(jsapi_ticket_cache, 'jsapi_ticket_cache')
    jsapi_ticket = jsapi_ticket_cache
    next()
  } else {
    request('https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket',
      {
        qs: {
          access_token
        }
      },
      (error, response, body) => {
        console.log("***********getJsapiToken middle**********")


        let info = JSON.parse(body)
        jsapi_ticket = info.ticket
        cache.put(access_token, jsapi_ticket, expire_time);

        next()
      });
  }
}
const getSignature = (req, res) => {
  const { query: { url } } = req
  let noncestr = "test"
  let timestamp = new Date().getTime()
  let string1 = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
  let signature = sha1(string1)
  let resObj = {
    signature, timestamp, nonceStr: noncestr
  }
  let data = { data: resObj }
  console.log(new Date().getHours() + ':' + new Date().getMinutes())
  console.log("*********** end **********")
  return res.send(data)
}
exports.getAccessToken = getAccessToken
exports.getJsapiToken = getJsapiToken
exports.getSignature = getSignature
```
然后可以启动服务，在客户端调用这个接口
```bash
node server
```
在企业微信中调用这个接口的话需要url经过[验证](#valid)，（这里想在本地开发环境使用的话，需要用内网穿透工具映射自己的服务到公网，我们用的是钉钉的工具）  
客户端代码：
```javascript
axios.get('/wx/getSignature',
  {
    params: {
      // 这三个参数跟在企业微信的管理页面可以拿到和配置
      corpid:"ww184db0f35d1176d3",
      corpsecret:"XgqQTQgJUyBQstkJ_4b0Xemav1wkUGqdXQ8YiTFYT4M",
      url: 'http://bnddk.vaiwan.com/'
    }
  }).then(res => {
    wx.config({
      beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
      // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      ...res.data, // /wx/getSignature接口返回参数
      jsApiList: [
        'chooseImage',
        'getLocalImgData',
        'uploadImage',
      ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
  })
```
成功之后就可以在项目中调用wx的api了
## 封装微信api
微信的api不方便的地方就是参数多，回调也作为参数对象的属性，写起来很不舒服，所以我把一些api做了promise处理，很简单，就是把wx的api包进Promise里，在成功回调调用resolve，失败的回调调用reject   
以选择图片为例：
```javascript
export const wxChooseImage = (count = 4) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: count, // 默认9
      sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
      defaultCameraMode: "batch", //表示进入拍照界面的默认模式，目前有normal与batch两种选择，normal表示普通单拍模式，batch表示连拍模式，不传该参数则为normal模式。（注：用户进入拍照界面仍然可自由切换两种模式）
      success: function (res) {
        var localIds = res.localIds; // 返回选定照片的本地ID列表，
        resolve(localIds)
        // andriod中localId可以作为img标签的src属性显示图片；
        // 而在IOS中需通过上面的接口getLocalImgData获取图片base64数据，从而用于img标签的显示
      }
    });
  })
}


const wxGetLocalImgData = (localId) => {
  return new Promise((resolve, reject) => {
    if (!localId) reject(new Error('localId 为空'));
    wx.getLocalImgData({
      localId: localId, // 图片的localID
      success: function (res) {
        var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
        resolve(localData)
      }
    });
  })
}
/**
 *
 * @param {Array} localIds
 * 配合上面两个使用
 * Usage:
 * wxChooseImage()
    .then(localIds => {
      return getAllLocalImgData(localIds);
    })
    .then(LocalImgData => {
      this.imageArr = LocalImgData;
    })
    .catch(e => {});
    @returns {Array}
 */
export const getAllLocalImgData = (localIds) => {
  return Promise.all(localIds.map(element => wxGetLocalImgData(element)));
}

```
## <span id = "valid">验证</span>
在企业微信管理后台，我们要对自己服务所在的url进行验证后才能正常调用微信的api，
微信的验证方式是对你配置的url进行访问，你需要放一个微信提供的txt文件在静态资源中，使其通过url可以访问到（比如访问http://localhost:8080/WW_verify_8ocsL2HqKAyGwbf9是直接访问资源目录中名为WW_verify_8ocsL2HqKAyGwbf9的文件），但是我们的项目使用的是vue，这种url最终回被路由拦住，所以我饿每年要通过webpack配置，把对应名称的文件当作资源能被访问到   
需要把文件放在项目中的是static文件夹中，在webpack配置文件中通过CopyWebpackPlugin：
```javascript
plugins: [
  
  // copy custom static assets
  new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, '../static/WW_verify_8ocsL2HqKAyGwbf9.txt'),
      to: 'WW_verify_8ocsL2HqKAyGwbf9.txt',
      toType: 'file'
    }
  ])
]
```
这样就可以通过url直接访问到文件资源了