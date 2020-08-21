const util = require('../../../util/index');

const children = [
    '第1章：重构，第一个案例',
    '第2章：重构原则',
    '第3章：代码的坏味道',
    '第4章：构筑测试体系',
    '第5章：重构列表',
    '第6章：重新组织函数',
];

module.exports = [
    util.generateSidebar('重构改善既有代码的设计', children),
];