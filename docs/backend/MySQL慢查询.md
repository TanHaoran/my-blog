# MySQL慢查询

<Counter :path="'backend'" :name="'MySQL慢查询'"></Counter>

## 一、什么是慢查询

慢查询日志，顾名思义，就是查询慢的日志，是指 `mysql` 记录所有执行超过 `long_query_time` 参数设定的时间阈值的 `SQL` 语句的日志。该日志能为 SQL 语句的优化带来很好的帮助。默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。

默认的慢查询日志是关闭的：

```sql
show variables like '%slow_query_log%';
```

存放慢查询日志的地址：

```sql
show variables like '%slow_query_log_file%';
```

## 二、慢查询配置

### 1、慢查询基本配置

* slow_query_log 

启动停止技术慢查询日志

* slow_query_log_file 

指定慢查询日志得存储路径及文件（默认和数据文件放一起）

* long_query_time 

指定记录慢查询日志 SQL 执行时间得伐值（单位：秒，默认 10 秒）
* log_queries_not_using_indexes 

是否记录未使用索引的 SQL

* log_output 

日志存放的地方【TABLE】【FILE】【FILE,TABLE】

设置慢查询时间并开启慢查询：

```sql
set global long_query_time = 0;

set global slow_query_log = 1;
```

这样子设置后，随便一个查询都会被记录到日志中。

### 2、慢查询解读

慢查询日志数据组成如下：

```log
# Time: 2020-05-01T13:34:02.191987Z
# User@Host: root[root] @  [111.18.129.246]  Id:   260
# Query_time: 0.000082  Lock_time: 0.000000 Rows_sent: 0  Rows_examined: 0
SET timestamp=1588340042;
SHOW CREATE TABLE `mall`.`account`;
```

第一行：执行时间

第二行：用户名 、用户的 IP 信息、线程 ID 号

第三行：执行花费的时间【单位：毫秒】、执行获得锁的时间、获得的结果行数、扫描的数据行数

第四行：这 SQL 执行的时间戳

第五行：具体的 SQL 语句

### 3、慢查询分析

慢查询的日志记录非常多，要从里面找寻一条查询慢的日志并不是很容易的事情，一般来说都需要一些工具辅助才能快速定位到需要优化的 SQL 语句，下面介绍两个慢查询辅助工具

#### (1) Mysqldumpslow

常用的慢查询日志分析工具，汇总除查询条件外其他完全相同的 `SQL`，并将分析结果按照参数中所指定的顺序输出。

语法：

`mysqldumpslow -s r -t 10 slow-mysql.log`

`-s order` (其中 `order` 可以是：`c`,`t`,`l`,`r`,`at`,`al`,`ar`)

`c`：总次数

`t`：总时间

`l`：锁的时间

`r`：总数据行

`at`：平均查询时间

`al`：平均锁定时间

`ar`：平局访问记录数

`-t top`：指定取前面几天作为结果输出

例如：

```bash
# 按照总时间排序查询前10条记录
mysqldumpslow -s t -t 10 /usr/local/mysql/data/yjtravel-bring-slow.log # 我电脑上这里文件的名字前面含有实例的名字
```

#### (2) pt_query_digest

源码安装：

```bash
cd /usr/local
wget percona.com/get/percona-toolkit.tar.gz
tar -zxvf percona-toolkit.tar.gz
cd percona-toolkit-3.2.0/
perl Makefile.PL PREFIX=/usr/local/percona-toolkit
make && make install
```

之后记得将环境变量配置到 `/etc/profile` 文件中

慢查询日志分析统计：

```bash
pt-query-digest /usr/local/mysql/data/yjtravel-bring-slow.log
```

分析结果：

