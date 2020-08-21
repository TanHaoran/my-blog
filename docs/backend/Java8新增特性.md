# Java8新增特性

<Counter :path="'backend'" :name="'Java8新增特性'"></Counter>

## 一、Lambda表达式

### 1、基础语法

`Java8` 中引入了一个新的操作符 `->`，该操作符成为箭头操作符或者 `Lambda` 操作符，箭头操作符将 `Lambda` 表达是拆分成两部分。

左侧：`Lambda` 表达式的参数列表

右侧：`Lambda` 表达式中所需要执行的功能，即 `Lambda` 体

#### (1) 无参数，无返回值

```java
    @Test
    public void test1() {
        int num = 0;
        // num 仍然和 Java 1.7 之前一样，实际上是 final 类型的，并且在下面的 Lambda 表达式中不允许改变值，不能使用 num++
        Runnable runnable = () -> System.out.println("hello" + num);
        runnable.run();
    }
```

#### (2) 有一个参数，并且无返回值

当只有一个参数的时候，左侧的括号可以省略不写。

```java
    @Test
    public void test2() {
        Consumer<String> consumer1 = x -> System.out.println(x);
        // 更简写的方式
        Consumer<String> consumer2 = System.out::println;

        consumer1.accept("consumer1");
        consumer2.accept("consumer2");
    }
```

#### (3) 有两个以上的参数，有返回值，并且 Lambda 体中有多条语句

```java
    @Test
    public void test3() {
        Comparator<Integer> comparator = (x, y) -> {
            System.out.println("hello");
            return Integer.compare(x, y);
        };
    }
```

#### (4) 有两个以上的参数，有返回值，并且 Lambda 体中只有一条语句

```java
    @Test
    public void test4() {
        Comparator<Integer> comparator1 = (x, y) -> Integer.compare(x, y);
        // 更简写的方式
        Comparator<Integer> comparator2 = Integer::compare;
    }
```

### 2、函数式接口

另外，`Lambda` 表达式左侧参数列表的数据类型可以省略不写，因为 `JVM` 可以通过上下文推断出数据类型，即“类型推荐”。如果要写则所有参数的数据类型都要写。


`Lambda` 表达式需要函数式接口的支持，若接口中只有一个抽象方法时，那么这个接口就是函数式接口，可以使用 `@FunctionalInterface` 修饰，使用这个注解可以检查这个接口是否是函数式接口。

定义一个函数式接口：

```java
@FunctionalInterface
public interface MyFunction {

    Integer getValue(Integer num);
}
```

编写一个方法进行测试：

```java
    public Integer operation(Integer num, MyFunction function) {
        return function.getValue(num);
    }

    /**
     * 对一个数进行运算
     */
    @Test
    public void test6() {
        System.out.println(operation(100, x -> x * x));
        System.out.println(operation(200, y -> y + 200));
    }
```

### 3、Lambda 表达式应用

#### (1) 例一

有这么一个员工类：

```java
public class Employee {

    private String name;

    private int age;

    private double salary;

    public Employee() {
    }

    public Employee(String name, int age, double salary) {
        this.name = name;
        this.age = age;
        this.salary = salary;
    }

    // getter、setter、toString 胜率
}
```

比较排序：

```java
    List<Employee> employeeList = Arrays.asList(
            new Employee("张三", 18, 4999.99),
            new Employee("李四", 28, 3999.99),
            new Employee("王五", 38, 2999.99),
            new Employee("赵六", 48, 1999.99)
    );

    /**
     * 先按照年龄比，年龄相同按照姓名比
     */
    @Test
    public void test1() {
        // 写法一
        Collections.sort(employeeList, (e1, e2) -> {
            if (e1.getAge() == e2.getAge()) {
                return e1.getName().compareTo(e2.getName());
            } else {
                return Integer.compare(e1.getAge(), e2.getAge());
            }
        });

        // 写法二
        employeeList.sort((e1, e2) -> {
            if (e1.getAge() == e2.getAge()) {
                return e1.getName().compareTo(e2.getName());
            } else {
                return Integer.compare(e1.getAge(), e2.getAge());
            }
        });

        employeeList.forEach(System.out::println);
    }
```

#### (2) 例二

定义一个字符串处理的函数式接口：

```java
@FunctionalInterface
public interface StringFunction {

    String getValue(String string);

}
```

应用：

```java
    /**
     * 对字符串进行处理
     *
     * @param string
     * @param function
     * @return
     */
    public String stringHandler(String string, StringFunction function) {
        return function.getValue(string);
    }

    @Test
    public void test2() {
        String text1 = stringHandler("hello", string -> string.toUpperCase());
        // 更简的写法
        String text2 = stringHandler("hello", String::toUpperCase);
        System.out.println(text1);
        System.out.println(text2);
    }
```

#### (3) 例三

定义接口：

```java
@FunctionalInterface
public interface LongFunction<T, R> {

    R getValue(T t1, T t2);
}
```

应用：

```java
    public void longHandler(Long l1, Long l2, LongFunction<Long, Long> function) {
        System.out.println(function.getValue(l1, l2));
    }

    @Test
    public void test3() {
        longHandler(100L, 200L, (x, y) -> x + y);
        // 更简写的方式
        longHandler(100L, 200L, Long::sum);
        longHandler(100L, 200L, (x, y) -> x * y);
    }
```

### 4、核心函数式接口

#### (1) `Consumer<T>`

消费型接口，方法：

```java
void accept(T t)
```

例如：

```java
    public void happy(double money, Consumer<Double> consumer) {
        consumer.accept(money);
    }

    /**
     * 消费型
     */
    @Test
    public void test1() {
        happy(10000, money -> System.out.println("消费" + money));
    }
```

#### (2) `Supplier<T>`

供给型接口，方法：

```java
T get()
```

例如：

```java
    /**
     * 产生指定个数的整数
     *
     * @param num
     * @param supplier
     * @return
     */
    public List<Integer> getNumList(int num, Supplier<Integer> supplier) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < num; i++) {
            Integer integer = supplier.get();
            list.add(integer);
        }

        return list;
    }

    /**
     * 供给型
     */
    @Test
    public void test2() {
        List<Integer> numList = getNumList(10, () -> (int) (Math.random() * 100));
        numList.forEach(System.out::println);
    }
```

#### (3) `Function<T, R>`

函数型接口，方法：

```java
R apply(T t)
```

例如：

```java
    /**
     * 字符串转大写
     *
     * @param string
     * @param function
     * @return
     */
    public String stringHandler(String string, Function<String, String> function) {
        return function.apply(string);
    }

    /**
     * 函数型
     */
    @Test
    public void test3() {
        String hello1 = stringHandler("hello", s -> s.toUpperCase());
        // 更简写的方式
        String hello2 = stringHandler("hello", String::toUpperCase);
        System.out.println(hello1);
        System.out.println(hello2);
    }
```

