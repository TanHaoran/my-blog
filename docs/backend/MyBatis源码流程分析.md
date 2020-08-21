# MyBatis源码流程分析

<Counter :path="'backend'" :name="'MyBatis源码流程分析'"></Counter>

## 一、MyBatis流程概述

通过对之前测试代码的分析，可以把 `MyBatis` 的运行流程分为三大阶段：
1. 初始化阶段：读取 `XML` 配置文件和注解中的配置信息，创建配置对象，并完成各个模块的初始化的工作；
2. 代理封装阶段：封装 `iBatis` 的编程模型，使用 `mapper` 接口开发的初始化工作；
3. 数据访问阶段：通过 `SqlSession` 完成 `SQL` 的解析，参数的映射、`SQL` 的执行、结果的解析过程；

具体阶段如下：

```java
    private SqlSessionFactory sqlSessionFactory;

    @Before
    public void init() throws IOException {
        //--------------------第一阶段---------------------------
        // 1.读取 mybatis 配置文件创 SqlSessionFactory
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        // 1.读取 mybatis 配置文件创 SqlSessionFactory
        sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        inputStream.close();
    }

    @Test
    // 快速入门
    public void quickStart() throws IOException {
        //--------------------第二阶段---------------------------
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        //--------------------第三阶段---------------------------
        // 4.执行查询语句并返回单条数据
        TUser user = mapper.selectByPrimaryKey(1);
        System.out.println(user);

        System.out.println("----------------------------------");

        // 5.执行查询语句并返回多条数据
        List<TUser> users = mapper.selectAll();
        for (TUser tUser : users) {
            System.out.println(tUser);
        }
    }
```

## 二、第一阶段：配置加载阶段

### 1、建造者模式

#### (1) 什么是建造者模式

在配置加载阶段大量的使用了建造者模式，首先学习建造者模式。建造者模式（`BuilderPattern`）使用多个简单的对象一步一步构建成一个复杂的对象。这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。建造者模式类图如下：

![建造者模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mybatis_builder_pattern.png)

各要素如下：
* Product：要创建的复杂对象
* Builder：给出一个抽象接口，以规范产品对象的各个组成成分的建造。这个接口规定要实现复杂对象的哪些部分的创建，并不涉及具体的对象部件的创建；
* ConcreteBuilder：实现 `Builder` 接口，针对不同的商业逻辑，具体化复杂对象的各部分的创建。 在建造过程完成后，提供产品的实例；
* Director：调用具体建造者来创建复杂对象的各个部分，在指导者中不涉及具体产品的信息，只负责保证对象各部分完整创建或按某种顺序创建；

关于建造器模式的扩展知识：

流式编程风格越来越流行，如 `zookeeper` 的 `Curator`、`JDK8` 的流式编程等等都是例子。流式编程的优点在于代码编程性更高、可读性更好，缺点在于对程序员编码要求更高、不太利于调试。建造者模式是实现流式编程风格的一种方式；

#### (2) 与工厂模式区别

建造者模式应用场景如下：
* 需要生成的对象具有复杂的内部结构，实例化对象时要屏蔽掉对象内部的细节，让上层代码与复杂对象的实例化过程解耦，可以使用建造者模式；简而言之，如果“遇到多个构造器参数时要考虑用构建器”；
* 对象的实例化是依赖各个组件的产生以及装配顺序，关注的是一步一步地组装出目标对象，可以使用建造器模式；

建造者模式与工程模式的区别在于：

| 设计模式 | 形象比喻 | 对象复杂度 | 客户端参与程度 |
| --- | --- | --- | --- |
| 工厂模式 | 生产大众版 | 关注的是一个产品整体，无需关心产品的各部分是如何创建出来的 | 客户端对产品的创建过程参与度低，对象实例化时属性值相对比较固定 |
| 建造者模式 | 生产定制版 | 建造的对象更加复杂，是一个复合产品，它由哥哥不见复合而成，部件不同产品对象不同，生成的产品粒度细 | 客户端参与了产品的创建，决定了产品的类型和内容，参与度高；适合实例化对象时属性变化频繁的场景 |

### 2、配置加载的核心类

#### (1) 建造器三个核心类

在 `MyBatis` 中负责加载配置文件的核心类有三个，类图如下：

![MyBatis建造者模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mybatis_builder.png)

* BaseBuilder：所有解析器的父类，包含配置文件实例，为解析文件提供的一些通用的方法；
* XMLConfigBuilder： 主要负责解析 `mybatis-config.xml`；
* XMLMapperBuilder： 主要负责解析映射配置 `Mapper.xml` 文件；
* XMLStatementBuilder： 主要负责解析映射配置文件中的 `SQL` 节点；

`XMLConfigBuilder`、`XMLMapperBuilder`、`XMLStatementBuilder` 这三个类在配置文件加载过程中非常重要，具体分工如下图所示：

![MyBatis初始化](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mybatis_init.png)

