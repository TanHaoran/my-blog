# 装饰者模式Decorator

<Counter :path="'pattern'" :name="'装饰者模式Decorator'"></Counter>

## 一、概念

### 1、定义

在不改变原有对象的基础之上，将功能附加到对象上，提供了比继承更有弹性的替代方案（扩展原有对象功能）

### 2、类型

结构型

### 3、适用场景

* 扩展一个类的功能或给一个类添加附加职责
* 动态的给一个对象添加功能，这些功能可以再动态的撤销

### 4、优点

* 继承的有力补充，比继承灵活，不改变原有对象的情况下给一个对象扩展功能
* 通过使用不同装饰类以及这些装饰类的排列组合，可以实现不同效果
* 符合开闭原则

### 5、缺点

* 会出现更多的代码，更多的类，增加程序复杂性
* 动态装饰时，多层装饰时会更复杂

### 6、相关设计模式

* 装饰者模式和代理模式

装饰者模式关注在给一个对象动态的添加方法；代理模式关注在控制对象的访问，代理模式中的代理类可以对它的客户隐藏对象的具体信息。装饰者模式通常会把原始对象作为一个参数穿给装饰者的构造方法；代理模式通常会在代理类中创建一个对象的实例。

* 装饰者模式和适配器模式

两者都可以称作是包装模式（wrapper）。装饰者模式中装饰者和被装饰者可以实现相同的接口或者装饰者是被装饰者的子类；适配器模式中适配器和被适配的类一般具有不同的接口。

## 二、Coding

### 1、基础版本

我是在早晨比较喜欢吃杂狼煎饼的，看看煎饼的类：
```java
public class Battercake {

    protected String getDesc() {
        return "煎饼";
    }

    protected int cost() {
        return 5;
    }
}
```
一个煎饼4块钱。

如果想给煎饼加个蛋，那么继承煎饼类：
```java
public class BattercakeWithEgg extends Battercake {

    @Override
    protected String getDesc() {
        return super.getDesc() + " 加一个蛋";
    }

    @Override
    protected int cost() {
        return super.cost() + 1;
    }
}
```
加一个蛋，价格加1块钱。

不行还不够吃，再来一个加肠的煎饼吧，再继承加蛋的煎饼类：
```java
public class BattercakeWithEggSausage extends BattercakeWithEgg {

    @Override
    protected String getDesc() {
        return super.getDesc() + " 加一根肠";
    }

    @Override
    protected int cost() {
        return super.cost() + 2;
    }
}
```

应用层调用：
```java
    public static void main(String[] args) {
        Battercake battercake = new Battercake();
        System.out.println(battercake.getDesc() + " 销售价格：" + battercake.cost());

        BattercakeWithEgg battercakeWithEgg = new BattercakeWithEgg();
        System.out.println(battercakeWithEgg.getDesc() + " 销售价格：" + battercakeWithEgg.cost());

        BattercakeWithEggSausage battercakeWithEggSausage = new BattercakeWithEggSausage();
        System.out.println(battercakeWithEggSausage.getDesc() + " 销售价格：" + battercakeWithEggSausage.cost());
    }
```
3个煎饼就做好了，一个原始的，一个加蛋的，一个加蛋加肠的。

运行结果：
```console
煎饼 销售价格：5
煎饼 加一个蛋 销售价格：6
煎饼 加一个蛋 加一根肠 销售价格：8
```

这时候另一个同学来了，他的需求是夹饼加2个蛋和1个肠，老板说好吧，再创建一个类吧，又来了一个同学说要2个蛋和2个肠的，老板蒙了，不能给每个不同的需求都新创建一个类吧。老板决定要改改代码了！

### 2、装饰者版本

这个装饰者版本需要如下一些类：抽象的实体类、具体的实体类、抽象的装饰者类、具体的装饰者的类（数个）。

抽象出一个抽象煎饼类：
```java
public abstract class AbstractBattercake {

    protected abstract String getDesc() ;

    protected abstract int cost();
}
```

具体的煎饼类：
```java
public class Battercake extends AbstractBattercake{

    @Override
    protected String getDesc() {
        return "煎饼";
    }

    @Override
    protected int cost() {
        return 5;
    }
}
```

抽象的装饰者类，也继承抽闲煎饼类：
```java
public abstract class AbstractDecorator extends AbstractBattercake {

    private AbstractBattercake abstractBattercake;

    public AbstractDecorator(AbstractBattercake abstractBattercake) {
        this.abstractBattercake = abstractBattercake;
    }

    protected abstract void doSomething();

    @Override
    protected String getDesc() {
        return abstractBattercake.getDesc();
    }

    @Override
    protected int cost() {
        doSomething();
        return abstractBattercake.cost();
    }
}
```
通过构造方法将抽象的煎饼传递进来，然后在抽闲装饰者类中调用传递进来的抽闲煎饼的方法执行。还可以加入一些其他的抽闲方法进行实现。

接下来具体的装饰者实现类，加蛋的装饰者：
```java
public class EggDecorator extends AbstractDecorator {

    public EggDecorator(AbstractBattercake abstractBattercake) {
        super(abstractBattercake);
    }

    @Override
    protected void doSomething() {
        System.out.println("计算加个鸡蛋的钱");
    }

    @Override
    protected String getDesc() {
        return super.getDesc() + " 加一个鸡蛋";
    }

    @Override
    protected int cost() {
        return super.cost() + 1;
    }
}
```

加肠的装饰者：
```java
public class SausageDecorator extends AbstractDecorator {

    public SausageDecorator(AbstractBattercake abstractBattercake) {
        super(abstractBattercake);
    }

    @Override
    protected void doSomething() {
        System.out.println("计算加根香肠的钱");
    }

    @Override
    protected String getDesc() {
        return super.getDesc() + " 加一根香肠";
    }

    @Override
    protected int cost() {
        return super.cost() + 2;
    }
}
```

应用层：
```java
    public static void main(String[] args) {
        AbstractBattercake battercake = new Battercake();
        battercake = new EggDecorator(battercake);
        battercake = new EggDecorator(battercake);
        battercake = new SausageDecorator(battercake);

        System.out.println(battercake.getDesc() + " 销售价格：" + battercake.cost());
    }
```

运行结果：
```console
计算加根香肠的钱
计算加个鸡蛋的钱
计算加个鸡蛋的钱
煎饼 加一个鸡蛋 加一个鸡蛋 加一根香肠 销售价格：9
```

也可以这样子简写：
```java
    public static void main(String[] args) {
        AbstractBattercake battercake = new SausageDecorator(new EggDecorator(new EggDecorator(new Battercake())));

        System.out.println(battercake.getDesc() + " 销售价格：" + battercake.cost());
    }
```
这样看起来是不是更清爽，层层装饰起来。老板再也不怕各种各样的需求了，直接做就完事了。

<Valine></Valine>