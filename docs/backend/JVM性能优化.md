# JVM性能优化

<Counter :path="'backend'" :name="'JVM性能优化'"></Counter>

## 一、内存溢出

内存溢出的原因：程序在申请内存时，没有足够的内存空间。

### 1、栈溢出

方法死循环递归调用（StackOverflowError）、不断建立线程（`OutOfMemoryError`）

```java
public class StackOverFlow {

    public void king() {
        // 死递归
        king();
    }

    public static void main(String[] args) throws Throwable {
        StackOverFlow javaStack = new StackOverFlow();
        javaStack.king();
    }
}
```

由于死递归会一直申请内存，最终导致没有足够的内存空间。执行结果：

```console
Exception in thread "main" java.lang.StackOverflowError
	at com.jerry.ch5.oom.StackOverFlow.king(StackOverFlow.java:14)
```

### 2、堆溢出

不断创建对象，分配对象大于最大堆的大小（`OutOfMemoryError`）

```java
public class HeapOom {

    public static void main(String[] args) {
        // 如果要分配下面这个100m大小的数组（堆），就会直接抛出 java.lang.OutOfMemoryError: Java heap space
        String[] strings = new String[100000000];
    }
}
```

启动参数：`-Xms30m -Xmx30m`，由于申请了 100m大小的数组，肯定超过了内存的30m，执行结果：

```console
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at com.jerry.ch5.oom.HeapOom.main(HeapOom.java:14)
```

```java
public class HeapOom2 {

    public static void main(String[] args) {
        // 在方法执行的过程中，它是GCRoots。执行会 java.lang.OutOfMemoryError: GC overhead limit exceeded
        List<Object> list = new LinkedList<>();
        int i = 0;
        while (true) {
            i++;
            if (i % 10000 == 0) {
                System.out.println("i=" + i);
            }
            list.add(new Object());
        }
    }
}
```

启动参数：`-Xms30m -Xmx30m`，执行结果：

```console
i=10000
i=20000
...
i=700000
Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded
	at java.util.LinkedList.linkLast(LinkedList.java:142)
	at java.util.LinkedList.add(LinkedList.java:338)
	at com.jerry.ch5.oom.HeapOom2.main(HeapOom2.java:24)
```

由于 `list` 是 `GCRoots`，所以他一直不会 `GC`，导致最终内存溢出。

### 3、直接内存

分配的本地内存大小大于 `JVM` 的限制

```java
public class DirectOom {

    public static void main(String[] args) {
        // 直接分配128M的直接内存(100M)，会抛出 java.lang.OutOfMemoryError: Direct buffer memory
        ByteBuffer bb = ByteBuffer.allocateDirect(128 * 1024 * 1204);
    }
}
```

启动参数：`-XX:MaxDirectMemorySize=100m`，执行结果：

```console
Exception in thread "main" java.lang.OutOfMemoryError: Direct buffer memory
	at java.nio.Bits.reserveMemory(Bits.java:694)
	at java.nio.DirectByteBuffer.<init>(DirectByteBuffer.java:123)
	at java.nio.ByteBuffer.allocateDirect(ByteBuffer.java:311)
	at com.jerry.ch5.oom.DirectOom.main(DirectOom.java:16)
```

需要申请 128m的内存，肯定会溢出的。

### 4、方法区溢出

在经常动态生产大量 `Class` 的应用中，`CGLIb` 字节码增强，动态语言，大量 `JSP`(`JSP` 第一次运行需要编译成 `Java` 类),基于 `OSGi` 的应用(同一个类，被不同的加载器加载也会设为不同的类)

## 二、内存泄露

内存泄露的原因：程序在申请内存后，无法释放已申请的内存空间。

### 1、长生命周期的对象持有短生命周期对象的引用

例如将 `ArrayList` 设置为静态变量，则容器中的对象在程序结束之前将不能被释放，从而造成内存泄漏

### 2、连接未关闭

如数据库连接、网络连接和 IO 连接等，只有连接被关闭后，垃圾回收器才会回收对应的对象。

### 3、变量作用域不合理

例如：

1. 一个变量的定义的作用范围大于其使用范围

2. 如果没有及时地把对象设置为 `null`

在写 `Stack` 这种数据机构的时候，在出栈时，有时会忘记将该位置置空。

