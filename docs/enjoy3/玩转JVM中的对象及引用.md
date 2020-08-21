# 玩转JVM中的对象及引用

<Counter :path="'enjoy3'" :name="'玩转JVM中的对象及引用'"></Counter>

## 一、JVM 中对象的创建过程

![对象创建过程](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm16.png)

### 1、对象的内存分配

`JVM` 遇到一条 `new` 指令时，首先检查是否被类加载器加载，如果没有，那必须先执行相应的类加载过程。类加载就是把 `class` 加载到 `JVM` 的运行时数据区的过程。

#### (1) 检查加载

首先检查这个指令的参数是否能在 `常量池` 中定位到一个类的 `符号引用`（是以一组符号来描述所引用的目标），并且检查类是否已经被加载、解析和初始化过。

#### (2) 分配内存

接下来虚拟机将为新生对象分配内存。为对象分配空间的任务等同于把一块确定大小的内存从 `Java 堆` 中划分出来。

内存分配分为两种方式，一种是 `指针碰撞`，一种是 `空闲列表`。

* 指针碰撞

如果 `Java 堆` 中内存是绝对规整的，所有用过的内存都放在一边，空闲的内存放在另一边，中间放着一个指针作为分界点的指示器，那所分配内存就仅仅是把那个指针向空闲空间那边挪动一段与对象大小相等的距离，这种分配方式称为 `指针碰撞`。

![指针碰撞](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm17.png)

* 空闲列表

如果 `Java 堆` 中的内存并不是规整的，已使用的内存和空闲的内存相互交错，那就没有办法简单地进行指针碰撞了，虚拟机就必须维护一个列表，记录上哪些内存块是可用的，在分配的时候从列表中找到一块足够大的空间划分给对象实例，并更新列表上的记录，这种分配方式称为 `空闲列表`。

![空闲列表](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm18.png)

选择哪种分配方式由 `Java 堆` 是否规整决定，而 `Java 堆` 是否规整又由所采用的 `垃圾收集器` 是否带有压缩整理功能决定。

如果是 `Serial`、`ParNew` 等带有压缩的整理的垃圾回收器的话，系统采用的是 `指针碰撞`，既简单又高效。

如果是使用 `CMS` 这种不带压缩（整理）的垃圾回收器的话，理论上只能采用较复杂的 `空闲列表`。

##### 并发安全

除了如何划分可用空间之外，还有另外一个需要考虑的问题是对象创建在虚拟机中是非常频繁的行为，即使是仅仅修改一个指针所指向的位置，在并发情况下也并不是线程安全的，可能出现正在给 对象A 分配内存，指针还没来得及修改，对象B 又同时使用了原来的指针来分配内存的情况。

解决这个问题有两种方案：

* CAS 机制

一种是对分配内存空间的动作进行同步处理——实际上虚拟机采用 `CAS` 配上失败重试的方式保证更新操作的 `原子性`。

![CAS机制](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm19.png)

* 分配缓冲

另一种是把内存分配的动作按照线程划分在不同的空间之中进行，即每个线程在 `Java 堆` 中预先分配一小块私有内存，也就是 `本地线程分配缓冲`（`Thread Local Allocation Buffer`，即 `TLAB`），`JVM` 在线程初始化时，同时也会申请一块指定大小的内存，只给当前线程使用，这样每个线程都单独拥有一个 `Buffer`，如果需要分配内存，就在自己的 `Buffer` 上分配，这样就不存在竞争的情况，可以大大提升分配效率，当 `Buffer` 容量不够的时候，再重新从 `Eden` 区域申请一块继续使用。

`TLAB` 的目的是在为新对象分配内存空间时，让每个 Java 应用线程 能在使用自己专属的分配指针来分配空间，减少同步开销。

`TLAB` 只是让每个线程有私有的分配指针，但底下存对象的内存空间还是给所有线程访问的，只是其它线程无法在这个区域分配而已。当一个 `TLAB` 用满（分配指针 `top` 撞上分配极限 `end` 了），就新申请一个 `TLAB`。

配置参数 `-XX:+UseTLAB` 可以允许在年轻代空间中使用线程本地分配块（`TLAB`）。默认情况下启用此选项。要禁用 `TLAB`，请指定 `-XX:-UseTLAB`。

参考文档：<https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html>

#### (3) 内存空间初始化

内存分配完成后，虚拟机需要将分配到的内存空间都初始化为零值(如 `int` 值为 0，`boolean` 值为 `false` 等等)。这一步操作保证了对象的实例字段在 Java 代码中可以不赋初始值就直接使用，程序能访问到这些字段的数据类型所对应的零值。

#### (4) 设置

