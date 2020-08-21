# JMM和底层实现原理

<Counter :path="'backend'" :name="'JMM和底层实现原理'"></Counter>

## 一、JMM基础-计算机原理

Java 内存模型即 `Java Memory Model`，简称 `JMM`。`JMM` 定义了 Java 虚拟机(`JVM`)在计算机内存(`RAM`)中的工作方式。`JVM` 是整个计算机虚拟模型，所以 `JMM` 是隶属于 `JVM` 的。`Java1.5` 版本对其进行了重构，现在的 `Java` 仍沿用了 `Java1.5` 的版本。`JMM` 遇到的问题与现代计算机中遇到的问题是差不多的。

物理计算机中的并发问题，物理机遇到的并发问题与虚拟机中的情况有不少相似之处，物理机对并发的处理方案对于虚拟机的实现也有相当大的参考意义。

早期计算机中 `CPU` 和内存的速度是差不多的，但在现代计算机中，`CPU` 的指令速度远超内存的存取速度，由于计算机的存储设备与处理器的运算速度有几个数量级的差距，所以现代计算机系统都不得不加入一层读写速度尽可能接近处理器运算速度的高速缓存（`Cache`）来作为内存与处理器之间的缓冲：将运算需要使用到的数据复制到缓存中，让运算能快速进行，当运算结束后再从缓存同步回内存之中，这样处理器就无须等待缓慢的内存读写了。

![cache](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm.png)

![cache2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm2.png)

在计算机系统中，寄存器划是 `L0` 级缓存，接着依次是 `L1`、`L2`、`L3`（接下来是内存，本地磁盘，远程存储）。越往上的缓存存储空间越小，速度越快，成本也更高；越往下的存储空间越大，速度更慢，成本也更低。从上至下，每一层都可以看做是更下一层的缓存，即：`L0` 寄存器是 `L1` 的缓存，`L1` 是 `L2` 的缓存，依次类推；每一层的数据都是来至它的下一层，所以每一层的数据是下一层的数据的子集。

下面是各个缓存的读（Read）、写（Write）、复制（Copy）和执行一个指令的时间周期（Latency）。

![cache3](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm3.png)

在现代 `CPU` 上，一般来说 `L0`、`L1`、`L2`、`L3` 都集成在 `CPU` 内部，而 `L1` 还分为一级数据缓存（Data Cache，D-Cache，L1d）和一级指令缓存（Instruction Cache，I-Cache，L1i），分别用于存放数据和执行数据的指令解码。每个核心拥有独立的运算处理单元、控制器、寄存器、L1、L2 缓存，然后一个 `CPU` 的多个核心共享最后一层 `CPU` 缓存 `L3`。

## 二、物理内存模型带来的问题

基于高速缓存的存储交互很好地解决了处理器与内存的速度矛盾，但是也为计算机系统带来更高的复杂度，因为它引入了一个新的问题：缓存一致性（CacheCoherence）。在多处理器系统中，每个处理器都有自己的高速缓存，而它们又共享同一主内存（MainMemory）。当多个处理器的运算任务都涉及同一块主内存区域时，将可能导致各自的缓存数据不一致。

现代的处理器使用写缓冲区临时保存向内存写入的数据。写缓冲区可以保证指令流水线持续运行，它可以避免由于处理器停顿下来等待向内存写入数据而产生的延迟。同时，通过以批处理的方式刷新写缓冲区，以及合并写缓冲区中对同一内存地址的多次写，减少对内存总线的占用。虽然写缓冲区有这么多好处，但每个处理器上的写缓冲区，仅仅对它所在的处理器可见。这个特性会对内存操作的执行顺序产生重要的影响：处理器对内存的读/写操作的执行顺序，不一定与内存实际发生的读/写操作顺序一致。

下面看这样子的情况：

![缓存数据不一致](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm4.png)

![执行逻辑](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm5.png)

处理器 A 和处理器 B 按程序的顺序并行执行内存访问，最终可能得到 `x = y = 0` 的结果。

处理器 A 和处理器 B 可以同时把共享变量写入自己的写缓冲区（步骤 A1，B1），然后从内存中读取另一个共享变量（步骤 A2，B2），最后才把自己写缓存区中保存的脏数据刷新到内存中（步骤 A3，B3）。当以这种时序执行时，程序就可以得到 `x = y = 0` 的结果。

从内存操作实际发生的顺序来看，直到处理器 A 执行 A3 来刷新自己的写缓存区，写操作 A1 才算真正执行了。虽然处理器 A 执行内存操作的顺序为：A1 -> A2，但内存操作实际发生的顺序却是 A2 -> A1。

如果真的发生这种情况，那同步回到主内存时以谁的缓存数据为准呢？为了解决一致性的问题，需要各个处理器访问缓存时都遵循一些协议，在读写时要根据协议来进行操作，这类协议有 `MSI`、`MESI`（Illinois Protocol）、`MOSI`、`Synapse`、`Firefly` 及 `Dragon Protocol` 等。

## 三、伪共享

前面我们已经知道，`CPU` 中有好几级高速缓存。但是 `CPU` 缓存系统中是以缓存行（cache line）为单位存储的。目前主流的 `CPU Cache` 的 `Cache Line` 大小都是 64Bytes。`Cache Line` 可以简单的理解为 `CPU Cache` 中的最小缓存单位，今天的 `CPU` 不再是按字节访问内存，而是以 64 字节为单位的块(chunk)拿取，称为一个缓存行(cache line)。当你读一个特定的内存地址，整个缓存行将从主存换入缓存。

一个缓存行可以存储多个变量（存满当前缓存行的字节数）；而 `CPU` 对缓存的修改又是以缓存行为最小单位的，在多线程情况下，如果需要修改“共享同一个缓存行的变量”，就会无意中影响彼此的性能，这就是伪共享（False Sharing）。

为了避免伪共享，我们可以使用数据填充的方式来避免，即单个数据填充满一个 `Cache Line`。这本质是一种空间换时间的做法。但是这种方式在 Java7 以后可能失效。

Java8 中已经提供了官方的解决方案，Java8 中新增了一个注解 `@sun.misc.Contended`。比如 `JDK` 的 `ConcurrentHashMap` 中就有使用。

加上这个注解的类会自动补齐缓存行，需要注意的是此注解默认是无效的，需要在 `jvm` 启动时设置 `-XX:-RestrictContended` 才会生效。

