# 原子操作CAS

<Counter :path="'backend'" :name="'原子操作CAS'"></Counter>

## 一、什么是原子操作

假定有两个操作 `A` 和 `B`，如果从执行 `A` 的线程来看，当另一个线程执行 `B` 时，要么将 `B` 全部执行完，要么完全不执行 `B`，那么 `A` 和 `B` 对彼此来说是原子的。

实现原子操作可以使用锁，即锁机制，满足基本的需求是没有问题的了。但是有的时候需求并非这么简单，需要更有效、更加灵活的机制，`synchronized` 关键字是基于阻塞的锁机制，也就是说当一个线程拥有锁的时候，访问同一资源的其它线程需要等待，直到该线程释放锁，这里会有些问题：首先，如果被阻塞的线程优先级很高很重要怎么办？其次，如果获得锁的线程一直不释放锁怎么办？（这种情况是非常糟糕的）。还有一种情况，如果有大量的线程来竞争资源，那CPU 将会花费大量的时间和资源来处理这些竞争，同时，还有可能出现一些例如死锁之类的情况。最后，其实锁机制是一种比较粗糙、粒度比较大的机制，相对于像计数器这样的需求有点儿过于笨重。

实现原子操作还可以使用当前的处理器基本都支持 `CAS` 的指令，只不过每个厂家所实现的算法并不一样，每一个 `CAS` 操作过程都包含三个运算符：一个内存地址 `V`，一个期望的值 `A` 和一个新值 `B`，操作的时候如果这个地址上存放的值等于这个期望的值 `A`，则将地址上的值赋为新值 `B`，否则不做任何操作。

`CAS` 的基本思路就是，如果这个地址上的值和期望的值相等，则给其赋予新值，否则不做任何事，但是要返回原值是多少。循环 `CAS` 就是在一个循环里不断的做 `CAS` 操作，直到成功为止。

`CAS` 是怎么实现线程的安全呢？语言层面不做处理，我们将其交给硬件CPU和内存，利用CPU的多处理能力，实现硬件层面的阻塞，再加上 `volatile` 变量的特性即可实现基于原子操作的线程安全。

## 二、CAS 实现原子操作的三大问题

### 1、ABA 问题

因为 `CAS` 需要在操作值的时候，检查值有没有发生变化，如果没有发生变化则更新，但是如果一个值原来是 `A`，变成了 `B`，又变成了 `A`，那么使用 `CAS` 进行检查时会发现它的值没有发生变化，但是实际上却变化了。

`ABA` 问题的解决思路就是使用版本号，在变量前面追加上版本号，每次变量更新的时候把版本号加1，那么 `A→B→A` 就会变成 `1A→2B→3A`，这样也就解决了问题。

### 2、循环时间长开销大

因为在执行 `CAS` 的时候，如果一次不成功，那么它会重新进行 `CAS`，直到成功为止。自旋 `CAS` 如果长时间不成功，会给CPU带来非常大的执行开销。

### 3、只能保证一个共享变量的原子操作

当对一个共享变量执行操作时，我们可以使用循环 `CAS` 的方式来保证原子操作，但是对多个共享变量操作时，循环 `CAS` 就无法保证操作的原子性，这个时候
就可以用锁。

还有一个取巧的办法，就是把多个共享变量合并成一个共享变量来操作。比如，有两个共享变量 `i＝2`，`j=a`，合并一下 `ij=2a`，然后用 `CAS` 来操作 `ij`。从 `Java 1.5` 开始，`JDK` 提供了 `AtomicReference` 类来保证引用对象之间的原子性，就可以把多个变量放在一个对象里来进行 `CAS` 操作。

## 三、jdk 中相关原子操作类的使用

### 1、AtomicInteger

* int addAndGet(int delta)

以原子方式将输入的数值与实例中的值（`AtomicInteger` 里的 `value`）相加，并返回结果。

* boolean compareAndSet(int expect，int update)

如果输入的数值等于预期值，则以原子方式将该值设置为输入的值。

* int getAndIncrement()

以原子方式将当前值加1，注意，这里返回的是自增前的值。

* int getAndSet(int newValue)

以原子方式设置为 `newValue` 的值，并返回旧值。

示例：
```java
public class UseAtomicInteger {

    private static AtomicInteger ATOMIC_INTEGER = new AtomicInteger(10);

    public static void main(String[] args) {
        System.out.println(ATOMIC_INTEGER.getAndIncrement());
        
        System.out.println( ATOMIC_INTEGER.incrementAndGet());
        System.out.println( ATOMIC_INTEGER.compareAndSet(10, 15));
        System.out.println(ATOMIC_INTEGER.addAndGet(10));
    }
}
```

执行结果：
```console
10
12
false
22
```

### 2、AtomicIntegerArray

主要是提供原子的方式更新数组里的整型，其常用方法如下：

