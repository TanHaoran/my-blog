## 介绍

这是一个根据 `VuePress` 框架搭建的文档

## 如何使用

```bash
# 1、克隆项目到本地
git clone https://gitee.com/scarlolita/my-blog.git
# 2、安装 vuepress：
npm install -g vuepress
# 3、进入项目目录，安装项目依赖
npm install
# 3、本地运行：
vuepress dev docs
# 4、打包文件到服务器：
vuepress build docs
```

## 配置
如果需要使用评论功能，需要修改 `config` 目录下的 `secretKeyConfig.js` 文件并配置自己的 `appId` 和 `appKey` 。