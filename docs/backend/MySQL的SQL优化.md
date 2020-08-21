# MySQL的SQL优化

<Counter :path="'backend'" :name="'MySQL的SQL优化'"></Counter>

## 一、优化策略

创建表，并插入一些数据，添加索引：

```sql
CREATE TABLE `staffs` (
	id INT PRIMARY KEY auto_increment,
	NAME VARCHAR ( 24 ) NOT NULL DEFAULT "" COMMENT '姓名',
	age INT NOT NULL DEFAULT 0 COMMENT '年龄',
	pos VARCHAR ( 20 ) NOT NULL DEFAULT "" COMMENT '职位',
add_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间' 
) charset utf8 COMMENT '员工记录表';

insert into staffs(name,age,pos,add_time) values('z3',22,'manage',now());
insert into staffs(name,age,pos,add_time) values('july',23,'dev',now());
insert into staffs(name,age,pos,add_time) values('2000',23,'dev',now());

ALTER TABLE staffs ADD INDEX idx_staffs_nameAgePos ( name, age, pos );
```

### 1、尽量全值匹配 

当建立了索引列后，能在 wherel 条件中使用索引的尽量所用。

```sql
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July'; # key_len 是 74
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July' AND age = 25; # key_len 是 78
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July' AND age = 25 AND pos = 'dev' # key_len 是 140
```

第三个查询的性能最好。

### 2、最佳左前缀法则

如果索引了多列，要遵守最左前缀法则。指的是查询从索引的最左前列开始并且不跳过索引中的列。

```sql
EXPLAIN SELECT * FROM staffs WHERE age = 25 AND pos = 'dev'; # 注意看 key 没有用到索引
EXPLAIN SELECT * FROM staffs WHERE pos = 'dev'; # 注意看 key 没有用到索引
EXPLAIN SELECT * FROM staffs WHERE name = 'July'; # 用到了索引
```

### 3、不在索引列上做任何操作

不在索引列上做任何操作（计算、函数、(自动 or 手动)类型转换），会导致索引失效而转向全表扫描

```sql
EXPLAIN SELECT * FROM staffs WHERE name = 'July'; # 用到了索引
EXPLAIN SELECT * FROM staffs WHERE left(name,4) = 'July'; # 没有用到索引
```

### 4、范围条件放最后

```sql
EXPLAIN SELECT * FROM staffs WHERE name = 'July'; # key_len 是 74
EXPLAIN SELECT * FROM staffs WHERE name = 'July' and age =22; # key_len 是 78
EXPLAIN SELECT * FROM staffs WHERE name = 'July' and age =22 and pos='manager'; # key_len 是 140
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July' and age >22 and pos='manager'; # key_len 是 78，有范围查询会导致后面的索引列全部失效
```

这里的范围条件放最后同时也是指索引的顺序和范围条件都要在最后。

### 5、覆盖索引尽量用

尽量使用覆盖索引(只访问索引的查询(索引列和查询列一致))，减少 `select *`

```sql
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July' and age =22 and pos='manager';
EXPLAIN SELECT name,age,pos FROM staffs WHERE NAME = 'July' and age =22 and pos='manager';
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July' and age >22 and pos='manager';
EXPLAIN SELECT name,age,pos FROM staffs WHERE NAME = 'July' and age >22 and pos='manager'
```

### 6、不等于要甚用

`MySQL` 在使用不等于(`!=` 或者 `<>`)的时候无法使用索引会导致全表扫描。

```sql
EXPLAIN SELECT * FROM staffs WHERE NAME = 'July'; # 用到索引
EXPLAIN SELECT * FROM staffs WHERE NAME != 'July'; # 没有用到索引
EXPLAIN SELECT * FROM staffs WHERE NAME <> 'July'; # 没有用到索引
```

如果定要需要使用不等于,请用覆盖索引

```sql
EXPLAIN SELECT name,age,pos FROM staffs WHERE NAME != 'July'; # 覆盖索引，用到了索引
EXPLAIN SELECT name,age,pos FROM staffs WHERE NAME <> 'July'; # 覆盖索引，用到了索引
```

### 7、NULL / NOT NULL 有影响

#### (1) 自定定义为 NOT NULL

在字段为 `not null` 的情况下，使用 `is null` 或 `is not null` 会导致索引失效

```sql
EXPLAIN select * from staffs where name is null; # impossible where，索引失效，没有用到索引
EXPLAIN select * from staffs where name is not null; # using where，索引失效，没有用到索引
```

解决方式：覆盖索引

```sql
EXPLAIN select name,age,pos from staffs where name is not null;
```

#### (2) 自定义为 NULL 或者不定义

重新创建一个 `staffs2` 表，唯一和 `staffs` 表不同的是，`staffs2` 表的 `name` 字段可以为空。

```slq
EXPLAIN select * from staffs2 where name is null; # 用到了索引
EXPLAIN select * from staffs2 where name is not null; # 没有用索引
```

`is not null` 的情况会导致索引失效

解决方式：覆盖索引

```sql
EXPLAIN select name,age,pos from staffs where name is not null;
```

### 8、LIKE 查询要当心

`like` 以通配符开头('%abc...')，`mysql` 索引失效会变成全表扫描的操作

```sql
EXPLAIN select * from staffs where name ='july'; # 索引生效
EXPLAIN select * from staffs where name like '%july%'; # 索引失效
EXPLAIN select * from staffs where name like '%july'; # 索引失效
EXPLAIN select * from staffs where name like 'july%'; # 索引生效
```

解决方式：覆盖索引

```sql
EXPLAIN select name,age,pos from staffs where name like '%july%';
```

### 9、字符类型加引号

```sql
EXPLAIN select * from staffs where name = 917; # 因为有类型转换，所以没有用到索引
```

解决方式：请加引号

### 10、OR 改 UNION 效率高

```sql
EXPLAIN select * from staffs where name='July' or name = 'z3'; # 索引失效
EXPLAIN select * from staffs where name='July' UNION select * from staffs where name = 'z3'; # 索引生效
```

### 葵花宝典

全值匹配我最爱，最左前缀要遵守；

带头大哥不能死，中间兄弟不能断；

索引列上少计算，范围之后全失效；

`LIKE` 百分写最右，覆盖索引不写 `*`；

不等空值还有 `OR`，索引影响要注意；

`VARCHAR` 引号不可丢， `SQL` 优化有诀窍。

## 二、INSERT 语句优化

* 提交前关闭自动提交
* 尽量使用批量 `INSERT` 语句
* 可以使用 `MyISAM` 存储引擎

## 三、LOAD DATA INFLIE

使用 `LOAD DATA INFLIE` ,比一般的 `insert` 语句快20倍

使用 

```sql
select * into OUTFILE 'D:\\product.txt' from product_info
```

将数据导入到文件中，然后使用

```sql
load data INFILE 'D:\\product.txt' into table product_info
```

将文件插入数据库

```sql
SHOW VARIABLES LIKE 'secure_file_priv'
```

如果值为 `null`，表示限制 `MySQL` 不允许导入或导出

如果值为 `/tmp`，表示限制 `MySQL` 只能在 `/tmp` 目录中执行导入导出，其它目录不能执行

如果没有值时，表示不限制 `MySQL`，可以在任意目录导入导出。

可以直接修改 `my.ini` 文件，添加：`secure_file_priv=''`。

<Valine></Valine> 