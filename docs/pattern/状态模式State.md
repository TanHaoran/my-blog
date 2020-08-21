# 状态模式State

<Counter :path="'pattern'" :name="'状态模式State'"></Counter>

## 一、概念

### 1、定义

允许一个对象在其内部状态改变时，改变它的行为

### 2、类型

行为型

### 3、适用场景

* 一个对象存在多个状态（不同状态下行为不同），且状态可相互转换

### 4、优点

* 将不同的状态隔离
* 把各种状态的转换逻辑，分布到State的子类中，减少相互依赖
* 增加新的状态非常简单

### 5、缺点

状态多的业务场景导致类数目增加，系统变复杂

### 6、相关设计模式

* 状态模式和享元模式

当状态中里面没有对应的属性时，这种情况下是可以使用享元模式在多个上下文角色之间共享这些状态实例

## 二、应用

场景如下，一个视频的状态有播放、快进、暂停、停止。在每一个状态下，有各自独立的行为。

视频课程类：

```java
public abstract class CourseVideoState {

    protected CourseVideoContext courseVideoContext;

    public void setCourseVideoContext(CourseVideoContext courseVideoContext) {
        this.courseVideoContext = courseVideoContext;
    }

    public abstract void play();

    public abstract void speed();

    public abstract void pause();

    public abstract void stop();
}
```

接着是4个状态下的类，都继承自 `CourseVideoState`：

```java
public class PlayState extends CourseVideoState {

    @Override
    public void play() {
        System.out.println("播放课程");
    }

    @Override
    public void speed() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.SPEED_STATE);
    }

    @Override
    public void pause() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.PAUSE_STATE);
    }

    @Override
    public void stop() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.STOP_STATE);
    }
}
```

```java
public class SpeedState  extends CourseVideoState {

    @Override
    public void play() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.PLAY_STATE);
    }

    @Override
    public void speed() {
        System.out.println("快进播放课程");
    }

    @Override
    public void pause() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.PAUSE_STATE);
    }

    @Override
    public void stop() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.STOP_STATE);
    }
}
```

```java
public class PauseState extends CourseVideoState {

    @Override
    public void play() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.PLAY_STATE);
    }

    @Override
    public void speed() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.SPEED_STATE);
    }

    @Override
    public void pause() {
        System.out.println("暂停播放课程");
    }

    @Override
    public void stop() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.STOP_STATE);
    }
}
```

```java
public class StopState extends CourseVideoState {

    @Override
    public void play() {
        courseVideoContext.setCourseVideoState(CourseVideoContext.PLAY_STATE);
    }

    @Override
    public void speed() {
        System.out.println("错误，停止状态不能快进");
    }

    @Override
    public void pause() {
        System.out.println("错误，停止状态不能暂停");
    }

    @Override
    public void stop() {
        System.out.println("停止播放课程");
    }
}
```

上下文类：

```java
public class CourseVideoContext {

    private CourseVideoState courseVideoState;

    public static final PlayState PLAY_STATE = new PlayState();
    public static final SpeedState SPEED_STATE = new SpeedState();
    public static final PauseState PAUSE_STATE = new PauseState();
    public static final StopState STOP_STATE = new StopState();

    public CourseVideoState getCourseVideoState() {
        return courseVideoState;
    }

    public void setCourseVideoState(CourseVideoState courseVideoState) {
        this.courseVideoState = courseVideoState;
        this.courseVideoState.setCourseVideoContext(this);
    }

    public void play() {
        this.courseVideoState.play();
    }

    public void speed() {
        this.courseVideoState.speed();
    }

    public void pause() {
        this.courseVideoState.pause();
    }

    public void stop() {
        this.courseVideoState.stop();
    }
}
```

此时类图：

![状态模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/state.png)

测试类：

```java
public class Test {

    public static void main(String[] args) {
        CourseVideoContext courseVideoContext = new CourseVideoContext();
        courseVideoContext.setCourseVideoState(new PlayState());
        System.out.println("当前状态：" + courseVideoContext.getCourseVideoState().getClass().getSimpleName());

        courseVideoContext.pause();
        System.out.println("当前状态：" + courseVideoContext.getCourseVideoState().getClass().getSimpleName());

        courseVideoContext.speed();
        System.out.println("当前状态：" + courseVideoContext.getCourseVideoState().getClass().getSimpleName());

        courseVideoContext.stop();
        System.out.println("当前状态：" + courseVideoContext.getCourseVideoState().getClass().getSimpleName());
    }
}
```

执行结果：

```console
当前状态：PlayState
当前状态：PauseState
当前状态：SpeedState
当前状态：StopState
```

如果尝试在停止状态下设置加速状态，那么就会报错。

## 三、源码中的应用

### LifeCycle

`javax.faces.lifecycle` 包下的 `LifeCycle` 类，有一个 `execute()` 方法：

```java
    public abstract void execute(FacesContext context) throws FacesException;
```

就使用了状态模式。

<Valine></Valine>