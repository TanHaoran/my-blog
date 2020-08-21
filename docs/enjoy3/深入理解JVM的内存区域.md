# 深入理解JVM的内存区域

<Counter :path="'enjoy3'" :name="'深入理解JVM的内存区域'"></Counter>

## 一、深入理解运行时数据区

看如下代码：

```java
public class JVMObject {
    public final static String MAN_TYPE = "man"; // 常量
    public static String WOMAN_TYPE = "woman";  // 静态变量
    public static void  main(String[] args)throws Exception {
        Teacher T1 = new Teacher();
        T1.setName("Mark");
        T1.setSexType(MAN_TYPE);
        T1.setAge(36);
        Teacher T2 = new Teacher();
        T2.setName("King");
        T2.setSexType(MAN_TYPE);
        T2.setAge(18);
        Thread.sleep(Integer.MAX_VALUE);//线程休眠
    }
}

class Teacher{
    String name;
    String sexType;
    int age;

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getSexType() {
        return sexType;
    }
    public void setSexType(String sexType) {
        this.sexType = sexType;
    }
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
}
```

运行流程如下：
1. `JVM` 向操作系统申请内存：`JVM` 第一步就是通过配置参数或者默认配置参数向操作系统申请内存空间，根据内存大小找到具体的内存分配表，然后把内存段的起始地址和终止地址分配给 `JVM`，接下来 `JVM` 就进行内部分配。
2. `JVM` 获得内存空间后，会根据配置参数分配 `堆`、`栈` 以及 `方法区` 的内存大小。运行上述代码的参数：`-Xms30m -Xmx30m -Xss1m -XX:MaxMetaspaceSize=30m`，设置 `堆` 大小为 30m，`虚拟机栈` 大小为 1m，`元空间` 最大为 30m。
3. 类加载：这里主要是把 `class` 放入方法区、还有 `class` 中的 `静态变量` 和 `常量` 也要放入 `方法区`。
4. 执行方法及创建对象：启动 `main` 线程，执行 `main()` 方法，开始执行第一行代码。此时堆内存中会创建一个 `T1` 对象，对象引用 `T1` 就存放在栈中。后续代码中遇到 `new` 关键字，会再创建一个 `T2` 对象，对象引用 `T2` 就存放在栈中。

![运行流程](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm3.png)

总结：

`JVM` 在操作系统上启动，申请内存，先进行 `运行时数据区` 的初始化，然后把类加载到 `方法区`，最后执行方法。

方法的执行和退出过程在内存上的体现上就是 `虚拟机栈` 中栈帧的入栈和出栈。同时在方法的执行过程中创建的对象一般情况下都是放在堆中，最后堆中的对象也是需要进行垃圾回收清理的。

## 二、从底层深入理解运行时数据区

### 1、堆空间分代划分

`堆` 被划分为 `新生代` 和 `老年代`（`Tenured`），`新生代` 又被进一步划分为 `Eden` 和 `Survivor` 区，最后 `Survivor` 由 `From Survivor` 和 `To Survivor` 组成。

如下图所示：

![堆空间分代划分](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm4.png)

### 2、GC 概念

`GC` - `Garbage Collection` 垃圾回收，在 `JVM` 中是自动化的垃圾回收机制，一般不用去关注，在 `JVM` 中 `GC` 的重要区域是 `堆` 空间。

可以通过一些额外方式主动发起它，比如 `System.gc()` 主动发起，但项目中切记不要使用。

### 3、JHSDB 工具

`JHSDB` 是一款基于服务性代理实现的进程外调试工具。服务性代理是 `HotSpot` 虚拟机中一组用于映射 `Java 虚拟机` 运行信息的，主要基于 `Java` 语言实现的 `API` 集合。

#### (1) JDK 1.8 的开启方式

`JDK1.8` 启动 `JHSDB` 的时候必须将 `sawindbg.dll`（一般会在 `JDK` 的目录下）复制到对应目录的 `jre` 下。

然后到 `JDK` 的 `lib` 目录中执行 `java -cp .\sa-jdi.jar sun.jvm.hotspot.HSDB` 即可开启。

#### (2) JDK 1.9 及以后的开启方式

进入 `JDK` 的 `bin` 目录下，执行 `jhsdb hsdb` 来启动它。

还是上面的代码，在启动的时候加入参数：`-XX:+UseConcMarkSweepGC -XX:-UseCompressedOops`，他们的含义是：