```java
public class Stack {

    public Object[] elements;
    private int size = 0;
    private static final int Cap = 16;

    public Stack() {
        elements = new Object[Cap];
    }

    /**
     * 入栈
     *
     * @param e
     */
    public void push(Object e) {
        elements[size] = e;
        size++;
    }

    /**
     * 出栈
     *
     * @return
     */
    public Object pop() {
        size = size - 1;
        Object o = elements[size];
        // 没有让 GC 回收掉
//        elements[size] = null;
        return o;
    }
}
```

导致使用的时候：

```java
public class UseStack {

    public static void main(String[] args) {

        Stack stack = new Stack();
        Object o = new Object();
        System.out.println("o = " + o);
        // 入栈
        stack.push(o);
        // 出栈
        Object o1 = stack.pop();
        // o对象没什么用
        System.out.println("o1 = " + o1);

        // 打印栈中的数据
        System.out.println(stack.elements[0]);
    }
}
```

执行结果：

```console
o = java.lang.Object@1b6d3586
o1 = java.lang.Object@1b6d3586
java.lang.Object@1b6d3586
```

虽然出栈了，但是居然还能查询到元素。

### 4、内部类持有外部类

Java 的非静态内部类的这种创建方式，会隐式地持有外部类的引用，而且默认情况下这个引用是强引用，因此，如果内部类的生命周期长于外部类的生命周期，程序很容易就产生内存泄漏。

如果内部类的生命周期长于外部类的生命周期，程序很容易就产生内存泄漏（你认为垃圾回收器会回收掉外部类的实例，但由于内部类持有外部类的引用，导致垃圾回收器不能正常工作）。

解决方法：你可以在内部类的内部显示持有一个外部类的软引用(或弱引用)，并通过构造方法的方式传递进来，在内部类的使用过程中，先判断一下外部类是否被回收。

```java
public class NoStaticInternal {

    public int k = 13;
    private static String STRING = "King";
    protected float j = 1.5f;

    public static void show() {
        System.out.println("show");
    }

    private void add() {
        System.out.println("add");
    }

    public static void main(String[] args) {
        NoStaticInternal m = new NoStaticInternal();
        // 非静态内部类的构造方式
        Child c = m.new Child();
        c.test();

        Inner inner = new Inner();
        inner.test();
    }

    /**
     * 内部类 Child，可以访问外部类静态和非静态的的成员变量、方法
     */
    class Child {
        public int i;

        public void test() {
            System.out.println("k=:" + k);
            System.out.println("string: " + STRING);
            add();
            System.out.println("j=:" + j);
            show();
        }
    }

    /**
     * 静态内部类，无法访问外部类的非静态成员变量和方法，防止内存泄漏
     */
    static class Inner {

        public void test() {
            System.out.println("string: " + STRING);
            show();
        }
    }
}
```

这个类中，内部类 `Child` 因为没有定义为内部类，所以他可以访问外部类的静态和非静态变量、方法，不合理；而静态内部类 `Inner` 只能访问静态的变量和、方法，减少了内存泄露的可能性。

### 5、Hash 值改变

在集合中，如果修改了对象中的那些参与计算哈希值的字段，会导致无法从集合中单独删除当前对象，造成内存泄露。

```java
public class Node {

    private int x;
    private int y;

    public Node(int x, int y) {
        super();
        this.x = x;
        this.y = y;
    }

    /**
     * 重写 hashCode() 方法
     *
     * @return
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + x;
        result = prime * result + y;
        return result;
    }

    /**
     * 改变 y 的值：同时改变 hashCode()
     *
     * @param y
     */
    public void setY(int y) {
        this.y = y;
    }

    public static void main(String[] args) {
        HashSet<Node> hashSet = new HashSet<>();
        Node node1 = new Node(1, 3);
        Node node2 = new Node(3, 5);
        hashSet.add(node1);
        hashSet.add(node2);
        // node2 的 Hash 值改变
        node2.setY(7);
        // 删掉 node2 节点
        hashSet.remove(node2);
        System.out.println(hashSet.size());
    }
}
```

执行结果：

```console
2
```

由于 `node2` 由于修改 `y` 属性导致更改了 `hash` 值，所以在 `remove()` 的时候没有正常移除掉。

