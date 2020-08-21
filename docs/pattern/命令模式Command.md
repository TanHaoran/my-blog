# 命令模式Command

<Counter :path="'pattern'" :name="'命令模式Command '"></Counter>

## 一、概念

### 1、定义

将“请求”封装成对象，以便使用不同的请求。

### 2、扩展

命令模式解决了应用程序中对象的职责以及它们之间的通信方式

### 3、类型

行为型

### 4、适用场景

* 请求调用者和请求接受者需要解耦，使得调用者和接受者不直接交互
* 需要抽象出等待执行的行为

### 5、优点

* 降低耦合
* 容易扩展新命令或者一组命令

### 6、缺点

命令的无限扩展会增加类的数量，提高系统实现复杂度

### 7、相关设计模式

* 命令模式和备忘录模式

可以使用备忘录模式保存命令的历史记录

## 二、应用

有这么一个业务场景，视频课程一般都会分章节，第一章可以免费观看，后面的章节需要收费。过了一段时间下达了一个命令，让第二章节也免费，再过了一段时间第三章节也免费，再后来第二章又恢复收费了。

首先创建一个命令的接口：

```java
public interface Command {

    void execute();
}
```

课程类：

```java
public class CourseVideo {

    private String name;

    public CourseVideo(String name) {
        this.name = name;
    }

    public void open() {
        System.out.println(name + "课程视频开放");
    }

    public void close() {
        System.out.println(name + "课程视频关闭");
    }
}
```

一个开放课程的实现类：

```java
public class OpenCourseVideoCommand implements Command {

    private CourseVideo courseVideo;

    public OpenCourseVideoCommand(CourseVideo courseVideo) {
        this.courseVideo = courseVideo;
    }

    @Override
    public void execute() {
        courseVideo.open();
    }
}
```

关闭课程的实现类：

```java
public class CloseCourseVideoCommand implements Command {

    private CourseVideo courseVideo;

    public CloseCourseVideoCommand(CourseVideo courseVideo) {
        this.courseVideo = courseVideo;
    }

    @Override
    public void execute() {
        courseVideo.close();
    }
}
```

具体执行命令的对象：

```java
public class Staff {

    private List<Command> commandList = new ArrayList<>();

    public void addCommand(Command command) {
        commandList.add(command);
    }

    public void executeCommands() {
        for (Command command : commandList) {
            command.execute();
        }
        commandList.clear();
    }
}
```

类图：

![命令模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/command.png)

测试类：

```java
public class Test {

    public static void main(String[] args) {
        CourseVideo courseVideo = new CourseVideo("Java设计模式");
        OpenCourseVideoCommand openCourseVideoCommand = new OpenCourseVideoCommand(courseVideo);
        CloseCourseVideoCommand closeCourseVideoCommand = new CloseCourseVideoCommand(courseVideo);

        Staff staff = new Staff();
        staff.addCommand(openCourseVideoCommand);
        staff.addCommand(closeCourseVideoCommand);
        staff.executeCommands();
    }
}
```

执行结果：

```console
Java设计模式课程视频开放
Java设计模式课程视频关闭
```

## 三、源码中的应用

### 1、Runnable

`Runnable` 可以理解成一个抽象命令，实现了 `Runnable` 接口的类就是具体的命令。

### 2、Test

`junit.framework` 中的 `Test` 类：

```java
public interface Test {
    /**
     * Counts the number of test cases that will be run by this test.
     */
    public abstract int countTestCases();

    /**
     * Runs a test and collects its result in a TestResult instance.
     */
    public abstract void run(TestResult result);
}
```

上面的 `run()` 方法就可以理解成命令模式中的 `execute()` 方法，`TestResult` 就是具体的命令，`countTestCases()` 方法是用来统计结果的。

<Valine></Valine>
