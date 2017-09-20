---
title: next主题添加algolia搜索
date: 2017-09-20 08:49:09
tags: [hexo,algolia]
categories: web
---
hexo中可以使用第三方的algolia作为搜索功能，在[next](http://theme-next.iissnan.com/third-party-services.html#algolia-search)主题下也有很好的支持，但是按照官网的说明跑了一边并不成功，发现有几点坑需要注意
## 更改algolia版本
为了更好的使用，我们把algolia版本改为0.2.0，在package.json中找到依赖中的"hexo-algolia"字段改为
```
"hexo-algolia": "^0.2.0"
```
## 站点配置
在站点配置中除了官网上说明的还需要在增加一个fields字段：
```
algolia:
  appId: 'appid'
  apiKey: 'apiKey'
  adminApiKey: 'adminApiKey'
  indexName: '上面填写的index名'
  chunkSize: 5000
  /*在后面添加一个字段*/
  fields:
    - title
    - slug
    - path
    - content:strip
```
在\themes\next下找到"_config.yml"，找到"algolia_search"，将enable修改为true，labels修改为自己需要的
```
# Algolia Search
algolia_search:
  enable: true
  hits:
    per_page: 10
  labels:
    input_placeholder: 搜索关键字
    hits_empty: "没有找到 ${query}"
    hits_stats: "$找到了 {hits} 条结果，耗时 ${time} ms"
```
## 更改header.swig
在themes\next\layout_partials中找到header.swig，找到以下代码并修改
```javascript
<nav class="site-nav">
  <!-- 添加  theme.algolia_search.enable -->
  {% set hasSearch = theme.swiftype_key || theme.algolia_search.enable || theme.tinysou_Key || config.search %}


  {% if theme.menu %}
    <ul id="menu" class="menu">
      {% for name, path in theme.menu %}
        {% set itemName = name.toLowerCase() %}
        <li class="menu-item menu-item-{{ itemName }}">
          <a href="{{ url_for(path) }}" rel="section">
            {% if theme.menu_icons.enable %}
              <i class="menu-item-icon fa fa-fw fa-{{theme.menu_icons[itemName] | default('question-circle') | lower }}"></i> 

            {% endif %}
            {{ __('menu.' + itemName) }}
          </a>
        </li>
      {% endfor %}


  {% if hasSearch %}
    <li class="menu-item menu-item-search">
      {% if theme.swiftype_key %}
        <a href="javascript:;" class="st-search-show-outputs">
      {% elseif config.search %}
        <a href="javascript:;" class="popup-trigger">

<!-- 添加 开始 -->


      {% elseif theme.algolia %}
        <a href="javascript:;" class="popup-trigger">

<!-- 添加 结束 -->


      {% endif %}
        {% if theme.menu_icons.enable %}
          <i class="menu-item-icon fa fa-search fa-fw"></i> <br />
        {% endif %}
        {{ __('menu.search') }}
      </a>
    </li>
  {% endif %}
</ul>

  {% endif %}


  {% if hasSearch %}
    <div class="site-search">
      {% include 'search.swig' %}
    </div>
  {% endif %}
</nav>
```
## 最后
执行```hexo algolia```前先执行```hexo clean```