## 三、内存泄露和内存溢出辨析

* 相同与不同

内存溢出：实实在在的内存空间不足导致；

内存泄漏：该释放的对象没有释放，多见于自己使用容器保存元素的情况下。

* 如何避免

内存溢出：检查代码以及设置足够的空间。

内存泄漏：一定是代码有问题。往往很多情况下，内存溢出往往是内存泄漏造成的。

## 四、了解MAT

`MAT` 是一个分析内存的工具，全名是 `EclipseMemoryAnalyzer`。

先看下面这样一段代码：

```java
public class DumpOom {

    public static void main(String[] args) {
        // 在方法执行的过程中，它是 GCRoots
        List<Object> list = new LinkedList<>();
        int i = 0;
        while (true) {
            i++;
            if (i % 10000 == 0) {
                System.out.println("i = " + i);
            }
            list.add(new Object());
        }
    }

}
```

启动参数：`-Xms30m -Xmx30m  -XX:+PrintGCDetails -XX:+HeapDumpOnOutOfMemoryError` ，其中 `-XX:+HeapDumpOnOutOfMemoryError` 表示将对内存溢出的信息导出来到当前项目根目录，执行结果：

```console
i = 10000
i = 20000
i = 30000
...
i = 550000
i = 560000
i = 570000
[Full GC (Ergonomics) [PSYoungGen: 8192K->3070K(9216K)] [ParOldGen: 15132K->20086K(20480K)] 23324K->23156K(29696K), [Metaspace: 3217K->3217K(1056768K)], 0.0991477 secs] [Times: user=0.73 sys=0.02, real=0.10 secs] 
i = 580000
i = 590000
i = 600000
...
i = 700000
[Full GC (Ergonomics) [PSYoungGen: 8192K->8107K(9216K)] [ParOldGen: 20086K->20086K(20480K)] 28278K->28193K(29696K), [Metaspace: 3218K->3218K(1056768K)], 0.1849831 secs] [Times: user=1.75 sys=0.00, real=0.18 secs] 
[Full GC (Ergonomics) [PSYoungGen: 8192K->8191K(9216K)] [ParOldGen: 20086K->20086K(20480K)] 28278K->28278K(29696K), [Metaspace: 3218K->3218K(1056768K)], 0.1050623 secs] [Times: user=1.02 sys=0.00, real=0.11 secs]
...
[Full GC (Ergonomics) [PSYoungGen: 8192K->8192K(9216K)] [ParOldGen: 20116K->20116K(20480K)] 28308K->28308K(29696K), [Metaspace: 3228K->3228K(1056768K)], 0.1014891 secs] [Times: user=0.80 sys=0.00, real=0.10 secs] 
[Full GC (Ergonomics) [PSYoungGen: 8192K->8192K(9216K)] [ParOldGen: 20117K->20117K(20480K)] 28309K->28309K(29696K), [Metaspace: 3228K->3228K(1056768K)], 0.1011485 secs] [Times: user=1.03 sys=0.00, real=0.10 secs] 
java.lang.OutOfMemoryError: GC overhead limit exceeded
Dumping heap to java_pid1708.hprof ...
[Full GC (Ergonomics) [PSYoungGen: 8192K->8192K(9216K)] [ParOldGen: 20169K->20143K(20480K)] 28361K->28335K(29696K), [Metaspace: 3271K->3271K(1056768K)], 0.1089935 secs] [Times: user=1.09 sys=0.00, real=0.11 secs] 
Heap dump file created [53925809 bytes in 0.374 secs]
[Full GC (Ergonomics) [PSYoungGen: 8192K->8192K(9216K)] [ParOldGen: 20161K->20145K(20480K)] 28353K->28337K(29696K), [Metaspace: 3296K->3296K(1056768K)], 0.0974956 secs] [Times: user=0.94 sys=0.00, real=0.10 secs] 
[Full GC (Ergonomics) [PSYoungGen: 8192K->0K(9216K)] [ParOldGen: 20156K->641K(20480K)] 28348K->641K(29696K), [Metaspace: 3311K->3311K(1056768K)], 0.0037823 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 9216K, used 387K [0x00000000ff600000, 0x0000000100000000, 0x0000000100000000)
  eden space 8192K, 4% used [0x00000000ff600000,0x00000000ff660ed0,0x00000000ffe00000)
  from space 1024K, 0% used [0x00000000fff00000,0x00000000fff00000,0x0000000100000000)
  to   space 1024K, 0% used [0x00000000ffe00000,0x00000000ffe00000,0x00000000fff00000)
 ParOldGen       total 20480K, used 641K [0x00000000fe200000, 0x00000000ff600000, 0x00000000ff600000)
  object space 20480K, 3% used [0x00000000fe200000,0x00000000fe2a07f0,0x00000000ff600000)
 Metaspace       used 3380K, capacity 4500K, committed 4864K, reserved 1056768K
  class space    used 363K, capacity 388K, committed 512K, reserved 1048576K
Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded
	at java.util.LinkedList.linkLast(LinkedList.java:142)
	at java.util.LinkedList.add(LinkedList.java:338)
	at com.jerry.ch5.DumpOom.main(DumpOom.java:24)
```

