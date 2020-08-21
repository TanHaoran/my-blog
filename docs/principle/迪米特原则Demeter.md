# 迪米特原则Demeter

<Counter :path="'principle'" :name="'迪米特原则Demeter'"></Counter>

## 一、概念

### 1、定义

一个对象应该对其他对象保持最少的了解，又叫做最少知道原则。

### 2、注意

* 尽量降低类与类之间的耦合。
* 强调只和朋友交流，不和陌人生说话。其中出现在成员变量、方法的输入、输出参数中的类称为成员朋友类，而出现在方法体内部的类不属于朋友类。

### 3、有点

降低类之间的耦合

## 二、应用

首先创建一个课程类：

```java
public class Course {
}
```

有一个 `TeamLeader`，他负责统计在线课程的数量：

```java
public class TeamLeader {

    /**
     * 计算一共有多少个课程
     */
    public void checkNumberOfCourses(List<Course> courseList) {
        System.out.println("在线课程的数量是：" + courseList.size());
    }
}
```

接收一个课程集合，统计出来数量。

还有一个 `Boss` 类，他有一个方法负责向 `TeamLeader` 发命令，获取在线课程数量：

```java
public class Boss {

    /**
     * 下命令计算一共有多少个课程
     *
     * @param teamLeader
     */
    public void commandCheckNumber(TeamLeader teamLeader) {
        List<Course> courseList = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            courseList.add(new Course());
        }
        teamLeader.checkNumberOfCourses(courseList);
    }
}
```

应用层：

```java
public class Test {

    public static void main(String[] args) {
        Boss boss = new Boss();
        TeamLeader teamLeader = new TeamLeader();
        boss.commandCheckNumber(teamLeader);
    }
}
```

执行结果：

```java
在线课程的数量是：20
```

现在来看下 `Boss` 类的 `commandCheckNumber()` 方法，参数 `TeamLead` 是这个类的朋友，但是根据迪米特原则方法体内部的 `Course` 类不是 `Boss` 的朋友，`Course` 应当和 `TeamLead` 有朋友的关系。

此时的类图：

![迪米特法则1](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/demeter_1.png)

可以看出此时 `Course` 是由 `Boss` 创建的，应当将 `Course` 改为由 `TeamLeader` 创建。

所以应当修改 `TeamLeader` 类：

```java
public class TeamLeader {

    /**
     * 计算一共有多少个课程
     */
    public void checkNumberOfCourses() {
        List<Course> courseList = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            courseList.add(new Course());
        }
        System.out.println("在线课程的数量是：" + courseList.size());
    }
}
```

`Boss` 对应修改：

```java
public class Boss {

    /**
     * 下命令计算一共有多少个课程
     *
     * @param teamLeader
     */
    public void commandCheckNumber(TeamLeader teamLeader) {
        teamLeader.checkNumberOfCourses();
    }
}
```

应用层不用修改，运行结果是一样的。

![迪米特法则2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/demeter_2.png)

此时的类图：

`Course` 由 `TeamLeader` 创建，`Course` 不再和 `Boss` 有直接关系，也就遵循了迪米特法则。

<Valine></Valine>