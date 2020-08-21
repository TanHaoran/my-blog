# MyBatis应用

<Counter :path="'backend'" :name="'MyBatis应用'"></Counter>

## 一、MyBatis快速入门

### 1、为什么需要ORM框架

传统的 `JDBC` 编程存在的弊端：

* 工作量大，操作数据库至少要 5 步；
* 业务代码和技术代码耦合；
* 连接资源手动关闭，带来了隐患；

`MyBatis` 前身是 `iBatis`，其源于“`Internet`”和“`ibatis`”的组合，本质是一种半自动的 `ORM` 框架，除了 `POJO` 和映射关系之外，还需要编写 `SQL` 语句；`Mybatis` 映射文件三要素：`SQL`、映射规则和 `POJO`；

### 2、MyBatis快速入门

#### (1) 导入依赖

创建 `maven` 工程，在 `pom` 文件中添加对应依赖：

```xml
	<dependencies>
		<!-- 单元测试相关依赖 -->
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>4.12</version>
			<scope>test</scope>
		</dependency>

		<!-- 日志相关依赖 -->
		<dependency>
			<groupId>ch.qos.logback</groupId>
			<artifactId>logback-classic</artifactId>
			<version>1.1.2</version>
		</dependency>
		<dependency>
			<groupId>ch.qos.logback</groupId>
			<artifactId>logback-core</artifactId>
			<version>1.1.2</version>
		</dependency>

		<!-- mysql驱动 -->
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<version>5.1.18</version>
		</dependency>

		<!-- mybatis相关依赖 -->
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis</artifactId>
			<version>3.5.0</version>
		</dependency>

	</dependencies>
```

#### (2) 添加配置文件

`MyBatis` 的配置文件：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>

	<properties resource="db.properties"/>

	<settings>
		<!-- 设置自动驼峰转换 -->
		<setting name="mapUnderscoreToCamelCase" value="true"/>

		<!-- 开启懒加载 -->
		<!-- 当启用时，有延迟加载属性的对象在被调用时将会完全加载任意属性。否则，每种属性将会按需要加载。默认：true -->
		<setting name="aggressiveLazyLoading" value="false"/>
	</settings>

	<!-- 别名定义 -->
	<typeAliases>
		<package name="com.jerry.mybatis.demo.entity"/>
	</typeAliases>

	<!--配置environment环境 -->
	<environments default="development">
		<!-- 环境配置1，每个SqlSessionFactory对应一个环境 -->
		<environment id="development">
			<transactionManager type="JDBC"/>
			<dataSource type="UNPOOLED">
				<property name="driver" value="${jdbc_driver}"/>
				<property name="url" value="${jdbc_url}"/>
				<property name="username" value="${jdbc_username}"/>
				<property name="password" value="${jdbc_password}"/>
			</dataSource>
		</environment>

	</environments>

	<!-- 映射文件，mapper的配置文件 -->
	<mappers>
		<!--直接映射到相应的mapper文件 -->
		<mapper resource="sqlmapper/TUserMapper.xml"/>
		<mapper resource="sqlmapper/TUserTestMapper.xml"/>
		<mapper resource="sqlmapper/TPositionMapper.xml"/>
	</mappers>

</configuration>
```

`<typeAliases>` 底下的包名定义可以在 `mapper` 的 `xml` 文件中方便的直接使用类名。

其中使用到的 `db.properties` 文件：

```properties
jdbc_driver=com.mysql.jdbc.Driver
jdbc_url=jdbc:mysql://47.105.147.31:3306/mybatis?useUnicode=true&characterEncoding=utf8&allowMultiQueries=true
jdbc_username=root
jdbc_password=35335565
```

然后是日志的配置文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
scan：当此属性设置为true时，配置文件如果发生改变，将会被重新加载，默认值为true。
scanPeriod：设置监测配置文件是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒当scan为true时，此属性生效。默认的时间间隔为1分钟。
debug：当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。
-->
<configuration scan="false" scanPeriod="60 seconds" debug="false">
	<!-- 定义日志的根目录 -->
	<!--     <property name="LOG_HOME" value="/app/log" /> -->
	<!-- 定义日志文件名称 -->
	<property name="appName" value="netty"></property>
	<!-- ch.qos.logback.core.ConsoleAppender 表示控制台输出 -->
	<appender name="stdout" class="ch.qos.logback.core.ConsoleAppender">
		<Encoding>UTF-8</Encoding>
		<!--
		日志输出格式：%d表示日期时间，%thread表示线程名，%-5level：级别从左显示5个字符宽度
		%logger{50} 表示logger名字最长50个字符，否则按照句点分割。 %msg：日志消息，%n是换行符
		-->
		<encoder>
			<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
		</encoder>
	</appender>

	<!-- 滚动记录文件，先将日志记录到指定文件，当符合某个条件时，将日志记录到其他文件 -->
	<appender name="appLogAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
		<Encoding>UTF-8</Encoding>
		<!-- 指定日志文件的名称 -->
		<file>${appName}.log</file>
		<!--
		当发生滚动时，决定 RollingFileAppender 的行为，涉及文件移动和重命名
		TimeBasedRollingPolicy： 最常用的滚动策略，它根据时间来制定滚动策略，既负责滚动也负责出发滚动。
		-->
		<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
			<!--
			滚动时产生的文件的存放位置及文件名称 %d{yyyy-MM-dd}：按天进行日志滚动
			%i：当文件大小超过maxFileSize时，按照i进行文件滚动
			-->
			<fileNamePattern>${appName}-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
			<!--
			可选节点，控制保留的归档文件的最大数量，超出数量就删除旧文件。假设设置每天滚动，
			且maxHistory是365，则只保存最近365天的文件，删除之前的旧文件。注意，删除旧文件是，
			那些为了归档而创建的目录也会被删除。
			-->
			<MaxHistory>365</MaxHistory>
			<!--
			当日志文件超过maxFileSize指定的大小是，根据上面提到的%i进行日志文件滚动 注意此处配置SizeBasedTriggeringPolicy是无法实现按文件大小进行滚动的，必须配置timeBasedFileNamingAndTriggeringPolicy
			-->
			<timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
				<maxFileSize>100MB</maxFileSize>
			</timeBasedFileNamingAndTriggeringPolicy>
		</rollingPolicy>
		<!--
		日志输出格式：%d表示日期时间，%thread表示线程名，%-5level：级别从左显示5个字符宽度 %logger{50} 表示logger名字最长50个字符，否则按照句点分割。 %msg：日志消息，%n是换行符
		-->
		<encoder>
			<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [ %thread ] - [ %-5level ] [ %logger{50} : %line ] - %msg%n</pattern>
		</encoder>
	</appender>

	<!--
	logger主要用于存放日志对象，也可以定义日志类型、级别
	name：表示匹配的logger类型前缀，也就是包的前半部分
	level：要记录的日志级别，包括 TRACE < DEBUG < INFO < WARN < ERROR
	additivity：作用在于children-logger是否使用 rootLogger配置的appender进行输出，false：表示只用当前logger的appender-ref，true：表示当前logger的appender-ref和rootLogger的appender-ref都有效
	-->

	<!--     <logger name="edu.hyh" level="info" additivity="true">
			<appender-ref ref="appLogAppender" />
		</logger> -->

	<!--
	root与logger是父子关系，没有特别定义则默认为root，任何一个类只会和一个logger对应，
	要么是定义的logger，要么是root，判断的关键在于找到这个logger，然后判断这个logger的appender和level。
	-->
	<root level="debug">
		<appender-ref ref="stdout"/>
		<appender-ref ref="appLogAppender"/>
	</root>
</configuration> 
```

#### (3) 编写实体类和mapper文件

建表语句会在项目工程中给出。

实体类：

```java
public class TUser implements Serializable {

    private Integer id;

    private String userName;

    private String realName;

    private Byte sex;

    private String mobile;

    private String email;

    private String note;

    private TPosition position;

    private List<TJobHistory> jobs;

    private List<HealthReport> healthReports;


    private List<TRole> roles;

    @Override
    public String toString() {
        String positionId = (position == null ? "" : String.valueOf(position.getId()));
        return "TUser [id=" + id + ", userName=" + userName + ", realName="
                + realName + ", sex=" + sex + ", mobile=" + mobile + ", email="
                + email + ", note=" + note + ", positionId=" + positionId + "]";
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public Byte getSex() {
        return sex;
    }

    public void setSex(Byte sex) {
        this.sex = sex;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public TPosition getPosition() {
        return position;
    }

    public void setPosition(TPosition position) {
        this.position = position;
    }

    public List<TJobHistory> getJobs() {
        return jobs;
    }

    public void setJobs(List<TJobHistory> jobs) {
        this.jobs = jobs;
    }

    public List<HealthReport> getHealthReports() {
        return healthReports;
    }

    public void setHealthReports(List<HealthReport> healthReports) {
        this.healthReports = healthReports;
    }

    public List<TRole> getRoles() {
        return roles;
    }

    public void setRoles(List<TRole> roles) {
        this.roles = roles;
    }

}
```

