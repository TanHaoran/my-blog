# MySQL锁与事务的分析

<Counter :path="'backend'" :name="'MySQL锁与事务的分析'"></Counter>

## 一、锁的简介

### 1、为什么需要锁

到淘宝上买一件商品，商品只有一件库存，这个时候如果还有另一个人买，那么如何解决是你买到还是另一个人买到的问题？

### 2、锁的概念

* 锁是计算机协调多个进程或线程并发访问某一资源的机制。
* 在数据库中，数据也是一种供许多用户共享的资源。如何保证数据并发访问的一致性、有效性是所有数据库必须解决的一个问题，锁冲突也是影响数据库并发访问性能的一个重要因素。
* 锁对数据库而言显得尤其重要，也更加复杂。

### 3、MySQL 中的锁

MySQL的锁最显著的特点是不同的存储引擎支持不同的锁机制。例如：`MyISAM` 和 `MEMORY` 存储引擎采用的是表级锁，`InnoDB` 存储引擎既支持行级锁，也支持表级索，但默认情况下采用行级锁。

* 表级锁：开销小，加锁快；不会出现死锁；锁定粒度大，发生锁冲突的概率最高,并发度最低。
* 行级锁：开销大，加锁慢；会出现死锁；锁定粒度最小，发生锁冲突的概率最低,并发度也最高。
* 页面锁(gap 锁,间隙锁)：开销和加锁时间界于表锁和行锁之间；会出现死锁；锁定粒度界于表锁和行锁之间，并发度一般。

### 4、表锁与行锁的使用场景

表级锁更适合于以查询为主，只有少量按索引条件更新数据的应用，如 `OLAP` 系统。

行级锁则更适合于有大量按索引条件并发更新少量不同数据，同时又有并发查询的应用，如一些在线事务处理（`OLTP`）系统。

很难笼统地说哪种锁更好，只能就具体应用的特点来说哪种锁更合适。

## 二、MyISAM 锁

`MySQL` 的表级锁有两种模式：

表共享读锁（`Table Read Lock`）

表独占写锁（`Table Write Lock`）

| 请求锁模式是否兼容当前锁模式 | None | 读锁 | 写锁 |
| --- | --- | --- | --- |
| 读锁 | 是 | 是 | 否 |
| 写锁 | 是 | 否 | 否 |

### 1、共享读锁

语法：`LOCK TABLE 表名 READ`

给表中插入数据：

```sql
INSERT testmyisam VALUES (11), (12), (13);
```

然后添加读锁：

```sql
LOCK TABLE testmyisam READ;
```

在当前会话中进行新增或、更新或者删除都会报错：

```sql
INSERT testmyisam VALUES	( 2 ); # 1099 - Table 'testmyisam' was locked with a READ lock and can't be updated
UPDATE testmyisam SET id = 2 WHERE	id = 1; # 1099 - Table 'testmyisam' was locked with a READ lock and can't be updated
```

即使对其它表进行查询、插入等操作也会报错：

```sql
SELECT * FROM account; # 1100 - Table 'account' was not locked with LOCK TABLES

INSERT account VALUE (100, 'aaa', 200); # 1100 - Table 'account' was not locked with LOCK TABLES
```

如果查询当前表，但是起了别名也会报错：

```sql
SELECT s.* FROM testmyisam; 1100 - Table 'testmyisam' was not locked with LOCK TABLES
```

但是如果新开一个会话，进行查询操作的时候是可以成功的，但是要进行插入、更新或删除操作：

```sql
INSERT testmyisam VALUES (2);
```

会发现并没有报错，而是一直在等待执行。

解锁的命令：

```sql
UNLOCK TABLES;
```

### 2、独占写锁

语法：`LOCK TABLE 表名 WRITE`

加写锁：

```sql
LOCK TABLE testmyisam WRITE;
```

在相同会话中是可以进行查询、新增、更新、删除操作的。

如果查询其它表的话是会报错的：

```sql
SELECT * FROM account; # 1100 - Table 'account' was not locked with LOCK TABLES
```

如果对当前表起别名也是无法查询的：