接下来，虚拟机要对对象进行必要的设置，例如这个对象是哪个类的实例、如何才能找到类的元数据信息（`Java classes` 在 `Java hotspot VM` 内部表示为类元数据）、对象的哈希码、对象的 `GC` 分代年龄等信息。这些信息存放在对象的对象头之中。

#### (5) 对象初始化

在上面工作都完成之后，从虚拟机的视角来看，一个新的对象已经产生了，但从 Java 程序 的视角来看，对象创建才刚刚开始，所有的字段都还为零值。所以，一般来说，执行 `new` 指令之后会接着把对象按照程序员的意愿进行初始化(构造方法)，这样一个真正可用的对象才算完全产生出来。

### 2、对象的内存布局

![对象的内存布局](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/enjoy3/jvm20.png)

在 `HotSpot` 虚拟机中，对象在内存中存储的布局可以分为 3 块区域：`对象头`（`Header`）、`实例数据`（`Instance Data`）和 `对齐填充`（`Padding`）。

`对象头` 包括两部分信息，第一部分用于存储对象自身的运行时数据，如 `哈希码`（`HashCode`）、`GC 分代年龄`、`锁状态标志`、`线程持有的锁`、`偏向线程ID`、`偏向时间戳`等。

`对象头` 的另外一部分是 `类型指针`，即对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例。

如果对象是一个 `Java 数组`，那么在对象头中还有一块用于记录数组长度的数据。

第三部分对齐填充并不是必然存在的，也没有特别的含义，它仅仅起着占位符的作用。由于 `HotSpot VM` 的自动内存管理系统要求对对象的大小必须是 8 字节的整数倍。当对象其他数据部分没有对齐时，就需要通过对齐填充来补全。

### 4、对象的访问定位

建立对象是为了使用对象，Java 程序需要通过 `栈` 上的 `reference` 数据来操作 `堆` 上的具体对象。目前主流的访问方式有使用 `句柄` 和 `直接指针` 两种。

#### (1) 句柄 

如果使用 `句柄` 访问的话，那么 `Java 堆` 中将会划分出一块内存来作为 `句柄池`，`reference` 中存储的就是对象的 `句柄地址`，而 `句柄` 中包含了对象实例数据与类型数据各自的具体地址信息。

使用 `句柄` 来访问的最大好处就是 `reference` 中存储的是稳定的 `句柄地址`，在对象被移动（垃圾收集时移动对象是非常普遍的行为）时只会改变 `句柄` 中的 `实例数据指针`，而 `reference` 本身不需要修改.

#### (2) 直接指针

如果使用直接指针访问，`reference` 中存储的直接就是 `对象地址`。

这两种对象访问方式各有优势，使用 `直接指针` 访问方式的最大好处就是速度更快，它节省了一次指针定位的时间开销，由于对象的访问在 `Java` 中非常频繁，因此这类开销积少成多后也是一项非常可观的执行成本。

对 `Sun HotSpot` 而言，它是使用 `直接指针` 访问方式进行对象访问的。

### 5、判断对象的存活

在 `堆` 里面存放着几乎所有的对象实例，垃圾回收器在对对进行回收前，要做的事情就是确定这些对象中哪些还是“存活”着，哪些已经“死去”（死去代表着不可能再被任何途径使用得对象了）

`C` 申请内存：`malloc free`，`C++` 申请内存：`new delete`。`C/C++` 都是手动回收内存。

`Java` 使用 `new` 创建对象，`Java` 是自动内存回收，编程上简单，系统不容易出错。

手动释放内存，容易出两种类型的问题：1、忘记回收；2、多次回收

判断对象是否是垃圾：没有任何引用指向的一个对象或者多个对象（不包括循环引用）。

#### (1) 引用计数法

在对象中添加一个 `引用计数器`，每当有一个地方引用它，计数器就加 1，当引用失效时，计数器减 1。

`Python` 在用，但主流虚拟机没有使用，因为存在对象相互引用的情况，这个时候需要引入额外的机制来处理，这样做影响效率。

在 `Java` 中，只保留相互引用的对象还是会被回收掉，说明 `JVM` 中采用的不是 `引用计数法`。

#### (2) 可达性分析

来判定对象是否存活的。这个算法的基本思路就是通过一系列的称为 `GC Roots` 的对象作为起始点，从这些节点开始向下搜索，搜索所走过的路径称为 `引用链`（`Reference Chain`），当一个对象到 `GC Roots` 没有任何 `引用链` 相连时，则证明此对象是不可用的。

作为 `GC Roots` 的对象包括下面几种，其中重点是前面 4 种：

