---
title: 在其他电脑上使用hexo更新博客的解决方案
date: 2017-09-20 14:53:11
tags: [hexo,github]
categories: web
---
## 设想
最开始设想建立两个repo，一个repo1是hexo生成的项目，另一个repo2是写在这个项目deploy的配置中，这样只用管理repo1这个项目，每次用`hexo d`相当于更新repo2，达到不同机子上更新博客的目的，换了机子把repo1同步下来管理即可。
看到网上有人说用一个repo两个分支，嗯，道理是一样的，这样也更加合理，决定采用这种方法。
## 实现
* 在xxx.githbu.io这个个repo中建立两个分支
    * 一个分支为master
    * 另一个为hexo（名字无所谓）
* 把hexo设置为默认分支
* 在hexo中使用`hexo init`建立一个hexo项目，配置文件中的deploy填写为master分支
* 博客的构建修改直接在hexo分支中进行，更新完运行`git push`，运行`hexo g -d`生成静态文件并部署到master分支上
* 在另一台电脑上运行`git pull`获得整个博客文件，更新完重复上一步