下面是一个例子：

```java
public class FalseSharing implements Runnable {

    public final static int NUM_THREADS = Runtime.getRuntime().availableProcessors();
    public final static long ITERATIONS = 500L * 1000L * 1000L;
    private final int arrayIndex;

    private static VolatileLong[] longs = new VolatileLong[NUM_THREADS];
//    private static VolatileLongPadding[] longs = new VolatileLongPadding[NUM_THREADS];
//    private static VolatileLongAnno[] longs = new VolatileLongAnno[NUM_THREADS];

    static {
        // 将数组初始化
        for (int i = 0; i < longs.length; i++) {
            longs[i] = new VolatileLong();
        }
    }

    public FalseSharing(final int arrayIndex) {
        this.arrayIndex = arrayIndex;
    }

    public static void main(final String[] args) throws Exception {
        final long start = System.nanoTime();
        runTest();
        System.out.println("duration = " + (System.nanoTime() - start));
    }

    private static void runTest() throws InterruptedException {
        // 创建和CPU数相同的线程
        Thread[] threads = new Thread[NUM_THREADS];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(new FalseSharing(i));
        }

        for (Thread t : threads) {
            t.start();
        }

        // 等待所有线程执行完成
        for (Thread t : threads) {
            t.join();
        }
    }

    /**
     * 访问数组
     */
    public void run() {
        long i = ITERATIONS + 1;
        while (0 != --i) {
            longs[arrayIndex].value = i;
        }
    }

    public final static class VolatileLong {
        public volatile long value = 0L;
    }

    /**
     * long padding 避免 false sharing
     * 按理说 jdk7 以后 long padding 应该被优化掉了，但是从测试结果看 padding 仍然起作用
     */
    public final static class VolatileLongPadding {
        public long p1, p2, p3, p4, p5, p6, p7;
        public volatile long value = 0L;
        volatile long q0, q1, q2, q3, q4, q5, q6;
    }

    /**
     * jdk8新特性，Contended注解避免false sharing
     * Restricted on user classpath
     * Unlock: -XX:-RestrictContended
     */
    @sun.misc.Contended
    public final static class VolatileLongAnno {
        public volatile long value = 0L;
    }
}
```

定义了三种类型的数组：`VolatileLong`、`VolatileLongPadding` 和 `VolatileLongAnno`。

`VolatileLong` 的数组中 中只定义了一个 `volatile` 类型的 `long` 型变量，然后让多个线程同时并发访问这个数组，这时可以想到，在多个线程同时处理数据时，数组中的多个 `VolatileLong` 对象可能存在同一个缓存行中。

此时的执行结果：

```console
duration = 43155496101
```

大约花费了43.2秒。

将 `longs` 数组替换为 `VolatileLongPadding` 数组，然后在 `volatile` 类型的变量前后使用多个变量进行缓存行的填充，改进后的执行结果：

```console
duration = 6107263700
```

速度提升至6.1秒左右。

接下来使用 `VolatileLongAnno` 类型的数组，也就是使用了 `@sun.misc.Contended` 注解进行优化，同时加入启动参数 `-XX:-RestrictContended` ，此时执行结果：

```console
duration = 6028898899
````

速度进一步优化到了6.0秒左右。

## 四、Java内存模型（JMM）

从抽象的角度来看，`JMM` 定义了线程和主内存之间的抽象关系：线程之间的共享变量存储在主内存（`Main Memory`）中，每个线程都有一个私有的本地内存（`Local Memory`），本地内存中存储了该线程以读/写共享变量的副本。本地内存是 `JMM` 的一个抽象概念，并不真实存在。它涵盖了缓存、写缓冲区、寄存器以及其他的硬件和编译器优化。

![jmm](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm6.png)

![jmm2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm7.png)

## 五、Java内存模型带来的问题

### 1、可见性问题

![可见性问题](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm8.png)

左边 `CPU` 中运行的线程从主存中拷贝共享对象 `obj` 到它的 `CPU` 缓存，把对象 `obj` 的 `count` 变量改为 2。但这个变更对运行在右边 `CPU` 中的线程不可见，因为这个更改还没有 `flush` 到主存中。

在多线程的环境下，如果某个线程首次读取共享变量，则首先到主内存中获取该变量，然后存入工作内存中，以后只需要在工作内存中读取该变量即可。同样如果对该变量执行了修改的操作，则先将新值写入工作内存中，然后再刷新至主内存中。但是什么时候最新的值会被刷新至主内存中是不太确定，一般来说会很快，但具体时间不知。

要解决共享对象可见性这个问题，我们可以使用 `volatile` 关键字或者是加锁。

### 2、竞争问题

![竞争问题](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm9.png)

线程 A 和线程 B 共享一个对象 `obj`。假设线程 A 从主存读取 `obj.count` 变量到自己的 `CPU` 缓存，同时，线程 B 也读取了 `obj.count` 变量到它的 `CPU` 缓存，并且这两个线程都对 `obj.count` 做了加 1 操作。此时，`obj.count` 加 1 操作被执行了两次，不过都在不同的 `CPU` 缓存中。

如果这两个加 1 操作是串行执行的，那么 `obj.count` 变量便会在原始值上加2，最终主存中的 `obj.count` 的值会是 3。然而图中两个加 1 操作是并行的，不管是线程 A 还是线程 B 先 `flush` 计算结果到主存，最终主存中的 `obj.count` 只会增加 1 次变成 2，尽管一共有两次加 1 操作。 要解决上面的问题我们可以使用 `synchronized` 代码块。

### 3、重排序

#### (1) 重排序类型

除了共享内存和工作内存带来的问题，还存在重排序的问题：在执行程序时，为了提高性能，编译器和处理器常常会对指令做重排序。重排序分 3 种类型。

1. 编译器优化的重排序。编译器在不改变单线程程序语义的前提下，可以重新安排语句的执行顺序。
2. 指令级并行的重排序。现代处理器采用了指令级并行技术（Instruction-LevelParallelism，ILP）来将多条指令重叠执行。如果不存在数据依赖性，处理器可以改变语句对应机器指令的执行顺序。
3. 内存系统的重排序。由于处理器使用缓存和读/写缓冲区，这使得加载和存储操作看上去可能是在乱序执行。

#### (2) 数据依赖性

如果两个操作访问同一个变量，且这两个操作中有一个为写操作，此时这两个操作之间就存在数据依赖性。数据依赖分为下列 3 种类型，上面的 3 种情况，只要重排序两个操作的执行顺序，程序的执行结果就会被改变。

| 名称 | 代码示例 | 说明 |
| --- | --- | --- |
| 写后读 | a = 1;<br>b = a; | 写一个变量之后，再读这个变量 |
| 写后写 | a = 1;<br>a = 2; | 写一个变量之后，再写这个变量 |
| 读后写 | a = b;<br>b = 1; | 读一个变量之后，再写这个变量 |

当依赖关系如下图所示时

![依赖关系](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm10.png)

A 和 C 存在数据依赖，B 和 C 也存在数据依赖，而 A 和 B 之间不存在数据依赖，如果重排序了 A 和 C 或者 B 和 C 的执行顺序，程序的执行结果就会被改变。

不管如何重排序，都必须保证代码在单线程下的运行正确，连单线程下都无法正确，更不用讨论多线程并发的情况，所以就提出了一个 `as-if-serial` 的概念。

##### as-if-serial

`as-if-serial` 语义的意思是：不管怎么重排序（编译器和处理器为了提高并行度），（单线程）程序的执行结果不能被改变。编译器、runtime 和处理器都必须遵守 `as-if-serial` 语义。

为了遵守 `as-if-serial` 语义，编译器和处理器不会对存在数据依赖关系的操作做重排序，因为这种重排序会改变执行结果。（强调一下，这里所说的数据依赖性仅针对单个处理器中执行的指令序列和单个线程中执行的操作，不同处理器之间和不同线程之间的数据依赖性不被编译器和处理器考虑。）但是，如果操作之间不存在数据依赖关系，这些操作依然可能被编译器和处理器重排序。

例如上图中所示的 A、B、C 三者之间的关系中，A 和 C 之间存在数据依赖关系，同时 B 和 C 之间也存在数据依赖关系。因此在最终执行的指令序列中，C 不能被重排序到 A 和 B 的前面（C 排到 A 和 B 的前面，程序的结果将会被改变）。但 A 和 B 之间没有数据依赖关系，编译器和处理器可以重排序 A 和 B 之间的执行顺序。

`as-if-serial` 语义把单线程程序保护了起来，遵守 `as-if-serial` 语义的编译器、runtime 和处理器可以让我们感觉到：单线程程序看起来是按程序的顺序来执行的。`asif-serial` 语义使单线程程序员无需担心重排序会干扰他们，也无需担心内存可见性问题。

#### (3) 控制依赖性

```java
public class ControlDep {

