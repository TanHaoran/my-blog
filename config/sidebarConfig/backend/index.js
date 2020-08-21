const util = require('../../../util/index');

const children = [
    '线程基础',
    '线程之间的共享和协作',
    '线程的并发工具类',
    '原子操作CAS',
    '显示锁和AQS',
    '并发容器',
    '线程池',
    '并发安全',
    'JMM和底层实现原理',
    'Java8新增的并发',
    '常见并发面试题',
    '深入理解JVM内存区域',
    'JVM如何创建对象',
    '垃圾回收算法与垃圾回收器',
    'JVM执行子系统',
    'JVM性能优化',
    'MySQL安装和基础数据类型',
    'MySQL体系架构',
    'MySQL锁与事务的分析',
    'MySQL业务设计',
    'MySQL慢查询',
    'MySQL索引和执行计划',
    'MySQL的SQL优化',
    'Linux基础',
    '反射：框架设计的灵魂',
    'Java8新增特性',
    'MyBatis应用',
    'MyBatis源码骨架分析',
    'MyBatis源码流程分析',
    '消息中间件入门，AMQP与RabbitMQ',
];

module.exports = [
    util.generateSidebar('基础教程', children)
];