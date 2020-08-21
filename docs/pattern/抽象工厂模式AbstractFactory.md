# 抽象工厂模式AbstractFactory

<Counter :path="'pattern'" :name="'抽象工厂模式AbstractFactory'"></Counter>

## 一、概念

### 1、定义

抽象工厂模式提供一个创建一系列相关或相互依赖对象的接口，

### 2、注意

无需指定它们具体的类

### 3、类型

创建型

### 4、适用场景

* 客户端（应用层）不依赖于产品类实现如何被创建、实现等细节
* 强调一系列相关产品对象（属于同一产品族）一起使用创建对象需要大量重复的代码
* 提供一个产品类的库，所有的产品以同样的接口出现，从而使客户端不依赖于具体实现

### 5、优点

* 具体产品在应用层代码隔离，无须关心创建细节
* 将一个系列的产品族统一到一起创建

### 6、缺点

* 规定了所有可能被创建的产品集合，产品族中扩展新的产品困难，需要修改抽象工厂的接口
* 增加了系统的抽象性和理解难度

## 二、应用

继续接着上两篇博客 [简单工厂SimpleFactory](简单工厂SimpleFactory.md) 和 [工厂方法模式FactoryMethod](工厂方法模式FactoryMethod.md) ，如果不熟悉的可以先去看看前两篇博客。

前面博客中用到的是视频类，在学习一门课程的时候如果不但需要视频，还需要笔记，那么按照之前工厂方法模式，就需要笔记类、创建笔记的抽象工厂以及创建各个课程的笔记工厂，这样子需要创建的类太多了。

其实视频和笔记是同属于同一产品族的，可以将创建它们的工厂使用同一个类（或接口）进行封装起来。

首先是新加入的笔记类：

```java
public abstract class Article {

    public abstract void produce();
}
```

接着使用一个课程的接口，负责创建视频和笔记：

```java
public interface CourseFactory {

    Video getVideo();

    Article getArticle();

}
```

之前的 `JavaVideo` 和 `PythonVideo` 类已经有了，现在新增一个 `JavaArticle` 和 `PythonArticle` 类：

```java
public class JavaArticle extends Article {

    @Override
    public void produce() {
        System.out.println("编写Java课程手记");
    }
}
```

```java
public class PythonArticle extends Article {

    @Override
    public void produce() {
        System.out.println("编写Python课程手记");
    }
}
```

现在一个产品族需要有视频和笔记，所以创建一个用于创建Java课程的工厂：

```java
public class JavaCourseFactory implements CourseFactory {

    @Override
    public Video getVideo() {
        return new JavaVideo();
    }

    @Override
    public Article getArticle() {
        return new JavaArticle();
    }
}
```

再来一个用于创建Python课程的工厂：

```java
public class PythonCourseFactory implements CourseFactory {

    @Override
    public Video getVideo() {
        return new PythonVideo();
    }

    @Override
    public Article getArticle() {
        return new PythonArticle();
    }
}
```

这个时候，应用层是这个样子的：

```java
public class Test {

    public static void main(String[] args) {
        CourseFactory courseFactory = new JavaCourseFactory();
        Video video = courseFactory.getVideo();
        Article article = courseFactory.getArticle();
        video.produce();
        article.produce();
    }
}
```

这个时候应用层创建视频和笔记的时候只用确定好从Java课程工厂中创建出来的就一定就是Java视频和Java笔记了，如果换成Python课程工厂，那么创建出来的一定就是Python视频和Python笔记了。

运行结果：
```console
录制Java课程视频
编写Java课程手记
```

此时的类图：

![抽象工厂](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/abstractfactory.png)

这时候优点就体现出来了，应用层代码不和具体的视频和笔记产生依赖，只和具体类型的课程工厂发生依赖；并且从指定类型课程工厂中创建出来的一定是对应类型的视频和笔记；如果有新类型的课程和笔记加入时，只用创建新类型课程工厂并创建好对应的视频和笔记，应用层指定新的课程工厂，从这个工厂中创建视频和笔记即可。

但是也有缺点，如果有新的产品出现时，比如课程需要配套源码，那么就需要给课程工厂接口新增创建源码的方法了，并且所有实现了课程工厂的子类也需要新增对应的方法，这样子的修改还是比较大的。

## 三、源码中的应用

<Valine></Valine>