* int addAndGet(int i，int delta)

以原子方式将输入值与数组中索引 `i` 的元素相加。

* boolean compareAndSet(int i，int expect，int update)

如果当前值等于预期值，则以原子方式将数组位置 `i` 的元素设置成 `update` 值。

需要注意的是，数组 `value` 通过构造方法传递进去，然后 `AtomicIntegerArray`会将当前数组复制一份，所以当 `AtomicIntegerArray` 对内部的数组元素进行修改时，不会影响传入的数组。

示例：
```java
public class UseAtomicArray {

    private static int[] value = new int[]{1, 2};
    private static AtomicIntegerArray ATOMIC_INTEGER_ARRAY = new AtomicIntegerArray(value);

    public static void main(String[] args) {
        ATOMIC_INTEGER_ARRAY.getAndSet(0, 3);
        System.out.println(ATOMIC_INTEGER_ARRAY.get(0));
        // 原数组不会变化
        System.out.println(value[0]);
    }
}
```

执行结果：
```console
3
1
```

### 3、UseAtomicReference

原子更新基本类型的 `AtomicInteger` ，只能更新一个变量，如果要原子更新多个变量，可以使用 `AtomicReference` 更新引用类型。

更新引用并不会影响原来对象的值。

示例：
```java
public class UseAtomicReference {

    private static AtomicReference<UserInfo> ATOMIC_REFERENCE;

    public static void main(String[] args) {
        // 原始数据
        UserInfo user = new UserInfo("Mark", 15);
        ATOMIC_REFERENCE = new AtomicReference(user);

        // 需要更新的数据
        UserInfo updateUser = new UserInfo("Bill", 17);
        ATOMIC_REFERENCE.compareAndSet(user, updateUser);

        System.out.println(ATOMIC_REFERENCE.get());
        System.out.println(user);
    }

    private static class UserInfo {

        private String name;
        private int age;

        public UserInfo(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() {
            return name;
        }

        public int getAge() {
            return age;
        }

        @Override
        public String toString() {
            return "UserInfo{" +
                    "name='" + name + '\'' +
                    ", age=" + age +
                    '}';
        }
    }
}
```

执行结果：
```console
UserInfo{name='Bill', age=17}
UserInfo{name='Mark', age=15}
```

### 4、UseAtomicStampedReference

利用版本戳的形式记录了每次改变以后的版本号，这样的话就不会存在 `ABA`问题了。这就是 `AtomicStampedReference` 的解决方案。

示例：
```java
public class UseAtomicStampedReference {

    private static AtomicStampedReference<String> ATOMIC_STAMPED_REFERENCE =
            new AtomicStampedReference("mark", 0);

    public static void main(String[] args) throws InterruptedException {
        // 拿到旧的版本号和值
        final int oldStamp = ATOMIC_STAMPED_REFERENCE.getStamp();
        final String oldReference = ATOMIC_STAMPED_REFERENCE.getReference();
        System.out.println(oldReference + "============" + oldStamp);

        Thread rightStampThread = new Thread(() ->
                System.out.println(Thread.currentThread().getName() +
                        "：当前变量值：" + oldReference + "，当前版本戳：" + oldStamp + "，对比结果："
                        + ATOMIC_STAMPED_REFERENCE.compareAndSet(
                        oldReference, oldReference + "+Java",
                        oldStamp, oldStamp + 1)));

        Thread errorStampThread = new Thread(() -> {
            String reference = ATOMIC_STAMPED_REFERENCE.getReference();
            System.out.println(Thread.currentThread().getName()
                    + "：当前变量值：" + reference + "，当前版本戳：" + ATOMIC_STAMPED_REFERENCE.getStamp() + "，对比结果："
                    + ATOMIC_STAMPED_REFERENCE.compareAndSet(
                    reference, reference + "+C",
                    oldStamp, oldStamp + 1));
        });

        // 控制 rightStampThread 先执行
        rightStampThread.start();
        rightStampThread.join();
        errorStampThread.start();
        errorStampThread.join();

        System.out.println(ATOMIC_STAMPED_REFERENCE.getReference() + "============" + ATOMIC_STAMPED_REFERENCE.getStamp());
    }
}
```

执行结果：
```console
mark============0
Thread-0：当前变量值：mark，当前版本戳：0，对比结果：true
Thread-1：当前变量值：mark+Java，当前版本戳：1，对比结果：false
mark+Java============1
```

### 5、AtomicMarkableReference

`AtomicMarkableReference` 跟 `AtomicStampedReference 差不多，`AtomicStampedReference` 的构造方法是 `AtomicStampedReference(V initialRef, int initialStamp)，可以记录变化的次数 ，而 `AtomicMarkableReference` 的构造方法是 `AtomicMarkableReference(V initialRef, boolean initialMark)`，只记录了是否变化。

<Valine></Valine>