#### (4) `Predicate<T>`

断言型接口，方法：

```java
boolean test(T t)
```

例如：

```java
    /**
     * 满足条件的字符串放入集合中
     *
     * @param list
     * @param predicate
     * @return
     */
    public List<String> filterString(List<String> list, Predicate<String> predicate) {
        List<String> result = new ArrayList<>();

        for (String string : list) {
            if (predicate.test(string)) {
                result.add(string);
            }
        }

        return result;
    }

    /**
     * 断言型
     */
    @Test
    public void test4() {
        List<String> list = Arrays.asList("hello", "jerry", "test", "abc", "hi");

        List<String> result = filterString(list, s -> s.length() > 3);
        result.forEach(System.out::println);
    }
```

其它接口：

| 函数式接口 | 参数类型 | 返回类型 | 方法 | 用途 |
| --- | --- | --- | --- | --- |
| `BiFunction<T, U, R>` | T, U | R | R apply(T t, U u) | 对类型为 `T`，`U` 参数应用操作，返回 `R` 类型的结果 |
| `UnaryOperator<T>` （Function 子接口） | T | T | T apply(T t) | 对类型为 `T` 的对象进行一元运算，并返回 `T` 类型的结果 | 
| `BinaryOperator<T>` （Bifunction 子接口 | T, T | T | T apply(T t1, T t2) | 对类型为 `T` 的对象进行二元运算，并返回 `T` 类型的结果 |
| `BiConsumer<T, U>` | T, U | void | void accept(T t, U u) | 对类型为 `T`，`U` 的参数应用操作 |
| `ToIntFunction<T>` <br> `ToLongFunction<T>` <br> `ToDoubleFunction<T>` | T | int <br> long <br> double | int applyAsInt(T value) <br> long applyAsLong(T value) <br> double applyAsDouble(T value) | 分别计算 `int`、`long`、`double` 值的函数 |
| `IntFunction<R>` <br> `LongFunction<R>` <br> `DoubleFunction<R>` | int <br> long <br> double | R | R apply(int value) <br> R getValue(T t1, T t2) <br> R apply(double value) | 参数分别为 `int`、`long`、`double` 类型的函数 |

### 5、方法引用与构造器引用

#### (1) 方法引用

若 `Lanbda` 体中的内容有方法已经实现了，我们可以使用“方法引用”，可以理解为方法引用是 `Lambda` 表达式的另外一种表现形式。

注意：

1. `Lambda` 体中调用方法的参数列表与返回值类型，要与函数式接口中抽象方法的函数列表和返回类型保持一致。
2. 若 `Lambda` 参数列表中的第一个参数是实例方法的调用者，第二个参数是实例方法的参数时，可以使用 `类::静态方法名`

##### 对象::实例方法名

```java
    /**
     * 对象::实例方法名
     */
    @Test
    public void test1() {
        Consumer<String> consumer1 = x -> System.out.println(x);
        // 方法引用写法
        Consumer<String> consumer2 = System.out::println;

        consumer1.accept("hello");
        consumer2.accept("hello");
    }

    /**
     * 对象::实例方法名
     */
    @Test
    public void test2() {
        Employee employee = new Employee();
        employee.setName("jerry");

        Supplier<String> supplier1 = () -> employee.getName();
        // 方法引用写法
        Supplier<String> supplier2 = employee::getName;

        System.out.println(supplier1.get());
        System.out.println(supplier2.get());
    }
```

##### 类::静态方法名

```java
    /**
     * 类::静态方法名
     */
    @Test
    public void test3() {
        Comparator<Integer> comparator1 = (x, y) -> Integer.compare(x, y);
        // 方法引用写法
        Comparator<Integer> comparator2 = Integer::compare;
    }
```

##### 类::实例方法名

```java
    /**
     * 类::实例方法名
     */
    @Test
    public void test4() {
        BiPredicate<String, String> biPredicate1 = (x, y) -> x.equals(y);
        // 方法引用写法
        BiPredicate<String, String> biPredicate2 = String::equals;
     }
```

#### (2) 构造器引用

注意：

构造方法的参数类型和顺序也要和接口中的参数数据类型和顺序保持一致。

##### 类名::new

```java
    /**
     * 类名::new
     */
    @Test
    public void test5() {
        Supplier<Employee> supplier1 = () -> new Employee();
        // 方法引用写法
        Supplier<Employee> supplier2 = Employee::new;
    }
```

因为 `Lambda` 体的参数列表要和函数式接口的参数列表保持一致，所以这里调用的是 `Employee` 无参的构造方法


给 `Employee` 新增两个构造方法：

```java
    public Employee(String name) {
        this.name = name;
    }

    public Employee(String name, int age) {
        this.name = name;
        this.age = age;
    }
```

那么下面这个：

```java
    /**
     * 类名::new
     */
    @Test
    public void test6() {
        Function<String, Employee> function1 = name -> new Employee();
        // 方法引用写法
        Function<String, Employee> function2 = Employee::new;
    }
```

调用的就是 `Employee` 一个参数的构造方法。

而下面这个：

```java
    @Test
    public void test7() {
        BiFunction<String, Integer, Employee> biFunction1 = (name, age) -> new Employee();
        // 方法引用写法
        BiFunction<String, Integer, Employee> biFunction2 = Employee::new;
    }
```

调用的就是 `Employee` 两个参数的构造方法。

#### (3) 数组引用

##### Type::new

```java
    /**
     * Type::new
     */
    @Test
    public void test8() {
        Function<Integer, String[]> function1 = x -> new String[x];
        // 方法引用写法
        Function<Integer, String[]> function2 = String[]::new;

        String[] strings1 = function1.apply(10);
        String[] strings2 = function2.apply(20);

        System.out.println(strings1.length);
        System.out.println(strings2.length);
    }
```

## 二、Stream API

`Stream API` 是 `Java 8` 中处理集合的关键抽象概念，它可以指定你希望对集合进行的操作，可以执行非常复杂的查找、过滤和映射数据等操作。使用 `Stream API` 对集合数据进行操作，就类似于使用 `SQL` 执行的数据库查询。也可以使用 `Stream API` 来并行执行操作。简而言之，`Stream API` 提供了一种高效且易于使用的处理数据的方式。

`Stream` 是数据渠道，用于操作数据源（集合、数组等）锁生成的元素序列。“集合讲的是数据，流讲的是计算”。

注意：
1. `Stream` 自己不会存储元素。
2. `Stream` 不会改变源对象。相反，它会返回一个持有结果的新 `Stream` 。
3. `Stream` 操作是延迟执行的。这意味着它会等待需要结果的时候才执行。