这三个类使用了建造者模式对 `configuration` 对象进行初始化，但是没有使用建造者模式的“肉体”（流式编程风格），只用了灵魂（屏蔽复杂对象的创建过程），把建造者模式演绎成了工厂模式；后面还会对这三个类源码进行分析；

#### (2) 关于 Configuration 对象

实例化并初始化 `Configuration` 对象是第一个阶段的最终目的，所以熟悉 `configuration` 对象是理解第一个阶段代码的核心；`configuration` 对象的关键属性解析如下：
* MapperRegistry：`mapper` 接口动态代理工厂类的注册中心。在 `MyBatis` 中，通过 `mapperProxy` 实现 `InvocationHandler` 接口，`MapperProxyFactory` 用于生成动态代理的实
例对象；
* ResultMap：用于解析 `mapper.xml` 文件中的 `resultMap` 节点，使用 `ResultMapping` 来封装 `id`，`result` 等子元素；
* MappedStatement：用于存储 `mapper.xml` 文件中的 `select`、`insert`、`update` 和 `delete` 节点，同时还包含了这些节点的很多重要属性；
* SqlSource：用于创建 `BoundSql`，`mapper.xml` 文件中的 `sql` 语句会被解析成 `BoundSql` 对象，经过解析 `BoundSql` 包含的语句最终仅仅包含 `?` 占位符，可以直接提交给数据库执行；

需要特别注意的是 `Configuration` 对象在 `MyBatis` 中是单例的，生命周期是应用级的，换句话说只要 `MyBatis` 运行 `Configuration` 对象就会独一无二的存在；在 `MyBatis` 中仅在 `org.apache.ibatis.builder.xml.XMLConfigBuilder.XMLConfigBuilder(XPathParser, String, Properties)` 中有实例化 configuration 对象的代码，

```java
  private XMLConfigBuilder(XPathParser parser, String environment, Properties props) {
    super(new Configuration());
    ErrorContext.instance().resource("SQL Mapper Configuration");
    this.configuration.setVariables(props);
    this.parsed = false;
    this.environment = environment;
    this.parser = parser;
  }
```

`Configuration` 对象的初始化（属性复制），是在建造 `SqlSessionfactory` 的过程中进行的，接下来分析第一个阶段的内部流程；

### 3、配置加载过程

可以把第一个阶段配置加载过程分解为四个步骤，四个步骤如下图：

![加载过程](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mybatis_config_load.png)

第一步：

通过 `SqlSessionFactoryBuilder` 建造 `SqlSessionFactory`，并创建 `XMLConfigBuilder` 对象读取 `MyBatis` 核心配置文件，见方法：`org.apache.ibatis.session.SqlSessionFactoryBuilder.build(Reader, String, Properties)`：

```java
  public SqlSessionFactory build(Reader reader, String environment, Properties properties) {
    try {
      // 读取配置文件
      XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);
      // 解析配置文件得到 configuration 对象，并返回 SqlSessionFactory
      return build(parser.parse());
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error building SqlSession.", e);
    } finally {
      ErrorContext.instance().reset();
      try {
        reader.close();
      } catch (IOException e) {
        // Intentionally ignore. Prefer previous error.
      }
    }
  }
```

第二步：

进入 `XMLConfigBuilder` 的 `parseConfiguration` 方法，对 `MyBatis` 核心配置文件的各个元素进行解析，读取元素信息后填充到 `configuration` 对象。在 `XMLConfigBuilder` 的 `mapperElement()` 方法中通过 `XMLMapperBuilder` 读取所有 `mapper.xml` 文件；见方法 `org.apache.ibatis.builder.xml.XMLConfigBuilder.parseConfiguration(XNode)`；

```java
  public Configuration parse() {
    if (parsed) {
      throw new BuilderException("Each XMLConfigBuilder can only be used once.");
    }
    parsed = true;
    parseConfiguration(parser.evalNode("/configuration"));
    return configuration;
  }

  private void parseConfiguration(XNode root) {
    try {
      // issue #117 read properties first
      // 解析 <properties> 节点
      propertiesElement(root.evalNode("properties"));
      // 解析 <settings> 节点
      Properties settings = settingsAsProperties(root.evalNode("settings"));
      loadCustomVfs(settings);
      loadCustomLogImpl(settings);
      // 解析 <typeAliases> 节点
      typeAliasesElement(root.evalNode("typeAliases"));
      // 解析 <plugins> 节点
      pluginElement(root.evalNode("plugins"));
      // 解析 <objectFactory> 节点
      objectFactoryElement(root.evalNode("objectFactory"));
      // 解析 <objectWrapperFactory> 节点
      objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
      // 解析 <reflectorFactory> 节点
      reflectorFactoryElement(root.evalNode("reflectorFactory"));
      settingsElement(settings);
      // read it after objectFactory and objectWrapperFactory issue #631
      // 解析 <environments> 节点
      environmentsElement(root.evalNode("environments"));
      // 解析 <databaseIdProvider> 节点
      databaseIdProviderElement(root.evalNode("databaseIdProvider"));
      // 解析 <typeHandlers> 节点
      typeHandlerElement(root.evalNode("typeHandlers"));
      // 解析 <mappers> 节点
      mapperElement(root.evalNode("mappers"));
    } catch (Exception e) {
      throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
    }
  }
```

