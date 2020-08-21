# 合成复用原则CompositionAggregation

<Counter :path="'principle'" :name="'合成复用原则CompositionAggregation'"></Counter>

## 一、概念

### 1、定义

尽量使用对象组合/聚合，而不是继承关系达到软件复用的目的

### 2、注意 

聚合 `has-a`，组合 `contains-a`，继承 `is-a`

### 3、优点

可以是系统跟家灵活，降低类与类之间的耦合度，一个类的变化对其他类造成的影响相对较少。

## 二、应用

假设有一个数据库连接类：

```java
public abstract class DBConnection {

    public String getConnection() {
        return "MySQL数据库连接";
    }
}
```

`Dao` 层有一个类继承 `DBConnection`：

```java
public class ProductDao extends DBConnection{

    public void addProduct() {
        String connection = getConnection();
        System.out.println("使用" + connection + "增加产品");
    }
}
```

测试类：

```java
public class Test {

    public static void main(String[] args) {
        ProductDao productDao = new ProductDao();
        productDao.addProduct();
    }
}
```

执行结果：

```console
使用MySQL数据库连接增加产品
```

此时的类图：

![合成复用原则1](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/compositionaggregation_1.png)

目前 `DBConnection` 类的 `getConnection()` 方法只返回了 `MySQL` 的数据库连接，如果这时候需要接入新的数据库该怎么办呢？直接在 `DBConnection` 新增一个获取新数据的连接吗？这样就违反了开闭原则。

所以需要使用合成复用原则对 `DBConnection` 进行修改：

```java
public abstract class DBConnection {

    public abstract String getConnection();
}
```

将 DBConnection 类定义成抽象类。

具体数据库连接类需要继承这个类：

```java
public class MySQLConnection extends DBConnection {

    @Override
    public String getConnection() {
        return "MySQL数据库连接";
    }
}
```

```java
public class PostgreSQLConnection extends DBConnection {

    @Override
    public String getConnection() {
        return "PostgreSQL数据库连接";
    }
}
```

原来的 `ProductDao` 修改为：

```java
public class ProductDao {

    private DBConnection dbConnection;

    public void setDbConnection(DBConnection dbConnection) {
        this.dbConnection = dbConnection;
    }

    public void addProduct() {
        String connection = dbConnection.getConnection();
        System.out.println("使用" + connection + "增加产品");
    }
}
```

提供了一个 `setDbConnection()` 来设置当前的数据库连接是什么，然后通过 `addProduct()` 添加商品。

应用层：

```java
public class Test {

    public static void main(String[] args) {
        ProductDao productDao = new ProductDao();
        productDao.setDbConnection(new PostgreSQLConnection());
        productDao.addProduct();
    }
}
```

自由决定使用什么数据库连接，执行结果：

```console
使用PostgreSQL数据库连接增加产品
```

此时的类图：

![合成复用原则2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/compositionaggregation_2.png)

相比于之前的类图，现在应用层可以自己创建各种各样的数据库连接，然后将数据库连接和 `ProductDao` 组合在一起达到目的。

<Valine></Valine>