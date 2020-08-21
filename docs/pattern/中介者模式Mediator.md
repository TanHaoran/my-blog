# 中介者模式Mediator

<Counter :path="'pattern'" :name="'中介者模式Mediator'"></Counter>

## 一、概念

### 1、定义

定义一个封装一组对象如何交互的对象

### 2、补充

通过是对象明确的相互引用来促进松散耦合，并允许独立地改变

### 3、类型

行为型

### 4、适用场景

* 系统中对象之间存在复杂的引用关系，产生的相互依赖关系结构混乱且难以理解
* 交互的公共行为，如果需要改变行为则可以增加新的中介者类

### 5、优点

* 将一对多转化成了一对一，降低程序复杂度
* 解决了类之间耦合

### 6、缺点

* 中介者过多，导致系统复杂

### 7、相关设计模式

* 中介者模式和观察者模式

有时候会使用观察者模式实现中介者模式中的角色间的通讯

## 二、应用

看这样子的业务场景，qq群中的通讯。

qq群类：

```java
public class StudyGroup {

    public static void showMessage(User user, String message) {
        System.out.println(new Date().toInstant() + " [" + user.getName() + "]: " + message);
    }
}
```

有一个静态方法，代表某个用户进行消息发送。

用户类：

```java
public class User {

    private String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void sendMessage(String message) {
        StudyGroup.showMessage(this, message);
    }
}
```

测试类：

```java
public class Test {

    public static void main(String[] args) {
        User jerry = new User("jerry");
        User user = new User("user");

        jerry.sendMessage("Hello, user");
        user.sendMessage("Hi, jerry");
    }
}
```

执行结果：

```console
2020-06-27T09:28:02.658Z [jerry]: Hello, user
2020-06-27T09:28:02.709Z [user]: Hi, jerry
```

类图：

![mediator](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/mediator.png)

## 三、源码中的应用

### Timer

`java.util` 包中的 `Timer` 的 `schedule()` 方法重载有很多，方法内部又调用了 `sched()` 方法。`Timer` 可以理解成中介者，而 `sched()` 方法中的 `TimerTask` 就是协调的 `User` 。

```java
    private void sched(TimerTask task, long time, long period) {
        if (time < 0)
            throw new IllegalArgumentException("Illegal execution time.");

        // Constrain value of period sufficiently to prevent numeric
        // overflow while still being effectively infinitely large.
        if (Math.abs(period) > (Long.MAX_VALUE >> 1))
            period >>= 1;

        synchronized(queue) {
            if (!thread.newTasksMayBeScheduled)
                throw new IllegalStateException("Timer already cancelled.");

            synchronized(task.lock) {
                if (task.state != TimerTask.VIRGIN)
                    throw new IllegalStateException(
                        "Task already scheduled or cancelled");
                task.nextExecutionTime = time;
                task.period = period;
                task.state = TimerTask.SCHEDULED;
            }

            queue.add(task);
            if (queue.getMin() == task)
                queue.notify();
        }
    }
```

<Valine></Valine>