```sql
SELECT s.* FROM testmyisam s; # 1100 - Table 's' was not locked with LOCK TABLES
```

如果在新会话中进行查询当前表的话，会一直等待：

```sql
SELECT * FROM testmyisam; # 不报错，一直等待
```

### 3、总结

* 读锁，对 `MyISAM` 表的读操作，不会阻塞其他用户对同一表的读请求，但会阻塞对同一表的写请求
* 读锁，对 `MyISAM` 表的读操作，不会阻塞当前 `session` 对表读，当对表进行修改会报错
* 读锁，一个 `session` 使用 `LOCK TABLE` 命令给表 `f` 加了读锁，这个 `session` 可以查询锁定表中的记录，但更新或访问其他表都会提示错误；
* 写锁，对 `MyISAM` 表的写操作，则会阻塞其他用户对同一表的读和写操作；
* 写锁，对 `MyISAM` 表的写操作，当前 `session` 可以对本表做 `CRUD`,但对其他表进行操作会报错

## 三、InnoDB 锁

在 `mysql` 的 `InnoDB` 引擎支持行锁。

* 共享锁又称：读锁。当一个事务对某几行上读锁时，允许其他事务对这几行进行读操作，但不允许其进行写操作，也不允许其他事务给这几行上排它锁，但允许上读锁。
* 排它锁又称：写锁。当一个事务对某几个上写锁时，不允许其他事务写，但允许读。更不允许其他事务给这几行上任何锁。包括写锁。

### 1、语法

上共享锁的写法：`lock in share mode`。例如： `select * from 表 where 条件 lock in share mode；`

上排它锁的写法：`for update`。例如：`select * from 表 where 条件 for update；`

### 2、注意

* 两个事务不能锁同一个索引。
* `insert`、`delete`、`update` 在事务中都会自动默认加上排它锁。
* 行锁必须有索引才能实现，否则会自动锁全表，那么就不是行锁了。

如何查看使用行锁时锁的是不是索引呢？利用执行计划 `EXPLAIN` 来看字段 `key` 是什么就可以，`key` 对应的是索引列，就是行锁，不是索引列，就锁全表。

创建表并插入数据：

```sql
CREATE TABLE testdemo (
	`id` INT ( 255 ) NOT NULL,
	`c1` VARCHAR ( 300 ) CHARACTER 
	SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
	`c2` INT ( 50 ) NULL DEFAULT NULL,
	PRIMARY KEY ( `id` ),
	INDEX `idx_c2` ( `c2` ) USING BTREE 
) ENGINE = INNODB;

INSERT INTO testdemo VALUES ( 1, '1', 1 ),(	2, '2',	2 );
```

#### (1) 示例1

开启事务后，上写锁：

```sql
BEGIN;

SELECT
	* 
FROM
	testdemo 
WHERE
	id = 1 FOR UPDATE;
```

另开一个会话执行：

```sql
UPDATE testdemo SET c1 = '1' WHERE id = 2; # 执行成功
UPDATE testdemo SET c1 = '1' WHERE id = 1; # 等待
```

给第一个事物回滚后，第二个事务等待的才可以执行成功：

```sql
ROLLBACK;
```

#### (2) 示例2

重新开启一个事物，并进行更新操作：

```sql
BEGIN;
UPDATE testdemo SET c1 = '1' WHERE id = 1;
```

再另一个会话中对同一行进行更新操作也会等待：

```sql
UPDATE testdemo SET c1 = '1' WHERE id = 1;
```

回滚回去。

这个例子说明了在进行 `update` 操作的时候，会默认加上排它锁。

#### (3) 示例3

```sql
BEGIN;
UPDATE testdemo SET c1 = '1' WHERE c1 = '1'
```

在另一个事物中执行：

```sql
UPDATE testdemo SET c1 = '2' WHERE c1 = '2'
```

会发在等待。因为在建表的时候 `c1` 并没有索引，而第一个会话锁的是 `c1`，从而这说明了行锁必须有索引才能实现，否则会自动锁全表，那么就不是行锁了。

