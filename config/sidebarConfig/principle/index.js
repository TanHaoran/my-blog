const util = require('../../../util/index');

const children = [
    '开闭原则OpenClose',
    '依赖倒置原则DependenceInversion',
    '单一职责原则SingleResponsibility',
    '接口隔离原则InterfaceSegregation',
    '迪米特原则Demeter',
    '里氏替换原则LiskovSubstitution',
    '合成复用原则CompositionAggregation',
];

module.exports = [
    util.generateSidebar('设计原则', children)
];