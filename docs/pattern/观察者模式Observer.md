# 观察者模式

<Counter :path="'pattern'" :name="'观察者模式'"></Counter>

## 一、概念

### 1、定义

定义了对象之间一对多依赖，让多个观察者对象同时监听某一个主题对象，当主题对象发生变化时，它的所有依赖着（观察者）都会收到通知并更新。

### 2、类型

行为型

### 3、适用场景

关联行为场景，建立一套触发机制

### 4、优点

* 观察者和被观察者之间建立一个抽象的耦合
* 观察者模式支持广播通信

### 缺点

* 观察者之间有过多的细节依赖、提高时间消耗及程序复杂度
* 使用要得当，要避免循环调用

## 二、应用

首先创建一个课程类：

```java
public class Course {

    private String name;

    public Course(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

课程对应的问题类：

```java
public class Question {

    private String username;

    private String content;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
```

课程的讲师类：

```java
public class Teacher {

    private String name;

    public Teacher(String name) {
        this.name = name;
    }
}
```

然后让课程类继承自 `Observable` ，这样课程就是一个被观察者：

```java
public class Course extends Observable {

    private String name;

    public Course(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void produceQuestion(Course course, Question question) {
        System.out.println(question.getUsername() + "在" + course.getName() + "提交了一个问题");
        setChanged();
        notifyObservers(question);
    }
}
```

它提供了一个 `produceQuestion()` 生产问题的方法，在方法内调用了 `Observable` 类的 `setChanged()` 方法，将父类中的 `changed` 设置为了 `true`，表示被观察者发生了改变，然后调用 `notifyObservers(question)` 将变化通知给观察者。

接着让 `Teacher` 实现 `Observer` 接口，让 `Teacher` 成为真正的观察者：

```java
public class Teacher implements Observer {

    private String name;

    public Teacher(String name) {
        this.name = name;
    }

    @Override
    public void update(Observable o, Object arg) {
        Course course = (Course) o;
        Question question = (Question) arg;
        System.out.println(name + "老师的" + course.getName() + "课程接收到一个" + question.getUsername() +
                "提交的问题：" + question.getContent());
    }
}
```

`Observer` 接口中的 `update()` 方法第一个参数是被观察的对象，第二个参数是被观察对象发生改变时，传递过来的对象。

测试方法：

```java
public class Test {

    public static void main(String[] args) {
        Course course = new Course("Java设计模式");
        Teacher teacher = new Teacher("Google");
        course.addObserver(teacher);

        Question question = new Question();
        question.setUsername("jerry");
        question.setContent("今天学习什么呢？");

        course.produceQuestion(course, question);
    }
}
```

执行结果：

```console
jerry在Java设计模式提交了一个问题
Google老师的Java设计模式课程接收到一个jerry提交的问题：今天学习什么呢？
```

类图：

![观察者模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/observer.png)

如果给这个课程多添加一个讲师，也很简单：

```java
public class Test {

    public static void main(String[] args) {
        Course course = new Course("Java设计模式");
        Teacher teacher = new Teacher("Google");
        Teacher teacher2 = new Teacher("BaiDu");
        course.addObserver(teacher);
        course.addObserver(teacher2);

        Question question = new Question();
        question.setUsername("jerry");
        question.setContent("今天学习什么呢？");

        course.produceQuestion(course, question);
    }
}
```

执行结果：

```console
jerry在Java设计模式提交了一个问题
BaiDu老师的Java设计模式课程接收到一个jerry提交的问题：今天学习什么呢？
Google老师的Java设计模式课程接收到一个jerry提交的问题：今天学习什么呢？
```

在实际应用中，可以将观察者的 `update()` 方法中的代码通过消息队列改为异步执行。

## 三、源码中的应用

### 1、Event

`java` 中 `awt` 包内的 `Event` 就是用了观察者模式。

### 2、EventListener

`java.util` 包下的 `EventListener` 也是一个监听器。

### 3、google 的 EventBus

创爱一个类：

```java
public class GuavaEvent {

    @Subscribe
    public void subscribe(String str) {
        // 业务逻辑
        System.out.println("执行 subscribe 方法，传入的参数是：" + str);
    }
}
```

`EventBus` 是实现观察者模式的核心类，其中有几个很重要的方法 `register()` 和 `unregister()`：

```java
  public void register(Object object) {
    subscribers.register(object);
  }
```

```java
  public void unregister(Object object) {
    subscribers.unregister(object);
  }
```

其中 `subscribers` 是一个成员变量：

```java
  private final SubscriberRegistry subscribers = new SubscriberRegistry(this);
```

它是一个自定义的类：

```java
final class SubscriberRegistry {

  /**
   * All registered subscribers, indexed by event type.
   *
   * <p>The {@link CopyOnWriteArraySet} values make it easy and relatively lightweight to get an
   * immutable snapshot of all current subscribers to an event without any locking.
   */
  private final ConcurrentMap<Class<?>, CopyOnWriteArraySet<Subscriber>> subscribers =
      Maps.newConcurrentMap();

  ...
}
```

这里使用了 `CopyOnWriteArraySet` 来存放 `Subscriber` ，所以 `Subscriber` 类重写了 `equals()` 方法：

```java
  @Override
  public final boolean equals(@Nullable Object obj) {
    if (obj instanceof Subscriber) {
      Subscriber that = (Subscriber) obj;
      // Use == so that different equal instances will still receive events.
      // We only guard against the case that the same object is registered
      // multiple times
      return target == that.target && method.equals(that.method);
    }
    return false;
  }
```

测试类：

```java
public class GuavaEventTest {

    public static void main(String[] args) {
        EventBus eventBus = new EventBus();
        GuavaEvent guavaEvent = new GuavaEvent();
        eventBus.register(guavaEvent);
        eventBus.post("post 的内容");
    }
}
```

这个 `post()` 方法，获取所有的订阅者，然后遍历进行分发。：

```java
  public void post(Object event) {
    Iterator<Subscriber> eventSubscribers = subscribers.getSubscribers(event);
    if (eventSubscribers.hasNext()) {
      dispatcher.dispatch(event, eventSubscribers);
    } else if (!(event instanceof DeadEvent)) {
      // the event had no subscribers and was not itself a DeadEvent
      post(new DeadEvent(this, event));
    }
  }
```

创建 `eventBus` 对象，然后向 `eventBus` 注册一个我们写的 `GuavaEvent`，发布一条内容，`GuavaEvent` 中通过 `@Subscribe` 注解标注的方法就会收到广播，执行方法。

执行结果：

```console
执行 subscribe 方法，传入的参数是：post 的内容
```

<Valine></Valine>