# 代理模式Proxy

<Counter :path="'pattern'" :name="'代理模式Proxy'"></Counter>

## 一、概念

### 1、定义

为其他对象提供一种代理，以控制对这个对象的访问。代理对象在客户端和目标对象之间起到中介作用。

### 2、类型

结构型

### 3、使用场景

* 保护目标对象
* 增强目标对象

### 4、优点

* 代理模式能将代理对象与真实被调用的目标对象分离
* 一定程度上降低了系统的耦合度，扩展性好
* 保护目标对象
* 增强目标对象

### 5、缺点

* 会造成系统设计中类的数目增加
* 在客户端和目标对象增加一个代理对象，会造成请求主力速度变慢
* 增加系统的复杂度

### 6、扩展

#### (1) 静态代理

在代码中显示的指定代理。

#### (2) 动态代理

只能对实现接口的类生成代理，并不能针对具体的实现类生成代理。无法代理类，可以代理接口。这里用到的代理类是在程序调用代理类对象时，才由 `JVM` 真正创建。`JVM` 根据出来的业务实现类对象以及方法名动态的创建代理类的 `class` 文件，`class` 文件被字节码引擎执行，通过该代理类的对象进行方法调用。

#### (3) CGLib代理

`CGLib` 会生成代理类的一个子类覆盖其中的方法，所以需要注意类中的 `final` 修饰符。

#### (4) Spring代理选择-扩展

* 当 `Bean` 有实现接口时，`Spring` 就会用 `JDK` 的动态代理。
* 当 `Bean` 没有实现接口时，`Spring` 使用 `CGLib`。
* 可以强制使用 `CGLib`：在 `Spring` 配置中加入 `<aop:aspectj-autoproxy proxy-target-class="true"/>`
* 参考资料：<https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html>

#### (4) 代理速度对比

在 `JDK7` 和 `JDK8` 中，`CGLIb` 要比 `JDK` 动态代理速度快20%

### 7、相关设计模式

* 代理模式和装饰者模式

装饰者模式是为对象加上行为，而代理模式是控制访问。代理模式更加注重通过设计代理人的方式增强目标对象，增强目标对象的方式是增强目标对象的行为。

* 代理模式和适配器模式

适配器模式主要改变所考虑对象的接口，而代理模式是不能改变代理类的接口的。

## 二、应用

### 1、静态代理

首先是订单类：

```java
public class Order {

    private Object orderInfo;

    private Integer userId;

    public Object getOrderInfo() {
        return orderInfo;
    }

    public void setOrderInfo(Object orderInfo) {
        this.orderInfo = orderInfo;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
```

`dao` 层接口：

```java
public interface IOrderDao {

    int insert(Order order);
}
```

实现：

```java
public class OrderDaoImpl implements IOrderDao {

    @Override
    public int insert(Order order) {
        System.out.println("dao层添加Order成功");
        return 1;
    }
}
```

然后是 `service` 层接口：

```java
public interface IOrderService {

    int saveOrder(Order order);
}
```

实现：

```java
public class OrderServiceImpl implements IOrderService {

    private IOrderDao orderDao;

    @Override
    public int saveOrder(Order order) {
        // 如果是 Spring 会自己注入
        orderDao = new OrderDaoImpl();
        System.out.println("service调用dao层添加Order");
        return orderDao.insert(order);
    }
}
```

假设现在需要对订单的入库做分库操作，需要根据 `userId` 对2取模后进行分库录入。

创建静态代理类：

```java
public class OrderServiceStaticProxy {

    private IOrderService orderService;

    public int saveOrder(Order order) {
        beforeMethod(order);
        orderService = new OrderServiceImpl();
        int result = orderService.saveOrder(order);
        afterMethod();
        return result;
    }

    private void beforeMethod(Order order) {
        System.out.println("静态代理 beforeMethod");
        int userId = order.getUserId();
        int dbRouter = userId % 2;
        System.out.println("静态代理分配到【db" + dbRouter + "】处理数据");
        // 这里需要动态设置数据源 DataSource
        DataSourceContextHolder.setDBType("db" + dbRouter);
    }

    private void afterMethod() {
        System.out.println("静态代理 afterMethod");
    }
}
```

这个代理类包含有一个 `orderService` 作为真正执行业务逻辑的对象，在执行 `orderService` 的 `saveOrder()` 方法前后进行了增强。其中在 `beforeMethod()` 方法中做了分库切换数据源的操作。

数据源持有者：`

```java
public class DataSourceContextHolder {

    private static final ThreadLocal<String> CONTEXT_HOLDER = new ThreadLocal<>();

    /**
     * 设置数据库类型
     *
     * @param dbType
     */
    public static void setDBType(String dbType) {
        CONTEXT_HOLDER.set(dbType);
    }