`Stream` 的3个操作步骤

1. 创建 `Stream` 

一个数据源（如：集合、数组），获取一个流。

2. 中间操作

一个中间操作链，对数据源的数据进行处理。

3. 终止操作（终端操作）

一个终止操作，执行中间操作链，并产生结果。

### 1、创建Stream

#### (1) 通过 Collection 系列集合提供的 stream() 或 parallelStream()

```java
        List<String> list = new ArrayList<>();
        Stream<String> stream1 = list.stream();
```

#### (2) 通过 Arrays 中的静态方法 stream()

```java
        Employee[] employees = new Employee[10];
        Arrays.stream(employees);
```

#### (3) 通过 Stream 类的静态方法 of()

```java
        Stream<String> stream3 = Stream.of("aa", "bb", "cc");
```

#### (4) 创建无限流

##### 迭代方式

```java
        Stream<Integer> stream4 = Stream.iterate(0, x -> x + 2);
        // 产生无限个
        stream4.forEach(System.out::println);
        // 产生前10个
        stream4.limit(4).forEach(System.out::println);
```

##### 生成方式

```java
        Stream<Double> stream5 = Stream.generate(Math::random);
        // 产生无限个
        // stream5.generate(Math::random).forEach(System.out::println);
        // 产生前5个
        stream5.limit(5).forEach(System.out::println);
```

### 2、中间操作

多个中间操作可以连接起来形成一个流水线，除非流水线上出发终止操作，否则中间操作不会执行任何的处理。在终止操作时一次性全部处理，这称为“惰性求值”。

`Stream API` 可以通过终止操作将流一个个迭代出来，这叫做“内部迭代”。

#### (1) 筛选与切片

* filter(Predicate p)

假设有这么些数据：

```java
    List<Employee> employeeList = Arrays.asList(
            new Employee("张三", 18, 4999.99),
            new Employee("李四", 28, 3999.99),
            new Employee("王五", 38, 2999.99),
            new Employee("赵六", 48, 1999.99),
            new Employee("张三", 18, 4999.99),
            new Employee("李四", 28, 3999.99)
    );
```

接收 `Lambda`，从流中排除某些元素

```java
        // 中间操作
        Stream<Employee> stream = employeeList.stream().filter(employee -> employee.getAge() > 30);
        // 终止操作
        stream.forEach(System.out::println);
```

执行结果：

```console
Employee{name='王五', age=38, salary=2999.99}
Employee{name='赵六', age=48, salary=1999.99}
```

* limit(long maxSize)

截断流，使其元素不超过给定数量

```java
        Stream<Employee> stream = employeeList.stream().filter(employee -> employee.getAge() < 40).limit(2);
        stream.forEach(System.out::println);

        System.out.println("-----------");

        Stream<Employee> stream2 = employeeList.stream().filter(employee -> {
            System.out.println("短路");
            return employee.getAge() < 40;
        }).limit(2);
        stream2.forEach(System.out::println);
```

执行结果：

```console
Employee{name='张三', age=18, salary=4999.99}
Employee{name='李四', age=28, salary=3999.99}
-----------
短路
Employee{name='张三', age=18, salary=4999.99}
短路
Employee{name='李四', age=28, salary=3999.99}
```

通过 `stream2` 的输出可以看出，当使用 `limit(2)` 查找出2个元素后，`filter()` 就停止执行了，这称为“短路”，也可以提高性能。

* skip(long n)

跳过元素，返回一个扔掉了前 `n` 个元素的流。若流中元素不足 `n` 个，则返回一个空流。与 `limit(n)` 互补

```java
        Stream<Employee> stream = employeeList.stream().filter(employee -> employee.getAge() < 40).skip(2);
        stream.forEach(System.out::println);
```

执行结果：

```console
Employee{name='王五', age=38, salary=2999.99}
Employee{name='张三', age=18, salary=4999.99}
Employee{name='李四', age=28, salary=3999.99}
```

* distinct()

筛选，通过流所生成元素的 `hashCode()` 和 `equals()` 去除重复元素。

重写 `Employee` 的两个方法：

```java
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return age == employee.age &&
                Double.compare(employee.salary, salary) == 0 &&
                Objects.equals(name, employee.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age, salary);
    }
```

测试：

```java
        Stream<Employee> stream = employeeList.stream().distinct();
        stream.forEach(System.out::println);
```

结果：

```console
Employee{name='张三', age=18, salary=4999.99}
Employee{name='李四', age=28, salary=3999.99}
Employee{name='王五', age=38, salary=2999.99}
Employee{name='赵六', age=48, salary=1999.99}
```

#### (2) 映射

* map

接受 `Lambda`，将元素转换成其他形式货提取信息。接受一个函数作为参数，该函数会被应用到每个元素上，并将其映射成一个新的元素。

```java
    /**
     * map
     */
    @Test
    public void test5() {
        List<String> list = Arrays.asList("aaa", "bbb", "ccc", "ddd");
        list.stream().map(String::toUpperCase).forEach(System.out::println);

        System.out.println("-----------");

        employeeList.stream().map(Employee::getName).forEach(System.out::println);
    }
```

流里面还可以保存流：

```java
    /**
     * 字符串转换成流
     */
    private Stream<Character> filterCharacter(String string) {
        List<Character> list = new ArrayList<>();
        for (Character c : string.toCharArray()) {
            list.add(c);
        }

        return list.stream();
    }

    @Test
    public void test6() {
        List<String> list = Arrays.asList("aaa", "bbb", "ccc", "ddd");
        // 这一步将流进一步转换成流
        Stream<Stream<Character>> streamStream = list.stream().map(this::filterCharacter);
        streamStream.forEach(characterStream -> characterStream.forEach(System.out::println));
    }
```

* flatMap

接受一个函数作为参数，将流中每个值都换成另一个流，然后把所有流连接成一个流。

#### (3) 排序

* sorted()

自然排序

```java
    /**
     * sorted() 自然排序
     */
    @Test
    public void test8() {
        List<String> list = Arrays.asList("aaa", "bbb", "ccc", "ddd");
        list.stream().sorted().forEach(System.out::println);
    }
```

* sorted(Comparator comparator)

定制排序

```java
    /**
     * sorted(Comparator comparator) 定制排序
     */
    @Test
    public void test9() {
        employeeList.stream().sorted((e1, e2) -> {
            if (e1.getAge() == e2.getAge()) {
                return e1.getName().compareTo(e2.getName());
            } else {
                return Integer.compare(e1.getAge(), e2.getAge());
            }
        }).forEach(System.out::println);
    }
```

### 3、终止操作

