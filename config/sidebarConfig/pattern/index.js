const util = require('../../../util/index');

const children = [
    '简单工厂SimpleFactory',
    '工厂方法模式FactoryMethod',
    '抽象工厂模式AbstractFactory',
    '建造者模式Builder',
    '单例模式Singleton',
    '原型模式Prototype',
    '外观模式Facade',
    '装饰者模式Decorator',
    '适配器模式Adapter',
    '享元模式Flyweight',
    '组合模式Composite',
    '桥接模式Bridge',
    '代理模式Proxy',
    '模板方法模式TemplateMethod',
    '迭代器模式Iterator',
    '策略模式Strategy',
    '解释器模式Interpreter',
    '观察者模式Observer',
    '备忘录模式Memento',
    '命令模式Command',
    '中介者模式Mediator',
    '责任链模式ChainOfResponsibility',
    '访问者模式Visitor',
    '状态模式State',
];

module.exports = [
    util.generateSidebar('设计模式', children)
];