    /**
     * 读取数据库类型
     *
     * @return
     */
    public static String getDBType() {
        return CONTEXT_HOLDER.get();
    }

    /**
     * 清除数据库类型
     */
    public static void clearDBType() {
        CONTEXT_HOLDER.remove();
    }
}
```

编写应用层：

```java
public class Test {

    public static void main(String[] args) {
        Order order = new Order();
        order.setUserId(2);
        OrderServiceStaticProxy orderServiceStaticProxy = new OrderServiceStaticProxy();
        orderServiceStaticProxy.saveOrder(order);
    }
}
```

执行结果：

```console
静态代理 beforeMethod
静态代理分配到【db0】处理数据
静态代理 afterMethod
service调用dao层添加Order
dao层添加Order成功
```

此时的类图：

![静态代理](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/proxy_1.png)

`OrderServiceImple` 实现了 `IOrderService` 接口；`OrderDaoImpl` 实现了 `IOrderDao` 接口。

`OrderServiceStaticProxy` 内部组合了 `IOrderService`；`OrderServiceImpl` 内部组合了 `IOrderDao`。

`OrderServiceImple` 创建了 `OrderServiceImpl`，在这里进行了增强；`OrderServiceImpl` 创建了 `OrderDaoImpl`。

### 2、动态代理

创建一个位于代理类和委托类中间的中介类，它实现了 `InvocationHandler` 接口：

```java
public class OrderServiceDynamicProxy implements InvocationHandler {

    private Object target;

    public OrderServiceDynamicProxy(Object target) {
        this.target = target;
    }

    public Object bind() {
        Class cls = target.getClass();
        return Proxy.newProxyInstance(cls.getClassLoader(), cls.getInterfaces(), this);
    }

    /**
     * 对方法进行增强
     *
     * @param proxy  代理类对象
     * @param method 标识具体调用的是代理类的哪个方法
     * @param args   代理类方法的参数
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object argObject = args[0];
        beforeMethod(argObject);
        Object object = method.invoke(target, args);
        afterMethod();
        return object;
    }

    private void beforeMethod(Object object) {
        System.out.println("动态代理 beforeMethod");
        int userId = 0;
        if (object instanceof Order) {
            Order order = (Order) object;
            userId = order.getUserId();
        }
        int dbRouter = userId % 2;
        System.out.println("动态代理分配到【db" + dbRouter + "】处理数据");
        // 这里需要动态设置数据源 DataSource
        DataSourceContextHolder.setDBType("db" + dbRouter);
    }

    private void afterMethod() {
        System.out.println("动态代理 afterMethod");
    }
}
```

其中 `InvocationHandler` 接口的 `invoke()` 方法就是对目标对象进行增强的方法。对代理类中的所有方法的调用都会变成对中介类 `invoke()` 方法的调用，这样可以在 `invoke()` 方法中添加统一的处理逻辑。

在 `bind()` 方法中利用 `Proxy` 类的 `newProxyInstance()` 来获取一个代理类实例。`newProxyInstance()` 方法的三个参数分别是：加载代理类对象的类加载器、代理类实现的接口列表以及实现了 `InvocationHandler` 接口的中介类实例对象。在代理类执行方法的时候，就会把方法调用分发到指定的调用处理器，也就是上面的中介类 `OrderServiceDynamicProxy`。

应用层：

```java
public class Test {

    public static void main(String[] args) {
        Order order = new Order();
        order.setUserId(2);
        IOrderService orderServiceDynamicProxy =
                (IOrderService) new OrderServiceDynamicProxy(new OrderServiceImpl()).bind();
        orderServiceDynamicProxy.saveOrder(order);
    }
}
```

执行结果：

```java
动态代理 beforeMethod
动态代理分配到【db0】处理数据
service调用dao层添加Order
dao层添加Order成功
动态代理 afterMethod
```

具体实现代理的过程如下：

首先通过 `newProxyInstance()` 方法获取代理类实例，而后便可以通过这个代理类实例调用代理类的方法，对代理类的方法的调用实际上都会调用中介类(调用处理器)的 `invoke()` 方法，在 `invoke()` 方法中调用委托类的相应方法，并且可以添加自己的处理逻辑。

实际上，中介类与委托类构成了静态代理关系，在这个关系中，中介类是代理类，委托类就是委托类;代理类与中介类也构成一个静态代理关系，在这个关系中，中介类是委托类，代理类是代理类。也就是说，动态代理关系由两组静态代理关系组成，这就是动态代理的原理。

`Java` 动态代理最大的特点就是动态生成的代理类和委托类实现同一个接口。`Java` 动态代理其实内部是通过反射机制实现的，也就是已知的一个对象，在运行的时候动态调用它的方法，并且调用的时候还可以加一些自己的逻辑在里面。

<Valine></Valine>