回滚回去。

在锁住行锁之后，使用 `ROLLBACK` 或者 `COMMIT` 都可以解锁。

## 四、锁的等待问题

假如有一个同事在 `debug` 程序，正在对数据库进行更新：

```sql
BEGIN;
SELECT * FROM testdemo WHERE id = 1 FOR UPDATE;
```

此时，我们需要进行一个共享锁：

```sql
BEGIN;

SELECT * FROM testdemo WHERE id =1 LOCK IN SHARE MODE 
```

去发现等待了，此时只能让前面那个同事进行提交或者回滚的操作才可以让我们的共享锁进行下去，而 `UNLOCK TABLES` 并不能解锁。

```sql
COMMIT; # 或者 ROLLBACK 或者 BEGIN
```

其实还有一种比较简单的方法，当发现死锁的时候，使用下面这个语句可以查询目前锁的内容：

```sql
SELECT * FROM information_schema.INNODB_LOCKS;
```

然后再用下面这个语句查看锁的队列id：

```sql
SELECT * FROM sys.innodb_lock_waits;
```

其中 `waiting_queue` 字段显示的就是当前正在等待的 `sql` 语句，接下来找到 `sql_kill_blocking_connection` 字段的值，直接运行：

```sql
KILL xxx;
```

就可以解锁了。

## 五、事务

### 1、为什么要事务

现在的很多软件都是多用户，多程序，多线程的，对同一个表可能同时有很多人在用，为保持数据的一致性，所以提出了事务的概念。

A 给 B 要划钱，A 的账户 -1000 元， B 的账户就要 +1000 元，这两个 `update` 语句必须作为一个整体来执行，不然 A 扣钱了，B 没有加钱这种情况很难处理。

### 2、什么存储引擎支持事务

只有 `InnoDB` 的引擎支持事务。

* 查看数据库下面是否支持事务（`InnoDB` 支持）？

```sql
show engines;
```

* 查看 `mysql` 当前默认的存储引擎？

```sql
show variables like '%storage_engine%';
```

* 查看某张表的存储引擎？

```sql
show create table 表名;
```

* 对于表的存储结构的修改？

建立 `InnoDB` 表：`CREATE TABLE xxx type = InnoDB；`。或者修改引擎： `Alter table xxx type = InnoDB;`

### 3、事务特性

事务应该具有 4 个属性：原子性、一致性、隔离性、持久性。这四个属性通常称为 `ACID` 特性。

#### (1) 原子性（atomicity）

一个事务必须被视为一个不可分割的最小单元，整个事务中的所有操作要么全部提交成功，要么全部失败，对于一个事务来说，不可能只执行其中的一部分操作。

例如：

老婆大人给 Deer 老师发生活费

1. 老婆大人工资卡扣除 500 元
2. Deer 老师工资卡增加 500

整个事务要么全部成功，要么全部失败。

#### (2) 一致性（consistency）

一致性是指事务将数据库从一种一致性转换到另外一种一致性状态，在事务开始之前和事务结束之后数据库中数据的完整性没有被破坏。

例如：

老婆大人给 Deer 老师发生活费

1. 老婆大人工资卡扣除 500 元
2. Deer 老师工资卡增加 500
3. Deer 老师工资卡增加 1000

扣除的钱（-500） 与增加的钱（500） 相加应该为 0

#### (3) 持久性（durability）

一旦事务提交，则其所做的修改就会永久保存到数据库中。此时即使系统崩溃，已经提交的修改数据也不会丢失。但这并不是数据库的角度完全能解决的。

#### (4) 隔离性（isolation）

一个事务的执行不能被其他事务干扰。即一个事务内部的操作及使用的数据对并发的其他事务是隔离的，并发执行的各个事务之间不能互相干扰。（对数据库的并行执行，应该像串行执行一样）

* 未提交读（READ UNCOMMITED）脏读
* 已提交读（READ COMMITED）不可重复读
* 可重复读（REPEATABLE READ）
* 可串行化（SERIALIZABLE）

`mysql` 默认的事务隔离级别为 `repeatable-read`