首先给上面的 `Employee` 类新增一个属性 `status`，这是一个枚举：

```java
    private Status status;

    public enum Status {
        FREE,
        BUSY,
        VOCATION;
    }
```

设置 `getter`、`setter` 方法，同时修改之前的 `toString()`、`hashCode()` 和 `equals()` 方法，并生成新的全参构造方法。

假设有这样子的集合：

```java
    private List<Employee> employeeList = Arrays.asList(
            new Employee("张三", 18, 4999.99, Employee.Status.FREE),
            new Employee("李四", 28, 3999.99, Employee.Status.BUSY),
            new Employee("王五", 38, 2999.99, Employee.Status.VOCATION),
            new Employee("赵六", 48, 1999.99, Employee.Status.FREE),
            new Employee("张三", 18, 4999.99, Employee.Status.FREE)
    );
```

#### (1) 查找与匹配

* allMath

检查是否匹配所有元素

```java
    /**
     * allMatch
     */
    @Test
    public void test1() {
        boolean b = employeeList.stream().allMatch(employee -> employee.getStatus().equals(Employee.Status.BUSY));
        System.out.println(b);
    }
```

* anyMatch

检查是否至少匹配一个元素

```java
    /**
     * anyMatch
     */
    @Test
    public void test2() {
        boolean b = employeeList.stream().anyMatch(employee -> employee.getStatus().equals(Employee.Status.VOCATION));
        System.out.println(b);
    }
```

* noneMatch

检查是否没有匹配所有元素

```java
    /**
     * noneMatch
     */
    @Test
    public void test3() {
        boolean b = employeeList.stream().noneMatch(employee -> employee.getStatus().equals(Employee.Status.FREE));
        System.out.println(b);
    }
```

* findFirst

返回第一个元素

```java
    /**
     * findFirst 获取工资最高的员工信息
     */
    @Test
    public void test4() {
        Optional<Employee> optional = employeeList.stream()
                .sorted((e1, e2) -> -Double.compare(e1.getSalary(), e2.getSalary())).findFirst();
        System.out.println(optional.get());
    }
```

* findAny

返回当前流中的任意元素

```java
    /**
     * findAny 获取状态是 FREE 的员工
     */
    @Test
    public void test5() {
        // 串行
        Optional<Employee> optional1 = employeeList.stream()
                .filter(employee -> employee.getStatus().equals(Employee.Status.FREE)).findAny();
        System.out.println(optional1.get());

        System.out.println("------------");

        // 并行
        Optional<Employee> optional2 = employeeList.parallelStream()
                .filter(employee -> employee.getStatus().equals(Employee.Status.FREE)).findAny();
        System.out.println(optional2.get());
    }
```

使用 `parallelStream()` 意味着开多个并行的流进行查找，第一个查找出来后就停止。

* count

返回流中元素的总个数

```java
    /**
     * count
     */
    @Test
    public void test6() {
        long count = employeeList.stream().count();
        System.out.println(count);
    }
```

* max

返回流中最大值

```java
    /**
     * max 获取工资最高的员工信息
     */
    @Test
    public void test7() {
        Optional<Employee> optional = employeeList.stream().max(Comparator.comparingDouble(Employee::getSalary));
        System.out.println(optional.get());
    }
```

* min

返回流中最小值

```java
    /**
     * min 获取员工中年龄最小的年龄值
     */
    @Test
    public void test8() {
        Optional<Integer> optional = employeeList.stream().map(Employee::getAge).min(Integer::compare);
        System.out.println(optional.get());
    }
```

#### (2) 规约

* reduce(T identity, BinaryOperator operator) / reduce(BinaryOperator operator)

可以将流中元素反复结合起来，得到一个值

```java
    /**
     * reduce
     */
    @Test
    public void test9() {
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        Integer sum = list.stream().reduce(0, Integer::sum);
        System.out.println(sum);

        // 获取所有人的工资
        Optional<Double> optional = employeeList.stream().map(Employee::getSalary).reduce(Double::sum);
        System.out.println(optional.get());
    }
```

`reduce` 操作相当于将给定序号的元素和下一个元素进行操作，操作结果再和下一个元素进行操作，直到操作完所有数据。

上面的计算总和的时候因为给定了初始索引，结果肯定不为空；而下面的计算由于没有给定初始索引，直接计算总和有可能为空，故返回值是 `Optional`。

`map` 和 `reduce` 的连接通常称为 `map-recude` 模式

#### (3) 收集

* collect 

将流转换为其他形式。接受一个 `Collector` 接口的实现，用于给 `Stream` 中元素做汇总的方法。

`Collector` 接口中方法的实现决定了如何对流执行收集操作（如收集到 `List`、`Set`、`Map`）。但是 `Collectors` 类提供了很多静态方法，可以方便的创建常见收集器实例。

```java
    /**
     * Collect
     */
    @Test
    public void test10() {
        // 姓名集合
        List<String> list = employeeList.stream().map(Employee::getName).collect(Collectors.toList());
        list.forEach(System.out::println);

        System.out.println("------------");

        // 姓名去重集合 Set
        Set<String> set = employeeList.stream().map(Employee::getName).collect(Collectors.toSet());
        set.forEach(System.out::println);

        System.out.println("------------");

        // 姓名去重集合 HashSet
        Set<String> hashSet = employeeList.stream().map(Employee::getName).collect(Collectors.toCollection(HashSet::new));
        hashSet.forEach(System.out::println);

        System.out.println("------------");

        // 总数
        Long count = employeeList.stream().collect(Collectors.counting());
        System.out.println(count);

        // 工资平均值
        Double average = employeeList.stream().collect(Collectors.averagingDouble(Employee::getSalary));
        System.out.println(average);

        // 工资求总和
        Double sum = employeeList.stream().collect(Collectors.summingDouble(Employee::getSalary));

        // 工资最大的员工信息
        Optional<Employee> maxEmployee = employeeList.stream()
                .collect(Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary)));
        System.out.println(maxEmployee.get());

        // 工资最小值的员工信息
        Optional<Employee> minEmployee = employeeList.stream()
                .collect(Collectors.minBy(Comparator.comparingDouble(Employee::getSalary)));
        System.out.println(minEmployee.get());
    }
```

还可以进行分组操作：

```java
    /**
     * 分组 groupingBy
     */
    @Test
    public void test11() {
        // 按照状态分组
        Map<Employee.Status, List<Employee>> map = employeeList.stream()
                .collect(Collectors.groupingBy(Employee::getStatus));
        System.out.println(map);

        // 多级分组
        Map<Employee.Status, Map<String, List<Employee>>> map2 = employeeList.stream()
                .collect(Collectors.groupingBy(Employee::getStatus,
                        Collectors.groupingBy(employee -> {
                            if (employee.getAge() <= 35) {
                                return "青年";
                            } else if (employee.getAge() <= 50) {
                                return "中年";
                            } else {
                                return "老年";
                            }
                        })));
        System.out.println(map2);
    }
```