1. `虚拟机栈`（`栈帧` 中的 `本地变量表`）中引用的对象；各个线程被调用方法堆栈中使用到的参数、局部变量、临时变量等。
2. `方法区` 中类静态属性引用的对象；`Java 类` 的引用类型静态变量。
3. `方法区` 中常量引用的对象；比如：字符串常量池里的引用。
4. `本地方法栈` 中 `JNI`（即一般说的 `Native` 方法）引用的对象。
5. `JVM` 的内部引用（`class` 对象、异常对象 `NullPointException`、`OutofMemoryError`，系统类加载器）。
6. 所有被同步锁（`synchronized` 关键）持有的对象。
7. `JVM` 内部的 `JMXBean`、`JVMTI` 中注册的回调、本地代码缓存等。
8. `JVM` 实现中的“临时性”对象，跨代引用的对象（在使用分代模型回收只回收部分代的对象）

以上的回收都是对象和类的回收条件。注意 `Class` 要被回收，条件比较苛刻，必须同时满足以下的条件（仅仅是可以，不代表必然，因为还有一些参数可以进行控制）：
1. 该类所有的实例都已经被回收，也就是 `堆` 中不存在该类的任何实例。
2. 加载该类的 `ClassLoader` 已经被回收。
3. 该类对应的 `java.lang.Class` 对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法。
4. 参数控制：`-Xnoclassgc`，废弃的常量和静态变量的回收其实就和 `Class` 回收的条件差不多。

### 5、Finalize() 方法

即使通过可达性分析判断不可达的对象，也不是“非死不可”，它还会处于“缓刑”阶段，真正要宣告一个对象死亡，需要经过两次标记过程，一次是没有找到与 `GCRoots` 的引用链，它将被第一次标记。随后进行一次筛选（如果对象覆盖了 `finalize()`），我们可以在 `finalize()` 中去拯救。

```java
public class FinalizeGC {

    public static FinalizeGC instance = null;

    public void isAlive() {
        System.out.println("I am still alive!");
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("finalize method executed");
        FinalizeGC.instance = this;
    }

    public static void main(String[] args) throws Throwable {
        instance = new FinalizeGC();
        // 对象进行第1次GC
        instance = null;
        System.gc();
        Thread.sleep(1000);//Finalizer方法优先级很低，需要等待
        if (instance != null) {
            instance.isAlive();
        } else {
            System.out.println("I am dead！");
        }
        //对象进行第2次GC
        instance = null;
        System.gc();
        Thread.sleep(1000);
        if (instance != null) {
            instance.isAlive();
        } else {
            System.out.println("I am dead！");
        }
    }
}
```

执行结果：

```console
finalize method executed
I am still alive!
I am dead！
```

可以看到，对象可以被拯救一次( `finalize()` 方法会执行一次，但是不会执行第二次)。

修改一下代码，再看看。

```java
public class FinalizeGC {

    public static FinalizeGC instance = null;

    public void isAlive() {
        System.out.println("I am still alive!");
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("finalize method executed");
        FinalizeGC.instance = this;
    }

    public static void main(String[] args) throws Throwable {
        instance = new FinalizeGC();
        // 对象进行第1次GC
        instance = null;
        System.gc();
//        Thread.sleep(1000);//Finalizer方法优先级很低，需要等待
        if (instance != null) {
            instance.isAlive();
        } else {
            System.out.println("I am dead！");
        }
        //对象进行第2次GC
        instance = null;
        System.gc();
//        Thread.sleep(1000);
        if (instance != null) {
            instance.isAlive();
        } else {
            System.out.println("I am dead！");
        }
    }
}
```

将中间两次休眠注释掉。

执行结果：

```console
I am dead！
finalize method executed
I am dead！
```

这一次，对象没有被拯救，这个就是 `finalize()` 方法执行缓慢，还没有完成拯救，垃圾回收器就已经回收掉了。

所以尽量不要使用 `finalize()`，因为这个方法太不可靠。在生产中你很难控制方法的执行或者对象的调用顺序。因为在 `finalize()` 方法能做的工作，`Java` 中有更好的，比如 `try-finally`。

## 二、各种引用

### 1、强引用

一般的 `Object obj = new Object()`，就属于 `强引用`。在任何情况下，只有有强引用关联（与根可达）还在，垃圾回收器就永远不会回收掉被引用的对象。

### 2、软引用 SoftReference

一些有用但是并非必需，用 `软引用` 关联的对象，系统将要发生内存溢出（`OOM`）之前，这些对象就会被回收（如果这次回收后还是没有足够的空间，才会抛出内存溢出）。

