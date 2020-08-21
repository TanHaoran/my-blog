# MySQL安装和基础数据类型

<Counter :path="'backend'" :name="'MySQL安装和基础数据类型'"></Counter>

# 一，安装

这里介绍在 `Linux` 下的安装。

首先去官网下载 `MySQL` 的压缩包，官网地址 <https://downloads.mysql.com/archives/community/>，将下载好的 `MySQL` 安装包解压到 `/usr/local` 目录下，我这里使用的是 `mysql-5.7.9-linux-glibc2.5-x86_64.tar.gz` 

```bash
tar -zxvf mysql-5.7.9-linux-glibc2.5-x86_64.tar.gz -C /usr/local
```

进入刚才解压好的目录，可以看到有这么一个文件 `INSTALL-BINARY` ，这个其实就是 `MySQL` 的安装文档。下面根据这个安装文档进行操作安装：

### 1、安装依赖

```bash
yum install -y libaio
```

### 2、添加组

```bash
groupadd mysql
```

### 3、添加用户

```bash
useradd -r -g mysql mysql
```

### 4、创建软连接

进入 `/usr/local` 目录下

```bash
ln -s /usr/local/mysql-5.7.9-linux-glibc2.5-x86_64/ mysql
```

### 5、创建目录

```bash
mkdir mysql-files
```

### 6、授权

```bash
chmod 770 mysql-files
chown -R mysql .
```

### 7、切换组

```bash
chgrp -R mysql .
```

### 8、初始化

```bash
bin/mysqld --initialize --user=mysql
bin/mysql_ssl_rsa_setup # 这行命令会产生一个临时密码，注意记录，方便后面修改密码
```

### 9、继续授权

```bash
chown -R root .
chown -R mysql data mysql-files # 此时如果提示没有data文件夹就需要先创建一下，再执行这个命令
```

此时，进入目录 `data`，如果发现目录里面有数据，就说明初始化成功了

### 10、启动

```bash
bin/mysqld_safe --user=mysql &
```

在这一步启动可能会报错，提示没有权限，此时就是读取配置文件 `my.cnf` 错误的问题。使用命令 `/usr/local/mysql/bin/mysqld --verbose --help | grep -A 1 'Default options'` 可以查看配置文件的优先读取顺序。执行后可以看到顺序如下：

```bash
Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf /usr/local/mysql/etc/my.cnf ~/.my.cnf
```

有可能这一步还是没法找到配置文件，那么去 `/usr/local/mysql/support-files/` 下找找是否有一个 `my-default.cnf` 文件，将这个文件复制到 `/etc` 下，并重命名为 `my.cnf`。

### 11、查看是否启动成功

```bash
ps -ef | grep mysqld
```
出现如下：
```bash
root     20528 17748  0 23:05 pts/0    00:00:00 /bin/sh bin/mysqld_safe --user=mysql
mysql    20610 20528  0 23:05 pts/0    00:00:00 /usr/local/mysql/bin/mysqld --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data --plugin-dir=/usr/local/mysql/lib/plugin --user=mysql --log-error=/usr/local/mysql/data/yjtravel-bring.err --pid-file=/usr/local/mysql/data/yjtravel-bring.pid
root     21277 17748  0 23:15 pts/0    00:00:00 grep --color=auto mysqld
```
说明启动成功了

### 12、配置服务默认开启

```bash
cp support-files/mysql.server /etc/init.d/mysql.server
```

### 13、查看目前配置的开机启动的程序

```bash
chkconfig --list
```

### 14、配置开机启动
```bash
chkconfig mysql.server on
```

### 15、配置环境变量

编辑文件 `/etc/profile`，给文件末尾添加：
```bash
export PATH=/usr/local/mysql/bin:$PATH
```
刷新配置文件：
```bash
source /etc/profile
```

### 16、测试连接

```bash
mysql -uroot -p'MaZI.yGp*2Su' # 刚才安装时生成的密码
```

### 17、连接成功后，修改密码，配置允许远程连接

```sql
set password = '123456';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456';
flush privileges;
```

`%` 表示所有 `ip`

### 18、重启mysql

先停止服务，然后再启动服务即可。

```bash
/etc/inint.d/mysql stop
/etc/inint.d/mysql start
```

