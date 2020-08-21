# 访问者模式Visitor

<Counter :path="'pattern'" :name="'访问者模式Visitor'"></Counter>

## 一、概念

### 1、定义

封装作用于某数据结构（如List/Set/Map等）中的各元素的操作

### 2、扩展

可以在不改变各元素的类的前提下，定义作用于这些元素的操作

### 3、类型

行为型

### 4、适用场景

* 一个数据结构（如List/Set/Map等）包含很多类型对象
* 数据结构与数据操作分离

### 5、优点

增加新的操作很容易，即增加一个新的访问者

### 6、缺点

* 增加新的数据结构困难
* 具体元素变更比较麻烦

### 7、相关设计模式

* 解释器模式和适配器模式

适配器模式不需要预先知道需要适配的规则，而对于解释器模式需要把规则写好，根据规则进行解释。

## 二、应用

首先是一个课程类：

```java
public abstract class Course {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public abstract void accept(IVisitor visitor);
}
```

网站有免费课程和实战课程，先来看免费课程：

```java
public class FreeCourse extends Course {

    @Override
    public void accept(IVisitor visitor) {
        visitor.visit(this);
    }
}
```

实战课程不是免费的，所有还有一个价格属性：

```java
public class CodingCourse extends Course {

    private int price;

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    @Override
    public void accept(IVisitor visitor) {
        visitor.visit(this);
    }
}
```

`IVisitor` 接口：

```java
public interface IVisitor {

    void visit(FreeCourse freeCourse);

    void visit(CodingCourse codingCourse);
}
```

接口实现：

```java
public class Visitor implements IVisitor {

    @Override
    public void visit(FreeCourse freeCourse) {
        System.out.println("免费课程：" + freeCourse.getName());
    }

    @Override
    public void visit(CodingCourse codingCourse) {
        System.out.println("实战课程：" + codingCourse.getName() + "，价格：" + codingCourse.getPrice());
    }
}
```

此时的类图：

![访问者模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/visitor.png)

测试类：

```java
public class Test {

    public static void main(String[] args) {
        List<Course> courseList = new ArrayList<>();

        FreeCourse freeCourse = new FreeCourse();
        freeCourse.setName("免费课程一");

        CodingCourse codingCourse = new CodingCourse();
        codingCourse.setName("Java设计模式");
        codingCourse.setPrice(299);

        courseList.add(freeCourse);
        courseList.add(codingCourse);

        for (Course course : courseList) {
            course.accept(new Visitor());
        }
    }
}
```

执行结果：

```console
免费课程：免费课程一
实战课程：Java设计模式，价格：299
```

## 三、源码中的应用

### 1、FileVisitor

`java.nio` 包下的 `FileVisitor` 类。它有一个实现类 `SimpleFileVisitor`。

### 2、BeanDefinitionVisitor

`Spring` 中的 `BeanDefinitionVisitor` ，可以遍历 `Bean` 的属性。它有一个成员变量 `StringValueResolver` ，具体的实现都会交给这个成员变量。`visitBeanDefinition()` 方法就是访问 `Bean` 属性的方法。

```java
	/**
	 * Traverse the given BeanDefinition object and the MutablePropertyValues
	 * and ConstructorArgumentValues contained in them.
	 * @param beanDefinition the BeanDefinition object to traverse
	 * @see #resolveStringValue(String)
	 */
	public void visitBeanDefinition(BeanDefinition beanDefinition) {
		visitParentName(beanDefinition);
		visitBeanClassName(beanDefinition);
		visitFactoryBeanName(beanDefinition);
		visitFactoryMethodName(beanDefinition);
		visitScope(beanDefinition);
		visitPropertyValues(beanDefinition.getPropertyValues());
		ConstructorArgumentValues cas = beanDefinition.getConstructorArgumentValues();
		visitIndexedArgumentValues(cas.getIndexedArgumentValues());
		visitGenericArgumentValues(cas.getGenericArgumentValues());
	}
```

<Valine></Valine>