`Mapper` 类：

```java
public interface TUserMapper {

    TUser selectByPrimaryKey(Integer id);

    List<TUser> selectAll();

}
```

`xml` 文件：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.jerry.mybatis.demo.mapper.TUserMapper">

	<resultMap id="BaseResultMap" type="TUser" autoMapping="true">
		<id column="id" property="id"/>
		<result column="userName" property="userName"/>
		<result column="realName" property="realName"/>
		<result column="sex" property="sex"/>
		<result column="mobile" property="mobile"/>
		<result column="email" property="email"/>
		<result column="note" property="note"/>
	</resultMap>

	<resultMap id="UserResultMap" type="TUser" autoMapping="true">
		<id column="id" property="id"/>
		<result column="userName" property="userName"/>
		<result column="realName" property="realName"/>
		<result column="sex" property="sex"/>
		<result column="mobile" property="mobile"/>
		<result column="email" property="email"/>
		<result column="note" property="note"/>
		<association property="position" javaType="TPosition" columnPrefix="post_">
			<id column="id" property="id"/>
			<result column="name" property="postName"/>
			<result column="note" property="note"/>
		</association>
	</resultMap>

	<select id="selectByPrimaryKey" resultMap="BaseResultMap">
		select
		id, userName, realName, sex, mobile, email, note
		from t_user
		where id = #{id,jdbcType=INTEGER}
	</select>

	<select id="selectAll" resultMap="BaseResultMap">
		select
		id, userName, realName, sex, mobile, email, note
		from t_user
	</select>

	<select id="selectTestResultMap" resultMap="UserResultMap">
		select
		    a.id,
		    userName,
			realName,
			sex,
			mobile,
			email,
			a.note,
			b.id  post_id,
			b.post_name,
			b.note post_note
		from t_user a,
			t_position b
		where a.position_id = b.id
	</select>

</mapper>
```

#### (4) 实例代码

快速入门查询：

```java
public class MybatisDemo {

    private SqlSessionFactory sqlSessionFactory;

    @Before
    public void init() throws IOException {
        //--------------------第一阶段---------------------------
        // 1.读取mybatis配置文件创SqlSessionFactory
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        // 1.读取mybatis配置文件创SqlSessionFactory
        sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        inputStream.close();
    }