## 二、多实例安装

首先修改配置文件如下：

```cnf
[mysqld]
sql_mode="STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER"

[mysqld_multi]
mysqld=/usr/local/mysql/bin/mysqld_safe
mysqladmin=/usr/local/mysql/bin/mysqladmin
log=/var/log/mysqld_multi.log

[mysqld1]
server-id=11
socket=/tmp/mysql.sock1
port=3307
datadir=/usr/local/mysql/data1
user=mysql
performance_schema=off
innodb_buffer_pool_size=32M
skip_name_resolve=1
log_error=error.log
pid-file=/usr/local/mysql/data1/mysql.pid1

[mysqld2]
server-id=12
socket=/tmp/mysql.sock2
port=3308
datadir=/usr/local/mysql/data2
user=mysql
performance_schema=off
innodb_buffer_pool_size=32M
skip_name_resolve=1
log_error=error.log
pid-file=/usr/local/mysql/data2/mysql.pid2
```

在 `/usr/local/mysql` 目录下创建 `data1` 和 `data2`目录。并给予权限 `chown mysql.mysql /usr/local/mysql/data1` 和 `chown mysql.mysql /usr/local/mysql/data2`

接下来初始化；
```bash
mysqld --initialize --user=mysql --datadir=/usr/local/mysql/data1
mysqld --initialize --user=mysql --datadir=/usr/local/mysql/data2
```

同时不要忘记记录两个实例生成的密码。

接来下配置开机启动：

```bash
cp /usr/local/mysql/support-files/mysqld_multi.server /etc/init.d/mysqld_multid
```

然后修改 `mysqld_multid` 文件，在文件顶部加入环境变量：`export PATH=$PATH:/usr/local/mysql/bin`

然后再执行：

```bash
chkconfig mysqld_multid on
```

启动多实例：`mysqld_multi start`

查看启动状态：`mysqld_multi report`，如果现实两个服务器都是 `running` 状态就说明成功了，如果不是 `running` 状态的话，可以去 `/data1` 或者 `/data2` 目录下查看下错误的日志信息，日志存放在 `error.log` 文件中。 

至此，多实例的安装和启动就已经完成了，这个多实例和之前的单实例互相独立，互不影响。

接下来服务器登录两个实例进行修改密码和允许远程访问：

```bash
mysql -u root -S /tmp/mysql.sock1 -p -P3307
```

```sql
set password = '123456';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456';
flush privileges;
```

然后重复这个操作对第二个实例进行操作。

## 三、MySQL权限

使用 `root` 用户通过工具远程登录，创建数据库 `mall`,给用户 `dev` 授予查询 `mall` 数据库的权限：

```sql
GRANT SELECT ON mall.* TO 'dev'@'%' IDENTIFIED BY '123456'; # 这个密码可以和root用户的密码不一致
```

在执行这条语句的时候可能会提示 `Access denied for user 'root'@'%' to database 'mall'`，这是由于多个 `root` 用户在登录的时候产生了多个进程，所以在开始给 `root` 用户授权的时候系统并不知道具体给哪个 `root` 授权，此时需要将所有`root` 相关进程进行结束，命令如下：

```sql
SELECT concat('KILL ',id,';') FROM information_schema.processlist WHERE user='root';
```

然后重新登录授权就没问题了。
具体原因可以查看这篇帖子：<https://blog.csdn.net/gu_wen_jie/article/details/89242255>

查看 `dev` 用户目前的权限：

```sql
SHOW GRANTS FOR 'dev'@'%'
```

### 1、权限粒度

其实在 `MySQL` 中，权限是可以精确到字段级别的。

创建表语句：

```sql
CREATE TABLE `account` (
	`id` INT(11) NOT NULL,
	`name` VARCHAR(50) DEFAULT NULL,
	`balance` INT(255) DEFAULT NULL,
	PRIMARY KEY (`id`),
	KEY `idx_balance` (`balance`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8
```

随便插入几条数据：

```sql
INSERT `account` VALUE ('1', 'lilei', '900');
INSERT `account` VALUE ('2', 'hanmei', '100');
INSERT `account` VALUE ('3', 'lucy', '250');
INSERT `account` VALUE ('5', 'tom', '0');
```