```java
public class TestSoftRef {
    //对象
    public static class User {
        public int id = 0;
        public String name = "";

        public User(int id, String name) {
            super();
            this.id = id;
            this.name = name;
        }

        @Override
        public String toString() {
            return "User [id=" + id + ", name=" + name + "]";
        }

    }

    public static void main(String[] args) {
        User u = new User(1, "King"); //new是强引用
        SoftReference<User> userSoft = new SoftReference<>(u);//软引用
        u = null;//干掉强引用，确保这个实例只有userSoft的软引用
        System.out.println(userSoft.get()); //看一下这个对象是否还在
        System.gc();//进行一次GC垃圾回收  千万不要写在业务代码中。
        System.out.println("After gc");
        System.out.println(userSoft.get());
        //往堆中填充数据，导致OOM
        List<byte[]> list = new LinkedList<>();
        try {
            for (int i = 0; i < 100; i++) {
                //System.out.println("*************"+userSoft.get());
                list.add(new byte[1024 * 1024 * 1]); //1M的对象 100m
            }
        } catch (Throwable e) {
            //抛出了OOM异常时打印软引用对象
            System.out.println("Exception*************" + userSoft.get());
        }

    }
}
```

运行时指定参数：`-Xms10m -Xmx10m -XX:+PrintGC`

执行结果：

```console
User [id=1, name=King]
[GC (System.gc())  2028K->756K(9728K), 0.0031256 secs]
[Full GC (System.gc())  756K->670K(9728K), 0.0038726 secs]
After gc
User [id=1, name=King]
[GC (Allocation Failure) -- 7919K->7919K(9728K), 0.0005728 secs]
[Full GC (Ergonomics)  7919K->7766K(9728K), 0.0054970 secs]
[GC (Allocation Failure) -- 7766K->7766K(9728K), 0.0002498 secs]
[Full GC (Allocation Failure)  7766K->7750K(9728K), 0.0060318 secs]
Exception*************null
```

可以看出，最开始进行手动 `gc` 的时候，`User` 是存在的，当发生了 `OOM` 之后，`User` 被回收了。

例如，一个程序用来处理用户提供的图片。如果将所有图片读入内存，这样虽然可以很快的打开图片，但内存空间使用巨大，一些使用较少的图片浪费内存空间，需要手动从内存中移除。如果每次打开图片都从磁盘文件中读取到内存再显示出来，虽然内存占用较少，但一些经常使用的图片每次打开都要访问磁盘，代价巨大。这个时候就可以用 `软引用` 构建缓存。

### 3、弱引用 WeakReference

一些有用（程度比 `软引用` 更低）但是并非必需，用 `弱引用` 关联的对象，只能生存到下一次垃圾回收之前，`GC` 发生时，不管内存够不够，都会被回收。

```java
public class TestWeakRef {
    public static class User {
        public int id = 0;
        public String name = "";

        public User(int id, String name) {
            super();
            this.id = id;
            this.name = name;
        }

        @Override
        public String toString() {
            return "User [id=" + id + ", name=" + name + "]";
        }

    }

    public static void main(String[] args) {
        User u = new User(1, "King");
        WeakReference<User> userWeak = new WeakReference<User>(u);
        u = null;//干掉强引用，确保这个实例只有userWeak的弱引用
        System.out.println(userWeak.get());
        System.gc();//进行一次GC垃圾回收,千万不要写在业务代码中。
        System.out.println("After gc");
        System.out.println(userWeak.get());
    }
}
```

执行结果：

```console
User [id=1, name=King]
After gc
null
```

注意：`软引用` `SoftReference` 和 `弱引用` `WeakReference`，可以用在内存资源紧张的情况下以及创建不是很重要的数据缓存。当系统内存不足的时候，缓存中的内容是可以被释放的。
实际运用例如：`WeakHashMap` 和 `ThreadLocal`

### 4、虚引用 PhantomReference

最弱（随时会被回收掉），垃圾回收的时候会收到一个通知，就是为了监控垃圾回收器是否正常工作。

## 三、对象的分配策略

### 1、栈上分配

#### (1) 没有逃逸

即方法中的对象没有发生逃逸。
逃逸分析的原理：分析对象动态作用域，当一个对象在方法中定义后，它可能被外部方法所引用。
比如：调用参数传递到其他方法中，这种称之为方法逃逸。甚至还有可能被外部线程访问到，例如：赋值给其他线程中访问的变量，这个称之为线程逃逸。
从不逃逸到方法逃逸到线程逃逸，称之为对象由低到高的不同逃逸程度。
如果确定一个对象不会逃逸出线程之外，那么让对象在栈上分配内存可以提高JVM 的效率。

例如：

<Valine></Valine>