    @Test
    // 快速入门
    public void quickStart() throws IOException {
        //--------------------第二阶段---------------------------
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
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
}
```

#### (5) 分析

* SqlSessionFactoryBuilder

读取配置信息创建 `SqlSessionFactory`，`SqlSessionFactory` 使用了建造者模式，并且是方法级别生命周期；

* SqlSessionFactory

创建 `Sqlsession`，工厂单例模式，存在于程序的整个生命周期；

* SqlSession

代表一次数据库连接，一般通过调用 `Mapper` 访问数据库，也可以直接发送 `SQL` 执行；线程不安全，要保证线程独享（方法级）；

* SQL Mapper

由一个 `Java` 接口和 `XML` 文件组成，包含了要执行的 `SQL` 语句和结果集映射规则。方法级别生命周期；

## 二、resultType 还是 resultMap

### 1、resultType

当使用 `resultType` 做 `SQL` 语句返回结果类型处理时，对于 `SQL` 语句查询出的字段在相应的 `pojo` 中必须有和它相同的字段对应，而 `resultType` 中的内容就是 `pojo` 在本项目中的位置。

自动映射注意事项 :

1. 前提：`SQL` 列名和 `JavaBean` 的属性是一致的；
2. 使用 `resultType`，如用简写需要配置 `typeAliases`（别名）；
3. 如果列名和 `JavaBean` 不一致，但列名符合单词下划线分割，`Java` 是驼峰命名法，则 `mapUnderscoreToCamelCase` 可设置为 `true`；

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.jerry.mybatis.demo.mapper.TUserTestMapper">

	<select id="selectByPrimaryKey" resultType="TUser">
		select
		id, user_name, real_name, sex, mobile, email, note
		from t_user_test
		where id = #{id,jdbcType=INTEGER}
	</select>

	<select id="selectAll" resultType="TUser">
		select
		id, user_name, real_name, sex, mobile, email, note
		from t_user_test
	</select>

</mapper>
```

如果使用 `resultType` 类型接收，并且定义了 `mapUnderscoreToCamelCase` 为 `true`，那么自动可以将数据库的下划线字段映射到实体类 `TUser` 中：

```java
    @Test
    //知识点：resultType
    public void testAutoMapping() throws IOException {
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserTestMapper mapper = sqlSession.getMapper(TUserTestMapper.class);
        // 4.执行查询语句并返回多条数据
        List<TUser> users = mapper.selectAll();
        for (TUser tUser : users) {
            System.out.println(tUser);
        }
    }
```

### 2、resultMap

`resultMap` 元素是 `MyBatis` 中最重要最强大的元素。它可以让你从 90% 的 `JDBC` `resultSets` 数据提取代码中解放出来,在对复杂语句进行联合映射的时候，它很可能可以代替数千行的同等功能的代码。 

`resultMap` 的设计思想是，简单的语句不需要明确的结果映射，而复杂一点的语句只需要描述它们的关系就行了。


| 属性 | 描述 |
| --- | --- |
| id | 当前命名空间中的一个唯一标识，用于标识一个 `resultMap` |
| type | 类的完全限定名, 或者一个类型别名 |
| autoMapping | 如果设置这个属性，`MyBatis` 将会为这个 `resultMap` 开启或者关闭自动映射。这个属性会覆盖全局的属性 `autoMappingBehavior`。默认值为：`unset`。 |

```xml
	<resultMap id="BaseResultMap" type="TUser">
		<id column="id" property="id"/>
		<result column="userName" property="userName"/>
		<result column="realName" property="realName"/>
		<result column="sex" property="sex"/>
		<result column="mobile" property="mobile"/>
		<result column="email" property="email"/>
		<result column="note" property="note"/>
	</resultMap>
```

```xml
	<resultMap id="BaseResultMap" type="TUser" autoMapping="true">
	</resultMap>
```

也就是说这两种写法的效果是一样的。

使用场景总结：
1. 字段有自定义的转化规则
2. 复杂的多表查询

下面演示一对一的复杂查询，`t_user` 表中有字段 `position_id`，存的值职位信息，`t_position` 表中的字段是：`id`、`position_name`、`note`，那么使用联合查询的时候就可以使用 `ResultMap` 来接收。

```xml
	<resultMap id="UserResultMap" type="TUser" autoMapping="true">
		<id column="id" property="id"/>
		<result column="userName" property="userName"/>
		<result column="realName" property="realName"/>
		<result column="sex" property="sex"/>
		<result column="mobile" property="mobile"/>
		<result column="email" property="email"/>
		<result column="note" property="note"/>
		<association property="position" javaType="TPosition" columnPrefix="post_">
			<id column="id" property="id"/>
			<result column="name" property="postName"/>
			<result column="note" property="note"/>
		</association>
	</resultMap>

	<select id="selectTestResultMap" resultMap="UserResultMap">
		select
		    a.id,
		    userName,
			realName,
			sex,
			mobile,
			email,
			a.note,
			b.id  post_id,
			b.post_name,
			b.note post_note
		from t_user a,
			t_position b
		where a.position_id = b.id
	</select>
```

其中 `TPosition` 类：

```java
public class TPosition {

    private Integer id;

    private String postName;

    private String note;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPostName() {
        return postName;
    }

    public void setPostName(String postName) {
        this.postName = postName;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
```

这样通过使用 `<association>` 就直接将查询出来的结果映射到 `TUser` 类的 `position` 属性中了。

`Mapper` 中添加新的方法：

```java
    List<TUser> selectTestResultMap();
```

测试查询：

```java
    @Test
    //知识点：resultMap
    public void testResultMap() throws IOException {
        //--------------------第二阶段---------------------------
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        //--------------------第三阶段---------------------------
        // 4.执行查询语句并返回单条数据
        List<TUser> users = mapper.selectTestResultMap();
        for (TUser tUser : users) {
            System.out.println(tUser.getUserName());
            System.out.println(tUser.getPosition().getPostName());
        }
    }
```

### 3、到底应该用 resultType 还是 resultMap?

强制使用 `resultMap`, 不要用 `resultType` 当返回参数，即使所有类属性名与数据库字段一一对应，也需要定义。

## 三、怎么传递多个参数

传递参数有三种方式：

| 方式 | 描述 |
| --- | --- |
| 使用 `map` 传递参数 | 可读性差，导致可维护性和可扩展性差，杜绝使用 |
| 使用注解传递参数 | 直观明了，当参数较少一般小于 5 个的时候，建议使用 |
| 使用 `Java Bean` 的方式传递参数 | 当参数大于 5 个的时候，建议使用 |

建议不要用 `Map` 作为 `mapper` 的输入和输出，不利于代码的可读性和可维护性。

### 1、使用 map 传递参数

`Mapper` 中定义方法：

```java
    List<TUser> selectByEmailAndSex1(Map<String, Object> param);
```

`xml` 文件实现：

```xml
	<sql id="Base_Column_List">
		id, userName, realName, sex, mobile, email, note, position_id
	</sql>

	<select id="selectByEmailAndSex1" resultMap="BaseResultMap" parameterType="map">
		select
		<include refid="Base_Column_List"/>
		from t_user a
		where a.email like CONCAT('%', #{email}, '%') and
		a.sex =#{sex}
	</select>
```

测试：

```java
    // 多参数查询
    @Test
    public void testManyParamQuery() {
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        String email = "qq.com";
        Byte sex = 1;

        // 第一种方式使用map
        Map<String, Object> params = new HashMap<>();
        params.put("email", email);
        params.put("sex", sex);
        List<TUser> list1 = mapper.selectByEmailAndSex1(params);
        System.out.println(list1.size());
    }
```

#### 2、使用注解传递参数

定义方法：

```java
    List<TUser> selectByEmailAndSex2(@Param("email")String email, @Param("sex")Byte sex);
```

`xml`：

```xml
	<select id="selectByEmailAndSex2" resultMap="BaseResultMap">
		select
		<include refid="Base_Column_List"/>
		from t_user a
		where a.email like CONCAT('%', #{email}, '%') and
		a.sex = #{sex}
	</select>
```

测试：

```java
        // 第二种方式直接使用参数
        List<TUser> list2 = mapper.selectByEmailAndSex2(email, sex);
        System.out.println(list2.size());
```

#### 3、 使用 Java Bean 的方式传递参数

定义方法：

```java
    List<TUser> selectByEmailAndSex2(@Param("email")String email, @Param("sex")Byte sex);
```

`xml`：

```xml
	<select id="selectByEmailAndSex3" resultMap="BaseResultMap"
			parameterType="com.jerry.mybatis.demo.entity.EmailSexBean">
		select
		<include refid="Base_Column_List" />
		from t_user a
		where a.email like CONCAT('%', #{email}, '%') and
		a.sex =	#{sex}
	</select>
```

测试：

```java
        // 第三种方式用对象
        EmailSexBean esb = new EmailSexBean();
        esb.setEmail(email);
        esb.setSex(sex);
        List<TUser> list3 = mapper.selectByEmailAndSex3(esb);
        System.out.println(list3.size());
```

## 四、怎么样获取主键

### 1、通过 insert/update 标签相关属性

| 属性 | 描述 | 
| --- | --- |
| useGeneratedKeys | （仅对 `insert` 和 `update` 有用）这会令 `MyBatis` 使用 `JDBC` 的 `getGeneratedKeys` 方法来取出由数据库内部生成的主键（比如：像 `MySQL` 和 `SQL Server` 这样的关系数据库管理系统的自动递增字段），默认值：`false`。 |
| keyProperty | （ 仅 对 `insert` 和 `update` 有 用 ） 唯一标记一个属性 ， `MyBatis` 会通过 `getGeneratedKeys` 的返回值或者通过 `insert` 语句的 `selectKey` 子元素设置它的键值，默认：`unset`。如果希望得到多个生成的列，也可以是逗号分隔的属性名称列表。 |

注意：自增长序号不是简单的行数+1，而是序号最大值+1；

定义方法：

```java
    int insert1(TUser record);
```

实现：

```xml
	<insert id="insert1" parameterType="TUser" useGeneratedKeys="true" keyProperty="id">
		insert into t_user (id, userName, realName,
		sex, mobile,
		email,
		note, position_id)
		values (#{id,jdbcType=INTEGER},
		#{userName,jdbcType=VARCHAR},
		#{realName,jdbcType=VARCHAR},
		#{sex,jdbcType=TINYINT}, #{mobile,jdbcType=VARCHAR},
		#{email,jdbcType=VARCHAR},
		#{note,jdbcType=VARCHAR},
		#{position.id,jdbcType=INTEGER})
	</insert>
```

测试：

```java
    @Test
    // 测试插入数据自动生成id
    public void testInsertGenerateId1() {
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);
        // 4.执行查询语句并返回结果
        TUser user1 = new TUser();
        user1.setUserName("test1");
        user1.setRealName("realname1");
        user1.setEmail("myemail1");
        mapper.insert1(user1);
        sqlSession.commit();
        System.out.println(user1.getId());
    }
```

### 2、通过 selectKey 元素

| 属性 | 描述 |
| --- | --- |
| keyProperty | `selectKey` 语句结果应该被设置的目标属性。如果希望得到多个生成的列，也可以是逗号分隔的属性名称列表。|
| resultType | 结果的类型。`MyBatis` 通常可以推算出来，但是为了更加确定写上也不会有什么问题。`MyBatis` 允许任何简单类型用作主键的类型，包括字符串。如果希望作用于多个生成的列，则可以使用一个包含期望属性的 `Object` 或一个 `Map`。|
| order | 这可以被设置为 `BEFORE` 或 `AFTER`。如果设置为 `BEFORE`，那么它会首先选择主键，设置 `keyProperty` 然后执行插入语句。如果设置为 `AFTER`，那么先执行插入语句，然后获
取主键字段；`mysql` 数据库自增长的方式 `order` 设置为 `After`，`oracle` 数据库通过 `sequnce` 获取主键 `order` 设置为 `Before` |

在 `Oracle` 中，在插入数据之前会首先获取将要插入的主键值。通过 `sequnce` 获取主键示例：

```xml
    <selectKey keyProperty=“id” order= "Before" resultType="int">
        select SEQ_ID.nextval from dual
    </selectKey>
```

在 `Mysql` 中在插入完一条数据后，才能获取到主键的值。通过自增长序号获取主键示例：

```xml
    <selectKey keyProperty="id" order="AFTER" resultType="int">
        select LAST_INSERT_ID()
    </selectKey>
```

定义方法：

```java
    int insert2(TUser record);
```

实现：

```xml
	<insert id="insert2" parameterType="TUser">
		<selectKey keyProperty="id" order="AFTER" resultType="int">
			select
			LAST_INSERT_ID()
		</selectKey>
		insert into t_user (id, userName, realName,
		sex, mobile,
		email,
		note,
		position_id)
		values (#{id,jdbcType=INTEGER},
		#{userName,jdbcType=VARCHAR},
		#{realName,jdbcType=VARCHAR},
		#{sex,jdbcType=TINYINT}, #{mobile,jdbcType=VARCHAR},
		#{email,jdbcType=VARCHAR},
		#{note,jdbcType=VARCHAR},
		#{position.id,jdbcType=INTEGER})
	</insert>
```

测试：

```java
    @Test
    // 测试插入数据自动生成id
    public void testInsertGenerateId2() throws IOException {
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);
        // 4.执行查询语句并返回结果
        TUser user2 = new TUser();
        user2.setUserName("test2");
        user2.setRealName("realname2");
        user2.setEmail("myemai2l");
        mapper.insert2(user2);
        sqlSession.commit();
        System.out.println(user2.getId());
    }
```

## 五、SQL 元素和 SQL 的参数

### 1、SQL 元素

用来定义可重用的 `SQL` 代码段，可以包含在其他语句中；例如上面在第一种传参方式中使用到的：

```xml
	<sql id="Base_Column_List">
		id, userName, realName, sex, mobile, email, note, position_id
	</sql>
```

### 2、SQL 参数

向 `sql` 语句中传递的可变参数，分为预编译 `#{}` 和传值 `${}` 两种

* 预编译 #{}

将传入的数据都当成一个字符串，会对自动传入的数据加一个单引号，能够很大程度防止 `sql` 注入；

* 传值 ${}

传入的数据直接显示生成在 `sql` 中，无法防止 `sql` 注入；适用场景：动态报表，表名、选取的列是动态的，`order by` 和 `in` 操作， 可以考虑使用 `${}`

定义方法：

```java
    List<TUser> selectBySymbol(@Param("tableName") String tableName,
                               @Param("inCol") String inCol,
                               @Param("orderStr") String orderStr,
                               @Param("userName") String userName);
```

实现：

```xml
	<select id="selectBySymbol" resultMap="BaseResultMap">
		select
		${inCol}
		from ${tableName} a
		where a.userName = #{userName}
		order by ${orderStr}
	</select>
```

测试查询：

```java
    @Test
    // 参数 # 和参数 $ 区别测试(动态 sql 入门)
    public void testSymbol() {
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        String inCol = "id, userName, realName, sex, mobile, email, note";
        String tableName = "t_user";
        String userName = "lison";
        String orderStr = "sex,userName";

        List<TUser> list = mapper.selectBySymbol(tableName, inCol, orderStr, userName);
        System.out.println(list.size());
    }
```

查询的时候对 `inCol`、`tableName` 和 `orderStr` 使用了 `$` 参数，而对 `userName` 使用的 `#` 参数。此时可以正常查询。

如果修改 `sql` 语句为：

```xml
	<select id="selectBySymbol" resultMap="BaseResultMap">
		select
		${inCol}
		from #{tableName} a
		where a.userName = #{userName}
		order by ${orderStr}
	</select>
```

再查询就会报错说找不到 `t_user` 这张表，这是因为使用 `#` 查询会给参数自动加上单引号，所以查询语句就变成了：`from 't_user'`，多了单引号就查不到表了。

建议：`sql.xml` 配置参数使用：`#{}`，`#param#` 不要使用 `${}` 此种方式容易出现 `SQL` 注入。

如果修改查询的参数为这样：

```java
        String userName = "xxx or 1=1";
```

将 `userName` 传值改为 `"xxx or 1=1"`，并且将 `sql` 改为：

```xml
	<select id="selectBySymbol" resultMap="BaseResultMap">
		select
		${inCol}
		from ${tableName} a
		where a.userName = ${userName}
		order by ${orderStr}
	</select>
```

使用 `$` 来接受参数，此时的查询语句就变成了：`select id, userName, realName, sex, mobile, email, note from t_user a where a.userName = 'xxx' or 1=1 order by sex,userName` ，从而绕过了条件匹配，查询到了所有的数据，实现了 `sql` 注入。

## 六、动态SQL

### 1、动态SQL元素

| 元素 | 作用 | 备注 |
| --- | --- | --- |
| if | 判断语句 | 单条件分支判断 |
| choose、when、otherwise | 相当于 java 的 case when | 多条件分支判断 |
| trim、where、set  | 辅助元素 | 用于处理 sql 拼装问题 |
| foreach | 循环语句 | 在 in 语句等列举条件常用，常用于实现批量操作 |

### 2、演示代码

#### (1) 查询

添加接口：

```java
    List<TUser> selectIf(@Param("email")String email,@Param("sex")Byte sex);

    List<TUser> selectIfAndWhere(@Param("email") String email, @Param("sex") Byte sex);

    List<TUser> selectChoose(@Param("email")String email,@Param("sex")Byte sex);
```

实现：

```xml
	<select id="selectIf" resultMap="BaseResultMap">
		select
		<include refid="Base_Column_List"/>
		from t_user a
		where 1=1
		<if test="email != null and email != ''">
			and a.email like CONCAT('%', #{email}, '%')
		</if>
		<if test="sex != null ">
			and a.sex = #{sex}
		</if>
	</select>

	<select id="selectIfAndWhere" resultMap="BaseResultMap">
		select
		<include refid="Base_Column_List"/>
		from t_user a
		<where>
			<if test="email != null and email != ''">
				and a.email like CONCAT('%', #{email}, '%')
			</if>
			<if test="sex != null ">
				and a.sex = #{sex}
			</if>
		</where>
	</select>


	<select id="selectChoose" resultMap="BaseResultMap">
		select
		<include refid="Base_Column_List"/>
		from t_user a
		<where>
			<choose>
				<when test="email != null and email != ''">
					and a.email like CONCAT('%', #{email}, '%')
				</when>
				<when test="sex != null">
					and a.sex = #{sex}
				</when>
				<otherwise>
					and 1=1
				</otherwise>
			</choose>
		</where>
	</select>
```

第一个 `sql` 使用了 `where 1=1` 来解决条件查询的问题，这样子做很不优雅。

在第二个 `sql` 中使用了 `if` 元素、`where` 元素，这样可以在查询条件之前加 `where` 关键字，同时去掉语句的第一个 `and` 或 `or`。

第三个 `sql` 中使用了 `<choose>` 标签，在 `<choose>` 标签内的 `<when>` 之间是 `or` 的关系，即满足一个后，后面的都不用判断了，如果都不满足则执行最后 `<otherwise>` 中的条件。

测试：

```java
    @Test
    // if用于select，并与where配合
    public void testSelectIf() {
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        String email = "qq.com";
        Byte sex = 1;
        List<TUser> list = mapper.selectIf(null, null);
        List<TUser> list2 = mapper.selectIfAndWhere(email, null);
        List<TUser> list3 = mapper.selectChoose(email, sex);

        System.out.println(list.size());
        System.out.println(list2.size());
        System.out.println(list3.size());
    }
```

#### (2) 更新

添加接口：

```java
    int updateIf(TUser record);

    int updateIfAndSet(TUser record);
```

实现：

```xml
	<update id="updateIf" parameterType="TUser">
		update t_user
		set
		<if test="userName != null">
			userName = #{userName,jdbcType=VARCHAR},
		</if>
		<if test="realName != null">
			realName = #{realName,jdbcType=VARCHAR},
		</if>
		<if test="sex != null">
			sex = #{sex,jdbcType=TINYINT},
		</if>
		<if test="mobile != null">
			mobile = #{mobile,jdbcType=VARCHAR},
		</if>
		<if test="email != null">
			email = #{email,jdbcType=VARCHAR},
		</if>
		<if test="note != null">
			note = #{note,jdbcType=VARCHAR}
		</if>
		where id = #{id,jdbcType=INTEGER}
	</update>

	<update id="updateIfAndSet" parameterType="TUser">
		update t_user
		<set>
			<if test="userName != null">
				userName = #{userName,jdbcType=VARCHAR},
			</if>
			<if test="realName != null">
				realName = #{realName,jdbcType=VARCHAR},
			</if>
			<if test="sex != null">
				sex = #{sex,jdbcType=TINYINT},
			</if>
			<if test="mobile != null">
				mobile = #{mobile,jdbcType=VARCHAR},
			</if>
			<if test="email != null">
				email = #{email,jdbcType=VARCHAR},
			</if>
			<if test="note != null">
				note = #{note,jdbcType=VARCHAR},
			</if>
		</set>
		where id = #{id,jdbcType=INTEGER}
	</update>
```

第一个 `sql` 当 `note` 字段没有值的时候而前面的条件有值时就会在结尾多出来一个 `,`，所以应道用第二个 `sql` 中的 `<set>` 标签来完成。

在 `update` 中使用 `if` 元素，`set` 元素可以在值设置之前加 `set` 关键字，同时去掉语句最有一个逗号。

测试：

```java
    @Test
    // if 用于 update，并与 set 配合
    public void testUpdateIfOper() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession(false);
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        TUser user = new TUser();
        user.setId(3);
        user.setUserName("cindy");
        user.setRealName("王美丽");
        user.setEmail("xxoo@163.com");
        user.setMobile("18695988747");
		user.setNote("cindy's note");
        user.setSex((byte) 2);
		System.out.println(mapper.updateIf(user));
        System.out.println(mapper.updateIfAndSet(user));
        sqlSession.commit();
    }
```

#### (3) 插入

添加接口：

```java
    int insertIf(TUser record);

    int insertSelective(TUser record);
```

实现：

```xml
	<insert id="insertIf" parameterType="TUser">
		insert into t_user (
		<if test="id != null">
			id,
		</if>
		<if test="userName != null">
			userName,
		</if>
		<if test="realName != null">
			realName,
		</if>
		<if test="sex != null">
			sex,
		</if>
		<if test="mobile != null">
			mobile,
		</if>
		<if test="email != null">
			email,
		</if>
		<if test="note != null">
			note
		</if>
		)
		values(
		<if test="id != null">
			#{id,jdbcType=INTEGER},
		</if>
		<if test="userName != null">
			#{userName,jdbcType=VARCHAR},
		</if>
		<if test="realName != null">
			#{realName,jdbcType=VARCHAR},
		</if>
		<if test="sex != null">
			#{sex,jdbcType=TINYINT},
		</if>
		<if test="mobile != null">
			#{mobile,jdbcType=VARCHAR},
		</if>
		<if test="email != null">
			#{email,jdbcType=VARCHAR},
		</if>
		<if test="note != null">
			#{note,jdbcType=VARCHAR}
		</if>
		)
	</insert>

	<insert id="insertSelective" parameterType="TUser" useGeneratedKeys="true" keyProperty="id">
		insert into t_user
		<trim prefix="(" suffix=")" suffixOverrides=",">
			<if test="id != null">
				id,
			</if>
			<if test="userName != null">
				userName,
			</if>
			<if test="realName != null">
				realName,
			</if>
			<if test="sex != null">
				sex,
			</if>
			<if test="mobile != null">
				mobile,
			</if>
			<if test="email != null">
				email,
			</if>
			<if test="note != null">
				note,
			</if>
		</trim>
		<trim prefix="values (" suffix=")" suffixOverrides=",">
			<if test="id != null">
				#{id,jdbcType=INTEGER},
			</if>
			<if test="userName != null">
				#{userName,jdbcType=VARCHAR},
			</if>
			<if test="realName != null">
				#{realName,jdbcType=VARCHAR},
			</if>
			<if test="sex != null">
				#{sex,jdbcType=TINYINT},
			</if>
			<if test="mobile != null">
				#{mobile,jdbcType=VARCHAR},
			</if>
			<if test="email != null">
				#{email,jdbcType=VARCHAR},
			</if>
			<if test="note != null">
				#{note,jdbcType=VARCHAR},
			</if>
		</trim>
	</insert>
```

第一个 `sql` 还是会出现多一个 `,` 的问题，使用第二个 `sql` 的 `<trim>` 标签可以解决这个问题，使用 `suffixOverrides` 属性可以去掉最后一个给定的值。

在 `insert` 中使用 `if` 元素，`trim` 元素可以帮助拼装 `columns` 和 `values`。

其实前面的 `<where>` 标签是 `<trim>` 标签的一种简写。下面这两个实际是等价的：

```xml
		<where>
			<if test="email != null and email != ''">
				and a.email like CONCAT('%', #{email}, '%')
			</if>
			<if test="sex != null ">
				and a.sex = #{sex}
			</if>
		</where>
```

```xml
		<trim prefix="where" prefixOverrides="and | or">
			<if test="email != null and email != ''">
				and a.email like CONCAT('%', #{email}, '%')
			</if>
			<if test="sex != null ">
				and a.sex = #{sex}
			</if>
		</trim>
```

测试：

```java
    @Test
    // if 用于 insert，并与 trim 配合
    public void testInsertIf() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        TUser user = new TUser();
        user.setUserName("mark");
        user.setRealName("毛毛");
        user.setEmail("xxoo@163.com");
        user.setMobile("18695988747");
        user.setNote("mark's note");
        user.setSex((byte) 1);
        System.out.println(mapper.insertIf(user));
		System.out.println(mapper.insertSelective(user));
    }
```

### 3、批量操作

#### (1) in

接口：

```java
    List<TUser> selectForeach4In(String[] names);
```

实现：

```xml
	<select id="selectForeach4In" resultMap="BaseResultMap">
		select
		<include refid="Base_Column_List"/>
		from t_user a
		where a.userName in
		<foreach collection="array" open="(" close=")" item="userName" separator=",">
			#{userName}
		</foreach>
	</select>
```

`collection` 属性如果传进来的是数组就是 `array`，如果是集合就是 `list`。

测试：

```java
    @Test
    // Foreach 用于 in 查询
    public void testForeach4In() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        String[] names = new String[]{"lison", "james"};
        List<TUser> users = mapper.selectForeach4In(names);

        for (TUser tUser : users) {
            System.out.println(tUser.getUserName());
        }

        System.out.println(users.size());
    }
```

#### (2) 批量 insert

接口：

```java
    int insertForeach4Batch(List<TUser> users);
```

实现：

```xml
	<insert id="insertForeach4Batch" useGeneratedKeys="true" keyProperty="id">
		insert into t_user (userName, realName,
		sex, mobile,email,note,
		position_id)
		values
		<foreach collection="list" separator="," item="user">
			(
			#{user.userName,jdbcType=VARCHAR},
			#{user.realName,jdbcType=VARCHAR},
			#{user.sex,jdbcType=TINYINT},
			#{user.mobile,jdbcType=VARCHAR},
			#{user.email,jdbcType=VARCHAR},
			#{user.note,jdbcType=VARCHAR},
			#{user.position.id,jdbcType=INTEGER}
			)
		</foreach>
	</insert>
```

这里的 `collection` 传的是一个集合所以使用的是 `list`，然后通过 `user` 作为对象，将一个个属性“点”出来。

通过 `useGeneratedKeys="true" keyProperty="id"` 还可以将插入后每一条数据的主键返回出来。

测试：

```java
    @Test
    // Foreach 用于批量插入
    public void testForeach4Insert() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        TUser user1 = new TUser();
        user1.setUserName("king");
        user1.setRealName("李小京");
        user1.setEmail("li@qq.com");
        user1.setMobile("18754548787");
        user1.setNote("king's note");
        user1.setSex((byte) 1);
        TUser user2 = new TUser();
        user2.setUserName("deer");
        user2.setRealName("陈大林");
        user2.setEmail("chen@qq.com");
        user2.setMobile("18723138787");
        user2.setNote("deer's note");
        user2.setSex((byte) 1);

        int i = mapper.insertForeach4Batch(Arrays.asList(user1, user2));
        System.out.println("------批量更新获取主键的方式与单条insert完全相同--------");
        System.out.println("插入成功的条数：" + i);
        System.out.println(user1.getId());
        System.out.println(user2.getId());
    }
```

#### (3) 批量update

```java
    @Test
    // 批量更新
    public void testBatchExecutor() {
        // 2.获取 sqlSession
		SqlSession sqlSession = sqlSessionFactory.openSession(true);
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        TUser user = new TUser();
        user.setUserName("mark");
        user.setRealName("毛毛");
        user.setEmail("xxoo@163.com");
        user.setMobile("18695988747");
        user.setNote("mark's note");
        user.setSex((byte) 1);
        TPosition position = new TPosition();
        position.setId(1);
        user.setPosition(position);
        System.out.println(mapper.insertSelective(user));

        TUser user1 = new TUser();
        user1.setId(3);
        user1.setUserName("cindy");
        user1.setRealName("王美丽");
        user1.setEmail("xxoo@163.com");
        user1.setMobile("18695988747");
        user1.setNote("cindy's note");
        user1.setSex((byte) 2);
        user.setPosition(position);
        System.out.println(mapper.updateIfAndSet(user1));

        System.out.println("----------------");
        System.out.println(user.getId());
        System.out.println(user1.getId());
    }
```

`sqlSessionFactory.openSession(true);` 表示使用自动提交功能，这样子是不用手动提交事务的。当执行第一个插入操作后就已经插入成功了，然后在进行第二个更新的操作。

下面这种写法是批量提交，并且需要手动提交事务：

```java
    @Test
    // 批量更新
    public void testBatchExecutor() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession(ExecutorType.BATCH, true);
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);

        TUser user = new TUser();
        user.setUserName("mark");
        user.setRealName("毛毛");
        user.setEmail("xxoo@163.com");
        user.setMobile("18695988747");
        user.setNote("mark's note");
        user.setSex((byte) 1);
        TPosition position = new TPosition();
        position.setId(1);
        user.setPosition(position);
        System.out.println(mapper.insertSelective(user));

        TUser user1 = new TUser();
        user1.setId(3);
        user1.setUserName("cindy");
        user1.setRealName("王美丽");
        user1.setEmail("xxoo@163.com");
        user1.setMobile("18695988747");
        user1.setNote("cindy's note");
        user1.setSex((byte) 2);
        user.setPosition(position);
        System.out.println(mapper.updateIfAndSet(user1));

        sqlSession.commit();
        System.out.println("----------------");
        System.out.println(user.getId());
        System.out.println(user1.getId());
    }
```

插入操作和更新操作是在同一事务中执行的，并且需要手动提交事务：`sqlSession.commit();`

## 七、代码生成器

`MyBatis` 的开发团队提供了一个很强大的代码生成器 `MyBatis Generator`，代码包含了数据库表对应的实体类 、`Mapper` 接口类、 `Mapper XML` 文件等，这些代码文件中几乎包含了全部的单表操作方法，使用 `MBG` 可以极大程度上方便我们使用 `MyBatis`，还可以减少很多重复操作；`MyBatis Generator` 的核心就是配置文件，完整的配置文件如下：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE generatorConfiguration PUBLIC
		"-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
		"http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd" >
<generatorConfiguration>

