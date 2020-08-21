# 单一职责原则SingleResponsibility

<Counter :path="'principle'" :name="'单一职责原则SingleResponsibility'"></Counter>

## 一、概念

### 1、定义

不要存在多于一个导致类变更的原因。

### 2、注意

一个类/接口/方法只负责一项职责。

### 3、优点

降低类的复杂度、提高类的可读性，提高系统的可维护性、降低变更引起的风险

## 二、应用

### 1、类级别

有一个鸟的类：

```java
public class Bird {

    public void mainMoveMode(String birdName) {
        System.out.println(birdName + "用翅膀飞");
    }
}
```

应用层：

```java
public class Test {

    public static void main(String[] args) {
        Bird bird = new Bird();
        bird.mainMoveMode("大雁");
    }
}
```

执行结果：

```console
大雁用翅膀飞
```

此时的代码非常简单。

然后又来了一个鸵鸟，总不能让鸵鸟也用翅膀飞吧，所以修改 `Bird` 类：

```java
public class Bird {

    public void mainMoveMode(String birdName) {
        if (birdName.equals("鸵鸟")) {
            System.out.println(birdName + "用脚走");
        } else {
            System.out.println(birdName + "用翅膀飞");
        }
    }
}
```

应用层：

```java
    public static void main(String[] args) {
        Bird bird = new Bird();
        bird.mainMoveMode("大雁");
        bird.mainMoveMode("鸵鸟");
    }
```

执行结果：

```console
大雁用翅膀飞
鸵鸟用脚走
```

如果后期又增加了其它的鸟类用其他部位行走，都得修改 `Bird` 类的 `mainMoveMode()` 方法，给里面加越来越多的判断语句，一不小心可能就会出错。所以我们不能这么做。

新建一个会飞的鸟类和用脚走的鸟类：

```java
public class FlyBird {

    public void mainMoveMode(String birdName) {
        System.out.println(birdName + "用翅膀飞");
    }
}
```

```java
public class WalkBird {

    public void mainMoveMode(String birdName) {
        System.out.println(birdName + "用脚走");
    }
}
```

现在的应用层：

```java
    public static void main(String[] args) {
        FlyBird flyBird = new FlyBird();
        flyBird.mainMoveMode("大雁");

        WalkBird walkBird = new WalkBird();
        walkBird.mainMoveMode("鸵鸟");
    }
```

执行结果：

```console
大雁用翅膀飞
鸵鸟用脚走
```

此时的类图：

![类层面](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/singleresponsibility_1.png)


这样拆分后，让决定权交给了应用层，在修改的时候也不至于引入新的问题。

### 2、接口级别

有这么一个课程接口：

```java
public interface ICourse {

    /**
     * 获取课程名称
     *
     * @return
     */
    String getCourseName();

    /**
     * 获取课程视频
     *
     * @return
     */
    byte[] getCourseVideo();

    /**
     * 学习课程
     */
    void studyCourse();

    /**
     * 退订课程
     */
    void refundCourse();
}
```

这么看来这个接口就有2个职责，一个获取课程信息，一个是管理课程。其中如课程退订之后，那么是无法获取课程信息的，所以退订课程的方法会影响获取课程信息的2个方法。

于是需要将这个接口拆分为2个接口：

```java
public interface ICourseManager {

    void studyCourse();

    void refundCourse();
}
```

```java
public interface ICourseContent {

    String getCourseName();

    byte[] getCourseVideo();
}
```

这时，一个课程实现2个接口效果如下：

```java
public class CourseImpl implements ICourseContent, ICourseManager {

    @Override
    public String getCourseName() {
        return null;
    }

    @Override
    public byte[] getCourseVideo() {
        return new byte[0];
    }

    @Override
    public void studyCourse() {

    }

    @Override
    public void refundCourse() {

    }
}
```

此时的类图：

![接口面](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/singleresponsibility_2.png)

需要实现接口的时候，可以实现1个，也可以实现2个，这样在修改的引起的变化就会降低。

### 3、方法级别

假设有这么一个类，里面代码大概如下：

```java
public class Method {

    // 不推荐
    private void updateUserInfo(String username, String address) {
        username = "Jerry";
        address = "Xi'an";
    }

    // 不推荐
    private void updateUserInfo(String username, String... properties) {
        username = "Jerry";
        // update others
    }

    // 推荐
    private void updateUsername(String username) {
        username = "Jerry";
    }

    // 推荐
    private void updateUserAddress(String address) {
        address = "Xi'an";
    }

    // 不推荐
    private void updateUserInfo(String username, String address, boolean bool) {
        if (bool) {
            // do something
        } else {
            // do something else
        }
    }

}
```

最上面的两个不推荐注释的方法都是在一个方法中更新了多个字段，这是不好的做法。而推荐的两个方法都是只更新单个字段的，这样做好控制职责。

最下面的不推荐的方法更是比较常见的，在方法中通过一个 `boolean` 值来判断执行不同的代码，这应当直接拆成两个方法。

如果刻意的追求单一职责原则，可能会产生很多类。所以在实际项目中，接口和类级别还是尽量遵循单一职责原则，类的单一职责看具体情况而定。

<Valine></Valine>