    int a = 0;
    volatile boolean flag = false;

    public void init() {
        // 操作1
        a = 1;
        // 操作2
        flag = true;
        //.......
    }

    public synchronized void use() {
        // 操作3
        if (flag) {
            // 操作4
            int i = a * a;
        }
    }
}
```

上述代码中，`flag` 变量是个标记，用来标识变量 `a` 是否已被写入，在 `use()` 方法中变量 `i` 的赋值依赖 `flag` 的判断，这里就叫控制依赖，如果发生了重排序，结果就不对了。

操作 1 和操作 2 没有数据依赖关系，编译器和处理器可以对这两个操作重排序；同样，操作 3 和操作 4 没有数据依赖关系，编译器和处理器也可以对这两个操作重排序。操作 3 和操作 4 则存在所谓控制依赖关系。

在程序中，当代码中存在控制依赖性时，会影响指令序列执行的并行度。为此，编译器和处理器会采用猜测（Speculation）执行来克服控制相关性对并行度的影响。以处理器的猜测执行为例，执行线程 B 的处理器可以提前读取并计算a*a，然后把计算结果临时保存到一个名为重排序缓冲（Reorder Buffer，ROB）的硬件缓存中。当操作 3 的条件判断为真时，就把该计算结果写入变量 i 中。猜测执行实质上对操作 3 和 4 做了重排序，问题在于这时候，a 的值还没被线程 A赋值。

在单线程程序中，对存在控制依赖的操作重排序，不会改变执行结果（这也是 `as-if-serial` 语义允许对存在控制依赖的操作做重排序的原因）。

但是对多线程来说就完全不同了：这里假设有两个线程 A 和 B，A 首先执行 `init()` 方法，随后 B 线程接着执行 `use()` 方法。线程 B 在执行操作 4 时，能否看到线程 A 在操作 1 对共享变量 a 的写入呢？答案是：不一定能看到。

让我们先来看看，当操作 1 和操作 2 重排序，操作 3 和操作 4 重排序时，可能会产生什么效果？操作 1 和操作 2 做了重排序。程序执行时，线程 A 首先写标记变量 flag，随后线程 B 读这个变量。由于条件判断为真，线程 B 将读取变量 a。此时，变量 a 还没有被线程 A 写入，这时就会发生错误！

所以在多线程程序中，对存在控制依赖的操作重排序，可能会改变程序的执行结果。

## 六、解决并发下的问题

### 1、内存屏障 Memory Barrier

`Java` 编译器在生成指令序列的适当位置会插入内存屏障指令来禁止特定类型的处理器重排序，从而让程序按我们预想的流程去执行。内存屏障的作用是：

1. 保证特定操作的执行顺序。
2. 影响某些数据（或则是某条指令的执行结果）的内存可见性。

编译器和 `CPU` 能够重排序指令，保证最终相同的结果，尝试优化性能。插入一条 `Memory Barrier` 会告诉编译器和 `CPU`：不管什么指令都不能和这条 `Memory Barrier` 指令重排序。

`Memory Barrier` 所做的另外一件事是强制刷出各种 `CPU cache`，如一个 `Write-Barrier`（写入屏障）将刷出所有在 `Barrier` 之前写入 `cache` 的数据，因此，任何 `CPU` 上的线程都能读取到这些数据的最新版本。

JMM 把内存屏障指令分为 4 类

| 屏障类型 | 指令示例 | 说明 |
| --- | --- | --- |
| LoadLoad Barriers | Load1;<br>LoadLoad;<br>Load2 | 确保 Load1 数据的装载必须之前于 Load2 以及所有后续装载指令的装载 |
| StoreStore Barriers | Store1;<br>StoreStore;<br>Store2 | 确保 Store1 数据对其他处理器可见（刷新到内存）必须之前于 Store2 以及所有后续存储指令的存储 |
| LoadStore Barriers | Load1;<br>LoadStore;<br>Store2 | 确保 Load1 数据的装载必须之前于 Store2 以及所有后续存储指令刷新到内存 |
| StoreLoad Barriers | Store1;<br>StoreLoad;<br>Load2 | 确保 Store1 数据对其他处理器变得可见（刷新到内存）必须之前于 Load2 以及所有后续装载指令的装载。StoreLoad Barriers 会使该屏障之前的所有内存访问指令（存储和装载指令）完成之后，才执行该屏障之后的内存访问指令 |

`StoreLoad Barriers` 是一个“全能型”的屏障，它同时具有其他 3 个屏障的效果。现代的多处理器大多支持该屏障（其他类型的屏障不一定被所有处理器支持）。

### 2、临界区

![临界区](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm11.png)

JMM 会在退出临界区和进入临界区这两个关键时间点做一些特别处理，使得多线程在这两个时间点按某种顺序执行。

临界区内的代码则可以重排序（但 `JMM` 不允许临界区内的代码“逸出”到临界区之外，那样会破坏监视器的语义）。虽然线程 A 在临界区内做了重排序，但由于监视器互斥执行的特性，这里的线程 B 根本无法“观察”到线程 A 在临界区内的重排序。这种重排序既提高了执行效率，又没有改变程序的执行结果。

## 七、Happens-Before

在 `Java` 规范提案中为让大家理解内存可见性的这个概念，提出了 `Happens-Before` 的概念来阐述操作之间的内存可见性。对应 `Java` 程序员来说，理解 `Happens-Before` 是理解 `JMM` 的关键。

`JMM` 这么做的原因是：程序员对于这两个操作是否真的被重排序并不关心，程序员关心的是程序执行时的语义不能被改变（即执行结果不能被改变）。因此，`Happens-Before` 关系本质上和 `as-if-serial` 语义是一回事。`as-if-serial` 语义保证单线程内程序的执行结果不被改变，`Happens-Before` 关系保证正确同步的多线程程序的执行结果不被改变。

### 1、定义

用 `Happens-Before` 的概念来阐述操作之间的内存可见性。在 `JMM` 中，如果一个操作执行的结果需要对另一个操作可见，那么这两个操作之间必须要存在 `Happens-Before` 关系 。

两个操作之间具有 `Happens-Before` 关系，并不意味着前一个操作必须要在后一个操作之前执行！`Happens-Before` 仅仅要求前一个操作（执行的结果）对后一个操作可见，且前一个操作按顺序排在第二个操作之前（the first is visible to andordered before the second）。

### 2、加深理解

上面的定义看起来很矛盾，其实它是站在不同的角度来说的。

1. 站在 Java 程序员的角度来说：`JMM` 保证，如果一个操作 `Happens-Before` 另一个操作，那么第一个操作的执行结果将对第二个操作可见，而且第一个操作的执行顺序排在第二个操作之前。
2. 站在编译器和处理器的角度来说：`JMM` 允许，两个操作之间存在 `Happens-Before` 关系，不要求 `Java` 平台的具体实现必须要按照 `Happens-Before` 关系指定的顺序来执行。如果重排序之后的执行结果，与按 `Happens-Before` 关系来执行的结果一致，那么这种重排序是允许的。

看下面的代码：

```java
        double x = 0.03;
        double y = 0.01;
        double z = x * x * y;
