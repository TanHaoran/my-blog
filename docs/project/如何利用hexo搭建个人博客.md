# 如何利用hexo搭建个人博客

<Counter :path="'project'" :name="'如何利用hexo搭建个人博客'"></Counter>

## 一、安装 node 环境

如果你已经安装好 node 环境的话，这一步就可以跳过。
从 node 的 [官网](http://nodejs.cn/download/) 下载最新的版本进行安装。

### 1、window 安装

直接下载 `.msi` 的安装文件下一步下一步安装就可以了；

也可以下载 `.zip` 文件进行解压，然后配置根目录下的 `/bin` 路径到 `环境变量` -> `系统变量` 中可以了。

### 2、linux 安装

首先需要下载到本地，这里我用的是 `12.14.1` 版本的 `node`。

下载：`wget https://npm.taobao.org/mirrors/node/v12.14.1/node-v12.14.1-linux-x64.tar.xz`

解压：`tar -xvf node-v12.14.1-linux-x64.tar.xz`

配置环境变量：`vim /etc/profile`，在文件尾部加入如下内容：
```profile
export NODE_HOME=/usr/local/node-v12.14.1-linux-x64 # 这里配置解压好存放node的目录
export PATH=$PATH:$JAVA_HOME/bin:$NODE_HOME/bin # 将node目录下的bin目录追加配置到PATH中
```
刷新配置文件：`source /etc/profile`

检查是否安装成功：`node -v`、`npm -v`，使用这两个命令都能看到对应版本信息就说明安装成功了。

## 二、安装 hexo 并初始化项目

打开命令行工具，安装 hexo 框架：`npm install -g hexo-cli`。

安装后使用：`hexo -v` 命令如果可以看到对应的版本信息，那么说明 `hexo` 安装成功了。

创建一个目录来存放博客所有文件，然后进入这个目录执行： `hexo init`，那么此时项目就初始化完毕了。

什么？这么简单。启动一下试试吧：`hexo server`，启动成功后，会提示我们在本地的 `4000` 端口，打开浏览器输入：`http://localhost:4000` 就可以看到我们自己的博客了。

## 三、创建新的 md 博客

创建一个新的博客文件：`hexo new 一篇新的博客`，系统会提示我们创建到项目目录 `source/_posts/` 下。然后就可以对这个文件使用 `markdown` 语法进行愉快的编写啦。编写完后，重新使用 `hexo server` 启动查看效果。

## 四、发布到个人网站

使用命令：`hexo generate` 进行生成编译文件。这时会看到在项目根目录下生成了一个 `public` 目录，并且里面有各种文件。然后将 `public` 内的文件上传到自己的服务器某个目录，然后在自己的服务器上使用 `nginx` 进行配置，将自己申请好的域名映射到刚才上传到服务器的目录下，这样就可以通过域名来访问博客了！

<Valine></Valine>