运行后，在根目录可以看到文件名类似这个的 `java_pid1708.hprof` ，使用 MAT 工具可以打开它。如图所示：

![mat](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mat.png)

点击下面的 `Details` 还可以看详细的分析：

![mat_detail](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/mat2.png)

### 1、浅堆和深堆

* 浅堆（Shallow Heap）

是指一个对象所消耗的内存。例如，在 32 位系统中，一个对象引用会占据 4 个字节，一个 `int` 类型会占据 4 个字节，`long` 型变量会占据 8 个字节，每个对象头需要占用 8 个字节。

* 深堆（Retained Heap）

这个对象被 GC 回收后，可以真实释放的内存大小，也就是只能通过对象被直接或间接访问到的所有对象的集合。通俗地说，就是指仅被对象所持有的对象的集合。深堆是指对象的保留集中所有的对象的浅堆大小之和。

举例：对象 `A` 引用了 `C` 和 `D`，对象 `B` 引用了 `E`。那么对象 `A` 的浅堆大小只是 `A` 本身，而如果 `A` 被回收，那么 `C` 和 `D` 都会被回收(可达性分析算法)，所以 `A` 的深堆大小为 `A + C + D` 之和，同时由于对象 `E` 还可以通过对象 `B` 访问到，因此不在对象 `A` 的深堆范围内。

![浅堆和深堆](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/Retained_Heap.png)

对于上面所讲的那个分析日志，当看到一个对象的神堆远远大于浅堆的时候就需要好好审查一下代码了。

### 2、incoming 和 outgoing

对象 `A` 引用了 `C` 和 `D`，那么 `A` 就是 `C` 和 `D` 的 `incoming`，相反的 `C` 和 `D` 就是 `A` 的 `outgoing`

## 五、JDK为我们提供的工具

### 1、命令行工具

#### (1) jps

列出当前机器上正在运行的虚拟机进程，`JPS` 从操作系统的临时目录上去找。

| 参数 | 说明 |
| --- | --- |
| -q | 仅仅显示进程 |
| -m | 输出主函数传入的参数 |
| -l | 输出应用程序主类完整 `package` 名称或 `jar` 完整名称 |
| -v | 列出 `jvm` 参数 |

#### (2) jstat

是用于监视虚拟机各种运行状态信息的命令行工具。它可以显示本地或者远程虚拟机进程中的类装载、内存、垃圾收集、`JIT` 编译等运行数据，在没有 `GUI` 图形界面，只提供了纯文本控制台环境的服务器上，它将是运行期定位虚拟机性能问题的首选工具。

假设需要每 250 毫秒查询一次进程 13616 垃圾收集状况，一共查询 10 次，那命令应当是：`jstat -gc 13616 250 10`

| 参数 | 说明 |
| --- | --- |
| -class | 类加载器 |
| -compiler | `JIT` |
| -gc | `GC` 堆状态 |
| -gccapacity | 各区大小 |
| -gccause | 最近一次 `GC` 统计和原因 |
| -gcnew | 新区统计 |
| -gcnewcapacity | 新区大小 |
| -gcold | 老区统计 |
| -gcoldcapacity | 老区大小 |
| -gcpermcapacity | 永久区大小 |
| -gcutil | `GC` 统计汇总 |
| -printcompilation | `HotSpot` 编译统计 |

