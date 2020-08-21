# 模板方法模式TemplateMethod

<Counter :path="'pattern'" :name="'模板方法模式TemplateMethod'"></Counter>

## 一、概念

### 1、定义

定义了一个算法的骨架，并允许子类为一个或多个步骤提供实现。

### 2、定义补充

模板方法使得子类可以在不改变算法结构的情况下，重新定义算法的某些步骤。

### 3、类型

行为型

### 4、适用场景

* 一次性实现一个算法的不变的部分，并将可变的行为留给子类来实现。
* 各子类中公共的行为被提取出来并集中到一个公共父类中，从而避免代码重复。

### 5、优点

* 提高复用性
* 提高扩展性
* 符合开闭原则

### 6、缺点

* 类数目增加
* 增加了系统实现的复杂度
* 继承关系自身缺点，如果父类添加新的抽象方法，所有子类都要改一遍

### 7、扩展

* 钩子方法

是模板对子类更进一步的开放和扩展。

### 8、相关设计模式

* 模板方法和工厂方法模式

工厂方法模式是对模板方法的特殊实现

* 模板方法和策略模式

都有封装算法。策略模式目的是使不同的算法可以相互替换，并且不影响应用层的使用，可以改变算法的流程；而模板方法是针对定义一个算法的流程，将一些不太一样的具体实现步骤交给子类实现，不改变算法的流程。

## 二、应用

首先创建一个课程的抽象类：

```java
public abstract class ACourse {

    /**
     * 制作课程
     */
    protected final void makeCourse() {
        makePPT();
        makeVideo();
        if (needWriteArticle()) {
            writeArticle();
        }
        packageCourse();
    }

    final void makePPT() {
        System.out.println("制作PPT");
    }

    final void makeVideo() {
        System.out.println("制作视频");
    }

    final void writeArticle() {
        System.out.println("编写手记");
    }

    /**
     * writeArticle() 的钩子方法，子类可以覆盖
     *
     * @return
     */
    protected boolean needWriteArticle() {
        return false;
    }

    /**
     * 包装课程
     */
    abstract void packageCourse();
}
```

在制作课程中，制作PPT、制作视频、编写手记的过程都是固定的，所以定义成了 `final` 类型，总的制作流程 `makeCourse()` 也是固定的，所以用 `final` 修饰。而是否需要编写手记每个课程不一样，所以有一个 `needWriteArticle()` 来控制，最后包装课程的 `packageCourse()` 方法定义成抽象的，交给子类实现。

创建一个后端设计模式的课程：

```java
public class DesignPatternCourse extends ACourse {

    @Override
    void packageCourse() {
        System.out.println("提供课程Java源代码");
    }
}
```

一个前端的课程：

```java
public class FrontEndCourse extends ACourse {

    @Override
    void packageCourse() {
        System.out.println("提供课程前端源代码");
        System.out.println("提供课程内部的多媒体素材");
    }
}
```

测试：

```java
public class Test {

    public static void main(String[] args) {
        System.out.println("设计模式课程 start ");
        ACourse designPatternCourse = new DesignPatternCourse();
        designPatternCourse.makeCourse();
        System.out.println("设计模式课程 end ");

        System.out.println("前端课程 start ");
        ACourse frontEndCourse = new FrontEndCourse();
        frontEndCourse.makeCourse();
        System.out.println("前端课程 end ");
    }
}
```

执行结果：

```console
设计模式课程 start 
制作PPT
制作视频
提供课程Java源代码
设计模式课程 end 
前端课程 start 
制作PPT
制作视频
提供课程前端源代码
提供课程内部的多媒体素材
前端课程 end 
```

现在设计模式课程需要写手记，所以修改 `DesignPatternCourse` 类，复写父类的 `needWriteArticle()` 方法：

```java
public class DesignPatternCourse extends ACourse {

    @Override
    void packageCourse() {
        System.out.println("提供课程Java源代码");
    }

    @Override
    protected boolean needWriteArticle() {
        return true;
    }
}
```

重新执行测试：

```console
设计模式课程 start 
制作PPT
制作视频
编写手记
提供课程Java源代码
设计模式课程 end 
前端课程 start 
制作PPT
制作视频
提供课程前端源代码
提供课程内部的多媒体素材
前端课程 end 
```

此时，设计模式课程因为在 `needWriteArticle()` 方法中返回了 `true`，所以有了编写手记的流程，而前端课程因为没有复写 `needWriteArticle()` 方法仍然采用的是模板中返回 `false` 的实现。

此时的类图：

![模板方法1](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/templatemethod_1.png)

如果前端课程又细分了两个：`Vue课程` 和 `React课程`，两个课程一个需要手记另一个不需要手记，此时就需要在 `FrontEndCourse` 类中重写 `needWriteArticle()` 方法，并且将具体的返回值开放给应用层：