使用这个语句可以查询：

```sql
SHOW VARIABLES LIKE '%tx_isolation%';
```

事务并发问题：

* 脏读

事务 A 读取了事务 B 更新的数据，然后 B 回滚操作，那么 A 读取到的数据是脏数据

* 不可重复读

事务 A 多次读取同一数据，事务 B 在事务 A 多次读取的过程中，对数据作了更新并提交，导致事务 A 多次读取同一数据时，结果不一致。

* 幻读

系统管理员 A 将数据库中所有学生的成绩从具体分数改为 ABCDE 等级，但是系统管理员 B 就在这个时候插入了一条具体分数的记录，当系统管理员 A 改结束后发现还有一条记录没有改过来，就好像发生了幻觉一样，这就叫幻读。

下面举例说明。

##### 未提交读（READ UNCOMMITED）

首先来看脏读。

新建两个会话，都修改当前会话默认隔离级别为： `READ UNCOMMITTED`：

```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

两个会话都开启事务：

```sql
BEGIN;
```

`account` 表此时的数据是这样子的：

```sql
id  name    balance
1	lilei	900
2	hanmei	100
3	lucy	250
5	tom	    0
```

第一个会话修改记录：

```sql
UPDATE account set balance = balance - 50 WHERE id = 1;
```

此时，这条记录的值变为了 850，第一个会话还未提交，第二个会话中读取：

```sql
SELECT * FROM account WHERE id = 1;
```

居然也读到了 850的值，但是实际上第一个会话还没有提交。这就是脏读。

##### 已提交读（READ COMMITTED）

接下来看不可重复读。

新建两个会话，都设置隔离级别为 `READ COMMITTED`：

```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

`account` 表此时的数据是这样子的：

```sql
id  name    balance
1	lilei	900
2	hanmei	100
3	lucy	250
5	tom	    0
```

在第一个会话中修改记录：

```sql
UPDATE account set balance = balance - 50 WHERE id = 1;
```

此时，这条记录的值变为了 850。第一个会话还未提交时在第二个会话中读取该条记录的值仍是 900，这解决了脏读的问题。

此时，第一个会话进行提交 `COMMIT`，然后第二个会话查询，值变为了 850，说明第二个会话两次读取的值不一样，这就是不可重复读。

##### 可重复读（REPEATABLE READ）

再看可重复读：

新建两个会话，使用默认的隔离级别 `REPEATABLE READ`，都开启事务。

`account` 表此时的数据是这样子的：

```sql
id  name    balance
1	lilei	900
2	hanmei	100
3	lucy	250
5	tom	    0
```

在第一个会话中修改记录：

```sql
UPDATE account set balance = balance - 50 WHERE id = 1;
```

然后第一个会话提交记录。此时这条记录改为 850并提交了。此时到第二个会话中查询值仍然是900，也就是说第一个会话提交的数据，第二个会话并没有读取到。这就叫做可重复读。第二个会话提交后在读取，才能读取到850的值。

##### 可串行化（SERIALIZABLE）

接着看看可串行化。

幻读代表当前会话已经读取到了一定的数据量，由于另一回话进行了新增或删除导致当前会话再次读取的时候数据量不同。

新建两个会话，都修改当前会话默认隔离级别为： `SERIALIZABLE`：

```sql
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

两个会话都开启事务：

```sql
BEGIN;
```

`account` 表此时的数据是这样子的：

```sql
id  name    balance
1	lilei	900
2	hanmei	100
3	lucy	250
5	tom	    0
```

第一个进行新增操作：

```sql
INSERT account VALUE(100, 'jerrr', 1000);
```

发现被卡主了。

只有当第二个会话进行 `COMMIT` 后，第一个会话的新增操作才可以进行下去。

这说明可序列化解决了幻读的问题，它采用了锁表的机制。

总结：

| 事务隔离级别  | 脏读 | 不可重复读 | 幻读 |
| --- | --- | --- | --- |
| 未提交读（READ UNCOMMITED） | 是  | 是     | 是  |
| 已提交读（READ COMMITED）   | 否  | 是     | 是  |
| 可重复读（REPEATABLE READ） | 否  | 否     | 是 / MySQL否  |
| 可串行化（SERIALIZABLE）    | 否  | 否     | 否  |

##### 间隙所（gap锁）

###### 测试1

创建表并插入数据：

```sql
CREATE TABLE t_lock_1 ( a INT PRIMARY KEY );
INSERT t_lock_1 VALUES	( 10 ),	( 11 ),	( 13 ),	( 20 ),	( 40 );
```

开启事务并上锁：

```sql
BEGIN;

