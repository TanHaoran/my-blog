const util = require('../../../util/index');

const children = [
    '如何利用hexo搭建个人博客',
    '解决微信退款回调解密异常的问题',
    '实现可查询进度的并发任务执行框架',
    '应用性能优化实战',
];

module.exports = [
    util.generateSidebar('项目实战', children)
];