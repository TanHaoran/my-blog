const navConfig = require('../../config/navConfig');
const sidebarConfig = require('../../config/sidebarConfig/index');
const pluginsConfig = require('../../config/pluginConfig');
const headConfig = require('../../config/headConfig');

module.exports = {
    title: '林山夕风',
    description: '林山夕风的博客,md文档,技术博客',
    // 浏览器图标
    head: headConfig,
    plugins: pluginsConfig,
    themeConfig: {
        nav: navConfig,
        sidebar: sidebarConfig,
        // 启用连接根据当前浏览标题而变化
        activeHeaderLinks: true,
        smoothScroll: false,
        lastUpdated: '上次更新',
    },
    markdown: {
        lineNumbers: true
    },
};