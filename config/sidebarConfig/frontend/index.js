const util = require('../../../util/index');

const children = [
    'Vue基础',
    'Vue进阶',
    'element-ui基础使用',
];

module.exports = [
    util.generateSidebar('前端', children)
];