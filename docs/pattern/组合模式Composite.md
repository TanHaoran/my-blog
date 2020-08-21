# 组合模式Composite

<Counter :path="'pattern'" :name="'组合模式Composite'"></Counter>

## 一、概念

### 1、定义

将对象组合成树形结构以表示“部分-整体”的层次结构，组合模式使客户端对单个对象和组合对象保持一致的方式处理

### 2、类型

结构型

### 3、适用场景

* 希望客户端可以忽略组合对象与单个对象的差异时 
* 处理一个树形结构时

### 4、优点

* 清楚地定义分层次的复杂对象，表示对象的全部或部分层次
* 让客户端忽略了层次的差异，方便对整个层次结构进行控制
* 简化客户端代码
* 符合开闭原则

### 5、缺点

* 当需要限制类型时会比较复杂
* 使设计变得更加抽象

### 6、相关设计模式

* 组合模式和访问者模式

可以使用访问者模式访问组合模式中的递归结构

## 二、Coding

看这样子的场景，现在各大平台都有视频教学，每个视频都有自己的所属的课程分类，我们先来创建一个课程和课程分类组件的父类：
```java
public abstract class CatalogComponent {

    public void add(CatalogComponent catalogComponent) {
        throw new UnsupportedOperationException("不支持添加操作");
    }

    public void remove(CatalogComponent catalogComponent) {
        throw new UnsupportedOperationException("不支持删除操作");
    }

    public String getName(CatalogComponent catalogComponent) {
        throw new UnsupportedOperationException("不支持获取名称操作");
    }

    public double getPrice(CatalogComponent catalogComponent) {
        throw new UnsupportedOperationException("不支持获取价格操作");
    }

    public void print() {
        throw new UnsupportedOperationException("不支持打印操作");
    }
}
```
这里声明成了一个抽象类，并且每个方法中都抛出异常，意思是让继承它的类自己确定复写哪些方法。

接下来是课程的实现类，它有2个属性，一个是课程名称，一个是课程价格：
```java
public class Course extends CatalogComponent {

    private String name;
    private double price;

    public Course(String name, double price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public String getName(CatalogComponent catalogComponent) {
        return name;
    }

    @Override
    public double getPrice(CatalogComponent catalogComponent) {
        return price;
    }

    @Override
    public void print() {
        System.out.println("Course name: " + name + ", price: " + price);
    }
}
```
它复写了父类的3个方法，支持获取名称、获取价格、和输出的方法。

然后是课程分类的实现类，它也有2个属性，一个是所属分类下的课程，一个是分类名称。
```java
public class CourseCatalog extends CatalogComponent {

    private List<CatalogComponent> itemList = new ArrayList<>();
    private String name;

    public CourseCatalog(String name) {
        this.name = name;
    }

    @Override
    public String getName(CatalogComponent catalogComponent) {
        return name;
    }

    @Override
    public void add(CatalogComponent catalogComponent) {
        itemList.add(catalogComponent);
    }

    @Override
    public void remove(CatalogComponent catalogComponent) {
        itemList.remove(catalogComponent);
    }

    @Override
    public void print() {
        System.out.println(name);
        for (CatalogComponent catalogComponent : itemList) {
            System.out.print("-");
            catalogComponent.print();
        }
    }
}
```
它复写了父类的4个方法，获取名称、添加课程、移除课程和打印。

看看应用层怎么调用吧：
```java
    public static void main(String[] args) {
        CatalogComponent linuxCourse = new Course("Linux课程", 11);
        CatalogComponent windowsCourse = new Course("WindowsCourse课程", 11);

        CatalogComponent javaCourseCatalog = new CourseCatalog("Java课程目录");

        CatalogComponent mallCourse1 = new Course("Java电商一期", 55);
        CatalogComponent mallCourse2 = new Course("Java电商二期", 66);
        CatalogComponent designPattern = new Course("Java设计模式", 77);

        javaCourseCatalog.add(mallCourse1);
        javaCourseCatalog.add(mallCourse2);
        javaCourseCatalog.add(designPattern);

        CatalogComponent mainCourseCatalog = new CourseCatalog("课程主目录");
        mainCourseCatalog.add(linuxCourse);
        mainCourseCatalog.add(windowsCourse);
        mainCourseCatalog.add(javaCourseCatalog);

        mainCourseCatalog.print();
    }
```
首先创建了2个课程：“Linux课程”和“WindowsCourse课程”，然后创建了一个“Java课程目录”，给这个目录中添加了3个子课程，最终将所有课程和课程目录统一放入了一个“课程主目录中”进行打印。

运行结果：
```console
课程主目录
-Course name: Linux课程, price: 11.0
-Course name: WindowsCourse课程, price: 11.0
-Java课程目录
-Course name: Java电商一期, price: 55.0
-Course name: Java电商二期, price: 66.0
-Course name: Java设计模式, price: 77.0
```

前面提到说当组合模式需要“限制类型时会比较复杂”，这个怎么理解呢？比方说现在需求变了，希望在课程或者课程类型的 `print()` 方法中打印的时候能通过不同个数的 `-` 体现出课程的层级结构来，这时候会需要动态的判断当前类型是课程还是课程类型。

修改课程分类的实现类，添加 `level` 属性，修改后的代码：
```java
public class CourseCatalog extends CatalogComponent {

    private List<CatalogComponent> itemList = new ArrayList<>();
    private String name;
    private Integer level;

    public CourseCatalog(String name, Integer level) {
        this.name = name;
        this.level = level;
    }

    @Override
    public String getName(CatalogComponent catalogComponent) {
        return name;
    }

    @Override
    public void add(CatalogComponent catalogComponent) {
        itemList.add(catalogComponent);
    }

    @Override
    public void remove(CatalogComponent catalogComponent) {
        itemList.remove(catalogComponent);
    }

    @Override
    public void print() {
        System.out.println(name);
        for (CatalogComponent catalogComponent : itemList) {
            if (level != null) {
                for (int i = 0; i < level; i++) {
                    System.out.print("-");
                }
            }
            catalogComponent.print();
        }
    }
}
```
在 `print()` 方法中对 `level` 做 `for循环` 输出空格即可。

应用层做下调整：
```java
    public static void main(String[] args) {
        CatalogComponent linuxCourse = new Course("Linux课程", 11);
        CatalogComponent windowsCourse = new Course("WindowsCourse课程", 11);

        CatalogComponent javaCourseCatalog = new CourseCatalog("Java课程目录", 2);

        CatalogComponent mallCourse1 = new Course("Java电商一期", 55);
        CatalogComponent mallCourse2 = new Course("Java电商二期", 66);
        CatalogComponent designPattern = new Course("Java设计模式", 77);

        javaCourseCatalog.add(mallCourse1);
        javaCourseCatalog.add(mallCourse2);
        javaCourseCatalog.add(designPattern);

        CatalogComponent mainCourseCatalog = new CourseCatalog("课程主目录", 1);
        mainCourseCatalog.add(linuxCourse);
        mainCourseCatalog.add(windowsCourse);
        mainCourseCatalog.add(javaCourseCatalog);

        mainCourseCatalog.print();
    }
```

运行结果：
```console
课程主目录
-Course name: Linux课程, price: 11.0
-Course name: WindowsCourse课程, price: 11.0
-Java课程目录
--Course name: Java电商一期, price: 55.0
--Course name: Java电商二期, price: 66.0
--Course name: Java设计模式, price: 77.0
```

<Valine></Valine>