* -XX:+UseConcMarkSweepGC

Enables the use of the CMS garbage collector for the old generation. Oracle recommends that you use the CMS garbage collector when application latency requirements cannot be met by the throughput (-XX:+UseParallelGC) garbage collector. The G1 garbage collector (-XX:+UseG1GC) is another alternative.

By default, this option is disabled and the collector is chosen automatically based on the configuration of the machine and type of the JVM. When this option is enabled, the -XX:+UseParNewGC option is automatically set and you should not disable it, because the following combination of options has been deprecated in JDK 8: -XX:+UseConcMarkSweepGC -XX:-UseParNewGC.

* -XX:-UseCompressedOops

Disables the use of compressed pointers. By default, this option is enabled, and compressed pointers are used when Java heap sizes are less than 32 GB. When this option is enabled, object references are represented as 32-bit offsets instead of 64-bit pointers, which typically increases performance when running the application with Java heap sizes less than 32 GB. This option works only for 64-bit JVMs.

It is also possible to use compressed pointers when Java heap sizes are greater than 32GB. See the -XX:ObjectAlignmentInBytes option.

修改上面的代码，在中间加入主动 `GC`：

```java
public class JVMObject {
    public final static String MAN_TYPE = "man"; // 常量
    public static String WOMAN_TYPE = "woman";  // 静态变量
    public static void  main(String[] args)throws Exception {
        Teacher T1 = new Teacher();
        T1.setName("Mark");
        T1.setSexType(MAN_TYPE);
        T1.setAge(36);
        for(int i =0 ;i<15 ;i++){
            System.gc();//主动触发GC 垃圾回收 15次--- T1存活
        }
        Teacher T2 = new Teacher();
        T2.setName("King");
        T2.setSexType(MAN_TYPE);
        T2.setAge(18);
        Thread.sleep(Integer.MAX_VALUE);//线程休眠
    }
}
```

运行程序，在命令行中使用 `jps` 查看当前 线程id，然后在 `JHSDB` 工具中菜单中点击 `File` -> `Attach to HotSpot process`，输入 线程id 即可看到程序中对象的内存分配：

![内存分配](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm5.png)

#### (3) JHSDB 中查看对象

菜单中点击 `Tools` -> `Heap Parameters`，即可看到实际 `JVM` 启动过程中堆中参数的对照，可以看到，在不启动内存压缩的情况下。堆空间里面的分代划分都是连续的：

![查看对象](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm6.png)

菜单中点击 `Tools` -> `Object Histogram`，即可查看对象，这里可以看到 `JVM` 中所有的对象，都是基于 `class` 的对象：

![查看对象2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm7.png)

在搜索框中还可以进行全路径名搜索，比如这里搜索 `com.jvm.ex2` ，找到 `Teacher` 类双击，即可看到 `T1` 和 `T2` 两个对象：

![查看对象3](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm8.png)

继续点击 `Inspect` 按钮还可以进一步观察这个对象。

通过观察可以看出 `T1` 在 `Eden` 区，而 `T2` 在 `老年代`。

#### (4) JHSDB 中查看栈

查看方式如下：

![查看栈](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm9.png)

![查看栈2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm10.png)

从上图中可以验证栈内存，同时也可以验证 `虚拟机栈` 和 `本地方法栈` 在 `Hotspot` 中是合二为一的实现了。

再来回顾整个代码的运行过程，`JVM` 的整个处理过程如下：

1. `JVM` 向操作系统申请内存，`JVM` 第一步就是通过配置参数或者默认配置参数向操作系统申请内存空间。
2. `JVM` 获得内存空间后，会根据配置参数分配 `堆`、`栈` 以及 `方法区` 的内存大小。
3. 完成上一个步骤后，`JVM` 首先会执行构造器，编译器会在 `.java` 文件被编译成 `.class` 文件时，收集所有类的初始化代码，包括 静态变量赋值语句、静态代码块、静态方法，静态变量和常量放入方法区
4. 执行方法。启动 `main` 线程，执行 `main()` 方法，开始执行第一行代码。此时堆内存中会创建一个 Teacher 对象，对象引用 `T1` 就存放在栈中。

### 4、总结

深入辨析堆和栈：

#### (1) 功能