	<!-- 引入配置文件 -->
	<properties resource="db.properties"/>

	<!-- 加载数据库驱动 -->
	<classPathEntry location="${class_path}"/>

	<!-- context:生成一组对象的环境 
			id:必选，上下文id，用于在生成错误时提示 
			defaultModelType:指定生成对象的样式 
				 1，conditional：类似hierarchical；
				 2，flat：所有内容（主键，blob）等全部生成在一个对象中，推荐使用； 
		  		 3，hierarchical：主键生成一个XXKey对象(key class)，Blob等单独生成一个对象，其他简单属性在一个对象中(record class) 
		  	targetRuntime: 
		  		 1，MyBatis3：默认的值，生成基于MyBatis3.x以上版本的内容，包括XXXBySample； 
		         2，MyBatis3Simple：类似MyBatis3，只是不生成XXXBySample，推荐使用；
     -->
	<context id="context1" targetRuntime="MyBatis3Simple" defaultModelType="flat">

		<!-- 生成的Java文件的编码 -->
		<property name="javaFileEncoding" value="UTF-8"/>

		<commentGenerator>
			<!-- 是否去除自动生成的注释 true：是，false:否 -->
			<property name="suppressAllComments" value="true"/>
			<!-- 阻止注释中包含时间戳 true：是，false:否 -->
			<property name="suppressDate" value="true"/>
			<!--  注释是否包含数据库表的注释信息  true：是 ： false:否 -->
			<property name="addRemarkComments" value="true"/>
		</commentGenerator>

