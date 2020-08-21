const util = require('../../../util/index');

const children = [
    '时间复杂度',
    '动态数组Array',
    '栈Stack',
    '队列Queue',
    '链表LinkedList',
    '二分搜索树BinarySearchTree',
    '集合Set',
    '映射Map',
    '堆Heap',
    '线段树SegmentTree',
];

module.exports = [
    util.generateSidebar('数据结构', children),
];