* `栈` 是以 `栈帧` 的方式存储方法调用的过程，并存储方法调用过程中基本数据类型的变量（`int`、`short`、`long`、`byte`、`float`、`double`、`boolean`、`char` 等）以及 `对象的引用变量`，其内存分配在 `栈` 上，变量出了作用域就会自动释放；
* `堆` 内存用来存储 `Java` 中的对象。无论是成员变量、局部变量还是类变量，它们指向的对象都存储在堆内存中；

#### (2) 线程独享还是共享

* `栈` 内存归属于单个线程，每个线程都会有一个栈内存，其存储的变量只能在其所属线程中可见，即栈内存可以理解成线程的私有内存。
* `堆` 内存中的对象对所有线程可见。堆内存中的对象可以被所有线程访问。

#### (3) 空间大小

栈的内存要远远小于堆内存

## 三、虚拟机内存优化技术

### 栈的优化技术——栈帧之间数据的共享

在一般的模型中，两个不同的 `栈帧` 的内存区域是独立的，但是大部分的 `JVM` 在实现中会进行一些优化，使得两个 `栈帧` 出现一部分重叠。（主要体现在方法中有参数传递的情况），让下面 `栈帧` 的 `操作数栈` 和上面 `栈帧` 的部分局部变量重叠在一起，这样做不但节约了一部分空间，更加重要的是在进行方法调用时就可以直接公用一部分数据，无需进行额外的参数复制传递了。

![数据共享](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm11.png)

使用 `JHSDB` 工具查看栈空间一样可以看到。

具体的代码如下：

```java
public class JVMStack {

    public int work(int x) throws Exception{
        int z =(x+5)*10;//局部变量表有， 32位
        Thread.sleep(Integer.MAX_VALUE);
        return  z;
    }
    public static void main(String[] args)throws Exception {
        JVMStack jvmStack = new JVMStack();
        jvmStack.work(10);//10  放入main栈帧  10 ->操作数栈
    }
}
```

在 `main()` 方法的 `栈帧` 中的 10 会作为共享到 `work()` 的 `栈帧` 中。

## 四、内存溢出

### 1、栈溢出

`HotSpot` 版本中 `栈` 的大小是固定的，是不支持拓展的。设置单个 `虚拟机栈` 的内存大小：`-Xss1m`

当出现栈溢出的时候，就会抛出 `java.lang.StackOverflowError` 异常。一般的方法调用是很难出现的，如果出现了可能会是无限递归。

虚拟机栈带给我们的启示：方法的执行因为要打包成 `栈桢`，所以天生要比实现同样功能的循环慢，所以树的遍历算法中：递归和非递归(循环来实现)都有存在的意义。递归代码简洁，非递归代码复杂但是速度较快。

OutOfMemoryError：不断建立线程，JVM 申请栈内存，机器没有足够的内存。一般演示不出，演示出来机器也死了。

同时要注意，`栈` 的空间 `JVM` 没有办法去限制的，因为 `JVM` 在运行过程中会有线程不断的运行，没办法限制，所以只限制单个 `虚拟机栈` 的大小。

### 2、堆溢出

内存溢出：申请内存空间,超出最大堆内存空间。

如果是内存溢出，则通过调大 `-Xms`、`-Xmx` 参数。

如果不是内存泄漏，就是说内存中的对象却是都是必须存活的，那么应该检查 `JVM` 的堆参数设置，与机器的内存对比，看是否还有可以调整的空间，再从代码上检查是否存在某些对象生命周期过长、持有状态时间过长、存储结构设计不合理等情况，尽量减少程序运行时的内存消耗。

### 3、方法区溢出

#### (1) 运行时常量池溢出

#### (2) 方法区中保存的 Class 对象没有被及时回收掉或者 Class 信息占用的内存超过了我们配置。

注意 `Class` 要被回收，条件比较苛刻（仅仅是可以，不代表必然，因为还有一些参数可以进行控制）：

1. 该类所有的实例都已经被回收，也就是堆中不存在该类的任何实例。
2. 加载该类的 `ClassLoader` 已经被回收。
3. 该类对应的 `java.lang.Class` 对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法。

`CGLIB` 是一个强大的，高性能，高质量的代码生成类库，它可以在运行期扩展 `Java 类` 与实现 `Java 接口`。

`CGLIB` 包的底层是通过使用一个小而快的字节码处理框架 `ASM`，来转换字节码并生成新的类。除了 `CGLIB` 包，脚本语言例如 `Groovy` 和 `BeanShell`，也是使用 `ASM` 来生成 `Java` 的字节码。当然不鼓励直接使用 `ASM`，因为它要求你必须对 `JVM` 内部结构包括 `class` 文件的格式和指令集都很熟悉。

