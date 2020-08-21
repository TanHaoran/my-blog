# 依赖倒置原则DependenceInversion

<Counter :path="'principle'" :name="'依赖倒置原则DependenceInversion'"></Counter>

## 一、概念

### 1、定义

高层模块不应该依赖底层模块，二者都应该依赖其抽象。

### 2、注意

* 抽象不应该依赖细节；细节应该依赖抽象。
* 针对接口编程，不要针对实现编程。

### 3、优点

可以减少类间的耦合性、提高系统稳定性，提高代码可读性和可维护性，可减低修改程序所造成的风险。

## 二、应用

### 1、普通实现

创建一个学习的主人公类：

```java
public class Jerry {

    public void studyJavaCourse() {
        System.out.println("Jerry在学习Java课程");
    }

    public void studyFrontEndCourse() {
        System.out.println("Jerry在学习FrontEnd课程");
    }
}
```

应用层：

```java
public class Test {

    public static void main(String[] args) {
        // v1.普通实现
        Jerry jerry = new Jerry();
        jerry.studyJavaCourse();
        jerry.studyFrontEndCourse();
    }
}
```

执行结果：

```console
Jerry在学习Java课程
Jerry在学习FrontEnd课程
```

此时的类图：

![普通实现](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/dependenceinversion_1.png)

如果主人公需要学习其他的课程，那么 `Jerry` 类就得添加新的方法，总是在扩展这个类，那么此时实际上就是在针对实现编程，应用层的修改是依赖底层 `Jerry` 类的实现的。

### 2、接口方法注入

依赖倒置原则的定义是“高层模块不应该依赖底层模块”，此时应该怎么修改呢？

抽象出来一个课程接口：

```java
public interface ICourse {

    /**
     * 学习课程
     */
    void studyCourse();
}
```

具体要学习什么样的课程交给高程模块来选择。

创建一个Java课程，实现这个接口：

```java
public class JavaCourse implements ICourse {

    @Override
    public void studyCourse() {
        System.out.println("Jerry在学习Java课程");
    }
}
```

再来一个前端课程：

```java
public class FrontEndCourse implements ICourse {

    @Override
    public void studyCourse() {
        System.out.println("Jerry在学习FrontEnd课程");
    }
}
```

此时，主人公的类这样子修改：

```java
public class Jerry {

    public void studyCourse(ICourse iCourse) {
        iCourse.studyCourse();
    }
}
```

只接受课程接口，具体需要学习什么课程不在这个类里实现，而是交给应用层。

应用层：

```java
public class Test {

    public static void main(String[] args) {
        // v2.接口方法注入
        Jerry jerry = new Jerry();
        jerry.studyCourse(new JavaCourse());
        jerry.studyCourse(new FrontEndCourse());
    }
}
```

执行结果和之前是一样的。

此时的类图：

![接口方法注入](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/dependenceinversion_2.png)

如果需要新增新的课程，只需要实现 `ICourse` 接口即可，而具体的 `Jerry` 类是不需要改的，具体的学习是在应用层完成的，也就是说 `Jerry` 类和课程实现以及应用层是解耦的，它只和接口有耦合。

### 3、构造方法注入

修改 `Jerry` 类，让具体学习的课程通过构造方法注入进来：

```java
public class Jerry {

    private ICourse iCourse;

    public Jerry(ICourse iCourse) {
        this.iCourse = iCourse;
    }

    public void studyCourse() {
        iCourse.studyCourse();
    }
}
```

此时的应用层：

```java
public class Test {

    public static void main(String[] args) {
        // v3.构造器注入
        Jerry jerry = new Jerry(new JavaCourse());
        jerry.studyCourse();
    }
}
```

具体学习的课程在构造方法中注入好了，直接学习就可以了。

执行结果：

```console
Jerry在学习Java课程
```

但是这种构造方法注入的方式只能在构造时注入，如果想学一个别的课程，就得重新创建一个 `Jerry` 类。

此时的类图：

![构造方法注入](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/dependenceinversion_3.png)

### 4、setter方法注入

修改 `Jerry` 类：

```java
public class Jerry {

    private ICourse iCourse;

    public void setICourse(ICourse iCourse) {
        this.iCourse = iCourse;
    }

    public void studyCourse() {
        iCourse.studyCourse();
    }
}
```

通过 `setICourse()` 方法可以多次注入不同的课程。在学习课程的时候通过 `studyCourse()` 完成，这个方法里面并不关心学习哪门课程。

应用层：

```java
public class Test {

    public static void main(String[] args) {
        // v4.setter方法设置
        Jerry jerry = new Jerry();
        jerry.setICourse(new JavaCourse());
        jerry.studyCourse();

        jerry.setICourse(new FrontEndCourse());
        jerry.studyCourse();
    }
}
```

执行结果：

```console
Jerry在学习Java课程
Jerry在学习FrontEnd课程
```

此时的类图：

![setter方法注入](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/dependenceinversion_4.png)

至此，`Jerry` 类不依赖具体的 `JavaCourse` 或者 `FrontEndCourse`，想学什么课都可以在不修改 `Jerry` 类的情况下进行扩展，扩展的方式就是新创建一个类实现 `ICourse` 接口，然后在应用层调注入后直接调用 `StudyCourse()` 即可。

<Valine></Valine>