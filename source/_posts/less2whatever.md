---
title: 面对各种小程序,制作一个less2whatever工具
date: 2019-03-07 10:28:20
tags: [less,css]
categories: web
---
实现一个命令行工具less2whatever，监听less文件变化，自动编译生成对应后缀的文件   
这篇文章我首发于[掘金](https://juejin.im/post/5c7b208ee51d457f7b6c98f5)
<!--more-->
## 重复的轮子
监听less文件变化原地生成css文件，这个功能在诸多编辑器上的插件都能实现，通过配置，也可以改变生成文件的后缀名，比如wxss,acss等。  
但是当我接到公司小程序项目的时候，第一反应还是想自己动手实现一个。原因是：
1. 这个工具实现起来并不复杂；
2. 这是个练习的好机会，可以学习如何用node编写命令行工具，如何在npm上发布自己的包。   

## 代码
这个工具做的事情应该是这样的，在项目目录通过命令行运行后，开始监听文件夹包括子文件夹内.less文件的变化，当监听到文件变化时，运行lessc命令在文件所在的目录生成对应后缀的样式文件。  
首先是初始化一个node工程
```
mkdir less2whatever
cd less2whatever
npm init
```
然后创建一个名为`bin`的文件夹，在bin文件夹里新建一个`less2whatever.js`，我们最终输入命令行之后执行的就是这个文件，代码如下   
```javascript
#!/usr/bin/env node
var fs = require("fs"),
    path = process.cwd(),
    fileWatcher = require("../index.js");
/**
 * 
 * @param  suffix 自定义生成的后缀名，从命令行的参数中获取，默认为css
 */
var run = function (suffix="css") {
    fs.readdir(path, function (err, files) {
        console.log(path)
        if (err) {
            return console.log(err);
        }
        fileWatcher(path, suffix)
    });
};
//获取除第一个命令以后的第一个参数
run(process.argv.slice(2)[0]); 
```
在package.json中添加bin字段   
```json
"bin": { "less2whatever": "bin/less2whatever.js" }
```
表示`less2whatever`命令执行的是`bin/less2whatever.js`   
代码顶部一定要加上`#!/usr/bin/env node`,表示要使用node来执行这段脚本,`fileWatcher`是我们监听文件并编译文件的代码：
```javascript
const fs = require('fs')
const exec = require('child_process').exec
const path = require('path')
/**
 * 
 * @param  rootPath 执行命令时的路径
 * @param  filename 变动的less文件名
 */
function compileFile(rootPath, filename, suffix) {
	let filePathArr = `${rootPath + '\\' + filename}`.split('.')
	filePathArr.pop()
	let filenameWithPath = filePathArr.join('.')
	exec(`lessc -x ${filenameWithPath}.less > ${filenameWithPath}.${suffix}`)
}
/**
 * 递归监听文件夹下less文件的变化（包括新建less文件）
 * @param rootPath 执行命令时的路径
 * @param suffix 需要编译生成的文件后缀名（wxss/css）
 */
function fileWatcher(rootPath, suffix) {
	fs.watch(rootPath,
		{
			encoding: 'utf-8',
			recursive: true,//是否监听子文件夹下的文件
			persistent: true//是否持续监听
		},
		(eventType, filename) => {
			if (eventType === "change" && path.extname(filename) === ".less") {
				compileFile(rootPath, filename, suffix)
			}
		});
}
module.exports = fileWatcher 
```
当我们监听到less文件变化时，执行`compileFile`,通过`lessc`生成对应文件（所以我们这个工具使用前提是已经全局安装了less）（这样看来我好像啥也没干，核心功能是完全依赖less😂）   
到这里我们就已经实现了工具的全部功能，接下来是通过`npm publish`发布   
在这之前我们先执行
```
npm install . -g
```
这行命令是将这个包全局安装在自己的电脑上，我们可以先验证一下工具有没有问题   
![](https://user-gold-cdn.xitu.io/2019/3/3/1694158cb7627f59?w=1920&h=1080&f=gif&s=14037066)
![](https://user-gold-cdn.xitu.io/2019/3/3/1694159222f831b4?w=1920&h=1080&f=gif&s=8441323)
工具可以正常使用，接下来就是发布了   
```bash
npm publish
```
需要注意的是如果你之前没有发布过npm包，需要执行`npm adduser`添加你的账号，然后就可以发布成功了，当你更新了包的内容，记得把package.json中的version同步更改，在执行`npm publish`就可以更新你的npm包了。   
--- ---    
项目地址：[https://github.com/zwlafk/less2whatever](https://github.com/zwlafk/less2whatever)   
npm地址：[https://www.npmjs.com/package/less2whatever](https://www.npmjs.com/package/less2whatever)   
--- ---
参考链接   
[https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener](https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener)   
[https://segmentfault.com/a/1190000002918295](https://segmentfault.com/a/1190000002918295)   