### 4、本机直接内存溢出

直接内存的容量可以通过 `MaxDirectMemorySize` 来设置（默认与堆内存最大值一样），所以也会出现 `OOM` 异常；

由直接内存导致的内存溢出，一个比较明显的特征是在 `HeapDump` 文件中不会看见有什么明显的异常情况，如果发生了 `OOM`，同时 `HeapDump` 文件很小，可以考虑重点排查下直接内存方面的原因。

## 五、常量池

### 1、Class 常量池(静态常量池)

在 `class` 文件中除了有类的版本、字段、方法和接口等描述信息外，还有一项信息是常量池(`Constant Pool Table`)，用于存放编译期间生成的各种 `字面量` 和 `符号引用`。

例如：

![Class 常量池](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm12.png)

* 字面量

给基本类型变量赋值的方式就叫做字面量或者字面值。

比如：`String a = "b"` ，这里 `b` 就是字符串字面量，同样类推还有整数字面值、浮点类型字面量、字符字面量。

* 符号引用

符号引用以一组符号来描述所引用的目标。符号引用可以是任何形式的字面量，`Java` 在编译的时候每一个 `Java 类` 都会被编译成一个 `class` 文件，但在编译的时候虚拟机并不知道所引用类的地址(实际地址)，就用 `符号引用` 来代替，而在类的解析阶段就是为了把这个 `符号引用` 转化成为真正的地址的阶段。

一个 `Java 类`（假设为 `People` 类）被编译成一个 `class` 文件时，如果 `People` 类引用了 `Tool` 类，但是在编译时 `People` 类并不知道引用类的实际内存地址，因此只能使用符号引用（`org.simple.Tool`）来代替。而在类装载器装载 `People` 类时，此时可以通过虚拟机获取 `Tool` 类的实际内存地址，因此便可以既将符号 `org.simple.Tool` 替换为 `Tool` 类的实际内存地址。

### 2、运行时常量池

`运行时常量池`（`Runtime Constant Pool`）是每一个类或接口的常量池（`Constant_Pool`）的运行时表示形式，它包括了若干种不同的常量：从编译期可知的数值 `字面量` 到必须运行期解析后才能获得的方法或字段引用。

运行时常量池是在类加载完成之后，将 `Class` 常量池中的 `符号引用` 值转存到 `运行时常量池中`，类在解析之后，将 `符号引用` 替换成 `直接引用`。

`运行时常量池` 在 `JDK1.7` 版本之后，就移到 `堆` 内存中了，这里指的是物理空间，而逻辑上还是属于 `方法区`（方法区是逻辑分区）。

在 `JDK1.8` 中，使用 `元空间` 代替 `永久代` 来实现方法区，但是 `方法区` 并没有改变。变动的只是 `方法区` 中内容的物理存放位置，但是 `运行时常量池` 和 `字符串常量池` 被移动到了 `堆` 中。但是不论它们物理上如何存放，逻辑上还是属于 `方法区` 的。

### 3、字符串常量池

`字符串常量池` 这个概念是最有争议的，在 `JDK1.8` 中，`字符串常量池` 是存放在 `堆` 中，并且与 `java.lang.String` 类有很大关系。设计这块内存区域的原因在于：`String` 对象作为 `Java` 语言中重要的数据类型，是内存中占据空间最大的一个对象。高效地使用字符串，可以提升系统的整体性能。所以要彻底弄懂，重心其实在于深入理解 `String`。

## 六、String

### 1、String 类分析（JDK1.8）

`String` 对象是对 `char` 数组进行了封装实现的对象，主要有 2 个成员变量：`char` 数组、`hash` 值。

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
    /** The value is used for character storage. */
    private final char value[];

    /** Cache the hash code for the string */
    private int hash; // Default to 0
