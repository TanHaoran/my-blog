# 里氏替换原则LiskovSubstitution

<Counter :path="'principle'" :name="'里氏替换原则LiskovSubstitution'"></Counter>

## 一、概念

### 1、定义

如果对每一个类型为 `T1` 的对象 `o1`，都有类型为 `T1` 的对象 `o2`，使得以 `T1` 定义的所有程序 `P` 在所有的对象 `o1` 都替换成 `o2` 时，程序 `P` 的行为没有发生变化，那么类型 `T2` 是类型 `T1` 的子类型。

### 2、扩展

一个软件实体如果适用一个父类的话，那一定适用于其子类，所有引用父类的地方必须能透明地使用其子类的对象，子类对象能够替换父类对象，而程序逻辑不变。

### 3、引申意义

子类可以扩展父类的功能，单不能改变父类原有的功能。

含义：
* 子类可以实现父类的抽象方法，但不能覆盖父类的非抽象方法
* 子类中可以增加自己特有的方法
* 当子类的方法重载父类的方法时，方法的前置条件（即方法的输入/入参）要比父类方法的输入参数更宽松。
* 当子类的方法实现父类的方法时（重写/重载货实现抽象方法），方法的后置条件（即方法的输出/返回值）要比父类更严格或相等。

### 4、优点

* 约束继承泛滥，开闭原则的一冲提现
* 加强程序的健壮性，同时变更时也可以做到非常好的兼容性，提供程序的维护性、扩展性，降低需求变更时引入的风险。

## 二、应用

### 1、开闭原则的补充

在之前 [开闭原则OpenClose](开闭原则OpenClose.md) 博客中，仔细观察 `JavaDiscountCourse` 类：

```java
public class JavaDiscountCourse extends JavaCourse {

    public JavaDiscountCourse(Integer id, String name, Double price) {
        super(id, name, price);
    }

    /**
     * 获取原价
     *
     * @return
     */
    public Double getOriginPrice() {
        return super.getPrice();
    }

    /**
     * 获取课程价格
     *
     * @return
     */
    @Override
    public Double getPrice() {
        return super.getPrice() * 0.8;
    }

}
```

其中 `getOriginPrice()` 是新增的方法，没问题，但是 `getPrice()` 将父类的方法给覆盖了，这不符合里氏替换原则，所以需要改为：

```java
public class JavaDiscountCourse extends JavaCourse {

    public JavaDiscountCourse(Integer id, String name, Double price) {
        super(id, name, price);
    }

    /**
     * 获取原价
     *
     * @return
     */
    public Double getDiscountPrice() {
        return super.getPrice() * 0.8;
    }

}
```

应用层需要修改为：

```console
public class Test {

    public static void main(String[] args) {
        ICourse iCourse = new JavaDiscountCourse(96, "Java从零到企业级电商开发", 348D);
        JavaDiscountCourse javaCourse = (JavaDiscountCourse) iCourse;
        System.out.println("课程id：" + javaCourse.getId() + "，课程名称：" + javaCourse.getName() +
                "，课程原价：" + javaCourse.getPrice() + "，课程折后价格：" + javaCourse.getDiscountPrice());
    }
}
```

执行结果：

```console
课程id：96，课程名称：Java从零到企业级电商开发，课程原价：348.0，课程折后价格：278.40000000000003
```

这样才符合了里氏替换原则。

### 2、正方形和长方形

首先创建一个长方形类：

```java
public class Rectangle {

    private long length;
    private long width;

    @Override
    public long getWidth() {
        return width;
    }

    @Override
    public long getLength() {
        return length;
    }

    public void setLength(long length) {
        this.length = length;
    }

    public void setWidth(long width) {
        this.width = width;
    }
}
```

因为正方形是一种特殊的长方形，所以正方形继承长方形：

```java
public class Square extends Rectangle {

    private long sideLength;

    public long getSideLength() {
        return sideLength;
    }

    public void setSideLength(long sideLength) {
        this.sideLength = sideLength;
    }

    @Override
    public long getWidth() {
        return getSideLength();
    }

    @Override
    public long getLength() {
        return getSideLength();
    }

    @Override
    public void setLength(long length) {
        setSideLength(length);
    }

    @Override
    public void setWidth(long width) {
        setSideLength(width);
    }
}
```

正方形覆盖了父类的获取长宽和设置长宽的方法。

有这样一个需求，当长方形的宽小于等于长的时候，给宽加1，直到满足条件，那么应用层代码：

```java
public class Test {

    public static void resize(Rectangle rectangle) {
         while (rectangle.getWidth() <= rectangle.getLength()) {
             rectangle.setWidth(rectangle.getWidth() + 1);
             System.out.println("width: " + rectangle.getWidth() + ",length: " + rectangle.getLength());
         }
        System.out.println("resize方法结束，width: " + rectangle.getWidth() + ", length: " + rectangle.getLength());
    }

    public static void main(String[] args) {
        Rectangle rectangle = new Rectangle();
        rectangle.setWidth(10);
        rectangle.setLength(20);
        resize(rectangle);
    }
}
```

执行结果：

```console
width: 11,length: 20
width: 12,length: 20
width: 13,length: 20
width: 14,length: 20
width: 15,length: 20
width: 16,length: 20
width: 17,length: 20
width: 18,length: 20
width: 19,length: 20
width: 20,length: 20
width: 21,length: 20
resize方法结束，width: 21, length: 20
```

可以看出，当宽加到 21 之后，方法就执行完毕退出了。