分区操作：

```java
    /**
     * 分区 partitioningBy
     */
    @Test
    public void test12() {
        Map<Boolean, List<Employee>> map = employeeList.stream()
                .collect(Collectors.partitioningBy(employee -> employee.getSalary() > 8000));
        System.out.println(map);
    }
```

统计操作：

```java
    /**
     * 统计
     */
    @Test
    public void test13() {
        DoubleSummaryStatistics statistics = employeeList.stream()
                .collect(Collectors.summarizingDouble(Employee::getSalary));
        System.out.println(statistics.getSum());
        System.out.println(statistics.getAverage());
        System.out.println(statistics.getMax());
        System.out.println(statistics.getMin());
        System.out.println(statistics.getCount());
    }
```

连接操作：

```java
    /**
     * 连接
     */
    @Test
    public void test14() {
        // 将所有名字连接起来
        String names = employeeList.stream()
                .map(Employee::getName)
                .collect(Collectors.joining());
        // 将所有名字用 , 作为间隔连接起来
        String names2 = employeeList.stream()
                .map(Employee::getName)
                .collect(Collectors.joining(","));
        // 将所有名字用 , 作为间隔连接起来，首位加上 ===
        String names3 = employeeList.stream()
                .map(Employee::getName)
                .collect(Collectors.joining("===", ",", "==="));

        System.out.println(names);
        System.out.println(names2);
        System.out.println(names3);
    }
```

## 三、Stream 练习

下面看几个练习：

```java
    private List<Employee> employeeList = Arrays.asList(
            new Employee("张三", 18, 4999.99, Employee.Status.FREE),
            new Employee("李四", 28, 3999.99, Employee.Status.BUSY),
            new Employee("王五", 38, 2999.99, Employee.Status.VOCATION),
            new Employee("赵六", 48, 1999.99, Employee.Status.FREE),
            new Employee("张三", 18, 4999.99, Employee.Status.FREE)
    );

    /**
     * 给定一个数字列表，如何返回一个由每个书的平方构成的列表。
     * 给定：[1,2,3,4,5]，应当返回：[1,4,9,16,15]
     */
    @Test
    public void test1() {
        Integer[] nums = {1, 2, 3, 4, 5};
        List<Integer> list = Arrays.stream(nums).map(num -> num * num).collect(Collectors.toList());
        System.out.println(list);
    }

    /**
     * 用 map 和 reduce 方法数一数流中有多少个 Employee
     */
    @Test
    public void test2() {
        Optional<Integer> count = employeeList.stream().map(employee -> 1).reduce(Integer::sum);
        System.out.println(count.get());
    }
```

已知条件：

```java
public class Trader {

    private String name;

    private String city;

    // 省略 getter、setter、toString
}
```

```java
public class Transaction {

    private Trader trader;

    private int year;

    private int value;

    // 省略 getter、setter、toString
```

初始化数据：

```java
    private List<Transaction> transactionList;

    @Before
    public void before() {
        Trader raoul = new Trader("Raoul", "Cambridge");
        Trader mario = new Trader("Mario", "Milan");
        Trader alan = new Trader("Alan", "Cambridge");
        Trader brian = new Trader("Brian", "Cambridge");

        transactionList = Arrays.asList(
                new Transaction(brian, 2011, 300),
                new Transaction(raoul, 2012, 1000),
                new Transaction(raoul, 2011, 400),
                new Transaction(mario, 2012, 710),
                new Transaction(mario, 2012, 700),
                new Transaction(alan, 2012, 950)
        );
    }
```

练习：

```java
    /**
     * 找出 2011 年发生的所有交易，并按照交易额排序（从低到高）
     */
    @Test
    public void test1() {
        transactionList.stream().filter(transaction -> transaction.getYear() == 2011)
                .sorted(Comparator.comparingInt(Transaction::getValue))
                .forEach(System.out::println);
    }

    /**
     * 交易员都在那些不同的城市工作过
     */
    @Test
    public void test2() {
        transactionList.stream().map(transaction -> transaction.getTrader().getCity())
                .distinct()
                .forEach(System.out::println);
    }

    /**
     * 查找所有来自 Cambridge 的交易员，并按照姓名排序
     */
    @Test
    public void test3() {
        transactionList.stream().filter(transaction -> transaction.getTrader().getCity().equals("Cambridge"))
                .map(Transaction::getTrader)
                .sorted(Comparator.comparing(Trader::getName))
                .distinct()
                .forEach(System.out::println);
    }

    /**
     * 字符串转换成流
     */
    private Stream<String> filterCharacter(String string) {
        List<String> list = new ArrayList<>();
        for (Character c : string.toCharArray()) {
            list.add(c.toString());
        }

        return list.stream();
    }

    /**
     * 返回所有交易员的姓名字符串，并按照字母顺序排序
     */
    @Test
    public void test4() {
        transactionList.stream().map(transaction -> transaction.getTrader().getName())
                .sorted()
                .forEach(System.out::println);

        System.out.println("------------");

        String names = transactionList.stream().map(transaction -> transaction.getTrader().getName())
                .sorted()
                .reduce("", String::concat);
        System.out.println(names);

        System.out.println("------------");

        transactionList.stream().map(transaction -> transaction.getTrader().getName())
                .flatMap(this::filterCharacter)
                .sorted(String::compareTo)
                .forEach(System.out::print);
    }

    /**
     * 有没有交易员是在 Milan 工作过的
     */
    @Test
    public void test5() {
        boolean b = transactionList.stream().anyMatch(transaction -> transaction.getTrader().getCity().equals("Milan"));
        System.out.println(b);
    }

    /**
     * 输出生活在 Cambridge 的交易员的所有交易额
     */
    @Test
    public void test6() {
        Optional<Integer> sum = transactionList.stream()
                .filter(transaction -> transaction.getTrader().getCity().equals("Cambridge"))
                .map(Transaction::getValue)
                .reduce(Integer::sum);
        System.out.println(sum.get());
    }

    /**
     * 所有交易中，最高的交易额是多少
     */
    @Test
    public void test7() {
        Optional<Integer> max = transactionList.stream().map(Transaction::getValue).max(Integer::compare);
        System.out.println(max.get());
    }

    /**
     * 找到交易额最小的交易
     */
    @Test
    public void test8() {
        Optional<Transaction> min = transactionList.stream().min(Comparator.comparingInt(Transaction::getValue));
        System.out.println(min.get());
    }
```

## 四、并行流与顺序流

