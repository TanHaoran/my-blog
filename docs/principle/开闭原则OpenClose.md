# 开闭原则OpenClose

<Counter :path="'principle'" :name="'开闭原则OpenClose'"></Counter>

## 一、概念

### 1、定义

一个软件实体如类、模块和函数应该对扩展开发，对修改关闭。

### 2、注意

用抽象构建框架，用实现扩展细节。

### 3、优点

提高软件系统的可复用性及可维护性

## 二、应用

我们都需不断的学习，比如说上网课，有这么一个统一的课程接口：

```java
public interface ICourse {

    /**
     * 获取课程id
     *
     * @return
     */
    Integer getId();

    /**
     * 获取课程名称
     *
     * @return
     */
    String getName();

    /**
     * 获取课程价格
     *
     * @return
     */
    Double getPrice();
}
```

有一份Java课程推出了，那么它实现课程接口：

```java
public class JavaCourse implements ICourse {

    private Integer id;
    private String name;
    private Double price;

    public JavaCourse(Integer id, String name, Double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Double getPrice() {
        return price;
    }
}
```

看看此时的课程介绍：

```java
public class Test {

    public static void main(String[] args) {
        ICourse javaCourse = new JavaCourse(96, "Java从零到企业级电商开发", 348D);
        System.out.println("课程id：" + javaCourse.getId() + "，课程名称：" + javaCourse.getName() +
                "，课程价格：" + javaCourse.getPrice() + "元");
    }
}
```

执行结果：

```console
课程id：96，课程名称：Java从零到企业级电商开发，课程价格：348.0元
```

此时的 `UML` 类图是这个样子的：

![第一次类图](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/openclose_1.png)

过了一段时间，赶上过节了，这个课程有了打折活动，于是接口中多了一个方法：

```java
public interface ICourse {

    /**
     * 获取课程id
     *
     * @return
     */
    Integer getId();

    /**
     * 获取课程名称
     *
     * @return
     */
    String getName();

    /**
     * 获取课程价格
     *
     * @return
     */
    Double getPrice();

    /**
     * 获取打折价格
     *
     * @return
     */
    Double getDiscountPrice();
}
```

那么此时对应的课程实现，也得修改了：

```java
public class JavaCourse implements ICourse {

    private Integer id;
    private String name;
    private Double price;

    public JavaCourse(Integer id, String name, Double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Double getPrice() {
        return price;
    }

    @Override
    public Double getDiscountPrice() {
        return price * 0.8;
    }
}
```

活动价是原价的8折。应用层代码：

```java
    public static void main(String[] args) {
        ICourse javaCourse = new JavaCourse(96, "Java从零到企业级电商开发", 348D);
        System.out.println("课程id：" + javaCourse.getId() + "，课程名称：" + javaCourse.getName() +
               "，课程折后价格：" + javaCourse.getDiscountPrice());
    }
```

执行结果：

```console
课程id：96，课程名称：Java从零到企业级电商开发，课程折后价格：278.40000000000003
```

看似完成了功能，但是如果实现课程接口的类有很多，这里因为在接口中新增了一个方法，那么所有的实现类都得修改，那不得疯掉。所以在接口中新增方法的方案肯定不行。

可能有人会说，直接修改 `JavaCourse` 类的 `getPrice()` 方法不就完了吗？修改如下：

```console
public class JavaCourse implements ICourse {

    private Integer id;
    private String name;
    private Double price;

    public JavaCourse(Integer id, String name, Double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Double getPrice() {
        return price * 0.8;
    }
}
```

确实简单粗暴，但是如果需求是说只有满足原价大于300元的课程才打折，这样就没办法获取到原来课程的价格来判断是否打折了。

那么该怎么办呢？其实可以新创建一个类继承 `JavaCourse`：

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

在这个类中，通过复写 `JavaCourse` 类中的 `getPrice()` 方法，在方法内进行价格处理，实现了打折，并且同时还新增了一个获取原价的方法 `getOriginPrice()` 方便返回原价。

应用层：

```java
public class Test {

    public static void main(String[] args) {
        ICourse iCourse = new JavaDiscountCourse(96, "Java从零到企业级电商开发", 348D);
        JavaDiscountCourse javaCourse = (JavaDiscountCourse) iCourse;
        System.out.println("课程id：" + javaCourse.getId() + "，课程名称：" + javaCourse.getName() +
                "，课程原价：" + javaCourse.getOriginPrice() + "，课程折后价格：" + javaCourse.getPrice());
    }
}
```

因为要想获取课程的原价需要是用到新写的 `JavaDiscountCourse` 类中的 `getOriginPrice()` 方法，而 `ICourse` 接口中并没有这个方法定义，所以需要将 `iCourse` 强转为 `JavaDiscountCourse` ，就可以使用 `getOriginPrice()` 方法了。

执行结果：

```console
课程id：96，课程名称：Java从零到企业级电商开发，课程原价：348.0，课程折后价格：278.40000000000003
```

此时的 `UML` 类图是这个样子的：

![第二次类图](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/openclose_2.png)

可以看出，这种做法对于底层的接口和实现类是完全没有改动的，只是新增了一个扩展类和修改了应用层的代码，这样也防止了风险的扩散，实现了面对扩展开发，面对修改关闭。

<Valine></Valine>