```

站在程序员的角度：

1. A Happens-Before B
2. B Happens-Before C
3. A Happens-Before C

但是仔细考察，2、3 是必需的，而 1 并不是必需的，因此 `JMM` 对这三个 `Happens-Before` 关系的处理就分为两类：

1. 会改变程序执行结果的重排序
2. 不会改变程序执行结果的重排序

JMM 对这两种不同性质的重排序，采用了不同的策略，如下：

1. 对于会改变程序执行结果的重排序，`JMM` 要求编译器和处理器必须禁止这种重排序；
2. 对于不会改变程序执行结果的重排序，`JMM` 对编译器和处理器不做要求。

于是，站在我们程序员的角度，看起来这个三个操作满足了 `Happens-Before` 关系，而站在编译器和处理器的角度，进行了重排序，而排序后的执行结果，也是满足 `Happens-Before` 关系的。

![Happens-Before](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm12.png)

### 3、Happens-Before规则

`JMM` 为我们提供了以下的 `Happens-Before` 规则：

1. 程序顺序规则：一个线程中的每个操作，`Happens-Before` 于该线程中的任意后续操作。
2. 监视器锁规则：对一个锁的解锁，`Happens-Before` 于随后对这个锁的加锁。
3. `volatile` 变量规则：对一个 `volatile` 域的写，`Happens-Before` 于任意后续对这个 `volatile` 域的读。
4. 传递性：如果 A `Happens-Before` B，且 B `Happens-Before` C，那么 A `Happens-Before` C。
5. `start()` 规则：如果线程 A 执行操作 `ThreadB.start()`（启动线程 B），那么 A 线程的 `ThreadB.start()` 操作 `Happens-Before` 于线程 B 中的任意操作。
6. `join()` 规则：如果线程 A 执行操作 `ThreadB.join()` 并成功返回，那么线程 B中的任意操作 `Happens-Before` 于线程 A 从 `ThreadB.join()` 操作成功返回。
7. 线程中断规则:对线程 `interrupt()` 方法的调用 `Happens-Before` 于被中断线程的代码检测到中断事件的发生。

## 八、volatile详解

### 1、volatile特性

可以把对 `volatile` 变量的单个读/写，看成是使用同一个锁对这些单个读/写操作做了同步。例如：

```java
public class Vola {

    /**
     * 使用 volatile 声明64位的 long 型变量
     */
    private volatile long i = 0L;

    public long getI() {
        return i;
    }

    public void setI(long i) {
        this.i = i;
    }
    
    public void increment() {
        i++;
    }
}
```

可以看成：

```java
public class VolaLikeSync {

    /**
     * 普通的 long 型变量
     */
    private long i = 0L;
    
    public synchronized long getI() {
        return i;
    }

    public synchronized void setI(long i) {
        this.i = i;
    }