```java
public class FrontEndCourse extends ACourse {

    private boolean needWriteArticleFlag;

    public FrontEndCourse(boolean needWriteArticleFlag) {
        this.needWriteArticleFlag = needWriteArticleFlag;
    }

    @Override
    void packageCourse() {
        System.out.println("提供课程前端源代码");
        System.out.println("提供课程内部的多媒体素材");
    }

    @Override
    protected boolean needWriteArticle() {
        return needWriteArticleFlag;
    }
}
```

使用 `needWriteArticleFlag` 来控制是否写手记，采用构造方法的方式注入进来值。

应用层：

```java
public class Test {

    public static void main(String[] args) {
        System.out.println("设计模式课程 start ");
        ACourse designPatternCourse = new DesignPatternCourse();
        designPatternCourse.makeCourse();
        System.out.println("设计模式课程 end ");

        System.out.println("前端课程Vue start ");
        ACourse vueCourse = new FrontEndCourse(true);
        vueCourse.makeCourse();
        System.out.println("前端课程Vue end ");

        System.out.println("前端课程React start ");
        ACourse reactCourse = new FrontEndCourse(true);
        reactCourse.makeCourse();
        System.out.println("前端课程React end ");
    }
}
```

执行结果：

```console
设计模式课程 start 
制作PPT
制作视频
编写手记
提供课程Java源代码
设计模式课程 end 
前端课程Vue start 
制作PPT
制作视频
编写手记
提供课程前端源代码
提供课程内部的多媒体素材
前端课程Vue end 
前端课程React start 
制作PPT
制作视频
编写手记
提供课程前端源代码
提供课程内部的多媒体素材
前端课程React end 
```

虽然 `DesignPatternCourse` 和 `FrontEndCourse` 都是继承自 `ACourse` ， 但实际上 `DesignPatternCourse` 已经到一个具体的课程了，就和 `FrontEndCourse` 课程中的 `Vue课程` 和 `React课程` 一样。

`ACourse` 中的 `makeCourse()` 方法注意一定要是 `final` 的，因为制作课程的过程是固定好的，先如何再如何是定义好的，不允许子类打乱这个流程。

此时的类图：

![模板方法2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/templatemethod_2.png)

## 三、源码中的应用

### 1、AbstractList

其中的 `addAll()` 方法就相当于一个定义好流程的方法，所有的子类都需要按照这个流程走：

```java
    public boolean addAll(int index, Collection<? extends E> c) {
        rangeCheckForAdd(index);
        boolean modified = false;
        for (E e : c) {
            add(index++, e);
            modified = true;
        }
        return modified;
    }
```

这个类的 `get()` 是一个抽象方法，交由子类来具体实现。下面这个是 `ArrayList` 的实现：

```java
    public E get(int index) {
        rangeCheck(index);

        return elementData(index);
    }
```

类似的还有 `AbstractSet` 和 `AbstractMap`，都是一样的原理。

### 2、HttpServlet

`doPost()`、`doGet()`、`service()` 这3个方法 `HttpServlet` 都有默认的实现，子类继承的时候可以重写这些方法。

### 3、MyBatis 中的 BaseExecutor

它的 `doUpdate()`、`doFlushStatements()`、`doQuery()`、`doQueryCursor()` 这几个都是抽象方法，都是交由子类来实现的。

它一共有4个子类：`SimpleExecutor`、`BatchExecutor`、`ClosedExecutor`、`ReuseExecutor`。

例如 `SimpleExecutor` 的 `doUpdate()` 的实现：

```java
  @Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
    Statement stmt = null;
    try {
      Configuration configuration = ms.getConfiguration();
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }
  }
```

而 `BatchExecutor` 类又是有它自己不同的实现：

```java
  @Override
  public int doUpdate(MappedStatement ms, Object parameterObject) throws SQLException {
    final Configuration configuration = ms.getConfiguration();
    final StatementHandler handler = configuration.newStatementHandler(this, ms, parameterObject, RowBounds.DEFAULT, null, null);
    final BoundSql boundSql = handler.getBoundSql();
    final String sql = boundSql.getSql();
    final Statement stmt;
    if (sql.equals(currentSql) && ms.equals(currentStatement)) {
      int last = statementList.size() - 1;
      stmt = statementList.get(last);
      applyTransactionTimeout(stmt);
     handler.parameterize(stmt);//fix Issues 322
      BatchResult batchResult = batchResultList.get(last);
      batchResult.addParameterObject(parameterObject);
    } else {
      Connection connection = getConnection(ms.getStatementLog());
      stmt = handler.prepare(connection, transaction.getTimeout());
      handler.parameterize(stmt);    //fix Issues 322
      currentSql = sql;
      currentStatement = ms;
      statementList.add(stmt);
      batchResultList.add(new BatchResult(ms, sql, parameterObject));
    }
  // handler.parameterize(stmt);
    handler.batch(stmt);
    return BATCH_UPDATE_RETURN_VALUE;
  }
```

<Valine></Valine>