第三步：

`XMLMapperBuilder` 的核心方法为 `configurationElement(XNode)`，该方法对 `mapper.xml` 配置文件的各个元素进行解析，读取元素信息后填充到 `configuration` 对象：

```java
  private void configurationElement(XNode context) {
    try {
      // 获取 mapper 节点的 namespace 属性
      String namespace = context.getStringAttribute("namespace");
      if (namespace == null || namespace.isEmpty()) {
        throw new BuilderException("Mapper's namespace cannot be empty");
      }
      // 设置 builderAssistant 的 namespace 属性
      builderAssistant.setCurrentNamespace(namespace);
      // 解析 cache-ref 节点
      cacheRefElement(context.evalNode("cache-ref"));
      // 重点分析：解析 cache 节点----------------1-------------------
      cacheElement(context.evalNode("cache"));
      // 解析 parameterMap 节点（已废弃）
      parameterMapElement(context.evalNodes("/mapper/parameterMap"));
      // 重点分析：解析 resultMap 节点（基于数据结果去理解）----------------2-------------------
      resultMapElements(context.evalNodes("/mapper/resultMap"));
      // 解析 sql 节点
      sqlElement(context.evalNodes("/mapper/sql"));
      // 重点分析：解析 select、insert、update、delete 节点 ----------------3-------------------
      buildStatementFromContext(context.evalNodes("select|insert|update|delete"));
    } catch (Exception e) {
      throw new BuilderException("Error parsing Mapper XML. The XML location is '" + resource + "'. Cause: " + e, e);
    }
  }
```

在 `XMLMapperBuilder` 解析过程中，有四个点需要注意：

1. `resultMapElements(List<XNode>)` 方法用于解析 `resultMap` 节点，这个方法非常重要，一定要跟源码理解；解析完之后数据保存在 `configuration` 对象的 `resultMaps` 属性中，如下图：

![XMLMapperBuilder](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/xmlmapperbuilder.png)

2. `XMLMapperBuilder` 中在实例化二级缓存（见 `cacheElement(XNode)` ）、实例化 `resultMap` （见 `resultMapElements(List<XNode>)` ）过程中都使用了建造者模式，而且是建造者模式的典型应用；

3. `XMLMapperBuilder` 和 `XMLMapperStatmentBuilder` 有自己的“秘书” `MapperBuilderAssistant`。`XMLMapperBuilder` 和 `XMLMapperStatmentBuilder` 负责解析读取配置文件里面的信息，`MapperBuilderAssistant` 负责将信息填充到 `configuration`。将文件解析和数据的填充的工作分离在不同的类中，符合单一职责原则；

4. 在 `buildStatementFromContext(List<XNode>)` 方法中，创建 `XMLStatmentBuilder` 解析 `Mapper.xml` 中 `select`、`insert`、`update`、`delete` 节点

第四步：

在 `XMLStatmentBuilder` 的 `parseStatementNode()` 方法中，对 `Mapper.xml` 中 `select`、`insert`、`update`、`delete` 节点进行解析，并调用 `MapperBuilderAssistant` 负责将信息填充到`configuration`。在理解 `parseStatementNod()` 方法之前，有必要了解 `MappedStatement`，这个类用于封装 `select`、`insert`、`update`、`delete` 节点的信息；如下图所示：

![XMLStatmentBuilder](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/xmlstatmentbuilder.png)

## 三、第二阶段：代理封装阶段

第二个阶段是 `MyBatis` 最神秘的阶段，要理解它，就需要对 `Mybatis` 的接口层和 `binding` 模块数据源模块进行深入的学习

### 1、Mybatis 的接口层

第二个阶段使用到的第一个对象就是 `SqlSession`，`SqlSession` 是 `MyBaits` 对外提供的最关键的核心接口，通过它可以执行数据库读写命令、获取映射器、管理事务等；`SqlSession` 也意味着客户端与数据库的一次连接，客户端对数据库的访问请求都是由 `SqlSession` 来处理的，`SqlSession` 由 `SqlSessionFactory` 创建，每个 `SqlSession` 都会引用 `SqlSessionFactory` 中全局唯一单例存在的 `configuration` 对象；如下图所示

![Mybatis的接口层](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/sqlsession.png)

要深入理解 `SqlSession` 就得深入到源码进行学习，`SqlSession` 默认实现类为 `org.apache.ibatis.session.defaults.DefaultSqlSession`，解读如下：
1. `SqlSession` 是 `MyBatis` 的门面，是 `MyBatis` 对外提供数据访问的主要 `API`，实例代码 `com.enjoylearning.mybatis.MybatisDemo.originalOperation()`
2. 实际上 `Sqlsession` 的功能都是基于 `Executor` 来实现的，遵循了单一职责原则，例如在 `SqlSession` 中的各种查询形式，最终会把请求转发到 `Executor.query()` 方法，如下图所示：

<Valine></Valine> 