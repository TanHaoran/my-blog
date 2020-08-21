# 显示锁和AQS

<Counter :path="'backend'" :name="'显示锁和AQS'"></Counter>

## 一、显示锁 Lock

Java 程序是靠 `synchronized` 关键字实现锁功能的，使用 `synchronized` 关键字将会隐式地获取锁，但是它将锁的获取和释放固化了，也就是先获取再释放。

### 1、Lock 的标准用法
```java
       lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
```

在 `finally` 块中释放锁，目的是保证在获取到锁之后，最终能够被释放。

不要将获取锁的过程写在 `try` 块中，因为如果在获取锁（自定义锁的实现）时发生了异常，异常抛出的同时，也会导致锁无故释放。

示例：
```java
public class LockCase {

    private Lock lock = new ReentrantLock();

    private int age = 100000;

    private static class TestThread extends Thread {

        private LockCase lockCase;

        public TestThread(LockCase lockCase, String name) {
            super(name);
            this.lockCase = lockCase;
        }

        @Override
        public void run() {
            for (int i = 0; i < 100000; i++) {
                lockCase.test();
            }
            System.out.println(Thread.currentThread().getName() + " age =  " + lockCase.getAge());
        }
    }

    public void test() {
        lock.lock();
        try {
            age++;
        } finally {
            lock.unlock();
        }
    }

    public void test2() {
        lock .lock();
        try {
            age--;
        } finally {
            lock.unlock();
        }
    }

    public int getAge() {
        return age;
    }

    public static void main(String[] args) {
        LockCase lockCase = new LockCase();
        Thread testThread = new TestThread(lockCase, "endThread");
        testThread.start();
        for (int i = 0; i < 100000; i++) {
            lockCase.test2();
        }
        System.out.println(Thread.currentThread().getName() + " age =  " + lockCase.getAge());
    }

}
```

执行结果：
```console
main age =  95664
endThread age =  100000
```
由于两个线程一个在增加、一个在减少，所以先执行完的线程计算的结果不一定是100000，但是后执行的线程计算结果一定是100000。

### 2、Lock 的常用 API

| 方法名称 | 描述 |
| --- | --- |
| void lock() | 获取锁，调用该方法当前线程将会获取锁，当锁获得后，从该方法返回 |
| void lockInterruptibly() throws InterruptedException | 可中断的获取锁，和 `lock()` 方法的不同之处在于该方法会响应中断，即在锁的获取中可以中断当前线程 |
| boolean tryLock() | 尝试非阻塞的获取锁，调用该方法后立刻返回，如果能够获取则返回 `true` ，否则返回 `false` |
| boolean tryLock(long time, TimeUnit unit) throws InterruptedException | 超时的获取锁，当前线程在以下3中情况下回返回：1、当前线程在超时时间内获得了锁；2、当前线程在超时时间内被中断；3、超时时间结束，返回 `false` |
| void unlock() | 释放锁 |

### 3、可重入锁 ReentrantLock

#### 锁的可重入

简单地讲就是：“同一个线程对于已经获得到的锁，可以多次继续申请到该锁的使用权”。`synchronized` 关键字隐式的支持重进入，比如一个 `synchronized` 修饰的递归方法，在方法执行时，执行线程在获取了锁之后仍能连续多次地获得该锁。 `ReentrantLock` 在调用 `lock()` 方法时，已经获取到锁的线程，能够再次调用 `lock()` 方法获取锁而不被阻塞。这就叫做锁的可重入。

#### 公平锁和非公平锁

如果在时间上，先对锁进行获取的请求一定先被满足，那么这个锁是公平的，反之，是不公平的。公平的获取锁，也就是等待时间最长的线程最优先获取锁，也可以说锁获取是顺序的。 `ReentrantLock` 提供了一个构造方法 `public ReentrantLock(boolean fair)`，能够控制锁是否是公平的。事实上，公平的锁机制往往没有非公平的效率高。

在激烈竞争的情况下,非公平锁的性能高于公平锁的性能的一个原因是：在恢复一个被挂起的线程与该线程真正开始运行之间存在着严重的延迟。假设线程 `A` 持有一个锁，并且线程 `B` 请求这个锁。由于这个锁已被线程 `A` 持有，因此 `B` 将被挂起。当 `A` 释放锁时，`B` 将被唤醒，因此会再次尝试获取锁。与此同时，如果 `C` 也请求这个锁，那么 `C` 很可能会在 `B` 被完全唤醒之前获得、使用以及释放这个锁。这样的情况是一种“双赢”的局面：`B` 获得锁的时刻并没有推迟，`C` 更早地获得了锁，并且吞吐量也获得了提高。

### 4、读写锁 ReentrantReadWriteLock

`ReentrantLock` 是一种排他锁，这些锁在同一时刻只允许一个线程进行访问，而读写锁在同一时刻可以允许多个读线程访问，但是在写线程访问时，所有的读线程和其他写线程均被阻塞。读写锁维护了一对锁，一个读锁和一个写锁，通过分离读锁和写锁，使得并发性相比一般的排他锁有了很大提升。

除了保证写操作对读操作的可见性以及并发性的提升之外，读写锁能够简化读写交互场景的编程方式。假设在程序中定义一个共享的用作缓存数据结构，它大部分时间提供读服务（例如查询和搜索），而写操作占有的时间很少，但是写操作完成之后的更新需要对后续的读服务可见。

在没有读写锁支持的（Java 5 之前）时候，如果需要完成上述工作就要使用 Java 的等待通知机制，就是当写操作开始时，所有晚于写操作的读操作均会进入等待状态，只有写操作完成并进行通知之后，所有等待的读操作才能继续执行（写操作之间依靠 `synchronized` 关键进行同步），这样做的目的是使读操作能读取到正确的数据，不会出现脏读。改用读写锁实现上述功能，只需要在读操作时获取读锁，写操作时获取写锁即可。当写锁被获取到时，后续（非当前写操作线程）的读写操作都会被阻塞，写锁释放之后，所有操作继续执行，编程方式相对于使用等待通知机制的实现方式而言，变得简单明了。

一般情况下，读写锁的性能都会比排它锁好，因为大多数场景读是多于写的。在读多于写的情况下，读写锁能够提供比排它锁更好的并发性和吞吐量。

`ReentrantReadWriteLock` 其实实现的是 `ReadWriteLock` 接口。

下面演示一下，使用 `ReentrantReadWriteLock` 和 `synchronized` 两个的性能对比。

一个商品类的接口：
```java
public interface GoodsService {

    /**
     * 获得商品的信息
     *
     * @return
     */
    GoodsInfo getNum();

    /**
     * 设置商品的数量
     *
     * @param number
     */
     void setNum(int number);
}
```

实现类：
```java
public class GoodsInfo {

    private final String name;

    /**
     * 销售总价
     */
    private double totalMoney;

    /**
     * 库存
     */
    private int storeNumber;

    public GoodsInfo(String name, int totalMoney, int storeNumber) {
        this.name = name;
        this.totalMoney = totalMoney;
        this.storeNumber = storeNumber;
    }

    public double getTotalMoney() {
        return totalMoney;
    }

    public int getStoreNumber() {
        return storeNumber;
    }

    public void changeNumber(int sellNumber) {
        this.totalMoney += sellNumber * 25;
        this.storeNumber -= sellNumber;
    }
}
```

先来看看使用 `synchronized` 的实现：
```java
public class UseSync implements GoodsService {

    private GoodsInfo goodsInfo;

    public UseSync(GoodsInfo goodsInfo) {
        this.goodsInfo = goodsInfo;
    }

    @Override
    public synchronized GoodsInfo getNum() {
        SleepTool.ms(5);
        return goodsInfo;
    }

    @Override
    public synchronized void setNum(int number) {
        SleepTool.ms(5);
        goodsInfo.changeNumber(number);
    }

}
```

测试类：
```java
public class BusinessApp {

    /**
     * 读写线程的比例
     */
    private static final int READ_WRITE_RATIO = 10;

    /**
     * 最少线程数
     */
    private static final int MIN_THREAD_COUNT = 3;

    /**
     * 读操作线程
     */
    private static class GetThread implements Runnable {

        private GoodsService goodsService;

        public GetThread(GoodsService goodsService) {
            this.goodsService = goodsService;
        }

        @Override
        public void run() {
            long start = System.currentTimeMillis();
            for (int i = 0; i < 100; i++) {
                goodsService.getNum();
            }
            System.out.println(Thread.currentThread().getName() + "读取商品数据耗时："
                    + (System.currentTimeMillis() - start) + "ms");
        }
    }

    /**
     * 写操作线程
     */
    private static class SetThread implements Runnable {

        private GoodsService goodsService;

        public SetThread(GoodsService goodsService) {
            this.goodsService = goodsService;
        }

        @Override
        public void run() {
            long start = System.currentTimeMillis();
            Random r = new Random();
            for (int i = 0; i < 10; i++) {
                SleepTool.ms(50);
                goodsService.setNum(r.nextInt(10));
            }
            System.out.println(Thread.currentThread().getName()
                    + "写商品数据耗时：" + (System.currentTimeMillis() - start) + "ms---------");
        }
    }

    public static void main(String[] args) {
        GoodsInfo goodsInfo = new GoodsInfo("Cup", 100000, 10000);

        GoodsService goodsService = new UseSync(goodsInfo);
        for (int i = 0; i < MIN_THREAD_COUNT; i++) {
            Thread setT = new Thread(new SetThread(goodsService));
            for (int j = 0; j < READ_WRITE_RATIO; j++) {
                Thread getT = new Thread(new GetThread(goodsService));
                getT.start();
            }
            SleepTool.ms(100);
            setT.start();
        }
    }
}
```