`mysql` 库中的 `user` 表存储了 `用户+ip` 所对应的权限。`db` 表存储了用户对库所具有的权限。`tables_priv` 和 `columns_priv` 可以控制表和列级别的权限。

移除给用户分配的权限：

```sql
REVOKE SELECT ON mall.* FROM 'dev'@'%';
```

只给用户分配指定字段的查询权限：

```sql
GRANT SELECT(id, name) ON mall.account to 'dev'@'%'; # 只能访问id和name字段
```

此时使用 `dev` 用户登录就只能访问 `mall` 数据库的 `id` 和 `name` 字段了。

### 2、角色概念

在 `MySQL` 中是没有明确的角色概念的，但是可以将用户理解成为一个角色的概念。

设置开启角色功能和密码加密：

```sql
SET GLOBAL check_proxy_users = 1;
SET GLOBAL mysql_native_password_proxy_users = 1;
```

创建用户（理解成角色）

```sql
CREATE USER 'dev_role'; // 看成是角色
CREATE USER 'deer'; // 看成是用户
CREATE USER 'enjoy'; // 看成是用户
```

此时需要给 `root` 用户授权的权限，需要在 `MySQL` 控制台进行授权，然后在进行授权。

```sql
GRANT PROXY ON ''@'' TO 'root'@'%';
GRANT PROXY ON 'dev_role' to 'deer';
GRANT PROXY ON 'dev_role' to 'enjoy';
flush privileges;
```

这时只要给 `dev_role` 角色授权，另外两个用户就自动有权限了。

```sql
GRANT SELECT(id, name) ON mall.account to 'dev_role'@'%';
```

这时使用 `deer` 和空密码进行登录，可以查询到 `account` 表的 `id` 和 `name` 字段了。

```sql
SELECT id, name FROM account;
```
在 `proxies_priv` 表中可以看到刚才给用户授予角色的信息。

## 四、MySQL数据类型

### 1、INT 类型

| 类型 | 字节 | 最小值 | 最大值 |
| --- | --- | --- | --- |
| 有符号 TINYINT | 1 | -128 | 127 |
| 无符号 TINYINT | 1 | 0 | 255 |
| 有符号 SMALLINT | 2 | -32768 | 32767 |
| 无符号 SMALLINT | 2 | 0 | 65535 |
| 有符号 MEDIUMINT | 3 | -8388608 | 8388607 |
| 无符号 MEDIUMINT | 3 | 0 | 16777215 |
| 有符号 BIGINT | 8 | -92233720368547758080 | 92233720368547758087 |
| 无符号 BIGINT | 8 | 0 | 18446744073709551615 |

创建个无符号表，并插入数据：

```sql
CREATE TABLE test_unsigned (a INT UNSIGNED, b INT UNSIGNED);
INSERT test_unsigned VALUE(1, 2);
```

做如下查询：

```sql
SELECT b - a FROM test_unsigned;
```

可以正常查询，再做如下查询：

```sql
SELECT a - b FROM test_unsigned;
```

可以发现查询结果是null或者报错了，因为超出了最大精度。

创建表并插入数据：

```sql
CREATE TABLE test_int_n(a INT(4) ZEROFILL);

INSERT test_int_n VALUE(1);
INSERT test_int_n VALUE(123456);
```

这个`INT(4)` 表示如果没有达到长度位数4，会在前面补零。

此时使用终端进行查询：

```sql
SELECT * FROM test_int_n;
```

就会发现显示结果是：
```console
+--------+
| a      |
+--------+
|   0001 |
| 123456 |
+--------+
```

要想创建逐渐自动增长的表，一定要指明主键：

```sql
CREATE TABLE test_auto_increment(a INT AUTO_INCREMENT PRIMARY KEY);
```

插入数据：

```sql
INSERT test_auto_increment VALUES(null), (100), (null), (10), (null);
```
查询：

```sql
SELECT * FROM test_auto_increment;
```

结果：

```console
1
10
100
101
102
```

再插入一条数据：

```sql
INSERT test_auto_increment VALUE(-1), (-3), (0);
```

查询

```sql
SELECT * FROM test_auto_increment;
```

结果：

```console
-3
-1
1
10
100
101
102
104
```