    public void increment() {
        long temp = getI();
        temp = temp + 1L;
        setI(temp);
    }
}
```

所以 `volatile` 变量自身具有下列特性：

* 可见性

对一个 `volatile` 变量的读，总是能看到（任意线程）对这个 `volatile` 变量最后的写入。

* 原子性

对任意单个 `volatile` 变量的读/写具有原子性，但类似于 `volatile++` 这种复合操作不具有原子性。

### 2、volatile的内存语义

内存语义：可以简单理解为 `volatile`、`synchronize`、`atomic`、`lock` 之类的在 `JVM` 中的内存方面实现原则。

`volatile` 写的内存语义如下：

当写一个 `volatile` 变量时，`JMM` 会把该线程对应的本地内存中的共享变量值刷新到主内存。

`volatile` 读的内存语义如下：

当读一个 `volatile` 变量时，`JMM` 会把该线程对应的本地内存置为无效。线程接下来将从主内存中读取共享变量。

所以对于代码：

```java
public class ControlDep {

    int a = 0;
    volatile boolean flag = false;

    public void init() {
        // 操作1
        a = 1;
        // 操作2
        flag = true;
        //.......
    }

    public synchronized void use() {
        // 操作3
        if (flag) {
            // 操作4
            int i = a * a;
        }
    }
}
```

如果我们将 `flag` 变量以 `volatile` 关键字修饰，那么实际上：线程 A 在写 `flag` 变量后，本地内存 A 中被线程 A 更新过的两个共享变量的值都被刷新到主内存中。

![volatile的写内存语义](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm13.png)

在读 `flag` 变量后，本地内存 B 包含的值已经被置为无效。此时，线程 B 必须从主内存中读取共享变量。线程 B 的读取操作将导致本地内存 B 与主内存中的共享变量的值变成一致。

![volatile的读内存语义](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm14.png)

如果我们把 `volatile` 写和 `volatile` 读两个步骤综合起来看的话，在读线程 B 读一个 `volatile` 变量后，写线程 A 在写这个 `volatile` 变量之前所有可见的共享变量的值都将立即变得对读线程 B 可见。

### 3、为何volatile不是线程安全的

![为何volatile不是线程安全的](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm15.png)

#### (1) volatile 内存语义的实现

下面是 `volatile` 重排序规则表

| 第一个操作 | 第二个操作（普通读/写） | 第二个操作（vlatile读）| 第二个操作（vlatile写）|
| --- | --- | --- | --- |
| 普通读/写  |  |  | 不允许 |
| volatile读 | 不允许 | 不允许 | 不允许 |
| volatile写 |  | 不允许 | 不允许 |

总结起来就是：

* 当第二个操作是 `volatile` 写时，不管第一个操作是什么，都不能重排序。这个规则确保 `volatile` 写之前的操作不会被编译器重排序到 `volatile` 写之后。
* 当第一个操作是 `volatile` 读时，不管第二个操作是什么，都不能重排序。这个规则确保 `volatile` 读之后的操作不会被编译器重排序到 `volatile` 读之前。
* 当第一个操作是 `volatile` 写，第二个操作是 `volatile` 读时，不能重排序。

#### (2) volatile 的内存屏障

在 `Java` 中对于 `volatile` 修饰的变量，编译器在生成字节码时，会在指令序列中插入内存屏障来禁止特定类型的处理器重排序问题。

##### volatile 写

![volatile写](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm16.png)

`storestore` 屏障：对于这样的语句 `store1; storestore; store2`，在 `store2` 及后续写入操作执行前，保证 `store1` 的写入操作对其它处理器可见。(也就是说如果出现 `storestore` 屏障，那么 `store1` 指令一定会在 `store2` 之前执行，`CPU` 不会对 `store1` 与 `store2` 进行重排序)

`storeload` 屏障：对于这样的语句 `store1; storeload; load2`，在 `load2` 及后续所有读取操作执行前，保证 `store1` 的写入对所有处理器可见。(也就是说如果出现 `storeload` 屏障，那么 `store1` 指令一定会在 `load2` 之前执行，`CPU` 不会对 `store1` 与 `load2` 进行重排序)

##### volatile 读

![volatile读](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm17.png)

在每个 `volatile` 读操作的后面插入一个 `LoadLoad` 屏障。在每个 `volatile` 读操作的后面插入一个 `loadstore` 屏障。

`loadload` 屏障：对于这样的语句 `load1; loadload; load2`，在 `load2` 及后续读取操作要读取的数据被访问前，保证 `load1` 要读取的数据被读取完毕。（也就是说，如果出现 `loadload` 屏障，那么 `load1` 指令一定会在 `load2` 之前执行，`CPU` 不会对 `load1` 与 `load2` 进行重排序）

`loadstore` 屏障：对于这样的语句 `load1; loadstore; store2`，在 `store2` 及后续写入操作被刷出前，保证 `load1` 要读取的数据被读取完毕。（也就是说，如果出现 `loadstore` 屏障，那么 `load1` 指令一定会在 `store2` 之前执行，`CPU` 不会对 `load1` 与 `store2` 进行重排序）

### 4 volatile 的实现原理

通过对 `OpenJDK` 中的 `unsafe.cpp` 源码的分析，会发现被 `volatile` 关键字修饰的变量会存在一个 `lock` 的前缀。

`Lock `前缀，`Lock` 不是一种内存屏障，但是它能完成类似内存屏障的功能。`Lock` 会对 `CPU` 总线和高速缓存加锁，可以理解为 `CPU` 指令级的一种锁。

同时该指令会将当前处理器缓存行的数据直接写会到系统内存中，且这个写回内存的操作会使在其他 `CPU` 里缓存了该地址的数据无效。

在具体的执行上，它先对总线和缓存加锁，然后执行后面的指令，最后释放锁后会把高速缓存中的脏数据全部刷新回主内存。在 `Lock` 锁住总线的时候，其他 `CPU` 的读写请求都会被阻塞，直到锁释放。


## 九、final的内存语义

在构造线程的类时，我们有种方式就是让类中所有的成员变量都不可变，利用的就是 `final` 关键字，那么这个 `final` 为何可以做到呢？重排序这种优化动作对构造方法，一样也是存在的。这就说明，一个成员变量加了 `final` 关键字后，`JMM` 一定是做了相关处理的。

### 1、final 的两个重排序规则

对应 `final` 域，编译器和处理器需要遵守两个重排序规则。

```java
public class FinalMemory {

    /**
     * 普通变量
     */
    private int i;

    /**
     * final 变量
     */
    private final int j;

    private static FinalMemory obj;

    public FinalMemory() {
        // 写普通域
        i = 1;
        // 写 final 域
        j = 2;
    }