SELECT * FROM t_lock_1 WHERE a <= 13 FOR UPDATE;
```

在另一个会话中进行开启事务并插入：

```sql
BEGIN;

INSERT t_lock_1 VALUES(0);
```

发现被锁住了。因为插入值 0 是小于等于 13的。

仍然在另一个会话中先插入一条 21 的记录：

```sql
INSERT t_lock_1 VALUES(21);
```

发现可以插入成功，接着插入一条 19 的记录：

```sql
INSERT t_lock_1 VALUES(19);
```

发现被锁住了。这是为什么呢？

原来再第一个会话中在对主键 `a` 上锁的时候，表中的数据是 10、11、13、20、40，它会从小到大开始，先从 10 开始上锁，然后发现满足条件，再对 11 上锁，也满足条件，然后是 13 上锁，也满足条件，然后对 20 上锁，发现不满足条件，后面的40就不上锁了，所以在第二个会话中 插入 21 的时候因为没有上锁，所以可以插入，但是 19 却不行了。

###### 测试2

创建表并插入数据：

```sql
CREATE TABLE t_lock_2 (	a INT PRIMARY KEY,	b INT,KEY ( b ));

INSERT INTO t_lock_2 VALUES	( 1, 1 ),( 3,	1 ),(5,	3 ),(8,	6 ),(10, 8);
```

表字段 `a` 是主键，字段 `b` 有一个索引。

此时的表数据是这样子的：

```sql
a   b
1  	1
3  	1
5	3
8	6
10	8
```

开启一个会话，并加锁：

```sql
BEGIN
SELECT * FROM t_lock_2 WHERE b=3 FOR UPDATE;
```

```sql
a   b
1  	1
3  	1
5	3  # 加锁的是这条数据
8	6
10	8
```

另开一个会话：

```sql
BEGIN;

 # 因为数据(5, 3)被锁，不能加锁
SELECT * FROM t_lock_2 WHERE a = 5 LOCK IN SHARE MODE;

# 被锁，已经锁的字段 b 是 3 ，但是 2 在 1 和 3 之间的也被锁了 
INSERT t_lock_2 VALUE(4, 2); 

# 被锁，已经锁的字段 b 是 3 ，但是 5 在 3 和 6 之间的也被锁了 
INSERT t_lock_2 VALUE(6, 5); 

# 可以插入成功
INSERT t_lock_2 VALUE(2, 0);

# 可以插入成功
INSERT t_lock_2 VALUE(6, 7);

# 可以
INSERT t_lock_2 VALUE(9, 6);

# 可以
INSERT t_lock_2 VALUE(7, 6);
```

## 六、事务语法

### 1、开启事务

* begin
* START TRANSACTION（推荐）
* begin work

### 2、事务回滚 

rollback

### 3、事务提交

commit

### 4、还原点 

savepoint

首先看系统中自动提交是开启的：

```sql
show variables like '%autocommit%';
```

设置自动提交为0：

```sql
set autocommit=0;
```

开启事务

```sql
insert into testdemo values(5,5,5);
savepoint s1;
insert into testdemo values(6,6,6);
savepoint s2;
insert into testdemo values(7,7,7);
savepoint s3;
rollback to savepoint s2
rollback
```

插入第一条数据(5,5,5)后保存存储点1，插第二条数据(6,6,6)后保存存储点2，插入第三条数据(7,7,7)后保存存储点3，然后还原到存储点二，也就是没有了数据(7,7,7)，最后全部回滚。

<Valine></Valine>