执行结果：
```console
Thread-10读取商品数据耗时：1134ms
Thread-9读取商品数据耗时：1703ms
Thread-7读取商品数据耗时：2654ms
Thread-6读取商品数据耗时：3205ms
Thread-8读取商品数据耗时：4058ms
...
Thread-32读取商品数据耗时：16917ms
Thread-11写商品数据耗时：17157ms---------
Thread-0写商品数据耗时：17318ms---------
Thread-22写商品数据耗时：17160ms---------
```
可以看出，到后读商品数据的耗时越来越长，

来看看 `ReentrantReadWriteLock` 的实现：
```java
public class UseRwLock implements GoodsService{

    private GoodsInfo goodsInfo;

    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    /**
     * 读锁
     */
    private final Lock getLock = lock.readLock();

    /**
     * 写锁
     */
    private final Lock setLock = lock.writeLock();

    public UseRwLock(GoodsInfo goodsInfo) {
        this.goodsInfo = goodsInfo;
    }

    @Override
    public GoodsInfo getNum() {
        getLock.lock();
        try {
            SleepTool.ms(5);
            return this.goodsInfo;
        } finally {
            getLock.unlock();
        }
    }

    @Override
    public void setNum(int number) {
        setLock.lock();
        try {
            SleepTool.ms(5);
            goodsInfo.changeNumber(number);
        } finally {
            setLock.unlock();
        }
    }
}
```

将上面测试类中的实现换成 `UseRwLock` ，并执行，结果：
```console
Thread-0写商品数据耗时：604ms---------
Thread-5读取商品数据耗时：752ms
Thread-10读取商品数据耗时：752ms
Thread-3读取商品数据耗时：753ms
Thread-2读取商品数据耗时：753ms
...
Thread-23读取商品数据耗时：770ms
Thread-26读取商品数据耗时：770ms
Thread-32读取商品数据耗时：774ms
Thread-31读取商品数据耗时：775ms
```
可以看出读商品的时间一直都很快，而且稳定。

### 5、Condition 接口

任意一个 `Java` 对象，都拥有一组监视器方法（定义在 java.lang.Object 上），主要包括 `wait()` 、 `wait(long timeout)` 、 `notify()` 以及 `notifyAll()` 方法，这些方法与 `synchronized`  同步关键字配合，可以实现等待/通知模式。 `Condition` 接口也提供了类似 `Object` 的监视器方法，与 `Lock` 配合可以实现等待/通知模式。

#### Condition 常用方法

| 方法名称 | 描述 |
| --- | --- |
| void await() throws InterruptedException | 当前线程进入等待状态并释放相关联的锁直到被通知（ `signal()` ）或中断，当前线程将进入运行状态且从 `await()` 方法返回的情况包括：1、其它线程调用该 `Condition` 的 `signal()` 或 `signalAll()` 方法，而当前线程被选中唤醒；2、其它线程（调用 `interrupt()` 方法）中断当前线程。如果当前等待线程从 `await()` 方法返回，那么表明该线程已经获取了 `Condition` 对象所对应的锁 |
| void awaitUninterruptibly() | 当前线程进入等待状态直到被通知，从方法名可以看书该方法对中断不敏感 |
| long awaitNanos(long nanosTimeout) throws InterruptedException | 当前线程进入等待状态直到被通知、中断或者超时。返回值表示剩余时间，如果在 `nanosTimeout` 纳秒之前被唤醒，那么返回值就是 `nanosTimeout - 实际耗时` 。如果返回值是0或者负数，那么可以认定已经超时了。 |
| boolean awaitUnit(Date deadline) throws InterruptedException | 当前线程进入等待状态直到被通知、中断或者到某个时间。如果没有到指定时间就被通知，方法返回 `ture` ，否则，表示到了指定时间，方法返回 `false` 。 |
| void signal() | 唤醒一个等待在 `Condition` 上的线程，该线程从等待方法返回前必须获得与 `Condition` 相关联的锁 |
| void signalAll() | 唤醒所有等待在 `Condition` 上的线程，能够从等待方法返回的线程必须获得与 `Condition` 相关联的锁 |

#### Condition 使用范式

```java
    Lock lock = new ReentrantLock();
    Condition condition = lock.newCondition();

    public void conditionWait() throws InterruptedException {
        lock.lock();
        try {
            condition.await();
        } finally {
            lock.unlock();;
        }
    }
    
    public void conditionSignal() throws InterruptedException {
        lock.lock();
        try {
            condition.signal();
        } finally {
            lock.unlock();;
        }
    }
```