    /**
     * 写线程A执行
     */
    public static void write() {
        obj = new FinalMemory();
    }

    /**
     * 读线程B执行
     */
    public static void read() {
        // 读对象引用
        FinalMemory object = obj;
        // 读普通域
        int a = object.i;
        // 读 final 域
        int b = object.j;
    }

}
```

我们假设一个线程 A 执行 `write` 方法，随后另一个线程 B 执行 `read` 方法。

1. 在构造函数内对一个 `final` 域的写入，与随后把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序。

看 `write()` 方法，只包含一行代码 `obj = new FinalMemory();`。这一行代码包含两个步骤：构造一个 `FinalMemory` 类型的对象。
把这个对象的引用赋值给引用变量 `obj`。假设线程 B 读对象引用（`FinalMemory object = obj`）与读对象的成员域之间
（`int a = object.i; int b = object.j`）没有重排序，下面的图是一种可能的执行时序：

![final](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm18.png)

从上面可能的时序图中我们可以看到，写普通域被编译器重排序到了构造函数之外，读线程 B 错误的读取了普通变量 i 初始化之前的值。而写 `final` 域的操作，被写 `final` 域的重排序规则“限制”到了构造函数之内，读线程 B 正确读取了 `final` 变量初始化之后的值。

总结：写 `final` 域的重排序规则可以确保在对象引用为任意线程可见之前，对象的 `final` 域已经被正常的初始化了，而普通域不具有这样的保证。

2. 初次读一个包含 `final` 域的对象的引用，与随后初次读这个 `final` 域，这两个操作之间不能重排序

在一个线程中，初次读对象引用与初次读该对象包含的 `final` 域，`JMM` 禁止处理器重排序这两个操作。编译器会在读 final 域操作的前面插入一个 `LoadLoad`屏障。`reader()` 方法包含 3 个步骤：初次读引用变量 `obj`，初次读引用变量 `obj` 指向对象的普通域 `i`，初次读引用变量 `obj` 指向对象的 `final` 域 `j`。我们假设写线程 A 没有发生任何重排序，则下图是一种可能的时序：

![final2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm19.png)

读对象的普通域的操作被处理器重排序到读对象引用之前。读普通域时，该域还没有被线程 A 写入，所以上面的是一个错误的读取操作。但是读 `final` 域的重排序规则把读对象 `final` 域的操作“限定”在读对象引用之后，该 `final` 域已经被 A 线程初始化了，是一个正确的读取操作。

总结：读 `final` 域的重排序规则可以确保在读一个对象的 `final` 域之前，一定会先读包含这个 `final` 域的对象的引用。

### 2、final 域为引用类型

```java
public class FinalRefMemory {

    /**
     * final 是引用类型
     */
    private final int[] intArray;
    private static FinalRefMemory obj;

    public FinalRefMemory() {
        // 操作1
        intArray = new int[1];
        // 操作2
        intArray[0] = 1;
    }

    /**
     * 写线程A执行
     */
    public static void writerOne() {
        // 操作3
        obj = new FinalRefMemory();
    }

    /**
     * 写线程B执行
     */
    public static void writeTwo() {
        // 操作4
        obj.intArray[0] = 2;
    }

    /**
     * 读线程C执行
     */
    public static void reader() {
        // 操作5
        if (obj != null) {
            // 操作6
            int temp1 = obj.intArray[0];
        }
    }
}
```

在上面的代码中，`final` 域是一个引用类型，它引用了一个 `int` 类型的数组，对于引用类型，写 `final` 域的重排序规则对编译器和处理器增加了一下的约束：在构造函数内对一个 `final` 引用的对象的成员域的写入，与随后在构造函数外把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序。

我们假设线程 A 先执行 `writeOne()` 操作，执行完后线程 B 执行 `writeTwo()` 操作，执行完后线程 C 执行 `reader()` 操作，下图是一种可能的执行时序：

![final3](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm20.png)

操作1 是对 `final` 域的写入，操作2 是对这个 `final` 域引用的对象的成员域的写入，操作3 是把被构造的对象的引用赋值给某个引用变量。这里除了前面提到的 操作1 不能和 操作3重排序外，操作2 和 操作3 也不能重排序。

`JMM` 可以确保读线程 C 至少能看到写线程 A 在构造函数中对 `final` 引用对象的成员域的写入。即 C 至少能看到数组下标 0 的值为 1。而写线程 B 对数组元素的写入，读线程 C 可能看得到，也可能看不到。`JMM` 不保证线程 B 的写入对读线程 C 可见，因为写线程 B 和读线程 C 之间存在数据竞争，此时的执行结果不可预知。

如果想要确保读线程 C 看到写线程 B 对数组元素的写入，写线程 B 和读线程 C 之间需要使用同步（`lock` 或 `volatile`）来确保内存可见性。

### 3、final 引用不能从构造函数内逃逸

写 `final` 域的重排序规则可以确保：在引用变量为任意线程可见之前，该引用变量指向的对象的 `final` 域已经在构造函数中被正确初始化过了。其实，要得到这个效果，还需要一个保证：在构造函数内部，不能让这个被构造对象的引用为其他线程所见，也就是对象引用不能在构造函数中逃逸。

```java
public class FinalEscape {

    private final int i;
    private static FinalEscape obj;

    public FinalEscape() {
        // 写 final 域
        i = 10;
        // this 引用溢出
        obj = this;
    }

    public static void write() {
        new FinalEscape();
    }

    public static void read() {
        if (obj != null) {
            int temp = obj.i;
        }
    }
}
```

假设一个线程 A 执行 `write()` 方法，另一个线程 B 执行 `read()` 方法。这里的操作 2 使得对象还未完成构造前就为线程 B 可见。即使这里的操作 2 是构造函数的最后一步，且在程序中操作 2 排在操作 1 后面，执行 `read()` 方法的线程仍然可能无法看到 `final` 域被初始化后的值，因为这里的操作 1 和操作 2 之间可能被重排序。

![final4](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm21.png)

因此在构造函数返回前，被构造对象的引用不能为其他线程所见，因为此时的 `final` 域可能还没有被初始化。

### 4、final 语义的实现

会要求编译器在 `final` 域的写之后，构造函数 `return` 之前插入一个 `StoreStore` 障屏。

读 `final` 域的重排序规则要求编译器在读 `final` 域的操作前面插入一个 `LoadLoad` 屏障。

## 十、锁的内存语义

当线程释放锁时，`JMM` 会把该线程对应的本地内存中的共享变量刷新到主内存中。

当线程获取锁时，`JMM` 会把该线程对应的本地内存置为无效。从而使得被监视器保护的临界区代码必须从主内存中读取共享变量。

![sync](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm22.png)

回顾之前 [线程之间的共享和协作](线程之间的共享和协作.md)  博客中的 `VolatileCase`，为了让子线程可以及时看到 `ready` 变量的修改，我们需要将 `ready` 变量以 `volatile` 来修饰。

```java
public class VolatileCase {