### 2、字符类型

| 类型 | 说明 | N的含义 | 是否有字符集 | 最大长度 |
| --- | --- | --- | --- | --- |
| CHAR(N) | 定长字符 | 字符 | 是 | 255 |
| VARCHAR(N) | 变长字符 | 字符 | 是 | 16348 |
| BINARY(N) | 定长二进制字节 | 字节 | 否 | 255 |
| VARBINARY(N) | 变长二进制字节 | 字节 | 是 | 16348 |
| TINYBLOB(N) | 二进制大对象 | 字节 | 是 | 256 |
| BLOB(N) | 二进制大对象 | 字节 | 是 | 16K |
| MEDIUMBLOB(N) | 二进制大对象 | 字节 | 是 | 255 |
| LONGBLOB(N) | 二进制大对象 | 字节 | 否 | 4G |
| TINYTEXT(N) | 大对象 | 字节 | 是 | 256 |
| TEXT(N) | 大对象 | 字节 | 是 | 16K |
| MEDIUMTEXT(N) | 大对象 | 字节 | 是 | 16M |
| LONGTEXT(N) | 大对象 | 字节 | 是 | 4G |

除了 `CHAR` 和 `VARCHAR` 保存的是字符，其它保存的都是字节

默认情况下，当数据库的排序规则是 `utf8_general_ci` 的时候：

```sql
SELECT 'a' = 'A';
```

执行的结果是：

```console
1
```

`utf8_general_ci` 排序规则会忽略大小写，而 `utf8_bin` 排序规则不会忽略大小写。

修改数据库的排序规则：

```sql
SET NAMES utf8mb4 COLLATE utf8mb4_bin;
```

此时再执行：

```sql
SELECT 'a' = 'A';
```
执行的结果是：

```console
0
```

### 3、日期类型

| 日期类型      | 占用空间 | 表示范围                                                |   |
|-----------|------|-----------------------------------------------------|---|
| DATETIME  | 8    | 1000\-01\-01 00:00:00 ~ 9999\-12\-31 23:59:59       |   |
| DATE      | 3    | 1000\-01\-01 ~ 9999\-12\-31                         |   |
| TIMESTAMP | 4    | 1970\-01\-01 00:00:00UTC ~ 2038\-01\-19 03:14:07UTC |   |
| YEAR      | 1    | YEAR\(2\):1970\-2070, YEAR\(4\):1901\-2155          |   |
| TIME      | 3    | \-838:59:59 ~ 838:59:59                             |   |

创建表，添加数据：

```sql
CREATE TABLE test_time(a TIMESTAMP, b DATETIME);

INSERT test_time VALUES (now(), now());


SELECT @@time_zone;

SET time_zone = '+00:00';
```

此时查询：

```sql
SELECT * FROM test_time;
```

结果：

```console
2020-04-19 22:25:00	2020-04-19 22:25:00
```

如果修改了时区：

```sql
SET time_zone = '+00:00';
# 查询时区可以用这个
SET time_zone = '+00:00';
```

此时查询：

```sql
SELECT * FROM test_time;
```

结果：

```console
2020-04-19 14:25:00	2020-04-19 22:25:00
```

发现时间不一样了，这说明 `TIMESTAMP` 类型是带有时区信息的，而 `DATETIME` 没有时区信息。

### 4、json类型

`json` 数据类型是从 `mysql` 5.7才引入的类型。

创建表：

```sql
CREATE TABLE json_user ( uid INT AUTO_INCREMENT, data json, PRIMARY KEY ( uid ) );
```

插入数据：

```sql
INSERT json_user
VALUES
	( NULL, '{ "name":"lison", "age":18, "address":"enjoy"
	}' );
INSERT json_user
VALUES
	( NULL, '{"name":"james", "age":28, "mail":"james@163.com"
	}' );
```

这里如果 `json` 格式有问题，是无法插入成功的。

#### (1) 常用函数

##### json_extract 抽取

```sql
SELECT	json_extract ( '[10, 20, [30, 40]]', '$[1]' );
```

执行结果是：`20`

如果想要查询 `json_user` 表中 `data` 字段 `json` 的 `name` 列和 `address` 列，可以这么写：