下面演示一下如何使用。还是之前博客 [线程之间的共享和协作](线程之间的共享和协作.html#二、线程间的协作) 中的快递的那个场景，这里使用 `Condition` 来实现：
```java
public class ExpressCondition {

    public final static String CITY = "Shanghai";

    private int km;
    private String site;

    private Lock kmLock = new ReentrantLock();
    private Lock siteLock = new ReentrantLock();

    private Condition kmCond = kmLock.newCondition();
    private Condition siteCond = siteLock.newCondition();

    public ExpressCondition() {
    }

    public ExpressCondition(int km, String site) {
        this.km = km;
        this.site = site;
    }

    public void changeKm() {
        kmLock.lock();
        try {
            km = 101;
            kmCond.signal();
        } finally {
            kmLock.unlock();
        }
    }

    public void changeSite() {
        siteLock.lock();
        try {
            site = "Beijing";
            siteCond.signal();
        } finally {
            siteLock.unlock();
        }
    }

    public void waitKm() {
        kmLock.lock();
        try {
            while (km < 100) {
                try {
                    kmCond.await();
                    System.out.println("check Site thread[" + Thread.currentThread().getId() + "] has been notified");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        } finally {
            kmLock.unlock();
        }
        System.out.println("km is " + km + ", I will change db");
    }

    public void waitSite() {
        siteLock.lock();
        try {
            while (site.equals(CITY)) {
                try {
                    siteCond.await();
                    System.out.println("Check Site thread[" + Thread.currentThread().getId() + "] has been notified");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        } finally {
            siteLock.unlock();
        }
        System.out.println("site is " + site + ", I will call user");
    }
}
```

测试类：
```java
public class TestCond {

    private static ExpressCondition express = new ExpressCondition(0, ExpressCondition.CITY);

    private static class CheckKm extends Thread {
        @Override
        public void run() {
            express.waitKm();
        }
    }

    private static class CheckSite extends Thread {
        @Override
        public void run() {
            express.waitSite();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 3; i++) {
            new CheckSite().start();
        }
        for (int i = 0; i < 3; i++) {
            new CheckKm().start();
        }

        Thread.sleep(1000);
        express.changeKm();
    }
}
```

执行结果：
```console
check Site thread[15] has been notified
km is 101, I will change db
```

当然上面使用了两个 `Lock` 和两个 `Condition`，也可以使用一个 `Lock`，然后 `newCondition()` 出两个 `Condition` 来完成同样的效果：
```java
public class ExpressConditionOneLock {

    public final static String CITY = "Shanghai";

    private int km;
    private String site;

    private Lock lock = new ReentrantLock();

    private Condition kmCond = lock.newCondition();
    private Condition siteCond = lock.newCondition();

    public ExpressConditionOneLock() {
    }

    public ExpressConditionOneLock(int km, String site) {
        this.km = km;
        this.site = site;
    }

    public void changeKm() {
        lock.lock();
        try {
            km = 101;
            kmCond.signal();
        } finally {
            lock.unlock();
        }
    }

    public void changeSite() {
        lock.lock();
        try {
            site = "Beijing";
            siteCond.signal();
        } finally {
            lock.unlock();
        }
    }

    public void waitKm() {
        lock.lock();
        try {
            while (km < 100) {
                try {
                    kmCond.await();
                    System.out.println("check Site thread[" + Thread.currentThread().getId() + "] has been notified");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        } finally {
            lock.unlock();
        }
        System.out.println("km is " + km + ", I will change db");
    }

    public void waitSite() {
        lock.lock();
        try {
            while (site.equals(CITY)) {
                try {
                    siteCond.await();
                    System.out.println("Check Site thread[" + Thread.currentThread().getId() + "] has been notified");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        } finally {
            lock.unlock();
        }
        System.out.println("site is " + site + ", I will call user");
    }

}
```

修改测试类，使用 `ExpressConditionOneLock` ，执行效果是一模一样的：
```console
check Site thread[15] has been notified
km is 101, I will change db
```

## 二、了解 LockSupport

`LockSupport` 定义了一组的公共静态方法，这些方法提供了最基本的线程阻塞和唤醒功能，而 `LockSupport` 也成为构建同步组件的基础工具。

`LockSupport` 定义了一组以 `park` 开头的方法用来阻塞当前线程，以及 `unpark(Thread thread)` 方法来唤醒一个被阻塞的线程。`LockSupport` 增加了 `park(Object blocker)` 、 `parkNanos(Object blocker, long nanos)` 和 `parkUntil(Objectblocker, long deadline)` 3 个方法，用于实现阻塞当前线程的功能，其中参数 `blocker` 是用来标识当前线程在等待的对象，该对象主要用于问题排查和系统监控。

## 三、CLH 队列锁

`CLH` 队列锁即 `Craig Landin and Hagersten (CLH) locks`。

`CLH` 队列锁也是一种基于链表的可扩展、高性能、公平的自旋锁，申请线程仅仅在本地变量上自旋，它不断轮询前驱的状态，假如发现前驱释放了锁就结束自旋。

队列是一个双向链表的结构，链表中每一个节点的够成如下图所示：

![节点数据结构](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs1.png)

当一个线程需要获取锁时：

1、创建一个的 `QNode`，将其中的 `locked` 设置为 `true` 表示需要获取锁，`myPred` 表示对其前驱结点的引用。

2、线程 `A` 对 `tail` 域调用 `getAndSet()` 方法，使自己成为队列的尾部，同时获取一个指向其前驱结点的引用 `myPred` 。

![线程A需要获取锁](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs2.png)

线程 `B` 需要获得锁，同样的流程再来一遍。

![线程A需要获取锁](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs3.png)

3、线程就在前驱结点的 `locked` 字段上旋转，直到前驱结点释放锁（前驱节点的锁值 `locked == false` ）。

4、当一个线程需要释放锁时，将当前结点的 `locked` 域设置为 `false` ，同时回收前驱结点。

![线程A需要获取锁](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs4.png)

如上图所示，前驱结点释放锁，线程 `A` 的 `myPred` 所指向的前驱结点的 `locked` 字段变为 `false` ，线程 `B` 就可以获取到锁。

`CLH` 队列锁的优点是空间复杂度低（如果有 `n` 个线程，`L` 个锁，每个线程每次只获取一个锁，那么需要的存储空间是 `O(L+n)`，`n` 个线程有 `n` 个 `myNode`，`L` 个锁有 `L` 个 `tail` ）。 `CLH` 队列锁常用在 `SMP` 体系结构下。

`Java` 中的 `AQS` 是 `CLH` 队列锁的一种变体实现。

### 什么是 SMP

`SMP(Symmetric Multi-Processor)` 。即对称多处理器结构，指 `server` 中多个 `CPU` 对称工作，每一个 `CPU` 访问内存地址所需时间同样。其主要特征是共享，包括对 `CPU`、 `内存`，`I/O` 等进行共享。`SMP` 的长处是可以保证内存一致性。缺点是这些共享的资源非常可能成为性能瓶颈。随着 `CPU` 数量的添加，每一个 `CPU` 都要訪问同样的内存资源，可能导致内存訪问冲突，可能会导致 `CPU` 资源的浪费。经常使用的 `PC` 机就属于这样的。

非一致存储访问，将 `CPU` 分为 `CPU 模块`，每个 `CPU 模块` 由多个 `CPU` 组成，并且具有独立的本地内存、`I/O` 槽口等，模块之间可以通过互联模块相互访问，访问本地内存（本 CPU模块的内存）的速度将远远高于访问远地内存（其他 `CPU 模块`的内存）的速度，这也是非一致存储访问的由来。 `NUMA`较好地解决 `SMP` 的扩展问题，当 `CPU` 数量增加时，因为访问远地内存的延时远远超过本地内存，系统性能无法线性增加。

`CLH` 唯一的缺点是在 `NUMA` 系统结构下性能很差，但是在 `SMP` 系统结构下该法还是非常有效的。解决 `NUMA` 系统结构的思路是 `MCS` 队列锁。

## 四、AbstractQueuedSynchronizer

### 1、什么是 AQS

队列同步器 `AbstractQueuedSynchronizer`（以下简称同步器或 `AQS` ），是用来构建锁或者其他同步组件的基础框架，它使用了一个 `int` 成员变量表示同步状态，通过内置的 `FIFO` 队列来完成资源获取线程的排队工作。并发包的大师（DougLea）期望它能够成为实现大部分同步需求的基础。

### 2、AQS 使用方式和其中的设计模式

`AQS` 的主要使用方式是继承，子类通过继承 `AQS` 并实现它的抽象方法来管理同步状态，在 `AQS` 里有一个 `int` 型的 `state` 来代表这个状态，在抽象方法的实现过程中免不了要对同步状态进行更改，这时就需要使用同步器提供的3个方法（ `getState()` 、`setState(int newState)` 和 `compareAndSetState(int expect, int update)` ）来进行操作，因为它们能够保证状态的改变是安全的。

在实现上，子类推荐被定义为自定义同步组件的静态内部类，`AQS` 自身没有实现任何同步接口，它仅仅是定义了若干同步状态获取和释放的方法来供自定义同步组件使用，同步器既可以支持独占式地获取同步状态，也可以支持共享式地获取同步状态，这样就可以方便实现不同类型的同步组件（ `ReentrantLock` 、 `ReentrantReadWriteLock` 和 `CountDownLatch` 等）。

同步器是实现锁（也可以是任意同步组件）的关键，在锁的实现中聚合同步器。可以这样理解二者之间的关系：

* 锁是面向使用者的，它定义了使用者与锁交互的接口（比如可以允许两个线程并行访问），隐藏了实现细节；

* 同步器面向的是锁的实现者，它简化了锁的实现方式，屏蔽了同步状态管理、线程的排队、等待与唤醒等底层操作。锁和同步器很好地隔离了使用者和实现者所需关注的领域。

实现者需要继承同步器并重写指定的方法，随后将同步器组合在自定义同步组件的实现中，并调用同步器提供的模板方法，而这些模板方法将会调用使用者重写的方法。

#### 模板方法模式

同步器的设计基于模板方法模式。模板方法模式的意图是：定义一个操作中的算法的骨架，而将一些步骤的实现延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。我们最常见的就是 `Spring` 框架里的各种 `xxxTemplate`。

下面举个例子介绍。我们开了个蛋糕店，蛋糕店不能只卖一种蛋糕呀，于是我们决定先卖奶油蛋糕，芝士蛋糕和慕斯蛋糕。三种蛋糕在制作方式上一样，都包括造型，烘焙和涂抹蛋糕上的东西。所以可以定义一个抽象蛋糕模型：
```java
public abstract class AbstractCake {

    protected abstract void shape();

    protected abstract void apply();

    protected abstract void brake();

    /**
     * 模板方法
     */
    public final void run() {
        shape();
        apply();
        brake();
    }

    protected boolean shouldApply() {
        return true;
    }
}
```

这个是芝士蛋糕的实现：
```java
public class CheeseCake extends AbstractCake {
    @Override
    protected void shape() {
        System.out.println("芝士蛋糕造型");
    }

    @Override
    protected void apply() {
        System.out.println("芝士蛋糕涂抹");
    }

    @Override
    protected void brake() {
        System.out.println("芝士蛋糕烘焙");
    }

}
```

这个是奶油蛋糕的实现：
```java
public class CreamCake extends AbstractCake {
    @Override
    protected void shape() {
        System.out.println("奶油蛋糕造型");
    }

    @Override
    protected void apply() {
        System.out.println("奶油蛋糕涂抹");
    }

    @Override
    protected void brake() {
        System.out.println("奶油蛋糕烘焙");
    }
}
```

这样一来，不但可以批量生产三种蛋糕，而且如果日后有扩展，只需要继承抽象蛋糕方法就可以了，十分方便，我们天天生意做得越来越赚钱。突然有一天，我们发现市面有一种最简单的小蛋糕销量很好，这种蛋糕就是简单烘烤成型就可以卖，并不需要涂抹什么食材，由于制作简单销售量大，这个品种也很赚钱，于是我们也想要生产这种蛋糕。但是我们发现了一个问题，抽象蛋糕是定义了抽象的涂抹方法的，也就是说扩展的这种蛋糕是必须要实现涂抹方法，这就很鸡儿蛋疼了。怎么办？我们可以将原来的模板修改为带钩子的模板。
```java
public abstract class AbstractCake {

    protected abstract void shape();

    protected abstract void apply();

    protected abstract void brake();

    /**
     * 模板方法
     */
    public final void run() {
        shape();
        if (shouldApply()) {
            apply();
        }
        brake();
    }

    protected boolean shouldApply() {
        return true;
    }
}
```

小蛋糕的具体实现：
```java
public class SmallCake extends AbstractCake {

    private boolean flag = false;

    public void setFlag(boolean shouldApply) {
        flag = shouldApply;
    }

    @Override
    protected boolean shouldApply() {
        return flag;
    }

    @Override
    protected void shape() {
        System.out.println("小蛋糕造型");
    }

    @Override
    protected void apply() {
        System.out.println("小蛋糕涂抹");
    }

    @Override
    protected void brake() {
        System.out.println("小蛋糕烘焙");
    }

}
```
是不一下子就解决了问题。

### 3、AQS 中的方法

#### 模板方法

实现自定义同步组件时，将会调用同步器提供的模板方法

| 方法名称 | 描述 |
| --- | --- |
| void acquire(int arg) | 独占式获取同步状态，如果当前线程获取同步状态成功，则由该方法返回，否则，将会进入同步队列等待，该方法会调用重写的 `tryAcquire(int arg)` 方法 |
| void acquireInterruptibly(int arg) | 与 `acquire(int arg)` 相同，但是该方法响应中断，当前线程未获取到同步状态而进入同步队列中，如果当前线程被中断，则该方法会抛出 `InterruptedException` 并返回 |
| boolean tryAcquireNanos(int arg, long nanos) | 在 `acquireInterruptibly(int arg)` 基础上增加了超时限制，如果当前线程在超时时间内没有获取到同步状态，那么将会返回 `false` ，如果获取到了返回 `true` |
| void acquireShared(int arg) | 共享式的获取同步状态，如果当前线程未获取到同步状态，将会进入同步队列等待，与独占式获取的主要区别是在同一时刻可以有多个线程获取到同步状态 |
| void acquireSharedInterruptibly(int arg) | 与 `acquireShared(int arg)` 相同，该方法响应中断 |
| boolean tryAcquireSharedNanos(int arg, long nanos) | 在 `acquireSharedInterruptibly(int arg)` 基础上增加了超时限制 |
| boolean release(int arg) | 独占式的释放同步状态，该方法会在释放同步状态之后，将同步队列中第一个节点包含的线程唤醒 |
| boolean releaseShared(int arg) | 共享式的释放同步状态 |
| Collection<Thread> getQueueThread() | 获取等待在同步队列上的线程集合 |

这些模板方法同步器提供的模板方法基本上分为3类：独占式获取与释放同步状态、共享式获取与释放、同步状态和查询同步队列中的等待线程情况。

#### 可重写的方法

| 方法名称 | 描述 |
| --- | --- |
| boolean tryAcquire(int arg) | 独占式获取同步状态，实现该方法需要查询当前状态并判断同步状态是否符合预期，然后进行 `CAS` 设置同步状态 |
| boolean tryRelease(int arg) | 独占式释放同步状态，等待获取同步状态的线程将有机会获取同步状态 |
| int tryAcquireShared(int arg) | 共享式获取同步状态，返回大于等于0的值，表示获取成功，反之，获取失败 |
| boolean tryReleaseShared(int arg) | 共享式释放同步状态 |
| boolean isHeldExclusively() | 当前同步器是否在独占模式下被线程占用，一般该方法表示是否被当前线程所独占 |

#### 访问或修改同步状态的方法

重写同步器指定的方法时，需要使用同步器提供的如下3个方法来访问或修改同步状态。

| 方法名称 | 描述 |
| --- | --- |
| getState() | 获取当前同步状态 |
| setState(int newState) | 设置当前同步状态 |
| compareAndSetState(int expect, int update) | 使用 `CAS` 设置当前状态，该方法能够保证状态设置的原子性 |

下面演示如何实现自己的独占锁：
```java
public class SelfLock implements Lock {

    /**
     * 仅需要将操作代理到Sync上即可
     */
    private final Sync sync = new Sync();

    /**
     * 静态内部类，自定义同步器
     */
    private static class Sync extends AbstractQueuedSynchronizer {

        /**
         * 判断是否处于占用状态
         *
         * @return
         */
        @Override
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }

        /**
         * 获得锁
         *
         * @param arg
         * @return
         */
        @Override
        protected boolean tryAcquire(int arg) {
            if (compareAndSetState(0, 1)) {
                // 将当前线程设置为拥有者，排斥他人进入
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }

        /**
         * 释放锁
         *
         * @param arg
         * @return
         */
        @Override
        protected boolean tryRelease(int arg) {
            if (getState() == 0) {
                throw new IllegalMonitorStateException();
            }
            setExclusiveOwnerThread(null);
            setState(arg - 1);
            return true;
        }

        /**
         * 返回一个 Condition ，每个 condition 都包含了一个 condition 队列
         *
         * @return
         */
        Condition newCondition() {
            return new ConditionObject();
        }
    }

    @Override
    public void lock() {
        System.out.println(Thread.currentThread().getName() + " is ready to get the lock");
        sync.acquire(1);
        System.out.println(Thread.currentThread().getName() + " has already got the lock");
    }

    @Override
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }

    @Override
    public void unlock() {
        System.out.println(Thread.currentThread().getName() + " is ready to release the lock");
        sync.release(1);
        System.out.println(Thread.currentThread().getName() + " has already release the lock");
    }

    @Override
    public Condition newCondition() {
        return sync.newCondition();
    }

    public boolean isLocked() {
        return sync.isHeldExclusively();
    }

    public boolean hasQueuedThreads() {
        return sync.hasQueuedThreads();
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(1);
    }

    @Override
    public boolean tryLock(long timeout, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1, unit.toNanos(timeout));
    }
}
```

测试类：
```java
public class TestMyLock {

    private void test() {
        final Lock lock = new SelfLock();

        class Worker extends Thread {

            public void run() {
                lock.lock();
                System.out.println(Thread.currentThread().getName() + " is running ...");
                try {
                    SleepTool.second(1);
                } finally {
                    lock.unlock();
                }
            }
        }

        for (int i = 0; i < 4; i++) {
            Worker w = new Worker();
            w.start();
        }

    }

    public static void main(String[] args) {
        TestMyLock testMyLock = new TestMyLock();
        testMyLock.test();
    }
}
```

执行结果：
```console
Thread-0 is ready to get the lock
Thread-3 is ready to get the lock
Thread-2 is ready to get the lock
Thread-1 is ready to get the lock
Thread-0 has already got the lock
Thread-0 is running ...
Thread-0 is ready to release the lock
Thread-0 has already release the lock
Thread-3 has already got the lock
Thread-3 is running ...
Thread-3 is ready to release the lock
Thread-3 has already release the lock
Thread-2 has already got the lock
Thread-2 is running ...
Thread-2 is ready to release the lock
Thread-2 has already release the lock
Thread-1 has already got the lock
Thread-1 is running ...
Thread-1 is ready to release the lock
Thread-1 has already release the lock
```

但是我们自己写的这个独占锁是否支持可重入呢？测试下：
```java
public class TestReenterSelfLock {

    private static final Lock lock = new SelfLock();

    private void reenter(int x) {
        lock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + "：递归层级：" + x);
            x -= 1;
            if (x != 0) {
                reenter(x);
            }
        } finally {
            lock.unlock();
        }

    }

    private void test() {

        class Worker extends Thread {

            public void run() {
                System.out.println(Thread.currentThread().getName() + " has started ...");
                SleepTool.second(1);
                reenter(3);
            }
        }

        for (int i = 0; i < 3; i++) {
            Worker w = new Worker();
            w.start();
        }

        for (int i = 0; i < 100; i++) {
            SleepTool.second(1);
        }
    }

    public static void main(String[] args) {
        TestReenterSelfLock testMyLock = new TestReenterSelfLock();
        testMyLock.test();
    }

}
```

执行结果：
```console
Thread-0 has started ...
Thread-1 has started ...
Thread-2 has started ...
Thread-1 is ready to get the lock
Thread-2 is ready to get the lock
Thread-0 is ready to get the lock
Thread-1 has already got the lock
Thread-1：递归层级：3
Thread-1 is ready to get the lock
```
可以看出程序在第一次进行递归的时候就死锁了，上面自己实现的独占锁是不支持可重入的。

### 4、深入源码

#### (1) AQS 中的数据结构-节点和同步队列

##### 节点 Node 

`Java` 中的 `AQS` 是 `CLH` 队列锁的一种变体实现，毫无疑问，作为队列来说，必然要有一个节点的数据结构来保存我们前面所说的各种域，比如前驱节点，节点的状态等，这个数据结构就是 `AQS` 中的内部类 `Node` 。作为这个数据结构应该关心些什么信息？

1、线程信息，肯定要知道我是哪个线程；

2、队列中线程状态，既然知道是哪一个线程，肯定还要知道线程当前处在什么状态，是已经取消了“获锁”请求，还是在“”等待中”，或者说“即将得到锁”

3、前驱和后继线程，因为是一个等待队列，那么也就需要知道当前线程前面的是哪个线程，当前线程后面的是哪个线程（因为当前线程释放锁以后，理当立马通知后继线程去获取锁）。

所以这个 `Node` 类是这么设计的：

![Node节点](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs5.png)

其中包括了：

1. 线程的2种等待模式：

* SHARED：表示线程以共享的模式等待锁（如 `ReadLock`）

* EXCLUSIVE：表示线程以互斥的模式等待锁（如 `ReetrantLock`），互斥就是一把锁只能由一个线程持有，不能同时存在多个线程使用同一个锁

2. 线程在队列中的状态枚举：

* CANCELLED：值为1，表示线程的获锁请求已经“取消”

* SIGNAL：值为-1，表示该线程一切都准备好了,就等待锁空闲出来给我

* CONDITION：值为-2，表示线程等待某一个条件（ `Condition` ）被满足

* PROPAGATE：值为-3，当线程处在“ `SHARED` ”模式时，该字段才会被使用上初始化 `Node` 对象时，默认为0

3. 成员变量：

* waitStatus：该 int 变量表示线程在队列中的状态，其值就是上述提到的 `CANCELLED` 、 `SIGNAL` 、 `CONDITION` 、 `PROPAGATE` 
* prev：该变量类型为 `Node` 对象，表示该节点的前一个 Node 节点（前驱）
* next：该变量类型为 `Node` 对象，表示该节点的后一个 Node 节点（后继）
* thread：该变量类型为 `Thread` 对象，表示该节点的代表的线程
* nextWaiter：该变量类型为 `Node` 对象，表示等待 `condition` 条件的 `Node` 节点

当前线程获取同步状态失败时，同步器会将当前线程以及等待状态等信息构造成为一个节点（Node）并将其加入同步队列，同时会阻塞当前线程，当同步状态释放时，会把首节点中的线程唤醒，使其再次尝试获取同步状态。同步队列中的节点（Node）用来保存获取同步状态失败的线程引用、等待状态以及前驱和后继节点。

##### head 和 tail

`AQS` 还拥有首节点（ `head` ）和尾节点（ `tail` ）两个引用，一个指向队列头节点，而另一个指向队列尾节点。

**注意：因为首节点 `head` 是不保存线程信息的节点，仅仅是因为数据结构设计上的需要，在数据结构上，这种做法往往叫做“空头节点链表”。对应的就有“非空头结点链表”**

#### (2) 节点在同步队列中的增加和移出

##### 节点加入到同步队列

当一个线程成功地获取了同步状态（或者锁），其他线程将无法获取到同步状态，也就是获取同步状态失败，`AQS` 会将这个线程以及等待状态等信息构造成为一个节点（ `Node` ）并将其加入同步队列的尾部。而这个加入队列的过程必须要保证线程安全，因此同步器提供了一个基于 `CAS` 的设置尾节点的方法：`compareAndSetTail(Node expect, Node update)` ，它需要传递当前线程“认为”的尾节点和当前节点，只有设置成功后，当前节点才正式与之前的尾节点建立关联。

##### 首节点的变化

首节点是获取同步状态成功的节点，首节点的线程在释放同步状态时，将会唤醒后继节点，而后继节点将会在获取同步状态成功时将自己设置为首节点。设置首节点是通过获取同步状态成功的线程来完成的，由于只有一个线程能够成功获取到同步状态，因此重新设置头节点的方法并不需要使用 `CAS` 来保证，它只需要将首节点设置成为原首节点的后继节点并断开原首节点的 `next` 引用即可。

##### 独占式同步状态获取与释放

###### 获取

通过调用同步器的 `acquire(int arg)` 方法可以获取同步状态，这个方法主要完成了同步状态获取、节点构造、加入同步队列以及在同步队列中自旋等待的相关工作，其源码是：
```java
    public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
```

首先调用自定义同步器重写实现的 `tryAcquire(int arg)` 方法，该方法需要保证线程安全的获取同步状态。

如果同步状态获取失败（ `tryAcquire()` 返回 `false` ），则构造同步节点（独占式 `Node.EXCLUSIVE` ，同一时刻只能有一个线程成功获取同步状态）并通过 `addWaiter(Node node)` 方法将该节点加入到同步队列的尾部，最后调用 `acquireQueued(Node node, int arg)` 方法，使得该节点以“死循环”的方式获取同步状态。如果获取不到则阻塞节点中的线程，而被阻塞线程的唤醒主要依靠前驱节点的出队或阻塞线程被中断来实现。

下面是 `addWaiter(Node node)` 源码：
```java
    private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail;
        if (pred != null) {
            node.prev = pred;
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        enq(node);
        return node;
    }
```
将当前线程包装成 `Node` 后，队列不为空的情况下，先尝试把当前节点加入队列并成为尾节点，如果不成功或者队列为空进入 `enq(final Node node)` 方法：
```java
    private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            if (t == null) { // Must initialize
                if (compareAndSetHead(new Node()))
                    tail = head;
            } else {
                node.prev = t;
                if (compareAndSetTail(t, node)) {
                    t.next = node;
                    return t;
                }
            }
        }
    }
```

在 `enq(final Node node)` 方法中，同步器通过“死循环”来保证节点的正确添加，这个死循环中，做了两件事，第一件事：如果队列为空，初始化队列，`new` 出一个空节点，并让首节点（ `head` ）和尾节点（ `tail` ）两个引用都指向这个空节点；第二件事：把当前节点加入队列。

在“死循环”中只有通过 `CAS` 将节点设置成为尾节点之后，当前线程才能从该方法返回，否则，当前线程不断地尝试设置。

下面是 `acquireQueued(Node node, int arg)` 的源码：
```java
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                if (p == head && tryAcquire(arg)) {
                    setHead(node);
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```

其实就是一个自旋的过程，每个节点（或者说每个线程）都在自省地观察，当条件满足，获取到了同步状态，就可以从这个自旋过程中退出，否则依旧留在这个自旋过程中（并会阻塞节点的线程）。

在 `acquireQueued(final Node node, int arg)` 方法中，当前线程在“死循环”中尝试获取同步状态，而只有前驱节点是头节点才能够尝试获取同步状态，这是为什么？原因有两个。

第一，头节点是成功获取到同步状态的节点，而头节点的线程释放了同步状态之后，将会唤醒其后继节点，后继节点的线程被唤醒后需要检查自己的前驱节点是否是头节点。

第二，维护同步队列的 FIFO 原则。

当前线程获取到同步状态后，让首节点（ `head` ）这个引用指向自己所在节点。当同步状态获取成功后，当前线程就从 acquire 方法返回了。如果同步器实现的是锁，那就代表当前线程获得了锁。

###### 释放

当前线程获取同步状态并执行了相应逻辑之后，就需要释放同步状态，使得后续节点能够继续获取同步状态。通过调用同步器的 `release(int arg)` 方法可以释放同步状态，该方法在释放了同步状态之后，会唤醒其后继节点（进而使后继节点重新尝试获取同步状态）。
```java
    public final boolean release(int arg) {
        if (tryRelease(arg)) {
            Node h = head;
            if (h != null && h.waitStatus != 0)
                unparkSuccessor(h);
            return true;
        }
        return false;
    }
```
该方法执行时，会唤醒首节点（ `head` ）所指向节点的后继节点线程，`unparkSuccessor(Node node)` 方法使用 `LockSupport`  来唤醒处于等待状态的线程。

```java
    private void unparkSuccessor(Node node) {
        /*
         * If status is negative (i.e., possibly needing signal) try
         * to clear in anticipation of signalling.  It is OK if this
         * fails or if status is changed by waiting thread.
         */
        int ws = node.waitStatus;
        if (ws < 0)
            compareAndSetWaitStatus(node, ws, 0);

        /*
         * Thread to unpark is held in successor, which is normally
         * just the next node.  But if cancelled or apparently null,
         * traverse backwards from tail to find the actual
         * non-cancelled successor.
         */
        Node s = node.next;
        if (s == null || s.waitStatus > 0) {
            s = null;
            for (Node t = tail; t != null && t != node; t = t.prev)
                if (t.waitStatus <= 0)
                    s = t;
        }
        if (s != null)
            LockSupport.unpark(s.thread);
    }
```
这段代码中17~25行的意思，一般情况下，被唤醒的是 `head` 指向节点的后继节点线程，如果这个后继节点处于被 `cancel `状态，（测开发者的思路这样的：后继节点处于被 `cancel` 状态，意味着当锁竞争激烈时，队列的第一个节点等了很久（一直被还未加入队列的节点抢走锁），包括后续的节点 `cancel` 的几率都比较大，所以）先从尾开始遍历，找到最前面且没有被 `cancel` 的节点。

###### 总结

在获取同步状态时，同步器维护一个同步队列，获取状态失败的线程都会被加入到队列中并在队列中进行自旋；移出队列（或停止自旋）的条件是前驱节点为头节点且成功获取了同步状态。在释放同步状态时，同步器调用 `tryRelease(int arg)` 方法释放同步状态，然后唤醒 `head` 指向节点的后继节点。

##### 共享式同步状态获取与释放

共享式获取与独占式获取最主要的区别在于同一时刻能否有多个线程同时获取到同步状态。以读写为例，如果一个程序在进行读操作，那么这一时刻写操作均被阻塞，而读操作能够同时进行。写操作要求对资源的独占式访问，而读操作可以是共享式访问。

在 `acquireShared(int arg)` 方法中，同步器调用 `tryAcquireShared(int arg)` 方法，也就是自己实现锁所需要复写的方法，尝试获取同步状态：
```java
    public final void acquireShared(int arg) {
        if (tryAcquireShared(arg) < 0)
            doAcquireShared(arg);
    }
```
`tryAcquireShared(int arg)` 方法返回值为 `int` 类型，当返回值大于等于0时，表示能够获取到同步状态。因此，在共享式获取的自旋过程中，成功获取到同步状态并退出自旋的条件就是 `tryAcquireShared(int arg)` 方法返回值大于等于 0。当没能获取到同步状态的时候就会执行后面的 `doAcquireShared(int arg)` 方法：
```java
    private void doAcquireShared(int arg) {
        final Node node = addWaiter(Node.SHARED);
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                if (p == head) {
                    int r = tryAcquireShared(arg);
                    if (r >= 0) {
                        setHeadAndPropagate(node, r);
                        p.next = null; // help GC
                        if (interrupted)
                            selfInterrupt();
                        failed = false;
                        return;
                    }
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```
可以看到，在 `doAcquireShared(int arg)` 方法的自旋过程中，如果当前节点的前驱为头节点时，尝试获取同步状态，即执行 `tryAcquireShared()` 方法，如果返回值大于等于 0，即表示拿到同步状态，并将此操作向后传递 `setHeadAndPropagate(node, r)` ，之后并从自旋过程中退出。

共享式同步状态的释放和获取类似：
```java
    public final boolean releaseShared(int arg) {
        if (tryReleaseShared(arg)) {
            doReleaseShared();
            return true;
        }
        return false;
    }
```
先调用我们需要复写的 `tryReleaseShared(arg)` 方法，如果释放成功，则会执行后面的 `doReleaseShared()` 方法：
```java
    private void doReleaseShared() {
        /*
         * Ensure that a release propagates, even if there are other
         * in-progress acquires/releases.  This proceeds in the usual
         * way of trying to unparkSuccessor of head if it needs
         * signal. But if it does not, status is set to PROPAGATE to
         * ensure that upon release, propagation continues.
         * Additionally, we must loop in case a new node is added
         * while we are doing this. Also, unlike other uses of
         * unparkSuccessor, we need to know if CAS to reset status
         * fails, if so rechecking.
         */
        for (;;) {
            Node h = head;
            if (h != null && h != tail) {
                int ws = h.waitStatus;
                if (ws == Node.SIGNAL) {
                    if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                        continue;            // loop to recheck cases
                    unparkSuccessor(h);
                }
                else if (ws == 0 &&
                         !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                    continue;                // loop on failed CAS
            }
            if (h == head)                   // loop if head changed
                break;
        }
    }
```
因为共享式同步状态可能会有多个线程拿到共享状态，所以这里使用了 `for (;;)` 循环来保证多个进入此方法的线程都能够正确的释放同步状态。

对于能够支持多个线程同时访问的并发组件（比如 `Semaphore` ，释放同步状态的操作和独占式主要区别在于 `tryReleaseShared(int arg)` 方法必须确保同步状态（或者资源数）线程安全释放，一般是通过循环和 `CAS` 来保证的，因为释放同步状态的操作会同时来自多个线程。

#### (3) 共享式的同步工具类

明白了共享式同步状态获取和释放的原理，我们就可以自己实现一个同步工具类，这里我们实现一个最多可允许3个线程同时访问的工具类：
```java
public class TrinityLock implements Lock {

    private final Sync sync = new Sync(3);

    private static final class Sync extends AbstractQueuedSynchronizer {

        Sync(int count) {
            if (count <= 0) {
                throw new IllegalArgumentException("count must larger than zero.");
            }
            setState(count);
        }

        /**
         * 获取共享同步状态
         *
         * @param reduceCount 扣减个数
         * @return 返回小于0，表示当前线程获得同步状态失败；大于0，表示当前线程获得同步状态成功
         */
        @Override
        protected int tryAcquireShared(int reduceCount) {
            for (; ; ) {
                int currentCount = getState();
                int newCount = currentCount - reduceCount;
                if (newCount < 0 || compareAndSetState(currentCount, newCount)) {
                    return newCount;
                }
            }
        }

        /**
         * 归还同步状态
         *
         * @param returnCount 归还个数
         * @return
         */
        @Override
        protected boolean tryReleaseShared(int returnCount) {
            for (; ; ) {
                int currentCount = getState();
                int newCount = currentCount + returnCount;
                if (compareAndSetState(currentCount, newCount)) {
                    return true;
                }
            }
        }

        final Condition newCondition() {
            return new ConditionObject();
        }

    }

    @Override
    public void lock() {
        sync.acquireShared(1);
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireSharedInterruptibly();
    }

    @Override
    public boolean tryLock() {
        return sync.tryAcquireShared(1) >= 0;
    }

    @Override
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireSharedNanos(1, unit.toNanos(time));
    }

    @Override
    public void unlock() {
        sync.releaseShared(1);
    }

    @Override
    public Condition newCondition() {
        return sync.newCondition();
    }
}
```

将之前 `TestMyLock` 中使用的锁替换为上面的 `TrinityLock` 测试运行，执行结果：
```console
Thread-0 is running ...
Thread-2 is running ...
Thread-1 is running ...
Thread-3 is running ...
```
可以看出，3个线程是同时获取到同步状态的，然后最后一个线程才获取到同步状态。

#### (4) 了解 Condition 的实现

等待队列是一个 `FIFO` 的队列，在队列中的每个节点都包含了一个线程引用，该线程就是在 `Condition` 对象上等待的线程，如果一个线程调用了 `Condition` 的 `await()` 方法，那么该线程将会释放锁，构造成节点加入等待队列并进入等待状态。事实上，节点的定义复用了同步器中节点的定义，也就是说，同步队列和等待队列中节点类型都是同步器的静态内部类，只是同部队列是一个双向链表结构，而等待队列是一个单相链表结构。

![等待队列](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs6.png)

一个 `Condition` 对应一个等待队列，`Condition` 拥有首节点（ `firstWaiter` ）和尾节点（ `lastWaiter` ）。当前线程调用 `Condition` 的 `await()` 方法，将会以当前线程构造节点，并将节点从尾部加入等待队列。`Condition` 拥有首尾节点的引用，而新增节点只需要将原有的尾节点 `nextWaiter` 指向它，并且更新尾节点即可。上述节点引用更新的过程并没有使用 `CAS` 保证，原因在于调用 `await()` 方法的线程必定是获取了锁的线程，也就是说该过程是由锁来保证线程安全的。

`Lock`（更确切地说是同步器）拥有一个同步队列和多个等待队列。

![同步器](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs7.png)

`Condition` 在 `AbstractQueuedSynchronizer` 类中是一个 `ConditionObject` 内部类，它的 `await()` 方法如下：
```java
        public final boolean await(long time, TimeUnit unit)
                throws InterruptedException {
            long nanosTimeout = unit.toNanos(time);
            if (Thread.interrupted())
                throw new InterruptedException();
            Node node = addConditionWaiter();
            int savedState = fullyRelease(node);
            final long deadline = System.nanoTime() + nanosTimeout;
            boolean timedout = false;
            int interruptMode = 0;
            while (!isOnSyncQueue(node)) {
                if (nanosTimeout <= 0L) {
                    timedout = transferAfterCancelledWait(node);
                    break;
                }
                if (nanosTimeout >= spinForTimeoutThreshold)
                    LockSupport.parkNanos(this, nanosTimeout);
                if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
                    break;
                nanosTimeout = deadline - System.nanoTime();
            }
            if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
                interruptMode = REINTERRUPT;
            if (node.nextWaiter != null)
                unlinkCancelledWaiters();
            if (interruptMode != 0)
                reportInterruptAfterWait(interruptMode);
            return !timedout;
        }
```

调用 `Condition` 的 `await()` 方法（或者以 `await` 开头的方法），会使当前线程进入等待队列并释放锁，同时线程状态变为等待状态。当从 `await()` 方法返回时，当前线程一定获取了 `Condition` 相关联的锁。

如果从队列（同步队列和等待队列）的角度看 `await()` 方法，当调用 `await()` 方法时，相当于同步队列的首节点（获取了锁的节点）移动到 `Condition` 的等待队列中。调用该方法的线程成功获取了锁的线程，也就是同步队列中的首节点，该方法会将当前线程构造成节点并加入等待队列中，然后释放同步状态，唤醒同步队列中的后继节点，然后当前线程会进入等待状态。当等待队列中的节点被唤醒，则唤醒节点的线程开始尝试获取同步状态。如果不是通过其他线程调用`Condition` 的 `signal()` 方法唤醒，而是对等待线程进行中断，则会抛出`InterruptedException` 。

![同步器](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs8.png)

如图所示，同步队列的首节点并不会直接加入等待队列，而是通过 `addConditionWaiter()` 方法把当前线程构造成一个新的节点并将其加入等待队列中。

![同步器](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/aqs9.png)

```java
        public final void signal() {
            if (!isHeldExclusively())
                throw new IllegalMonitorStateException();
            Node first = firstWaiter;
            if (first != null)
                doSignal(first);
        }
```
调用 `Condition` 的 `signal()` 方法，将会唤醒在等待队列中等待时间最长的节点（首节点），在唤醒节点之前，会将节点移到同步队列中。

调用该方法的前置条件是当前线程必须获取了锁，可以看到 `signal()` 方法进行了 `isHeldExclusively()` 检查，也就是当前线程必须是获取了锁的线程。

接着获取等待队列的首节点，将其移动到同步队：
```java
        private void doSignal(Node first) {
            do {
                if ( (firstWaiter = first.nextWaiter) == null)
                    lastWaiter = null;
                first.nextWaiter = null;
            } while (!transferForSignal(first) &&
                     (first = firstWaiter) != null);
        }
```

在 `transferForSignal()` 中，唤醒节点中的线程：
```java
    final boolean transferForSignal(Node node) {
        /*
         * If cannot change waitStatus, the node has been cancelled.
         */
        if (!compareAndSetWaitStatus(node, Node.CONDITION, 0))
            return false;

        /*
         * Splice onto queue and try to set waitStatus of predecessor to
         * indicate that thread is (probably) waiting. If cancelled or
         * attempt to set waitStatus fails, wake up to resync (in which
         * case the waitStatus can be transiently and harmlessly wrong).
         */
        Node p = enq(node);
        int ws = p.waitStatus;
        if (ws > 0 || !compareAndSetWaitStatus(p, ws, Node.SIGNAL))
            LockSupport.unpark(node.thread);
        return true;
    }
```

通过调用同步器的 `enq(Node node)` 方法，等待队列中的头节点线程安全地移动到同步队列。当节点移动到同步队列后，当前线程再使用 `LockSupport` 唤醒该节点的线程。

被唤醒后的线程，将从 `await()` 方法中的 `while` 循环中退出（ `isOnSyncQueue(Node node)` 方法返回 `true` ，节点已经在同步队列中），进而调用同步器的 `acquireQueued()` 方法加入到获取同步状态的竞争中。

成功获取同步状态（或者说锁）之后，被唤醒的线程将从先前调用的 `await()` 方法返回，此时该线程已经成功地获取了锁。

`Condition` 的 `signalAll()` 方法，相当于对等待队列中的每个节点均执行一次 `signal()` 方法，效果就是将等待队列中所有节点全部移动到同步队列中，并唤醒每个节点的线程。所以一般尽量使用 `signal()` 只唤醒一个等待的线程即可。

### 5、回头看 Lock 的实现

#### (1) ReentrantLock 的实现

##### 锁的可重入

重进入是指任意线程在获取到锁之后能够再次获取该锁而不会被锁所阻塞，该特性的实现需要解决以下两个问题。

1. 线程再次获取锁。锁需要去识别获取锁的线程是否为当前占据锁的线程，如果是，则再次成功获取。

2. 锁的最终释放。线程重复 `n` 次获取了锁，随后在第 `n` 次释放该锁后，其他线程能够获取到该锁。锁的最终释放要求锁对于获取进行计数自增，计数表示当前锁被重复获取的次数，而锁被释放时，计数自减，当计数等于0时表示锁已经成功释放。

`nonfairTryAcquire()` 方法增加了再次获取同步状态的处理逻辑：通过判断当前线程是否为获取锁的线程来决定获取操作是否成功，如果是获取锁的线程再次请求，则将同步状态值进行增加并返回 `true` ，表示获取同步状态成功。同步状态表示锁被一个线程重复获取的次数。

如果该锁被获取了 `n` 次，那么前 `(n-1)` 次 `tryRelease(int releases)` 方法必须返回 `false` ，而只有同步状态完全释放了，才能返回 `true` 。可以看到，该方法将同步状态是否 0作为最终释放的条件，当同步状态为0时，将占有线程设置为 `null`，并返回 `true`，表示释放成功。

##### 公平和非公平锁

`ReentrantLock` 的构造函数中，默认的无参构造函数将会把 `Sync` 对象创建为 `NonfairSync` 对象，这是一个“非公平锁”；而另一个构造函数 `ReentrantLock(boolean fair)` 传入参数为 `true` 时将会把 `Sync` 对象创建为“公平锁” `FairSync`。

`nonfairTryAcquire(int acquires)` 方法，对于非公平锁，只要 `CAS` 设置同步状态成功，则表示当前线程获取了锁，而公平锁则不同。 `tryAcquire` 方法，该方法与 `nonfairTryAcquire(int acquires)` 比较，唯一不同的位置为判断条件多了 `hasQueuedPredecessors()` 方法，即加入了同步队列中当前节点是否有前驱节点的判断，如果该方法返回 `true` ，则表示有线程比当前线程更早地请求获取锁，因此需要等待前驱线程获取并释放锁之后才能继续获取锁。

重新修改之前实现的锁，让它支持可重入：

```java
public class ReenterSelfLock implements Lock {

    private final Sync sync = new Sync();

    private static class Sync extends AbstractQueuedSynchronizer {

        @Override
        protected boolean tryAcquire(int arg) {
            // 如果能成功获取到同步状态，就将当前线程设置为独占
            if (compareAndSetState(0, 1)) {
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            // 如果当前线程就是独占线程的话，那么 state 加1
            else if (getExclusiveOwnerThread() == Thread.currentThread()) {
                setState(getState() + 1);
                return true;
            }
            return false;
        }

        @Override
        protected boolean tryRelease(int arg) {
            if (getExclusiveOwnerThread() != Thread.currentThread()) {
                throw new IllegalMonitorStateException();
            }
            if (getState() == 0) {
                throw new IllegalMonitorStateException();
            }

            // 同步状态扣减1
            setState(getState() - 1);

            // 如果扣减为0了，需要将当前线程移除独占状态
            if (getState() == 0) {
                setExclusiveOwnerThread(null);
            }
            return true;
        }

        @Override
        protected boolean isHeldExclusively() {
            return super.isHeldExclusively();
        }

        final Condition newCondition() {
            return new ConditionObject();
        }

    }

    @Override
    public void lock() {
        System.out.println(Thread.currentThread().getName() + " is ready to get the lock");
        sync.acquire(1);
        System.out.println(Thread.currentThread().getName() + " has already got the lock");
    }

    @Override
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }

    @Override
    public void unlock() {
        System.out.println(Thread.currentThread().getName() + " is ready to release the lock");
        sync.release(1);
        System.out.println(Thread.currentThread().getName() + " has already release the lock");
    }

    @Override
    public Condition newCondition() {
        return sync.newCondition();
    }

    public boolean isLocked() {
        return sync.isHeldExclusively();
    }

    public boolean hasQueuedThreads() {
        return sync.hasQueuedThreads();
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(1);
    }

    @Override
    public boolean tryLock(long timeout, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1, unit.toNanos(timeout));
    }
}
```

将之前测试可重入的测试类 `TestReenterSelfLock` 这个类，替换为使用 `ReenterSelfLock` 锁，执行结果：
```console
Thread-0 has started ...
Thread-2 has started ...
Thread-1 has started ...
Thread-0 is ready to get the lock
Thread-0 has already got the lock
Thread-1 is ready to get the lock
Thread-2 is ready to get the lock
Thread-0：递归层级：3
Thread-0 is ready to get the lock
Thread-0 has already got the lock
Thread-0：递归层级：2
Thread-0 is ready to get the lock
Thread-0 has already got the lock
Thread-0：递归层级：1
Thread-0 is ready to release the lock
Thread-0 has already release the lock
Thread-0 is ready to release the lock
Thread-0 has already release the lock
Thread-0 is ready to release the lock
Thread-0 has already release the lock
Thread-1 has already got the lock
Thread-1：递归层级：3
Thread-1 is ready to get the lock
Thread-1 has already got the lock
Thread-1：递归层级：2
Thread-1 is ready to get the lock
Thread-1 has already got the lock
Thread-1：递归层级：1
Thread-1 is ready to release the lock
Thread-1 has already release the lock
Thread-1 is ready to release the lock
Thread-1 has already release the lock
Thread-1 is ready to release the lock
Thread-1 has already release the lock
Thread-2 has already got the lock
Thread-2：递归层级：3
Thread-2 is ready to get the lock
Thread-2 has already got the lock
Thread-2：递归层级：2
Thread-2 is ready to get the lock
Thread-2 has already got the lock
Thread-2：递归层级：1
Thread-2 is ready to release the lock
Thread-2 has already release the lock
Thread-2 is ready to release the lock
Thread-2 has already release the lock
Thread-2 is ready to release the lock
Thread-2 has already release the lock
```
可以发现支持可重入了。

#### (2) ReentrantReadWriteLock 的实现

##### 读写状态的设计

读写锁同样依赖自定义同步器来实现同步功能，而读写状态就是其同步器的同步状态。

回想 `ReentrantLock` 中自定义同步器的实现，同步状态表示锁被一个线程重复获取的次数，而读写锁的自定义同步器需要在同步状态（一个整型变量）上维护多个读线程和一个写线程的状态，使得该状态的设计成为读写锁实现的关键。

如果在一个整型变量上维护多种状态，就一定需要“按位切割使用”这个变量，读写锁将变量切分成了两个部分，高16位表示读，低16位表示写，读写锁是如何迅速确定读和写各自的状态呢？

答案是通过位运算。假设当前同步状态值为 `S`，写状态等于 `S & 0x0000FFFF`（将高 16 位全部抹去），读状态等于 `S >>> 16`（无符号补 0 右移 16 位）。当写状态增加1时，等于 `S+1` ，当读状态增加1时，等于 `S + (1 << 16)` ，也就是 `S + 0x00010000` 。根据状态的划分能得出一个推论：`S` 不等于0时，当写状态 `S & 0x0000FFFF` 等于0时，则读状态 `S >>> 16` 大于0，即读锁已被获取。

##### 写锁的获取与释放

写锁是一个支持重进入的排它锁。如果当前线程已经获取了写锁，则增加写状态。如果当前线程在获取写锁时，读锁已经被获取（读状态不为0）或者该线程不是已经获取写锁的线程，则当前线程进入等待状态。

该方法除了重入条件（当前线程为获取了写锁的线程）之外，增加了一个读锁是否存在的判断。如果存在读锁，则写锁不能被获取，原因在于：读写锁要确保写锁的操作对读锁可见，如果允许读锁在已被获取的情况下对写锁的获取，那么正在运行的其他读线程就无法感知到当前写线程的操作。因此，只有等待其他读线程都释放了读锁，写锁才能被当前线程获取，而写锁一旦被获取，则其他读写线程的后续访问均被阻塞。

写锁的释放与 ReentrantLock 的释放过程基本类似，每次释放均减少写状态，当写状态为0时表示写锁已被释放，从而等待的读写线程能够继续访问读写锁，同时前次写线程的修改对后续读写线程可见。

##### 读锁的获取与释放

读锁是一个支持重进入的共享锁，它能够被多个线程同时获取，在没有其他写线程访问（或者写状态为 0）时，读锁总会被成功地获取，而所做的也只是（线程安全的）增加读状态。如果当前线程已经获取了读锁，则增加读状态。

如果当前线程在获取读锁时，写锁已被其他线程获取，则进入等待状态。读状态是所有线程获取读锁次数的总和，而每个线程各自获取读锁的次数只能选择保存在 `ThreadLocal` 中，由线程自身维护。在 `tryAcquireShared(int unused)`方法中，如果其他线程已经获取了写锁，则当前线程获取读锁失败，进入等待状态。如果当前线程获取了写锁或者写锁未被获取，则当前线程（线程安全，依靠 `CAS` 保证）增加读状态，成功获取读锁。读锁的每次释放（线程安全的，可能有多个读线程同时释放读锁）均减少读状态。

##### 锁的升降级

锁降级指的是写锁降级成为读锁。如果当前线程拥有写锁，然后将其释放，最后再获取读锁，这种分段完成的过程不能称之为锁降级。

锁降级是指把持住（当前拥有的）写锁，再获取到读锁，随后释放（先前拥有的）写锁的过程。

`ReentrantReadWriteLock` 不支持锁升级（把持读锁、获取写锁，最后释放读锁的过程）。目的是保证数据可见性，如果读锁已被多个线程获取，其中任意线程成功获取了写锁并更新了数据，则其更新对其他获取到读锁的线程是不可见的。

### 6、使用 AQS 实现 FutureTask

```java
public class MyFutureTask<V> implements Runnable, Future<V> {

    private Sync sync;

    public MyFutureTask(Callable<V> callable) {
        if (callable == null) {
            throw new NullPointerException();
        }
        sync = new Sync(callable);
    }

    private final class Sync extends AbstractQueuedSynchronizer {

        /**
         * 表示任务正在执行
         */
        private static final int RUNNING = 1;

        /**
         * 表示人物已经运行完毕
         */
        private static final int RAN = 2;

        private Callable<V> callable;

        /**
         * 执行结果
         */
        private V result;

        public Sync(Callable<V> callable) {
            this.callable = callable;
        }

        /**
         * 如果任务没完成，怎调用 get() 方法的线程全部进入同步队列、如果 acquireShared() 方法返回了，说明可以拿结果了，直接返回结果
         *
         * @return
         */
        public V innerGet() {
            acquireShared(1);
            return result;
        }

        /**
         * 对任务的状态进行变化，设置执行结果，并唤醒所有等待结果的线程
         *
         * @param v
         */
        public void innerSet(V v) {
            for (; ; ) {
                // 获取任务执行状态
                int state = getState();

                // 如果任务执行完毕就退出
                if (state == RAN) {
                    return;
                }
                // 尝试将任务执行设置为执行完成
                if (compareAndSetState(state, RAN)) {
                    // 设置执行结果
                    result = v;
                    // 释放同步状态
                    releaseShared(0);
                    return;
                }
            }
        }

        public void innerRun() {
            if (compareAndSetState(0, RUNNING)) {
                // 再检查一次，双重保障
                if (getState() == RUNNING) {
                    try {
                        // 将 call() 方法的执行结果赋值给 Sync 中的 result
                        innerSet(callable.call());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                } else {
                    // 如果不等于RUNNING，表示被取消或者是抛出了异常。这时候唤醒调用 get() 的线程。
                    releaseShared(0);
                }
            }
        }

        @Override
        protected boolean tryReleaseShared(int arg) {
            return true;
        }

        /**
         * 任务没完成，返回-1，让 get() 结果的线程全部进入同步队列；任务完成，返回1，可以让所有在同步队列上等待的线程一一去拿结果
         *
         * @param arg
         * @return
         */
        @Override
        protected int tryAcquireShared(int arg) {
            return getState() == RAN ? 1 : -1;
        }
    }

    @Override
    public void run() {
        sync.innerRun();
    }

    @Override
    public boolean cancel(boolean mayInterruptIfRunning) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean isCancelled() {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean isDone() {
        throw new UnsupportedOperationException();
    }

    @Override

    public V get() throws InterruptedException, ExecutionException {
        return sync.innerGet();
    }

    @Override
    public V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException {
        throw new UnsupportedOperationException();
    }
}
```

外部线程调用 `MyFutureTask` 的 `run()` 方法，实际上调用的是内部的 `innerRun()` 方法，在这个方法中对 `Callable` 进行运算，运算完成后通过 `innerSet(V v)` 设置值，并释放同步状态，在 `innerSet(V v)` 是使用了一个无线 `for` 循环，因为等待同步状态的线程可能不止一个，要保证素有的线程都能够被唤醒并返回。最后通过内部的 `innerGet()` 获取执行结果，`acquireShared()` 方法内部又调用了 `tryAcquireShared()` 方法，在这个方法中计算，当返回值大于0的时候表明计算结束了，否则继续等待直到获取到同步状态进行返回。

测试类：
```java
public class UseFuture {

    private static class UseCallable implements Callable<Integer> {

        private int sum;

        @Override
        public Integer call() throws Exception {
            System.out.println("Callable 子线程开始计算！");
            Thread.sleep(1000);
            for (int i = 0; i < 5000; i++) {
                sum = sum + i;
            }
            System.out.println("Callable 子线程计算结束！结果为：" + sum);
            return sum;
        }
    }

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        UseCallable useCallable = new UseCallable();
        // 用 FutureTask 包装 Callable
        final MyFutureTask<Integer> futureTask = new MyFutureTask<>(useCallable);
        new Thread(futureTask).start();
        Thread.sleep(2000);

        System.out.println("Main get UseCallable result = " + futureTask.get());

        new Thread(() -> {
            try {
                System.out.println("Sub get UseCallable result = " + futureTask.get());
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }).start();
    }
}

```

主线程和子线程都在计算，两个线程都可以获取计算结果。执行结果：
```console
Callable 子线程开始计算！
Callable 子线程计算结束！结果为：12497500
Main get UseCallable result = 12497500
Sub get UseCallable result = 12497500
```

<Valine></Valine>