    private volatile static boolean READY;
    private static int NUMBER;

    private static class PrintThread extends Thread {
        @Override
        public void run() {
            System.out.println("PrintThread is running ...");
            // 无限循环
            while (!READY) {
            }
            System.out.println("number = " + NUMBER);
        }
    }

    public static void main(String[] args) {
        new PrintThread().start();
        SleepTool.second(1);
        NUMBER = 51;
        READY = true;
        SleepTool.second(5);
        System.out.println("main is ended!");
    }
}
```

但是，当我们将程序做如下改造：

```java
public class SyncMemory {

    private static boolean ready;
    private static int number;

    private static class PrintThread extends Thread {

        @Override
        public void run() {
            while (!ready) {
                System.out.println("number = " + number);
            }
            System.out.println("number = " + number);
        }
    }

    public static void main(String[] args) {
        new PrintThread().start();
        SleepTool.second(1);
        number = 51;
        ready = true;
        SleepTool.second(5);
        System.out.println("main is ended!");
    }
}
```

执行结果：

```console
number = 0
number = 0
number = 0
number = 0
number = 0
...
number = 0
number = 0
number = 0
number = 51
main is ended!
```

结合前面锁的内存语义，我们可以知道，当进入 `synchronized` 语句块时，子线程会被强制从主内存中读取共享变量，其中就包括了 `ready` 变量，所以子线程同样中止了。

### 1、synchronized 的实现原理

`synchronized` 在 `JVM` 里的实现都是基于进入和退出 `Monitor` 对象来实现方法同步和代码块同步，虽然具体实现细节不一样，但是都可以通过成对的 `MonitorEnter` 和 `MonitorExit` 指令来实现。

对同步块，`MonitorEnter` 指令插入在同步代码块的开始位置，当代码执行到该指令时，将会尝试获取该对象 `Monitor` 的所有权，即尝试获得该对象的锁，而 `MonitorExit` 指令则插入在方法结束处和异常处，`JVM` 保证每个 `MonitorEnter` 必须有对应的 `MonitorExit`。

对同步方法，从同步方法反编译的结果来看，方法的同步并没有通过指令 `MonitorEnter` 和 `MonitorExit` 来实现，相对于普通方法，其常量池中多了 `ACC_SYNCHRONIZED` 标示符。

`JVM` 就是根据该标示符来实现方法的同步的：当方法被调用时，调用指令将会检查方法的 `ACC_SYNCHRONIZED` 访问标志是否被设置，如果设置了，执行线程将先获取 `Monitor`，获取成功之后才能执行方法体，方法执行完后再释放 `Monitor`。在方法执行期间，其他任何线程都无法再获得同一个 `Monitor` 对象。

`synchronized` 使用的锁是存放在 `Java` 对象头里面：

| 长度 | 内容 | 说明 |
| --- | --- | --- |
| 32/64bit | Mark Word | 存储对象的 HashCode 货锁信息 |
| 32/64bit | Class Metadata Address | 存储对象类型数据的指针 |
| 32/64bit | Array length | 数据的长度（如果当前对象是数组） |

具体位置是对象头里面的 `MarkWord`，`MarkWord` 里默认数据是存储对象的 `HashCode` 等信息，

| 锁状态 | 25bit | 4bit | 1bit是否是偏向锁 | 2bit锁标志位 |
| --- | --- | --- |
| 无所状态 | 对象的 HashCode | 对象分代年龄 | 0 | 01 |

但是会随着对象的运行改变而发生变化，不同的锁状态对应着不同的记录存储方式

![sync2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm23.png)

### 2、深入了解锁

#### (1) 自旋锁

##### 原理

自旋锁原理非常简单，如果持有锁的线程能在很短时间内释放锁资源，那么那些等待竞争锁的线程就不需要做内核态和用户态之间的切换进入阻塞挂起状态，它们只需要等一等（自旋），等持有锁的线程释放锁后即可立即获取锁，这样就避免用户线程和内核的切换的消耗。

但是线程自旋是需要消耗 `CPU` 的，说白了就是让 `CPU` 在做无用功，线程不能一直占用 `CPU` 自旋做无用功，所以需要设定一个自旋等待的最大时间。

如果持有锁的线程执行的时间超过自旋等待的最大时间扔没有释放锁，就会导致其它争用锁的线程在最大等待时间内还是获取不到锁，这时争用线程会停止自旋进入阻塞状态。

##### 自旋锁的优缺点

自旋锁尽可能的减少线程的阻塞，这对于锁的竞争不激烈，且占用锁时间非常短的代码块来说性能能大幅度的提升，因为自旋的消耗会小于线程阻塞挂起操作的消耗！

但是如果锁的竞争激烈，或者持有锁的线程需要长时间占用锁执行同步块，这时候就不适合使用自旋锁了，因为自旋锁在获取锁前一直都是占用 `CPU` 做无用功，线程自旋的消耗大于线程阻塞挂起操作的消耗，其它需要 `CPU` 的线程又不能获取到 `CPU`，造成 `CPU` 的浪费。

##### 自旋锁时间阈值

自旋锁的目的是为了占着 `CPU` 的资源不释放，等到获取到锁立即进行处理。但是如何去选择自旋的执行时间呢？如果自旋执行时间太长，会有大量的线程处于自旋状态占用 `CPU` 资源，进而会影响整体系统的性能。因此自旋次数很重要

`JVM` 对于自旋次数的选择，`jdk1.5` 默认为 10 次，在 1.6 引入了适应性自旋锁，适应性自旋锁意味着自旋的时间不在是固定的了，而是由前一次在同一个锁上的自旋时间以及锁的拥有者的状态来决定，基本认为一个线程上下文切换的时间是最佳的一个时间。

`JDK1.6` 中 `-XX:+UseSpinning` 开启自旋锁； `JDK1.7` 后，去掉此参数，由 `JVM` 控制；

#### (2) 锁的状态

一共有四种状态，无锁状态、偏向锁状态、轻量级锁状态和重量级锁状态，它会随着竞争情况逐渐升级。锁可以升级但不能降级，目的是为了提高获得锁和释放锁的效率。

#### (3) 偏向锁

引入背景：大多数情况下锁不仅不存在多线程竞争，而且总是由同一线程多次获得，为了让线程获得锁的代价更低而引入了偏向锁，减少不必要的 `CAS` 操作。

偏向锁，顾名思义，它会偏向于第一个访问锁的线程，如果在运行过程中，同步锁只有一个线程访问，不存在多线程争用的情况，则线程是不需要触发同步的，减少加锁／解锁的一些 `CAS` 操作（比如等待队列的一些 `CAS` 操作），这种情况下，就会给线程加一个偏向锁。 如果在运行过程中，遇到了其他线程抢占锁，则持有偏向锁的线程会被挂起，`JVM` 会消除它身上的偏向锁，将锁恢复到标准的轻量级锁。它通过消除资源无竞争情况下的同步原语，进一步提高了程序的运行性能。

偏向锁获取过程：

1. 访问 `Mark Word` 中偏向锁的标识是否设置成 1，锁标志位是否为01，确认为可偏向状态。
2. 如果为可偏向状态，则测试线程 ID 是否指向当前线程，如果是，进入步骤 5，否则进入步骤 3。
3. 如果线程 ID 并未指向当前线程，则通过 `CAS` 操作竞争锁。如果竞争成功，则将 `Mark Word` 中线程 ID 设置为当前线程 ID，然后执行 5；如果竞争失败，执行 4。
4. 如果 `CAS` 获取偏向锁失败，则表示有竞争。当到达全局安全点（safepoint）时获得偏向锁的线程被挂起，偏向锁升级为轻量级锁，然后被阻塞在安全点的线程继续往下执行同步代码。（撤销偏向锁的时候会导致 stop theword）
5. 执行同步代码。

![sync3](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm24.png)

偏向锁的释放过程：

锁时，持有偏向锁的线程才会释放偏向锁，线程不会主动去释放偏向锁。偏向锁的撤销，需要等待全局安全点（在这个时间点上没有字节码正在执行），它会首先暂停拥有偏向锁的线程，判断锁对象是否处于被锁定状态，撤销偏向锁后恢复到未锁定（标志位为“01”）或轻量级锁（标志位为“00”）的状态。

偏向锁的适用场景：

始终只有一个线程在执行同步块，在它没有执行完释放锁之前，没有其它线程去执行同步块，在锁无竞争的情况下使用，一旦有了竞争就升级为轻量级锁，升级为轻量级锁的时候需要撤销偏向锁，撤销偏向锁的时候会导致 stop the word 操作；在有锁的竞争时，偏向锁会多做很多额外操作，尤其是撤销偏向所的时候会导致
进入安全点，安全点会导致 stw，导致性能下降，这种情况下应当禁用。

jvm 开启/关闭偏向锁：

* 开启偏向锁：-XX:+UseBiasedLocking -XX:BiasedLockingStartupDelay=0
* 关闭偏向锁：-XX:-UseBiasedLocking

#### (4) 轻量级锁

轻量级锁是由偏向锁升级来的，偏向锁运行在一个线程进入同步块的情况下，当第二个线程加入锁争用的时候，偏向锁就会升级为轻量级锁；

轻量级锁的加锁过程：

1. 在代码进入同步块的时候，如果同步对象锁状态为无锁状态且不允许进行偏向（锁标志位为“01”状态，是否为偏向锁为“0”），虚拟机首先将在当前线程的栈帧中建立一个名为锁记录（Lock Record）的空间，用于存储锁对象目前的Mark Word 的拷贝，官方称之为 Displaced Mark Word。

2. 拷贝成功后，虚拟机将使用 CAS 操作尝试将对象的 Mark Word 更新为指向 LockRecord 的指针，并将 Lock record 里的 owner 指针指向 object mark word。如果更新成功，则执行步骤 3，否则执行步骤 4。

3. 如果这个更新动作成功了，那么这个线程就拥有了该对象的锁，并且对象 MarkWord 的锁标志位设置为“00”，即表示此对象处于轻量级锁定状态

4. 如果这个更新操作失败了，虚拟机首先会检查对象的 Mark Word 是否指向当前线程的栈帧，如果是就说明当前线程已经拥有了这个对象的锁，那就可以直接进入同步块继续执行。否则说明多个线程竞争锁，当竞争线程尝试占用轻量级锁失败多次之后，轻量级锁就会膨胀为重量级锁，重量级线程指针指向竞争线程，竞争线程也会阻塞，等待轻量级线程释放锁后唤醒他。锁标志的状态值变为“10”，Mark Word 中存储的就是指向重量级锁（互斥量）的指针，后面等待锁的线程也要进入阻塞状态。

![sync4](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/jmm25.png)

#### (4) 不同锁的比较

| 锁 | 优点 | 缺点 | 使用场景 |
| --- | --- | --- | --- |
| 偏向锁 | 加锁和解锁不需要额外的消耗和执行非同步方法比仅存在纳秒级的差距 | 如果线程间存在锁竞争，会带来额外的锁撤销的消耗 | 适用于只有一个线程的访问同步块场景 |
| 轻量级锁 | 竞争线程不会阻塞，调高了程序的响应速度 | 如果始终的补刀锁竞争的线程使用自旋会消耗 `CPU` | 追求响应时间；同步块执行速度非常快 |
| 重量级锁 | 线程竞争不使用自旋，不会消耗 `CPU` | 线程阻塞，响应时间缓慢 | 追求吞吐量；同步块执行速度较长 |

### 3、JDK 对锁的更多优化措施

#### (1) 逃逸分析

如果证明一个对象不会逃逸方法外或者线程外，则可针对此变量进行优化：同步消除 `synchronization Elimination`，如果一个对象不会逃逸出线程，则对此变量的同步措施可消除。

#### (2) 锁消除和粗化

锁消除：虚拟机的运行时编译器在运行时如果检测到一些要求同步的代码上不可能发生共享数据竞争，则会去掉这些锁。

锁粗化：将临近的代码块用同一个锁合并起来。

消除无意义的锁获取和释放，可以提高程序运行性能。

<Valine></Valine>