```sql
SELECT
	json_extract ( data, '$.name' ),
	json_extract ( data, '$.address' ) 
FROM
	json_user;
```

##### json_object 对象转json

这个函数会将给定的参数两两匹配，组成一个 `json` 对象。

```sql
SELECT	json_object ( "name", "enjoy", "email", "enjoy.com", "age", 35 );
```

执行结果是：`{"age": 35, "name": "enjoy", "email": "enjoy.com"}`

给 `json_user` 表添加数据：

```sql
INSERT json_user 
VALUE
	( NULL, json_object ( "name", "enjoy", "email", "enjoy.com", "age", 35 ) );
```

##### json_insert 插入数据

首先讲一个知识点。`@` 和 `@@`，前者是查询局部变量的，后者是查询全局变量的。

例如 `SHOW VARIABLES LIKE '%datadir%';` 可以查询存放数据的目录，同样使用 `SELECT @@datadir;` 也可以完成同样的效果。

那么此时设置一个局部变量：

```sql
SET @json = '{ "a": 1, "b": [2, 3]}';
```

然后：

```sql
SELECT	json_insert ( @json, '$.a', 10, '$.c', '[true, false]' );
```

执行结果是：`{"a": 1, "b": [2, 3], "c": "[true, false]"}`。

因为原本的 `@json` 中，`a` 字段已经有值了，所以插入的时候10是不能插入成功的，而字段 `c` 因为在原本的 `json` 中不存在，所以可以将 `c` 字段追加插入到 `json` 中。

看下面这个语句：

```sql
UPDATE json_user 
SET data = json_insert ( data, "$.address_2", "xiangxue" ) 
WHERE
	uid = 1;
```

这个就给原来 `data` 字段的 `json` 中新增了一个 `address_2` 字段，并且值是 `xiangxue`

##### json_merge 合并数据并返回

```sql
SELECT	json_merge ( '{"name": "enjoy"}', '{"id": 47}' );
```

执行结果：`{"id": 47, "name": "enjoy"}`

那么语句：

```sql
SELECT
	json_merge ( json_extract ( data, '$.address' ), json_extract ( data, '$.address_2' ) ) 
FROM
	json_user 
WHERE
	uid = 1;
```

的意思就是将 `data` 字段 `json` 中的 `address` 和 `address2` 字段进行合并并返回。

结果：`["enjoy", "xiangxue"]`

其它关于 `json` 的更多函数可以在官网查询：<https://dev.mysql.com/doc/refman/5.7/en/json-function-reference.html>

#### (2) json索引

`json` 类型数据本身无法直接创建索引，需要将需要索引的 `json` 数据重新生成虚拟列(`Virtual Columns`)之后，对该列进行索引。

创建表：

```sql
CREATE TABLE test_index_1 ( 
data json, 
gen_col VARCHAR ( 10 ) generated always AS ( json_extract ( data, '$.name' ) ), 
INDEX idx ( gen_col ) 
);
```

这个语句创建的表有2个字段，一个字段是 `data`，另一个字段 `gen_col` 的值是来自 `data` 字段中 `name` 字段的值。

插入数据：

```sql
INSERT test_index_1 ( data )
VALUES
	( '{"name":"king", "age":18, "address":"cs"}' );
INSERT test_index_1 ( DATA )
VALUES
	( '{"name":"peter", "age":28, "address":"zz"}' );
```

查询即可看到 `gen_col` 字段就有了值。

于是，也就可以实现 `where` 语句的查询功能：

```sql
SELECT
	json_extract ( data, "$.name" ) AS username 
FROM
	test_index_1 
WHERE
	gen_col = '"king"';
```

注意，这里生成的 `gen_col` 列的值是带有 `"` 的，查询的时候不要忘记了。但是这样似乎有些麻烦，有什么办法可以让查询的时候不用输入 `"` 呢？

只需要在创建的时候使用如下语句：

```sql
CREATE TABLE test_index_2 (
	 data json, 
	 gen_col VARCHAR ( 10 ) generated always AS ( json_unquote( json_extract( DATA, "$.name" ) )), 
	 INDEX idx ( gen_col ) 
);
```

这里使用到了 `json_unquote()` 函数，它将 `"` 去掉了。

<Valine></Valine>