		<!--数据库连接的信息：驱动类、连接地址、用户名、密码 -->
		<jdbcConnection driverClass="${jdbc_driver}"
						connectionURL="${jdbc_url}" userId="${jdbc_username}" password="${jdbc_password}"/>

		<!-- java模型创建器，是必须要的元素   负责：1，key类（见context的defaultModelType）；2，java类；3，查询类
			targetPackage：生成的类要放的包，真实的包受enableSubPackages属性控制；
			targetProject：目标项目，指定一个存在的目录下，生成的内容会放到指定目录中，如果目录不存在，MBG不会自动建目录
		 -->
		<javaModelGenerator targetPackage="com.jerry.generator.entity" targetProject="${project_src}">
			<!-- 设置一个根对象，
	                      如果设置了这个根对象，那么生成的keyClass或者recordClass会继承这个类；在Table的rootClass属性中可以覆盖该选项
	                      注意：如果在key class或者record class中有root class相同的属性，MBG就不会重新生成这些属性了，包括：
	                1，属性名相同，类型相同，有相同的getter/setter方法；
	         -->
			<property name="rootClass" value="com.jerry.generator.entity.BaseEntity"/>
		</javaModelGenerator>

		<!-- 生成SQL map的XML文件生成器，
            targetPackage：生成的类要放的包，真实的包受enableSubPackages属性控制；
        	targetProject：目标项目，指定一个存在的目录下，生成的内容会放到指定目录中，如果目录不存在，MBG不会自动建目录
         -->
		<sqlMapGenerator targetPackage="." targetProject="${project_mapper_xml}">
		</sqlMapGenerator>