但此时如果将正方形传入 `resize()` 方法会发生什么呢？

```java
public class Test {

    public static void resize(Rectangle rectangle) {
         while (rectangle.getWidth() <= rectangle.getLength()) {
             rectangle.setWidth(rectangle.getWidth() + 1);
             System.out.println("width: " + rectangle.getWidth() + ",length: " + rectangle.getLength());
         }
        System.out.println("resize方法结束，width: " + rectangle.getWidth() + ", length: " + rectangle.getLength());
    }

    public static void main(String[] args) {
        Square square = new Square();
        square.setSideLength(10);
        resize(square);
    }
}
```

执行结果：

```console
...
width: 2237528,length: 2237528
width: 2237529,length: 2237529
width: 2237530,length: 2237530
width: 2237531,length: 2237531
width: 2237532,length: 2237532
width: 2237533,length: 2237533
width: 2237534,length: 2237534
...
```

可以看出在这个 `resize()` 的逻辑中，代码无穷无尽的再执行。这用里氏替换原则来看，当把参数中的父类对象换成子类对象时，运行的结果和期望是不一致的。也就是说在这个应用场景下，正方形是不可以成为长方形的子类的。

那如何解决这个问题呢。

可以新写一个接口，让长方形和正方形都实现这个接口。

```java
public interface Quadrangle {

    long getWidth();

    long getLength();
}
```

长方形修改为：

```java
public class Rectangle implements Quadrangle{

    private long length;
    private long width;

    @Override
    public long getWidth() {
        return width;
    }

    @Override
    public long getLength() {
        return length;
    }

    public void setLength(long length) {
        this.length = length;
    }

    public void setWidth(long width) {
        this.width = width;
    }
}
```

正方形：

```java
public class Square implements Quadrangle{

    private long sideLength;

    @Override
    public long getWidth() {
        return sideLength;
    }

    @Override
    public long getLength() {
        return sideLength;
    }

    public long getSideLength() {
        return sideLength;
    }

    public void setSideLength(long sideLength) {
        this.sideLength = sideLength;
    }
}
```

此时，想要去修改 `resize()` 方法的时候，发现：

```java
    public static void resize(Rectangle rectangle) {
         while (rectangle.getWidth() <= rectangle.getLength()) {
             rectangle.setWidth(rectangle.getWidth() + 1);
             System.out.println("width: " + rectangle.getWidth() + ",length: " + rectangle.getLength());
         }
        System.out.println("resize方法结束，width: " + rectangle.getWidth());
    }
```

如果将参数 `Rectangle` 替换为接口 `Quadrangle` 的话，因为接口中没有 `setWidth()` 方法而会报错的，这也从代码层面约束了我们，在设计时禁止继承泛滥。通过了这个四边形接口 `Quadrangle` 解决了长方形类和正方形类不符合里氏替换原则的问题。

### 3、方法的入参

创建一个父类：

```java
public class Base {

    public void method(HashMap hashMap) {
        System.out.println("父类被执行");
    }
}
```

有一个方法，参数是 `HashMap`。接着创建一个子类：

```java
public class Child extends Base {

    @Override
    public void method(HashMap hashMap) {
        System.out.println("子类HashMap被执行");
    }

    public void method(Map map) {
        System.out.println("子类Map被执行");
    }
}
```

其中上面的 `method(HashMap hashMap)` 方法是重写，下面的 `method(Map map)` 方法是重载。

测试类：

```java
public class Test {

    public static void main(String[] args) {
        Child child = new Child();
        HashMap hashMap = new HashMap();
        child.method(hashMap);
    }
}
```

执行结果：

```console
子类HashMap被执行
```

也就是说子类的重写父类的方法被执行了。

这时候我们删掉子类中重写的方法，只保留重载的方法：

```java
public class Child extends Base {

    public void method(Map map) {
        System.out.println("子类Map被执行");
    }
}
```

同样执行上面的测试类，执行结果：

```console
父类被执行
```

也就是说父类的方法被执行了，当子类重载的参数类型范围比父类方法的参数范围大，当传入的参数满足父类方法参数时，那么子类的方法永远也不会被执行，始终执行的都是父类的方法，这符合里氏替换原则。

如果反过来：

```java
public class Base {

    public void method(Map map) {
        System.out.println("父类被执行");
    }
}
```

```java
public class Child extends Base {

    public void method(HashMap hashMap) {
        System.out.println("子类HashMap被执行");
    }
}
```

测试方法不变，执行结果：

```console
子类HashMap被执行
```

可以看出子类被执行了，这样就违反了里氏替换原则，在开发中很容易引出业务逻辑的混乱。所以当子类需要重载父类方法的时候，方法的入参方位一定要比父类方法的入参范围更宽松。

### 4、方法的返回值

创建一个抽象父类：

```java
public abstract class Base {

    public abstract Map method();
}
```

写子类：

```java
public class Child extends Base {

    @Override
    public HashMap method() {
        HashMap hashMap = new HashMap();
        System.out.println("子类method被执行");
        hashMap.put("message", "子类method被执行");
        return hashMap;
    }
}
```

测试类：

```java
public class Test {

    public static void main(String[] args) {
        Child child = new Child();
        System.out.println(child.method());
    }
}
```

执行结果：

```console
子类method被执行
{message=子类method被执行}
```

如果子类重写父类方法的时候，返回值类型比父类更宽松时，`IDE` 就直接会报错的。

<Valine></Valine>