并行流就是把一个内容分成多个数据块，并用不同的线程分别处理每个数据块的流。

`Java 8` 中奖并行进行了优化，可以很容易的对数据进行并行操作。`Stream API` 可以声明性的通过 `Parallel()` 与 `sequential()` 在并行流于循序流之间进行切换。

### Fork/Join 框架

在必要情况下，将一个大任务进行拆分（fork）成若干个小任务（才到不可再拆时），再将一个个小任务运算的结果进行汇总（join）。

关于这个的详细可以参考之前这篇博客：[线程的并发工具类](线程的并发工具类.html#一、fork-join) 。

使用 `Fork/Join` 框架创建一个求和的类：

```java
public class ForkJoinCalculate extends RecursiveTask<Long> {

    private static final long THRESHOLD = 10000;

    private long start;

    private long end;

    public ForkJoinCalculate(long start, long end) {
        this.start = start;
        this.end = end;
    }

    @Override
    protected Long compute() {
        long length = end - start;
        if (length <= THRESHOLD) {
            long sum = 0;
            for (long i = start; i < end; i++) {
                sum += i;
            }

            return sum;
        } else {
            long middle = (start + end) / 2;
            ForkJoinCalculate left = new ForkJoinCalculate(start, middle);
            // 拆分子任务，同时压入线程队列
            left.fork();

            ForkJoinCalculate right = new ForkJoinCalculate(middle + 1, end);
            right.fork();

            return left.join() + right.join();
        }
    }
}
```

三种求和的方式：

```java
    /**
     * 使用 ForkJoin 框架
     */
    @Test
    public void test1() {
        Instant start = Instant.now();
        ForkJoinPool pool = new ForkJoinPool();
        ForkJoinTask<Long> task = new ForkJoinCalculate(0, 1000000000L);
        Long sum = pool.invoke(task);
        System.out.println(sum);
        System.out.println("耗时：" + Duration.between(start, Instant.now()).toMillis() + "毫秒");
    }

    /**
     * 普通 for 循环
     */
    @Test
    public void test2() {
        Instant start = Instant.now();
        long sum = 0L;
        for (int i = 0; i < 1000000000L; i++) {
            sum += i;
        }
        System.out.println(sum);
        System.out.println("耗时：" + Duration.between(start, Instant.now()).toMillis() + "毫秒");
    }

    /**
     * Java 8 并行流
     */
    @Test
    public void test3() {
        Instant start = Instant.now();
        long sum = LongStream.rangeClosed(0, 1000000000L)
                .parallel()
                .reduce(0, Long::sum);
        System.out.println(sum);
        System.out.println("耗时：" + Duration.between(start, Instant.now()).toMillis() + "毫秒");
    }
```

当计算越复杂时，`ForkJoin` 和 并行流的优势就越明显。

## 五、Optional

`Optional` 是 `Java 8` 新增的一个容器类。

### 1、常用方法

* Optionalof(T t)

创建一个 `Optional` 实例

```java
    @Test
    public void test1() {
        Optional<Employee> optional = Optional.of(new Employee());
        Employee employee = optional.get();
        System.out.println(employee);
    }
```

执行结果：

```console
Employee{name='null', age=0, salary=0.0, status=null}
```

如果在构建的时候传递一个 `null`，

```java
    @Test
    public void test1() {
        Optional<Employee> optional = Optional.of(null);
        Employee employee = optional.get();
        System.out.println(employee);
    }
```

那么空指针异常就会在构建实例的时候抛出 `NullPointerException`，方便我们排查问题。

* Optional.empty()

创建一个空的 `Optional` 实例

```java
    @Test
    public void test2() {
        Optional<Employee> optional = Optional.empty();
        System.out.println(optional.get());
    }
```

将会在执行 `get()` 方法的时候抛出 `NoSuchElementException` 异常

* Optional.ofNullable(T t)

若 `t` 不为 `null，创建` `Optional` 实例，否则创建空实例

```java
    @Test
    public void test3() {
        Optional<Employee> optional = Optional.ofNullable(null);
        System.out.println(optional.get());
    }
```

如果构建了一个空的 `Optional` 实例，那么将在 `get()` 方法出抛出 `NoSuchElementException` 异常。如果构建的不是空实例，那么正常执行。

* isPresent()

判断是否包含值

```java
    @Test
    public void test4() {
        Optional<Employee> optional = Optional.ofNullable(new Employee());
        if (optional.isPresent()) {
            System.out.println(optional.get());
        }
    }
```

* orElse(T t)

如果调用对象包含值，返回该值，否则返回 `t`

```java
    @Test
    public void test5() {
        Optional<Employee> optional = Optional.ofNullable(null);
        Employee employee = optional.orElse(new Employee());
        System.out.println(employee);
    }
```

* orElseGet(Supplier s)

如果调用对象包含值，返回该值，否则返回 s 获取的值

```java
    @Test
    public void test6() {
        Optional<Employee> optional = Optional.ofNullable(null);
        Employee employee = optional.orElseGet(() -> new Employee());
        System.out.println(employee);
    }
```

* map(Function f)

如果有值对其处理，返回处理后的 `Optional，否则返回` `Optional.empty()`

```java
    @Test
    public void test7() {
        Optional<Employee> optional = Optional.ofNullable(new Employee("jerry", 20, 1000, Employee.Status.FREE));
        Optional<String> name = optional.map(Employee::getName);
        System.out.println(name.get());
    }
```

* flatMap(Function mapper)

与 `map` 类似，要求返回值必须是 `Optional`

### 2、应用

假设有这么个类：

```java
public class Man {

    private Godness godness;

    // 省略 getter、setter 等方法和构造方法
```

```java
public class Godness {

    private String name;
```

当需要从 `Man` 中获取 `Godness` 的 `name` 属性时：

```java
    public String getGodnessName(Man man) {
        return man.getGodness().getName();
    }

    @Test
    public void test9() {
        Man man = new Man();
        String name = getGodnessName(man);
        System.out.println(name);
    }
```

这么写会出现空指针的问题，为了避免空指针，需要写大量的 `if else` 判断语句。这时候就可以使用 `Optional` 来完成，重新定义 `NewMan` 类，使用 `Optional<Godness>` 作为属性值，并给定初始值：`Optional.empty()`

```java
public class NewMan {

    private Optional<Godness> godness = Optional.empty();

    // 省略 getter、setter 等方法和构造方法
```

此时，同样的查询只需要这么写就可以了：

```java
    public String getGodnessName2(Optional<NewMan> man) {
        return man.orElse(new NewMan()).getGodness().orElse(new Godness("女神")).getName();
    }
```

应用：

```java
    @Test
    public void test10() {
        // 如果为传 Optional 的空实例也可以有效的避免空指针
        Optional<NewMan> man = Optional.ofNullable(null);
        String name = getGodnessName2(man);
        System.out.println(name);

        // 正常的使用
        Optional<Godness> godness = Optional.ofNullable(new Godness("小女神"));
        Optional<NewMan> man2 = Optional.ofNullable(new NewMan(godness));
        String names = getGodnessName2(man2);
        System.out.println(names);
    }
```

## 六、接口中的默认方法与静态方法

### 1、接口中的默认方法

从 `Java 8` 开始，允许接口中有一个默认方法的实现。

若一个接口中定义了一个默认方法，而另外一个父类或接口中又定义类一个同名的方法时：
* 选择父类中的方法。如果一个父类提供了具体的实现，那么接口中具有相同名称和参数的默认方法会被忽略。
* 接口冲突。如果一个接口提供一个默认方法，而另一个接口也提供了一个具有相同名称和参数列表的方法（不管方法是否是默认方法），那么必须覆盖该方法来解决冲突。

```java
public interface MyFunction {

    default String getName() {
        return "hello";
    }
}
```

```java
public class MyClass {

    public String getName() {
        return "你好";
    }
}
```

```java
public class SubClass extends MyClass implements MyFunction {
}
```

测试：

```java
public class TestDefaultInterface {

    @Test
    public void test() {
        SubClass subClass = new SubClass();
        System.out.println(subClass.getName());
    }
}
```

运行结果：

```console
你好
```

又有一个接口也定义了相同的方法：

```java
public interface MyInterface {

    default String getName() {
        return "呵呵";
    }
}
```

此时子类继承这两个接口必须覆盖这个相同的方法：

```java
public class SubClass2 implements MyFunction, MyInterface {

    @Override
    public String getName() {
        return MyInterface.super.getName();
    }
}
```

这里演示的是子类调用了 `MyInterface` 里面的默认方法的实现。

测试：

```java
    @Test
    public void test2() {
        SubClass2 subClass2 = new SubClass2();
        System.out.println(subClass2.getName());
    }
```

运行结果：

```console
呵呵
```

### 2、接口中的静态方法

```java
public interface MyFunction {

    default String getName() {
        return "hello";
    }

    public static void show() {
        System.out.println("接口中的静态方法");
    }
}
```

应用：

```java
    @Test
    public void test3() {
        MyFunction.show();
    }
```

## 七、新时间日期API

### 1、线程安全问题

传统的时间API在多线程中使用到 `SimpleDateFormat` 的时候是会有线程安全问题的。

```java
    @Test
    public void test1() throws ExecutionException, InterruptedException {
        SimpleDateFormat format = new SimpleDateFormat("yyyyMMdd");

        Callable<Date> task = () -> format.parse("20200518");

        ExecutorService pool = Executors.newFixedThreadPool(10);

        List<Future<Date>> resultList = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            resultList.add(pool.submit(task));
        }

        for (Future<Date> future : resultList) {
            System.out.println(future.get());
        }

        pool.shutdown();
    }
```

这样一段代码在执行的时候会抛出 `java.lang.NumberFormatException` 的异常。

通常是通过 `ThreadLocal` 来解决这个问题的：

```java
public class DateFormatThreadLocal {

    public static final ThreadLocal<DateFormat> dateFormat =
            ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyyMMdd"));

    public static Date convert(String date) throws ParseException {
        return dateFormat.get().parse(date);
    }
}
```

修改：

```java
    @Test
    public void test1() throws ExecutionException, InterruptedException {
        Callable<Date> task = () -> DateFormatThreadLocal.convert("20200518");

        ExecutorService pool = Executors.newFixedThreadPool(10);

        List<Future<Date>> resultList = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            resultList.add(pool.submit(task));
        }

        for (Future<Date> future : resultList) {
            System.out.println(future.get());
        }

        pool.shutdown();
    }
```

使用新的API：

```java
    @Test
    public void test2() throws ExecutionException, InterruptedException {
        DateTimeFormatter formatter1 = DateTimeFormatter.ISO_LOCAL_DATE;
        // 自定义格式
        DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("yyyyMMdd");

        Callable<LocalDate> task = new Callable<LocalDate>() {
            @Override
            public LocalDate call() throws Exception {
                return LocalDate.parse("2020-05-18", formatter1);
            }
        };

        ExecutorService pool = Executors.newFixedThreadPool(10);

        List<Future<LocalDate>> resultList = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            resultList.add(pool.submit(task));
        }

        for (Future<LocalDate> future : resultList) {
            System.out.println(future.get());
        }

        pool.shutdown();
    }
```

### 2、本地时间与时间戳

#### (1) 本地时间

`LocalDate`、`LocalTime`、`LocalDateTime` 类的实例是不可变的对象，分别表示使用 `ISO-8601` 日历系统的日期、时间、日期时间。他们提供了简单的日期或时间，并不包含当前的时间信息，也不包含与时区相关的信息。

```java
    @Test
    public void test1() {
        LocalDateTime localDateTime1 = LocalDateTime.now();
        System.out.println(localDateTime1);

        System.out.println("------------");

        // 根据指定参数初始化
        LocalDateTime localDateTime2 = LocalDateTime.of(2020, 5, 18, 22, 12, 25);
        System.out.println(localDateTime2);

        System.out.println("------------");

        // 加2年
        LocalDateTime localDateTime3 = localDateTime2.plusYears(2);
        System.out.println(localDateTime3);

        System.out.println("------------");

        // 减2个小时
        LocalDateTime localDateTime4 = localDateTime3.minusHours(2);
        System.out.println(localDateTime4);

        System.out.println("------------");

        System.out.println(localDateTime4.getYear());
        System.out.println(localDateTime4.getMonth());
        System.out.println(localDateTime4.getMonthValue());
        System.out.println(localDateTime4.getDayOfMonth());
        System.out.println(localDateTime4.getHour());
        System.out.println(localDateTime4.getMinute());
        System.out.println(localDateTime4.getSecond());
    }
```

执行结果；

```console
2020-05-18T22:16:45.437
------------
2020-05-18T22:12:25
------------
2022-05-18T22:12:25
------------
2022-05-18T20:12:25
------------
2022
MAY
5
18
20
12
25
```

#### (2) 时间戳

`Instant` 时间戳，是以 `Unix` 元年（1970年1月1日00:00:00）到某个时间之间的毫秒值

```java
    @Test
    public void test2() {
        // 默认获取的是 UTC 时区的时间
        Instant instant1 = Instant.now();
        System.out.println(instant1);

        System.out.println("------------");

        // 带偏移量的运算
        OffsetDateTime offsetDateTime = instant1.atOffset(ZoneOffset.ofHours(8));
        System.out.println(offsetDateTime);

        System.out.println("------------");

        // 时间戳
        System.out.println(instant1.toEpochMilli());

        System.out.println("------------");

        // 加1分钟
        Instant instant2 = Instant.ofEpochSecond(60);
        System.out.println(instant2);
    }
```

执行结果：

```console
2020-05-18T14:34:24.340Z
------------
2020-05-18T22:34:24.340+08:00
------------
1589812464340
------------
1970-01-01T00:01:00Z
```

#### (3) 计算时间间隔

```java
    @Test
    public void test3() throws InterruptedException {
        LocalTime localTime1 = LocalTime.now();
        Thread.sleep(1000);
        LocalTime localTime2 = LocalTime.now();

        Duration duration1 = Duration.between(localTime1, localTime2);
        // 计算相差的秒
        System.out.println(duration1.getSeconds());

        System.out.println("------------");

        Instant instant1 = Instant.now();
        Thread.sleep(1000);
        Instant instant2 = Instant.now();
        Duration duration2 = Duration.between(instant1, instant2);

        // 计算相差的毫秒
        System.out.println(duration2.toMillis());

        System.out.println("------------");

        LocalDate localDate1 = LocalDate.now();
        LocalDate localDate2 = LocalDate.of(2010, 6, 18);
        Period period = Period.between(localDate1, localDate2);
        // 计算相差的间隔
        System.out.println(period);
        System.out.println(period.getYears());
        System.out.println(period.getMonths());
        System.out.println(period.getDays());
    }
```

执行结果；

```console
1
------------
1000
------------
P-9Y-11M
-9
-11
0
```

其中，`P-9Y-11M` 表示相差了负9年负11个月

### 3、时间校正器

* TemporalAdjuster

时间校正器。可以做这样子的操作：将日期调整到”下个周日“等操作

* TemporalAdjusters

该类通过静态犯法提供了大量的常用 `TemporalAdjuster` 的实现

```java

    @Test
    public void test4() {
        LocalDateTime localDateTime1 = LocalDateTime.now();
        System.out.println(localDateTime1);

        System.out.println("------------");

        // 将日指定为10
        LocalDateTime localDateTime2 = localDateTime1.withDayOfMonth(10);
        System.out.println(localDateTime2);

        System.out.println("------------");

        // 下一个周日
        LocalDateTime localDateTime3 = localDateTime1.with(TemporalAdjusters.next(DayOfWeek.SUNDAY));
        System.out.println(localDateTime3);

        System.out.println("------------");

        // 自定义校正器
        // 下一个工作日
        LocalDateTime localDateTime4 = localDateTime1.with(l -> {
            LocalDateTime localDateTime = (LocalDateTime) l;
            DayOfWeek dayOfWeek = localDateTime.getDayOfWeek();
            if (dayOfWeek.equals(DayOfWeek.FRIDAY)) {
                return localDateTime.plusDays(3);
            } else if (dayOfWeek.equals(DayOfWeek.SATURDAY)) {
                return localDateTime.plusDays(2);
            } else {
                return localDateTime.plusDays(1);
            }
        });
        System.out.println(localDateTime4);
    }
```

执行结果：

```console
2020-05-18T22:50:08.994
------------
2020-05-10T22:50:08.994
------------
2020-05-24T22:50:08.994
------------
2020-05-19T22:50:08.994
```

### 4、时间格式化与时间处理

* DateTimeFOrmatter

格式化时间/日期

```java
    @Test
    public void test5() {
        DateTimeFormatter formatter1 = DateTimeFormatter.ISO_DATE;
        LocalDateTime localDateTime = LocalDateTime.now();

        String dateTime1 = localDateTime.format(formatter1);
        System.out.println(dateTime1);

        System.out.println("------------");

        // 自定义时间转字符串
        DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss");
        String dateTime2 = localDateTime.format(formatter2);
        System.out.println(dateTime2);

        System.out.println("------------");

        // 字符串转时间
        LocalDateTime localDateTime3 = LocalDateTime.parse(dateTime2, formatter2);
        System.out.println(localDateTime3);
    }
```

执行结果：

```console
2020-05-19
------------
2020年05月19日 00:04:11
------------
2020-05-19T00:04:11
```

* ZonedDate、ZonedTime、ZonedDateTime

时区相关类

```java
    @Test
    public void test6() {
        // 查看所有时区
        Set<String> zoneIds = ZoneId.getAvailableZoneIds();
        zoneIds.forEach(System.out::println);
    }
```

```java
    @Test
    public void test7() {
        // 指定时区的初始化
        LocalDateTime localDateTime1 = LocalDateTime.now(ZoneId.of("America/Marigot"));
        System.out.println(localDateTime1);

        // 先创建时间，然后指定时区，最后获取带时区的时间
        LocalDateTime localDateTime2 = LocalDateTime.now(ZoneId.of("Asia/Shanghai"));
        ZonedDateTime zonedDateTime = localDateTime2.atZone(ZoneId.of("Asia/Shanghai"));
        System.out.println(zonedDateTime);
    }
```

执行结果：

```console
2020-05-18T12:09:49.807
2020-05-19T00:09:49.838+08:00[Asia/Shanghai]
```

## 八、重复注解与类型注解

### 1、重复注解

首先定义一个用于存放多个重复注解的注解：

```java
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotations {

    MyAnnotation[] value();
}
```

然后定义重复注解：

```java
@Repeatable(MyAnnotations.class)
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation {

    String value() default "annotation";
}
```

这里需要通过 `@Repeatable(MyAnnotations.class)` 来指定存放它的容器。

使用：

```java
    @MyAnnotation("hello")
    @MyAnnotation("hi")
    public void show1() {

    }

    @Test
    public void test1() throws NoSuchMethodException {
        Class<TestAnnotation> clazz  = TestAnnotation.class;
        Method method = clazz.getMethod("show1");
        MyAnnotation[] annotations = method.getAnnotationsByType(MyAnnotation.class);

        for (MyAnnotation annotation : annotations) {
            System.out.println(annotation.value());
        }
    }
```

执行结果：

```console
hello
hi
```

### 2、类型注解

给上面定义的 `MyAnnotation` 新增一个 `Target`：`TYPE_PARAMETER`

```java
@Repeatable(MyAnnotations.class)
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE, TYPE_PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation {

    String value() default "annotation";
}
```

然后就可以对方法的参数做注解了：

```java
    @MyAnnotation("hello")
    @MyAnnotation("hi")
    public void show2(@MyAnnotation("name") String name) {

    }
```

使用这一特性配合着其他框架，可以做一些编译时的异常处理，例如 `checker framework` 框架。

<Valine></Valine>