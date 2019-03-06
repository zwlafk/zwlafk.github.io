---
title: 树节点的查找
date: 2018-09-02 18:13:54
tags: [javascript,tree]
---
最近项目用到一些对树操作，记录一下
<!--more-->
需要通过唯一标识id获取树的节点，并拿到该节点下子节点的id
```js
var tree = [{
    id:'1',
    children:[{
        id:'1-1',
        children:[{
            id:'1-1'
        },{
            id:'1-2',
            children:[{
                id:'1-2-1'
            },{
                id:'1-2-2'
            },{
                id:'1-2-3'
            },{
                id:'1-2-4'
            }]
        },{
            id:'1-3'
        },{
            id:'1-4'
        }]
    },{
        id:'1-2'
    },{
        id:'1-3'
    },{
        id:'1-4'
    }]
}]
function getTreeNode(tree, id){
    var stack = [];

    stack = stack.concat(tree);

    while(stack.length) {
        var temp = stack.shift();//出栈
        if(temp.children) {
            stack = temp.children.concat(stack);//深度优先遍历，子节点放入栈顶
        }
        if(id === temp.id) {//检查出栈节点是否是要找的目标节点
            return [temp];
        }
    }
}
var res = []
function deepSearch(tree,id){
    for(var i = 0; i<tree.length; i++) {
        if(tree[i].children && tree[i].children.length>0) {
            //有children就递归，没什么好说的了
            deepSearch(tree[i].children,id);
        }
        res.push(tree[i].id)
    }
    return res
}
var target = getTreeNode(tree,'1-2')
var result = deepSearch(target)
console.log(result)

```