#### (3) jinfo

查看和修改虚拟机的参数。

| 参数 | 说明 |
| --- | --- |
| –sysprops | 可以查看由 System.getProperties()取得的参数 |
| –flag | 未被显式指定的参数的系统默认值 |
| –flags | 显示虚拟机的参数 |
| –flag +[参数] | 可以增加参数，但是仅限于由 `java -XX:+PrintFlagsFinal –version` 查询出来且为 `manageable` 的参数 |
| –flag -[参数] | 可以去除参数 |

看下面这段代码：

```java
public class JInfoTest {

    /**
     * 填充数据，造成 GC
     *
     * @param args
     */
    public static void main(String[] args) {
        while (true) {
            byte[] b = null;
            for (int i = 0; i < 10; i++) {
                b = new byte[1 * 1024 * 1024];
            }
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

启动参数：`-Xms20m -Xmx20m -Xmn2m -XX:+PrintGC`，执行结果：

```console
[GC (Allocation Failure)  1024K->600K(19968K), 0.0010100 secs]
[GC (Allocation Failure)  11862K->10968K(19968K), 0.0009586 secs]
[GC (Allocation Failure)  18984K->18520K(19968K), 0.0009448 secs]
[Full GC (Ergonomics)  18520K->2014K(19968K), 0.0067019 secs]
[GC (Allocation Failure)  18419K->18398K(19968K), 0.0004530 secs]
[Full GC (Ergonomics)  18398K->2013K(19968K), 0.0066805 secs]
[GC (Allocation Failure)  18398K->18398K(19968K), 0.0008508 secs]
[Full GC (Ergonomics)  18398K->1961K(19968K), 0.0140619 secs]
...
```

起初的执行结果就这么多，此时通过命令：`jps` 查询到当前运行的进程是11056：

![jps命令](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jps.png)

然后执行命令：`jinfo -flag +PrintGCDetails 11056` 执行后，可以看到控制台的输出日志多了这些内容：

```console
...
[GC (Allocation Failure) [PSYoungGen: 0K->0K(1536K)] 17408K->17408K(19968K), 0.0253200 secs] [Times: user=0.00 sys=0.00, real=0.02 secs] 
[GC (Allocation Failure) [PSYoungGen: 0K->0K(1536K)] 17408K->17408K(19968K), 0.0003467 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
[Full GC (Allocation Failure) [PSYoungGen: 0K->0K(1536K)] [ParOldGen: 17408K->2048K(18432K)] 17408K->2048K(19968K), [Metaspace: 3993K->3993K(1056768K)], 0.0024827 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
```

这样就动态修改了启动参数名实时监控到了变化的日志内容。

#### (4) jmap

用于生成堆转储快照（一般称为 `heapdump` 或 `dump` 文件）。`jmap` 的作用并不仅仅是为了获取 `dump` 文件，它还可以查询 `finalize` 执行队列、`Java` 堆和永久代的详细信息，如空间使用率、当前用的是哪种收集器等。和 `jinfo` 命令一样，`jmap` 有不少功能在 `Windows` 平台下都是受限的，除了生成 `dump` 文件的

| 参数 | 说明 |
| --- | -- |
| -dump | 用于查看每个类的实例、空间占用的统计 |

例如，命令 `jmap -dump:live,format=b,file=heap.bin <pid>` 可以将生成的日志保存当前用户目录下。

![jmap命令](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmap.png)

#### (5) jhat

使用 `jhat 文件名` 可以查看刚才生成的日志文件。

![jhat命令](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jhat.png)

执行后屏幕显示“Server is ready.”的提示后，用户在浏览器中键入 <http://localhost:7000/> 就可以访问详情

#### (6) jstack

（`Stack Trace for Java`）命令用于生成虚拟机当前时刻的线程快照。线程快照就是当前虚拟机内每一条线程正在执行的方法堆栈的集合，生成线程快照的主要目的是定位线程出现长时间停顿的原因，如线程间死锁、死循环、请求外部资源导致的长时间等待等都是导致线程长时间停顿的常见原因。

在代码中可以用 `java.lang.Thread` 类的 `getAllStackTraces()` 方法用于获取虚拟机中所有线程的 `StackTraceElement` 对象。使用这个方法可以通过简单的几行代码就完成 `jstack` 的大部分功能，在实际项目中不妨调用这个方法做个管理员页面，可以随时使用浏览器来查看线程堆栈。

```java
public class AllStackTraces {

    /**
     * 填充数据，造成GC
     *
     * @param args
     */
    public static void main(String[] args) {
        while (true) {
            byte[] b = null;
            for (int i = 0; i < 10; i++) {
                b = new byte[1 * 1024 * 1024];
            }
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // 于获取虚拟机中所有线程的 StackTraceElement 对象
            Map<Thread, StackTraceElement[]> threadMap = Thread.getAllStackTraces();
            for (Map.Entry<Thread, StackTraceElement[]> entry : threadMap.entrySet()) {
                Thread t = entry.getKey();
                StackTraceElement[] ss = entry.getValue();
                // 打印线程信息
                System.out.println(t.getName() + "-" + t.getId());
                // 打印线程详情信息
                for (StackTraceElement s : ss) {
                    System.out.println(s);
                }
            }
        }
    }
}
```

启动参数：`-Xms20m -Xmx20m -Xmn2m -XX:+PrintGC`，执行结果：

```console
[GC (Allocation Failure)  1024K->576K(19968K), 0.0009532 secs]
[GC (Allocation Failure)  11835K->10976K(19968K), 0.0013425 secs]
Finalizer-3
java.lang.Object.wait(Native Method)
java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:143)
java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:164)
java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:209)
main-1
java.lang.Thread.dumpThreads(Native Method)
java.lang.Thread.getAllStackTraces(Thread.java:1607)
com.jerry.ch5.AllStackTraces.main(AllStackTraces.java:31)
Monitor Ctrl-Break-6
java.net.SocketInputStream.socketRead0(Native Method)
java.net.SocketInputStream.socketRead(SocketInputStream.java:116)
java.net.SocketInputStream.read(SocketInputStream.java:171)
java.net.SocketInputStream.read(SocketInputStream.java:141)
sun.nio.cs.StreamDecoder.readBytes(StreamDecoder.java:284)
sun.nio.cs.StreamDecoder.implRead(StreamDecoder.java:326)
sun.nio.cs.StreamDecoder.read(StreamDecoder.java:178)
java.io.InputStreamReader.read(InputStreamReader.java:184)
java.io.BufferedReader.fill(BufferedReader.java:161)
java.io.BufferedReader.readLine(BufferedReader.java:324)
java.io.BufferedReader.readLine(BufferedReader.java:389)
com.intellij.rt.execution.application.AppMainV2$1.run(AppMainV2.java:64)
Attach Listener-5
Signal Dispatcher-4
Reference Handler-2
java.lang.Object.wait(Native Method)
java.lang.Object.wait(Object.java:502)
java.lang.ref.Reference.tryHandlePending(Reference.java:191)
java.lang.ref.Reference$ReferenceHandler.run(Reference.java:153)
[GC (Allocation Failure)  19033K->18468K(19968K), 0.0008729 secs]
[Full GC (Ergonomics)  18468K->2016K(19968K), 0.0053061 secs]
```

### 2、可视化工具

`JMX`（`Java Management Extensions`，即 Java 管理扩展）是一个为应用程序、设备、系统等植入管理功能的框架。`JMX` 可以跨越一系列异构操作系统平台、系统体系结构和网络传输协议，灵活的开发无缝集成的系统、网络和服务管理应用。

#### (1) jconsole

一种基于 `JMX` 的可视化监视、管理工具。

运行后可以选择之前保存的 `heap.bin` 文件

![jconsole](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jconsole.png)

可以查看内存等使用情况：

![jconsole2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jconsole2.png)

#### (2) VisualVM

`VisualVM` 是一个集成多个 `JDK` 命令行工具的可视化工具。可以作为 `Java应` 用程序性能分析和运行监控的工具。开发人员可以利用它来监控、分析线程信息，浏览内存堆数据。系统管理员可以利用它来监测、控制 `Java` 应用程序横跨整个网络的情况。`Java` 应用程序使用人员可以利用它来创建包含所有必要信息的 `Bug` 报告。

插件中心地址 <https://visualvm.github.io>

<Valine></Valine>