		<!-- 对于mybatis来说，即生成Mapper接口，注意，如果没有配置该元素，那么默认不会生成Mapper接口
			   type：选择怎么生成mapper接口（在MyBatis3/MyBatis3Simple下）：
				   1，ANNOTATEDMAPPER：会生成使用Mapper接口+Annotation的方式创建（SQL生成在annotation中），不会生成对应的XML；
				   2，MIXEDMAPPER：使用混合配置，会生成Mapper接口，并适当添加合适的Annotation，但是XML会生成在XML中；
				   3，XMLMAPPER：会生成Mapper接口，接口完全依赖XML；
			   注意，如果context是MyBatis3Simple：只支持ANNOTATEDMAPPER和XMLMAPPER
		   -->
		<javaClientGenerator targetPackage="com.jerry.generator.mapper" targetProject="${project_src}"
							 type="XMLMAPPER"/>

		<!-- shema 数据库 tableName 表明
			如果要生成库里所有表，那么 tableName 给值 % 即可
		-->
		<table schema="mybatis" tableName="t_user">
			<generatedKey column="id" sqlStatement="MySql"/>
		</table>

	</context>
</generatorConfiguration>
```

用到的一个配置文件：

```properties
jdbc_driver=com.mysql.jdbc.Driver
jdbc_url=jdbc:mysql://47.105.147.31:3306/mybatis?useUnicode=true&characterEncoding=utf8&allowMultiQueries=true
jdbc_username=root
jdbc_password=35335565
project_src=src/main/java
project_mapper_xml=src/main/resources/sqlmapper
class_path=lib/mysql-connector-java-5.1.18.jar
```

以及在项目根目录下的一个 `lib` 文件夹，里面存放了使用到的 `mybatis-generator-core-1.3.5.jar` 和 `mysql-connector-java-5.1.18.jar`

运行 `MGB` 的方式有三种：

| 方式 | 推荐使用场景 | 
| --- | --- |
| 作为 Maven Plugin 运行 | 对逆向工程定制较多，项目工程结构比较单一的情况 |
| 运行 Java 程序使用 XML 配置文件 | 对逆向工程定制较多，项目工程结构比较单一的情况 |
| 从命令提示符使用 XML 配置文件 | 对逆向工程定制较少，项目工程结构比较复杂的情况 |

以下三种方式都首先需要将如下要存放的根目录下的文件夹目录创建好：`src/main/java` 、`src/main/resources/sqlmapper`

### 1、Maven 插件方式

在项目的 `pom` 文件中写入插件的配置：

```xml
	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>2.1</version>
				<configuration>
					<source>1.8</source>
					<target>1.8</target>
				</configuration>
			</plugin>

			<plugin>
				<groupId>org.mybatis.generator</groupId>
				<artifactId>mybatis-generator-maven-plugin</artifactId>
				<version>1.3.2</version>
				<configuration>
					<verbose>true</verbose>
					<overwrite>true</overwrite>
				</configuration>
			</plugin>
		</plugins>
	</build>
```

然后执行 `mvn mybatis-generator:generate` 命令或者直接在右侧 `maven` 窗口双击 `Plugins` 下的 `mybatis-generator` 下的 `mybatis-generator:generate` 即可生成代码。

### 2、Java 程序方式

创建一个 `maven` 工程，`pom` 文件中引入依赖：

```xml
	<dependencies>
		<dependency>
			<groupId>org.mybatis.generator</groupId>
			<artifactId>mybatis-generator-core</artifactId>
			<version>1.3.2</version>
		</dependency>

		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<version>5.1.28</version>
		</dependency>
	</dependencies>
```

同样将 `lib` 文件夹和 `jar` 放好，以及配置的 `generatorConfig.xml` 文件和 `db.properties` 文件，此时引入驱动的地方主要写成绝对路径：

```properties
class_path=E:/IDEAProject/enjoy-mybatis/mybatis-generator/lib/mysql-connector-java-5.1.18.jar
```

最后写一个类的 `main()` 方法直接运行即可：

```java
public class Generator {