```
# 170ms user time, 10ms system time, 23.32M rss, 187.86M vsz
# Current date: Thu May  7 22:49:15 2020
# Hostname: yjtravel-bring
# Files: /usr/local/mysql/data/yjtravel-bring-slow.log
# Overall: 331 total, 64 unique, 0.00 QPS, 0.00x concurrency _____________
# Time range: 2020-05-01T13:34:01 to 2020-05-07T07:22:26
# Attribute          total     min     max     avg     95%  stddev  median
# ============     ======= ======= ======= ======= ======= ======= =======
# Exec time          114ms     4us     6ms   343us   972us   550us   204us
# Lock time           22ms       0   765us    65us   185us   100us    49us
# Rows sent         16.46k       0     355   50.91  346.17  115.94    0.99
# Rows examine      31.02k       0     500   95.98  487.09  155.23    0.99
# Query size        23.06k      11     565   71.33  271.23   98.64   28.75

# Profile
# Rank Query ID                         Response time Calls R/Call V/M   I
# ==== ================================ ============= ===== ====== ===== =
#    1 0xF9734574CDDDC5D231DA25F9549...  0.0204 17.9%    43 0.0005  0.00 SHOW STATUS
#    2 0xE77769C62EF669AA7DD5F6760F2...  0.0108  9.5%    19 0.0006  0.00 SHOW VARIABLES
#    3 0x88FE408114B4AD1A20C6A15F1F4...  0.0093  8.2%     5 0.0019  0.00 SELECT information_schema.ROUTINES information_schema.PARAMETERS
#    4 0x3C2A84A184121E5898947CCF916...  0.0084  7.4%     4 0.0021  0.00 SELECT UNION information_schema.TABLES information_schema.COLUMNS information_schema.ROUTINES
#    5 0x557949ACAD20DBB8C652E54E381...  0.0064  5.7%     6 0.0011  0.00 SELECT information_schema.triggers
#    6 0x733019F33E3027F6693EB59382A...  0.0061  5.4%    13 0.0005  0.00 SELECT INFORMATION_SCHEMA.PROFILING
#    7 0x9277183CCDDC5C9148701A8733C...  0.0060  5.3%    13 0.0005  0.00 SELECT INFORMATION_SCHEMA.PROFILING
#    8 0x3F2AFF269D39E8F78BCCE9A7D60...  0.0057  5.0%     1 0.0057  0.00 CREATE TABLE staffs `staffs`
#    9 0x9222273D680F616B28B5314FA08...  0.0056  5.0%     1 0.0056  0.00 CREATE TABLE mall.test_length `mall`.`test_length`
#   10 0x77C5EBAFE88A2A77513E8ABF197...  0.0047  4.1%     6 0.0008  0.00 SELECT information_schema.PARTITIONS
#   11 0xCC580A58CB4307CD61D15F3D416...  0.0035  3.1%    17 0.0002  0.00 SELECT information_schema.SCHEMATA
#   12 0x7B346D97B39D53F8AFCA9ED089D...  0.0028  2.5%     3 0.0009  0.00 INSERT staffs
#   13 0x0F4DD36E261C3C9BA74C738BC1E...  0.0021  1.8%     4 0.0005  0.00 SELECT information_schema.COLUMNS
#   14 0x8085D806F3631D0D30FE5C20326...  0.0020  1.7%     8 0.0002  0.00 SHOW TABLE STATUS
#   15 0x898255B1BE4F8C3044AE35A1828...  0.0018  1.6%    76 0.0000  0.00 ADMIN INIT DB
#   16 0xF6C6D60B8B46C010445D20E44CF...  0.0017  1.5%     5 0.0003  0.00 SHOW TABLE STATUS
#   17 0xD651E5FA7AF4A9660AE400CBBA3...  0.0015  1.3%     5 0.0003  0.00 SELECT information_schema.TABLES
#   18 0x72833D3A18ACDED00CF6DE6C18C...  0.0013  1.1%     4 0.0003  0.00 SHOW TABLES
#   19 0xAD3E923A22EE8EFA589A5F27DE4...  0.0012  1.0%     3 0.0004  0.00 SELECT INFORMATION_SCHEMA.VIEWS
#   20 0x82473CC2CD3FBE342FA557266B6...  0.0011  1.0%    15 0.0001  0.00 SET
# MISC 0xMISC                            0.0114 10.0%    80 0.0001   0.0 <44 ITEMS>

```

最上面的是会总信息，其中：

* Response: 总的响应时间。
* time: 该查询在本次分析中总的时间占比。
* Calls: 执行次数，即本次分析总共有多少条这种类型的查询语句。
* R/Call: 平均每次执行的响应时间。
* Item : 查询对象

接着就是每一个慢查询具体的信息：

```
# Query 7: 0.00 QPS, 0.00x concurrency, ID 0x9277183CCDDC5C9148701A8733C04373 at byte 47560
# This item is included in the report because it matches --limit.
# Scores: V/M = 0.00
# Time range: 2020-05-02T13:37:37 to 2020-05-07T03:22:36
# Attribute    pct   total     min     max     avg     95%  stddev  median
# ============ === ======= ======= ======= ======= ======= ======= =======
# Count          3      13
# Exec time      5     6ms   287us   614us   463us   596us   124us   504us
# Lock time      5     1ms    72us   107us    85us    98us     9us    80us
# Rows sent      0     127       4      15    9.77   14.52    4.79   11.69
# Rows examine   7   2.19k      66     278  172.69  271.23   88.14  202.64
# Query size     5   1.24k      98      98      98      98       0      98
# String:
# Databases    mall
# Hosts        125.76.177.109 (7/53%), 111.18.129.242 (4/30%)... 2 more
# Users        root
# Query_time distribution
#   1us
#  10us
# 100us  ################################################################
#   1ms
#  10ms
# 100ms
#    1s
#  10s+
# Tables
#    SHOW TABLE STATUS FROM `INFORMATION_SCHEMA` LIKE 'PROFILING'\G
#    SHOW CREATE TABLE `INFORMATION_SCHEMA`.`PROFILING`\G
# EXPLAIN /*!50100 PARTITIONS*/
SELECT QUERY_ID, SUM(DURATION) AS SUM_DURATION FROM INFORMATION_SCHEMA.PROFILING GROUP BY QUERY_ID\G
```

<Valine></Valine> 