```

### 2、String 对象的不可变性

了解了 `String` 对象的实现后，在实现代码中 `String` 类被 `final` 关键字修饰了，而且变量 `char` 数组也被 `final` 修饰了。

被 `final` 修饰代表该类不可继承，而 `char[]` 被 `final` 和 `private` 修饰，代表了 `String` 对象不可被更改。`Java` 实现的这个特性叫作 `String` 对象的不可变性，即 `String` 对象一旦创建成功，就不能再对它进行改变。

`Java` 这样做的好处在哪里呢？

1. 保证 `String` 对象的安全性。假设 `String` 对象是可变的，那么 `String` 对象将可能被恶意修改。
2. 保证 `hash` 属性值不会频繁变更，确保了唯一性，使得类似 `HashMap` 容器才能实现相应的 `key-value` 缓存功能。
3. 可以实现字符串常量池。在 `Java` 中，通常有两种创建字符串对象的方式，一种是通过字符串常量的方式创建，如 `String str = "abc"`；另一种是字符串变量通过 `new` 形式的创建，如 `String str = new String("abc")`。

### 3、String 的创建方式及内存分配的方式

#### (1) String str = "abc"

当代码中使用这种方式创建字符串对象时，`JVM` 首先会检查该对象是否在 `字符串常量池` 中，如果在，就返回该对象引用，否则新的字符串将在 `常量池` 中被创建。这种方式可以减少同一个值的字符串对象的重复创建，节约内存。（`str` 只是一个引用）

![String 的创建方式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm13.png)

#### (2) String str = new String("abc")

首先在编译类文件时，`abc` 常量字符串将会放入到常量结构中，在类加载时，`abc` 将会在 `常量池` 中创建；其次，在调用 `new` 时，`JVM` 命令将会调用 `String` 的构造函数，同时引用 `常量池` 中的 `abc` 字符串，在堆内存中创建一个 `String` 对象；最后，`str` 将引用 `String` 对象。

![String 的创建方式2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm14.png)

#### (3) 给创建的对象属性赋值

对象会创建在 `堆` 中，同时赋值的话，会在 `常量池` 中创建一个字符串对象，复制到 `堆` 中。

具体的复制过程是先将 `常量池` 中的字符串压入 `栈` 中，在使用 `String` 的构造方法时，会拿到 `栈` 中的字符串作为构方法的参数。

这个构造函数是一个 `char` 数组的赋值过程，而不是 `new` 出来的，所以是引用了 `常量池` 中的字符串对象。存在引用关系。

例如：

```java
public class Location {
    private String city;
    private String region;
    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
    public void mode3() {
        Location location = new Location();
        location.setCity("深圳");
        location.setRegion("南山");
    }
}
```

![String 的创建方式3](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm15.png)

#### (4) String str2 = "ab" + "cd" + "ef";

编程过程中，字符串的拼接很常见。`String` 对象是不可变的，如果使用 `String` 对象相加，拼接想要的字符串，是不是就会产生多个对象呢？例如以下代码：

```java
    public void mode4() {
        String str2 = "ab" + "cd" + "ef"; //3个对象。效率最低。java -> class- java
    }
```

首先会生成 `ab` 对象，再生成 `abcd` 对象，最后生成 `abcdef` 对象，从理论上来说，这段代码是低效的。但是编译器自动优化了这行代码，编译后的代码，你会发现编译器自动优化了这行代码，如下

```java
        String str = "abcdef";       
```

#### (5) for 循环

```java
    public void mode5() {
       String str = "abcdef";
       for (int i = 0; i < 1000; i++) {
           str = str + i;
       }
       // 上面的代码编译器会优化如下：
//       String str = "abcdef";
//       for(int i=0; i<1000; i++) {
//           str = (new StringBuilder(String.valueOf(str)).append(i).toString());
//       }
    }
```

#### (6) intern

`String` 的 `intern()` 方法，如果 `常量池` 中有相同值，就会重复使用该对象，返回对象引用。

例如：

```java
    public void mode6 () {
        // 去字符串常量池找到是否有等于该字符串的对象，如果有，直接返回对象的引用。
        String a = new String("king").intern();// new 对象、king 字符常量池创建
        String b = new String("king").intern();// b == a。
        if (a == b) {
            System.out.print("a == b");
        } else {
            System.out.print("a != b");
        }
    }
```

1. `new Sting()` 会在堆内存中创建一个 a 的 `String` 对象，`king` 将会在常量池中创建
2. 在调用 `intern()` 方法之后，会去常量池中查找是否有等于该字符串对象的引用，有就返回引用。
3. 调用 `new Sting()` 会在堆内存中创建一个 b 的 `String` 对象。
4. 在调用 `intern()` 方法之后，会去常量池中查找是否有等于该字符串对象的引用，有就返回引用。

所以 `a` 和 `b` 引用的是同一个对象。

<Valine></Valine>