    public static void main(String[] args) {
        // 警告信息
        List<String> warnings = new ArrayList<>();
        boolean overwrite = true;
        String genCfg = "generatorConfig.xml";
        File configFile = new File(Generator.class.getClassLoader().getResource(genCfg).getFile());
        ConfigurationParser parser = new ConfigurationParser(warnings);
        Configuration config = null;

        try {
            config = parser.parseConfiguration(configFile);
        } catch (XMLParserException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        DefaultShellCallback callback = new DefaultShellCallback(overwrite);
        MyBatisGenerator myBatisGenerator = null;
        try {
            myBatisGenerator = new MyBatisGenerator(config, callback, warnings);
        } catch (InvalidConfigurationException e) {
            e.printStackTrace();
        }

        try {
            myBatisGenerator.generate(null);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

### 3、命令提示符方式

将配置文件 `generatorConfig.xml` 和两个 `jar` 文件放在同一目录下，引入驱动的也是用绝对路径，然后执行脚本命令即可：

```cmd
java -Dfile.encoding=UTF-8 -jar mybatis-generator-core-1.3.5.jar -configfile generatorConfig.xml -overwrite
```

## 八、关联查询

### 1、关联查询几个需要注意的细节

思考问题：阿里为什么禁止超过三个表的 `join`？

答：大部分数据库的性能都太弱了，尤其是涉及到大数据量的多表 `join` 的查询，需要的对比与运算的量是会急速增长的，而数据库优化器在多表场景可能不是执行最优的计划，所以这条规范限制了 `join` 表的个数，还提及了 `join` 字段类型必须一致并有索引；那有这种约束复杂SQL 怎么实现？考虑如下三种方式减少 `join` 表的关联：

1. 字段允许适当冗余，以提高查询性能；
2. 分两次 `select`，第一次 `select` 取得主表数据，第二次查从表数据；
3. 将热点数据存缓存，提高数据的读取效率；

关联元素：

`association` 用于表示一对一关系，`collection` 用于表示一对多关系；

关联方式：

* 嵌套结果：使用嵌套结果映射来处理重复的联合结果的子集
* 嵌套查询：通过执行另外一个 `SQL` 映射语句来返回预期的复杂类型

### 2、一对一关联嵌套结果方式

定义如下方法：

```java
    List<TUser> selectUserPosition1();
```

实现：

```xml
	<resultMap id="userAndPosition1" extends="BaseResultMap" type="TUser">
		<association property="position" javaType="TPosition" columnPrefix="post_">
			<id column="id" property="id"/>
			<result column="name" property="postName"/>
			<result column="note" property="note"/>
		</association>
	</resultMap>

	<select id="selectUserPosition1" resultMap="userAndPosition1">
		select
		    a.id,
		    userName,
			realName,
			sex,
			mobile,
			email,
			a.note,
			b.id post_id,
			b.post_name,
			b.note post_note
		from t_user a,
			t_position b
		where a.position_id = b.id
	</select>
```

`association` 标签嵌套结果方式常用属性：

* property：对应实体类中的属性名，必填项。
* javaType：属性对应的 `Java` 类型 。
* resultMap：可以直接使用现有的 `resultMap` ，而不需要在这里配置映射关系。
* columnPrefix：查询列的前缀，配置前缀后，在子标签配置 `result` 的 `column` 时可以省略前缀

开发小技巧：
1. `resultMap` 可以通过使用 `extends` 实现继承关系，简化很多配置工作量；
2. 关联的表查询的类添加前缀是编程的好习惯；
3. 通过添加完整的命名空间，可以引用其他 `xml` 文件的 `resultMap；`

测试：

```java
    @Test
    // 1对1两种关联方式
    public void testOneToOne() throws JsonProcessingException {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);
        // 4.执行查询语句并返回结果
        // ----------------------
        List<TUser> list1 = mapper.selectUserPosition1();
        for (TUser tUser : list1) {
            System.out.println(tUser);
        }
    }
```

一对一关联嵌套结果的查询只会将 `t_user` 和 `t_job_history` 匹配的数据查出来。

### 3、一对一关联嵌套查询方式

定义如下方法：

```java    
    List<TUser> selectUserPosition2();
```

实现：

```xml
	<resultMap id="userAndPosition2" extends="BaseResultMap" type="TUser">
		<association property="position" fetchType="lazy" column="position_id"
					 select="com.jerry.mybatis.demo.mapper.TPositionMapper.selectByPrimaryKey"/>
	</resultMap>

	<select id="selectUserPosition2" resultMap="userAndPosition2">
		select
		a.id,
		a.userName,
		a.realName,
		a.sex,
		a.mobile,
		a.position_id
		from t_user a
	</select>
```

`association` 标签 嵌套查询方式 常用属性：

* select：另 一个映射查询的 `id`, `MyBatis` 会额外执行这个查询获取嵌套对象的结果 。
* column：列名（或别名），将主查询中列的结果作为嵌套查询的参数。
* fetchType：数据加载方式，可选值为 `lazy` 和 `eager`，分别为延迟加载和积极加载，这个配置会覆盖全局的 `lazyLoadingEnabled` 配置。`eager` 会在查询这条 `sql` 语句的时候直接将嵌套的查询也一并查询出来，而 `lazy` 则会在真正使用到嵌套查询字段的时候才会进行嵌套查询。如果想要配置成 `lazy` 还需要将全局的配置加上：`<setting name="aggressiveLazyLoading" value="false"/>`。

测试：

```java
        List<TUser> list2 = mapper.selectUserPosition2();
        System.out.println("------------主查询结束-------------");
        ObjectMapper om = new ObjectMapper().disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        for (TUser tUser : list2) {
            System.out.println(tUser.getPosition());
            System.out.println(om.writeValueAsString(tUser));
        }
```

如果上面配置的是 `lazy` 的话，那么直到执行 `tUser.getPosition()` 的时候才会进行嵌套的查询。

一对一关联嵌套查询会先将 `t_user` 所有的数据查出来，然后再查 `t_position` 表，将符合的数据填充到 `TUser` 中。

### 4、一对多关联嵌套结果

`collection` 支持的属性以及属性的作用和 `association` `完全相同。mybatis` 会根据 `id` 标签，进行字段的合并，合理配置好 `ID` 标签可以提高处理的效率；

定义方法：

```java
    List<TUser> selectUserJobs1();
```

实现：

```xml
    <resultMap id="userAndJobs1" extends="BaseResultMap" type="TUser">
        <collection property="jobs" ofType="com.jerry.mybatis.demo.entity.TJobHistory">
            <result column="comp_name" property="compName" jdbcType="VARCHAR"/>
            <result column="years" property="years" jdbcType="INTEGER"/>
            <result column="title" property="title" jdbcType="VARCHAR"/>
        </collection>
    </resultMap>

    <select id="selectUserJobs1" resultMap="userAndJobs1">
		select
		a.id,
		a.userName,
		a.realName,
		a.sex,
		a.mobile,
		b.comp_name,
		b.years,
		b.title
		from t_user a,
		t_job_history b
		where a.id = b.user_id
	</select>	
```

注意：在使用 `collection` 的时候，会根据 `resultMap` 中配置的 `id` 字段将结果集中的数据进行合并。

一对多关联嵌套结果的查询只会将 `t_user` 和 `t_job_history` 匹配的数据查出来。

测试：

```java
    @Test
    // 1对多两种关联方式
    public void testOneToMany() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);
        // 4.执行查询语句并返回结果
        // ----------------------
        List<TUser> selectUserJobs1 = mapper.selectUserJobs1();
        for (TUser tUser : selectUserJobs1) {
            System.out.println(tUser);
        }
    }
```

* `collection` 支持的属性以及属性的作用和 `association` 完全相同
* `mybatis` 会根据 `id` 标签，进行字段的合并，合理配置好 `id` 标签可以提高处理的效率；

### 5、一对多关联嵌套查询

定义方法：

```java
    List<TUser> selectUserJobs2();
```

实现：

```xml
    <resultMap id="userAndJobs2" extends="BaseResultMap" type="TUser">
        <collection property="jobs" fetchType="lazy" column="id"
                    select="com.jerry.mybatis.demo.mapper.TJobHistoryMapper.selectByUserId"/>
    </resultMap>

    <select id="selectUserJobs2" resultMap="userAndJobs2">
		select
		a.id,
		a.userName,
		a.realName,
		a.sex,
		a.mobile
		from t_user a
	</select>
```

开发小技巧：如果要配置一个相当复杂的映射，一定要从基础映射开始配置，每增加一些配置就进行对应的测试，在循序渐进的过程中更容易发现和解决问题 。

测试：

```java
        List<TUser> selectUserJobs2 = mapper.selectUserJobs2();
        for (TUser tUser : selectUserJobs2) {
            System.out.println(tUser.getJobs().size());
        }
```

一对多关联嵌套查询会先将 `t_user` 所有的数据查出来，然后再查 `t_job_history` 表，将符合的数据填充到 `TUser` 中。

### 6、多对多嵌套结果

要实现多对多的关联，需要满足如下两个条件：

1. 先决条件一：多对多需要一种中间表建立连接关系；
2. 先决条件二：多对多关系是由两个一对多关系组成的，一对多可以也可以用两种方式实现；

在接口中定义两个方法：

```java
    List<TUser> selectUserRole();
```

实现：

```xml
    <resultMap type="TUser" id="userRoleInfo" extends="BaseResultMap">
        <collection property="roles" ofType="TRole" columnPrefix="role_">
            <result column="id" property="id"/>
            <result column="Name" property="roleName"/>
            <result column="note" property="note"/>
        </collection>
    </resultMap>

    <select id="selectUserRole" resultMap="userRoleInfo">
		select a.id,
		      a.userName,
		      a.realName,
		      a.sex,
		      a.mobile,
		      a.note,
		      b.role_id,
		      c.role_name,
		      c.note role_note
		from t_user a,
		     t_user_role b,
		     t_role c
		where a.id = b.user_id AND
		      b.role_id = c.id
     </select>
```

测试：

```java
    @Test
    // 多对多 嵌套
    public void testManyToMany() {
        // 2.获取 sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应 mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);
        // 4.执行查询语句并返回结果
        // ----------------------
        // 嵌套结果
        List<TUser> list = mapper.selectUserRole();
        for (TUser tUser : list) {
            System.out.println(tUser.getRoles().size());
        }
    }
```

### 7、多对多嵌套查询

在接口中定义方法：

```java
    List<TUser> selectUserByRoleId();
```

```java
    List<TRole> selectRoleAndUsers();
```

实现：

```xml
    <select id="selectUserByRoleId" resultMap="userRoleInfo">
        select
        <include refid="Base_Column_List"/>
        from t_user a,
        t_user_role b
        where a.id = b.user_id and
        b.role_id = #{id}
    </select>
```

```xml
    <resultMap id="RoleAndUsers" type="TRole" extends="BaseResultMap">
        <collection property="users" fetchType="lazy" column="id"
                    select="com.jerry.mybatis.demo.mapper.TUserMapper.selectUserByRoleId"></collection>
    </resultMap>

    <select id="selectRoleAndUsers" resultMap="RoleandUsers">
        select
        <include refid="Base_Column_List"/>
        from t_role
    </select>
```

测试：

```java
        // 嵌套查询
        TRoleMapper roleMapper = sqlSession.getMapper(TRoleMapper.class);
        List<TRole> roles = roleMapper.selectRoleAndUsers();
        System.out.println("================主表查询结束=====================");
        for (TRole tRole : roles) {
            System.out.println(tRole.getUsers());
        }
```

### 8、discriminator 鉴别器

定义接口：

```java
    List<TUser> selectUserHealthReport();
```

实现：

```xml
    <resultMap id="userAndHealthReportMale" extends="userAndHealthReport" type="TUser">
        <collection property="healthReports" column="id"
                    select= "com.jerry.mybatis.demo.mapper.THealthReportMaleMapper.selectByUserId"></collection>
    </resultMap>

    <resultMap id="userAndHealthReportFemale" extends="userAndHealthReport" type="TUser">
        <collection property="healthReports" column="id"
                    select= "com.jerry.mybatis.demo.mapper.THealthReportFemaleMapper.selectByUserId"></collection>
    </resultMap>

    <resultMap id="userAndHealthReport" extends="BaseResultMap" type="TUser">
        <discriminator column="sex" javaType="int">
            <case value="1" resultMap="userAndHealthReportMale"/>
            <case value="2" resultMap="userAndHealthReportFemale"/>
        </discriminator>
    </resultMap>

    <select id="selectUserHealthReport" resultMap="userAndHealthReport">
        select
        <include refid="Base_Column_List"/>
        from t_user a
    </select>
```

```xml
    <select id="selectByUserId" parameterType="java.lang.Integer" resultMap="BaseResultMap">
        select
        <include refid="Base_Column_List"/>
        from t_health_report_male
        where user_id = #{userID,jdbcType=INTEGER}
    </select>
```


```xml
    <select id="selectByUserId" parameterType="java.lang.Integer" resultMap="BaseResultMap">
        select
        <include refid="Base_Column_List"/>
        from t_health_report_female
        where user_id = #{userId,jdbcType=INTEGER}
    </select>
```

这里的返回值 `sex` 字段有两种可能，一种是1，一种是2，根据不同的返回值进行了不同的 `resultMap` 封装，查询不同的表的 `sql` 语句。

`TUser` 对象中有这样一个属性：

```java
    private List<HealthReport> healthReports;
```

`HealthReport` 有一个 `id` 属性：

```java
public class HealthReport {
	
	private int id;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

}
```

因为要查询不同的表，所以查询结果会封装到不同的子类中。这里有两个类继承自 `HealthReport`：

```java
public class THealthReportMale extends HealthReport {

    private String checkProject;

    private String detail;

    private Integer userId;

    public String getCheckProject() {
        return checkProject;
    }

    public void setCheckProject(String checkProject) {
        this.checkProject = checkProject;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
```

```java
public class THealthReportFemale extends HealthReport {

    private String item;

    private BigDecimal score;

    private Integer userId;

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
```

对应着不同的表里面的字段。

测试：

```java
    @Test
    // discriminator
    public void testDiscriminator(){
        // 2.获取sqlSession
        SqlSession sqlSession = sqlSessionFactory.openSession();
        // 3.获取对应mapper
        TUserMapper mapper = sqlSession.getMapper(TUserMapper.class);
		// 4.执行查询语句并返回结果
		// ----------------------
        List<TUser> list = mapper.selectUserHealthReport();
        for (TUser tUser : list) {
            System.out.println(tUser);
        }
    }
```

## 九、缓存

`MyBatis` 包含一个非常强大的查询缓存特性，使用缓存可以使应用更快地获取数据，避免频繁的数据库交互 ；

### 1、一级缓存

* 一级缓存默认会启用，想要关闭一级缓存可以在 `select` 标签上配置 `flushCache=“true”`；
* 一级缓存存在于 `SqlSession` 的生命周期中，在同一个 `SqlSession` 中查询时， `MyBatis` 会把执行的方法和参数通过算法生成缓存的键值，将键值和查询结果存入一个 `Map` 对象中。如果同一个 `SqlSession` 中执行的方法和参数完全一致，那么通过算法会生成相同的键值，当 `Map` 缓存对象中己经存在该键值时，则会返回缓存中的对象；
* 任何的 `INSERT` 、`UPDATE` 、`DELETE` 操作都会清空一级缓存；

测试：

```java
    @Test
    public void Test1LevelCache(){
        SqlSession session1 = sqlSessionFactory.openSession();
        TUserMapper userMapper1 = session1.getMapper(TUserMapper.class);
        String email = "qq.com";
        Byte sex = 1;
        List<TUser> list1 = userMapper1.selectByEmailAndSex2(email, sex);
        System.out.println(list1.size());

        List<TUser> list2 = userMapper1.selectByEmailAndSex2(email, sex);
        System.out.println(list2.toString());

        HashMap<String, Object> map = new HashMap<>();
        map.put("email", email);
        map.put("sex", sex);

        List<TUser> list3 = userMapper1.selectByEmailAndSex1(map);
        System.out.println(list3.toString());

        session1.close();

        SqlSession session2 = sqlSessionFactory.openSession();
        TUserMapper userMapper2 = session2.getMapper(TUserMapper.class);
        List<TUser> list4 = userMapper2.selectByEmailAndSex2(email, sex);
        System.out.println(list4.toString());
        session1.close();
    }
}
```

`selectByEmailAndSex2` 的第一次查询是走的数据库，第二次查询的时候就走了缓存。`selectByEmailAndSex1` 虽然参数和 `selectByEmailAndSex2` 一模一样，但是由于方法名不一样，所以没有走缓存，最后在另一个 `SqlSession` 中的 `selectByEmailAndSex2` 查询走的也是数据库，没有走缓存。

如果在 `selectByEmailAndSex2` 的两次查询中间加入了增删改操作，那么就会清空一级缓存，重新走数据库查询：

```java
        List<TUser> list1 = userMapper1.selectByEmailAndSex2(email, sex);
        System.out.println(list1.size());

        // 增删改操作会清空一级缓存和二级缓存
		TUser userInsert = new TUser();
		userInsert.setUserName("test1");
		userInsert.setRealName("realname1");
		userInsert.setEmail("myemail1");
		userMapper1.insert1(userInsert);

        List<TUser> list2 = userMapper1.selectByEmailAndSex2(email, sex);
        System.out.println(list2.toString());
```

### 2、二级缓存

* 二级缓存也叫应用缓存，存在于 `SqlSessionFactory` 的生命周期中，可以理解为跨 `sqlSession`；缓存是以 `namespace` 为单位的，不同 `namespace` 下的操作互不影响。

* 在 `MyBatis` 的核心配置文件中 `cacheEnabled` 参数是二级缓存的全局开关，默认值是 `true`，如果把这个参数设置为 `false`，即使有后面的二级缓存配置，也不会生效；

* 要开启二级缓存,你需要在你的 `SQL Mapper` 文件中添加配置：
```xml
	<cache eviction=“LRU" flushInterval="60000" size="512" readOnly="true"/>
```

上面这段配置的效果如下：
* 映射语句文件中的所有 `select` 语句将会被缓存。
* 映射语句文件中的所有 `insert`，`update` 和 `delete` 语句会刷新缓存。
* 缓存会使用 `Least Recently Used`（`LRU`，最近最少使用的）算法来收回。
* 根据时间表（比如 `no Flush Interval`,没有刷新间隔）, 缓存不会以任何时间顺序 来刷新。
* 缓存会存储列表集合或对象（无论查询方法返回什么）的 512 个引用。
* 缓存会被视为是 `read`/`write`（可读/可写）的缓存；

开发建议：使用二级缓存容易出现脏读，建议避免使用二级缓存，在业务层使用可控制的缓存代替更好；

虽然二级缓存是命名空间级别的，但是也可以将不同的命名空间共享同一块缓存，只需要将第一个命名空间开启缓存，然后第二个命名空间使用：

```xml
<cache-ref namespace="第一个命名空间"/>
```

即可让两个命名空间共享一块缓存。

### 3、缓存调用过程

![mybatis缓存调用过程](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mybatis_cache.png)

调用过程解读：
1. 每次与数据库的连接都会优先从缓存中获取数据
2. 先查二级缓存，再查一级缓存
3. 二级缓存以 `namespace` 为单位的，是 `SqlSession` 共享的，容易出现脏读，建议避免使用二级缓存
4. 一级缓存是 `SqlSession` 独享的，建议开启；

<Valine></Valine> 