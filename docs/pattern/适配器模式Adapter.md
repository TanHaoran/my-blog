# 适配器模式Adapter

<Counter :path="'pattern'" :name="'适配器模式Adapter'"></Counter>

## 一、概念

### 1、定义

将一个类的接口（被适配者）转换成客户期望的另一个结构（目标类），使原本不兼容的类可以一起工作

### 2、类型

结构型

### 3、适用场景

* 已经存在的类，它的方法和需求不匹配时（方法结果相同或相似）
* 不是软件设计阶段考虑的设计模式，是随着软件维护，由于不同产品、不同厂家造成功能类似而接口不相同情况下的解决方案

### 4、优点

* 能提高类的透明性和复用，现有的类复用但不需要改变
* 目标类和适配器类解耦，提高程序扩展性
* 符合开闭原则

### 5、缺点

* 适配器编写过程需要全面考虑，可能会增加系统的复杂性
* 增加系统代码可读的难度

### 6、扩展

#### 类适配器

通过类继承实现的

#### 对象适配器

符合组合复用原则，并且使用委托机制，通过组合实现

### 7、相关设计模式

* 适配器模式和外观模式

都是对现有的类进行封装。适配器模式复用原有的接口，使两个已有的接口协同工作；而外观模式定义了新的接口，在现有的系统中提供一个更方便的访问入口。

## 二、Coding

先介绍一下适配器模式中被适配者的角色：
```java
public class Adaptee {

    public void adapteeRequest() {
        System.out.println("被适配者的方法");
    }
}
```

目标类，也就是适配后，最终我们想要的类：
```java
public interface Target {

    void request();
}
```
这里定义为了一个接口。

目标类的具体实现类：
```java
public class ConcreteTarget implements Target {

    @Override
    public void request() {
        System.out.println("ConcreteTarget目标方法");
    }
}
```

接下来就是最终要的适配器类了。

### 类适配器

类适配器中的适配器类是通过继承被适配类实现的：
```java
public class Adapter extends Adaptee implements Target {

    @Override
    public void request() {
        super.adapteeRequest();
    }
}
```
通过继承被适配者，然后实现目标接口，在目标接口的方法中调用了被适配者的方法，这样就将被适配者的方法适配到了目标方法。实际上在调用父类的的 `adapteeRequest()` 方法前后还可以做一系列操作来实现代码增强。

应用层：
```java
    public static void main(String[] args) {
        Target target = new ConcreteTarget();
        target.request();

        Target adapterTarget = new Adapter();
        adapterTarget.request();
    }
```
`target` 是原始的 `Target` 的实现类，后面通过适配器实现了 `Target` 接口，实际在适配器内部调用的是被适配者的方法，从而完成了适配。

运行结果：
```console
ConcreteTarget目标方法
被适配者的方法
```

### 对象适配器

对象适配器的适配器类是通过组合被适配器实现的：
```java
public class Adapter implements Target {

    private Adaptee adaptee = new Adaptee();

    @Override
    public void request() {
        adaptee.adapteeRequest();
    }
}
```
也同样完成了适配功能。同样的在适配过程前后可以增加自己的逻辑代码。

应用层不用变化，直接可以复用：
```java
    public static void main(String[] args) {
        Target target = new ConcreteTarget();
        target.request();

        Target adapterTarget = new Adapter();
        adapterTarget.request();
    }
```

运行结果：
```console
ConcreteTarget目标方法
被适配者的方法
```

一样的效果。

### 应用

最能体现适配器模式的就是充电器的适配电源了，将220V交流电（被适配者）通过手机充电器（适配器）转换为手机充电电压（目标）。先看下被适配者类，也就是220V交流电：
```java
public class AC220 {

    public int outputAC220V() {
        int output = 220;
        System.out.println("输出交流电" + output + "V");
        return output;
    }
}
```

接下来是目标类，5v直流电：
```java
public interface DC5 {

    int outputDC5V();
}
```

最终要的角色，手机充电器，也就是适配器：
```java
public class PowerAdapter implements DC5 {

    private AC220 ac220 = new AC220();

    @Override
    public int outputDC5V() {
        int adapterInput = ac220.outputAC220V();
        // 变压器
        int adapterOutput = adapterInput / 44;
        System.out.println("使用PowerAdapter输入AC：" + adapterInput + "V，输出DC：" + adapterOutput);
        return adapterOutput;
    }
}
```
这里通过组合的方式，在 `outputDC5V()` 方法中调用了被适配者的 `outputAC220V()` 方法，并做了逻辑处理，完成了适配。

看下应用层：
```java
    public static void main(String[] args) {
        DC5 dc5 = new PowerAdapter();
        dc5.outputDC5V();
    }
```

运行结果：
```console
输出交流电220V
使用PowerAdapter输入AC：220V，输出DC：5
```
是不是很简单。

<Valine></Valine>