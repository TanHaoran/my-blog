# 迭代器模式Iterator

<Counter :path="'pattern'" :name="'迭代器模式Iterator'"></Counter>

## 一、概念

### 1、定义

提供一种方法，顺序访问一个集合对象中的各个元素，而又不暴露该对象的内部实现。

### 2、类型

行为型

### 3、适用场景

* 访问一个集合对象的内容而无需暴露它的内部表示
* 为遍历不同的集合结构提供一个统一的接口

### 4、优点

分离了集合对象的遍历行为

### 5、缺点

类的个数成对增加

### 6、相关设计模式

* 迭代器模式和访问者模式

都是迭代的访问一个集合对象中的各个元素。访问者模式扩展开放的部分作用于对象的操作上，而迭代器模式扩展开放的部分作用域集合对象的种类上。实现方式也不一样。

## 二、应用

有一个课程类：

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

迭代器接口：

```java
public interface CourseIterator {

    Course nextCourse();
    boolean isLastCourse();
}
```

定义了两个方法，一个获取下一个课程的方法，一个判断当前是否是最后一个课程的方法。

迭代器的实现类：

```java
public class CourseIteratorImpl implements CourseIterator {

    private List courseList;

    private int position;
    private Course course;

    public CourseIteratorImpl(List courseList) {
        this.courseList = courseList;
    }

    @Override
    public Course nextCourse() {
        System.out.println("返回课程，位置是：" + position);
        course = (Course) courseList.get(position);
        position++;
        return course;
    }

    @Override
    public boolean isLastCourse() {
        if (position< courseList.size()) {
            return false;
        }
        return true;
    }
}
```

还有一个课程集合接口：

```java
public interface CourseAggregate {

    void addCourse(Course course);
    void removeCourse(Course course);

    CourseIterator getCourseIterator();
}
```

定义的方法有：添加课程、移除课程和获取课程迭代器。它的实现类：

```java
public class CourseAggregateImpl implements CourseAggregate {

    private List courseList;

    public CourseAggregateImpl(List courseList) {
        this.courseList = courseList;
    }

    @Override
    public void addCourse(Course course) {
        courseList.add(course);
    }

    @Override
    public void removeCourse(Course course) {
        courseList.remove(course);
    }

    @Override
    public CourseIterator getCourseIterator() {
        return new CourseIteratorImpl(courseList);
    }
}
```

此时的类图：

![迭代器](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/iterator.png)

测试方法：

```java
public class Test {

    public static void main(String[] args) {
        Course course1 = new Course("Java电商一期");
        Course course2 = new Course("Java电商二期");
        Course course3 = new Course("Java设计模式");
        Course course4 = new Course("Python课程");
        Course course5 = new Course("算法课程");
        Course course6 = new Course("前端课程");

        CourseAggregate courseAggregate = new CourseAggregateImpl();

        courseAggregate.addCourse(course1);
        courseAggregate.addCourse(course2);
        courseAggregate.addCourse(course3);
        courseAggregate.addCourse(course4);
        courseAggregate.addCourse(course5);
        courseAggregate.addCourse(course6);

        System.out.println("------课程列表------");
        printCourses(courseAggregate);

        courseAggregate.removeCourse(course4);
        courseAggregate.removeCourse(course5);

        System.out.println("------删除后的课程列表------");
        printCourses(courseAggregate);
    }

    private static void printCourses(CourseAggregate courseAggregate) {
        CourseIterator courseIterator = courseAggregate.getCourseIterator();
        while (!courseIterator.isLastCourse()) {
            Course course = courseIterator.nextCourse();
            System.out.println(course.getName());
        }
    }
}
```

执行结果：

```console
------课程列表------
返回课程，位置是：0
Java电商一期
返回课程，位置是：1
Java电商二期
返回课程，位置是：2
Java设计模式
返回课程，位置是：3
Python课程
返回课程，位置是：4
算法课程
返回课程，位置是：5
前端课程
------删除后的课程列表------
返回课程，位置是：0
Java电商一期
返回课程，位置是：1
Java电商二期
返回课程，位置是：2
Java设计模式
返回课程，位置是：3
前端课程
```

## 三、源码中的应用

### 1、Iterator 接口

这个接口的 `boolean hasNext()` 和 `E next()` 都是迭代器中的方法。它的实现类有很多，例如：`ArrayList` 就是比较常见的实现。`ArrayList` 有一个内部类 `Itr`，它实现了 `Iterator` 接口。`ArrayList` 还有一个内部类 `ListItr`，它继承了 `Itr`，新增了 `hasPrevious()`、`nextIndex()`、`previousIndex()`、`previous()` 等方法。

### 2、MyBatis 中的 Cursor 接口

这个接口有一个实现类 `DefaultCursor`，这个类内部有一个 `CursorIteraotr` 游标对象：

```java
    private final CursorIterator cursorIterator = new CursorIterator();
```

在 `iterator()` 方法中返回了这个游标：

```java
    @Override
    public Iterator<T> iterator() {
        if (iteratorRetrieved) {
            throw new IllegalStateException("Cannot open more than one iterator on a Cursor");
        }
        iteratorRetrieved = true;
        return cursorIterator;
    }
```

<Valine></Valine>