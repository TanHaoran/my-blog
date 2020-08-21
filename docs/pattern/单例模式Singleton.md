# 单例模式Singleton

<Counter :path="'pattern'" :name="'单例模式Singleton'"></Counter>

## 一、概念

### 1、定义

保证一个类仅有一个实例，并提供一个全局访问点

### 2、类型

创建型

### 3、适用场景

* 想确保任何情况下都绝对只有一个实例

### 4、优点

* 在内存里只有一个实例，减少了内存开销
* 可以避免对资源的多重占用
* 设置全局访问点，严格控制访问

### 5、缺点

* 没有借口，扩展困难

### 6、重点

* 私有构造器
* 线程安全
* 延迟加载
* 序列化和反序列化安全
* 反射
* double check
* 静态内部类

### 7、相关设计模式

* 单例模式和工厂模式

可以将工厂类设计成单例模式

* 单例模式和享元模式

一些业务场景会管理很多单例对象，通过单例模式和享元模式的结合完成单例对象的获取，这种情况下享元模式相当于单例模式的一个工厂，只不过这个工厂会生产处已经创建好的对象，而不是重新创建的对象。

## 二、Coding

### 1、懒汉式

懒汉式的单例比较简单：
```java
public class LazySingleton {

    private static LazySingleton instance;

    private LazySingleton() {

    }

    public synchronized static LazySingleton getInstance() {
        if (instance == null) {
            instance = new LazySingleton();
        }
        return instance;
    }

}
```
这种单例在单线程下是没有问题的，但如果考虑到多线程，就会可能造成产生多个实例的问题。

### 2、懒汉式的双重检查

```java
public class LazyDoubleCheckSingleton {

    private static LazyDoubleCheckSingleton instance;

    private LazyDoubleCheckSingleton() {

    }

    public static LazyDoubleCheckSingleton getInstance() {
        if (instance == null) {
            synchronized (LazyDoubleCheckSingleton.class) {
                if (instance == null) {
                    instance = new LazyDoubleCheckSingleton();
                }
            }
        }
        return instance;
    }
}
```
在首次判断为空的情况下，利用锁保证进入的只有一个线程，并在内部再次判断空，从而实现了单例的创建。但其实这样子的做饭还是有安全隐患的。因为在 `new` 出来 `LazyDoubleCheckSingleton` 对象的时候，实际上是进行了3个操作：
1. 分配内存给对象
2. 初始化对象
3. 设置 `instance` 指向分配好的内存地址

但是第2步和第3步操作有可能会因为 `java` 的 `重排序`颠倒执行的顺序，也就是先执行第3步，然后执行第2步。这样就导致了后进入的线程进入第一行判空的时候由于上一个线程的第3步先执行了，所以判断的结果是不为空，但实际上这个对象在上一个线程中还处于没有初始化完成的地步，但后一个线程因为判断不为空而拿到的单例是一个还没有初始化完毕的对象。

那么如何避免这种情况呢，很简答，只需要对 `instance` 做一个 `volatile` 修饰就可以了，这样实际上就是禁止了第2步和第3步的重排序，也就避免了上面出现的情况。

### 3、静态内部类

下面是静态内部类实现的单例：
```java
public class StaticInnerClassSingleton {

    private StaticInnerClassSingleton() {

    }

    private static class InnerClass {

        private static StaticInnerClassSingleton instance = new StaticInnerClassSingleton();
    }

    public static StaticInnerClassSingleton getInstance() {
        return InnerClass.instance;
    }
}

```
静态内部类使得非构造线程无法看到内部创建对象时的重排序。原理是在初始化内部类 `InnerClass` 的时候，进入的线程会拿到锁，而没有拿到锁的线程是无法看到内部初始化时的重排序的。

### 4、饿汉式

```java
public class HungrySingleton implements Serializable, Cloneable {

    private final static HungrySingleton instance = new HungrySingleton();

    private HungrySingleton() {
    }

    public static HungrySingleton getInstance() {
        return instance;
    }
    
}
```
饿汉式是比较简单的，就是在类加载的时候就初始化单例了。

这里单例的实例化过程还可以使用静态代码块的形式：
```java
public class HungrySingleton implements Serializable {

    private final static HungrySingleton instance;

    static {
        instance = new HungrySingleton();
    }

    private HungrySingleton() {
    }

    public static HungrySingleton getInstance() {
        return instance;
    }

}
```
这里使用了 `final` 关键字，使用 `final` 关键字修饰的变量必须在类加载完成时就完成初始化，所以之前的懒汉式是无法使用 `final` 来修饰的。

### 5、序列化破坏单例模式

你以为单例就这么设计好了吗？大错特错，序列化是可以破坏单例的。我们做这样子一种情况，将单例出来的对象序列化后存入文件，然后从文件中重新读取出来，那么此时读取出来的对象和开始我们创建的单例对象是同一个对象吗？测试代码如下：
```java
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        HungrySingleton instance = HungrySingleton.getInstance();
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("singleton_file"));
        oos.writeObject(instance);

        File file = new File("singleton_file");
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file));

        HungrySingleton newInstance = (HungrySingleton) ois.readObject();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
com.jerry.design.pattern.creational.singleton.HungrySingleton@52cc8049
com.jerry.design.pattern.creational.singleton.HungrySingleton@69663380
false
```

运行后可以发现两个对象并非同一个对象。这是为什么呢？原来在 `jdk` 关于 `ObjectInputStream` 的源码中的 `readObject()` 方法中如果读取的这个对象实现了序列化接口，那么就会使用反射重新 `new` 出来一个新的对象，这当然就和我们单例创建的对象不是同一个了。但是在 `readObject()` 返回结果之前还会在判断一下对象是否有一个名为 `readResolve()` 方法，如果有的话，就会调用对象自己的 `readResolve()` 方法，否则就会返回通过反射新创建的对象。
 
那么知道了原理就好解决了，我们给饿汉式的单例类添加一个方法并返回我们创建的单例就好了：
```java
    private Object readResolve() {
        return instance;
    }
```
此时在运行上面的测试就可以看到两个对象是同一个对象了。

运行结果：
```console
com.jerry.design.pattern.creational.singleton.HungrySingleton@52cc8049
com.jerry.design.pattern.creational.singleton.HungrySingleton@52cc8049
true
```

### 6、单例模式的反射攻击

那么除了序列化可以破坏单例模式之外还有什么可以破坏单例模式呢？反射出场了，先看看反射是如何攻击单例的吧，这里采用饿汉式进行演示：
```java
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, 
            InvocationTargetException, InstantiationException {
        Class objectClass = HungrySingleton.class;

        Constructor constructor = objectClass.getDeclaredConstructor();
        constructor.setAccessible(true);

        HungrySingleton instance = HungrySingleton.getInstance();
        HungrySingleton newInstance = (HungrySingleton) constructor.newInstance();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
com.jerry.design.pattern.creational.singleton.HungrySingleton@34a245ab
com.jerry.design.pattern.creational.singleton.HungrySingleton@7cc355be
false
```

运行发现，果然反射使得单例又“不灵”了。那么如何解决呢？

在饿汉式的构造方法中进行判断不允许实例化对象：
```java
    private HungrySingleton() {
        if (hungrySingleton != null) {
            throw new RuntimeException("单例构造器禁止反射调用");
        }
    }
```
这样，在使用反射进行实例化的时候就会抛异常了。这个在构造方法中禁止反射生成单例的代码需要在之前所有的非饿汉式单例中都要加上，这是因为这些类都是在类加载的时候完成单例初始化的，那么这样子处理可以解决。但对于不是在类加载时完成单例初始化的情况，例如懒汉式会是什么情况呢？

测试：
```java
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, 
            InvocationTargetException, InstantiationException {
        Class objectClass = LazySingleton.class;

        Constructor constructor = objectClass.getDeclaredConstructor();
        constructor.setAccessible(true);

        LazySingleton instance = LazySingleton.getInstance();
        LazySingleton newInstance = (LazySingleton) constructor.newInstance();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
Exception in thread "main" java.lang.reflect.InvocationTargetException
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at com.jerry.design.pattern.creational.singleton.Test.main(Test.java:48)
Caused by: java.lang.RuntimeException: 单例构造器禁止反射调用
	at com.jerry.design.pattern.creational.singleton.HungrySingleton.<init>(HungrySingleton.java:22)
	... 5 more
```

可以发现，单例失败了。

那么给懒汉式加入禁止反射构造器创建实例的代码有效吗？
```java
    private LazySingleton() {
        if (lazySingleton != null) {
            throw new RuntimeException("单例构造器禁止反射调用");
        }
    }
```
重新运行测试代码，运行结果：
```console
Exception in thread "main" java.lang.reflect.InvocationTargetException
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at com.jerry.design.pattern.creational.singleton.Test.main(Test.java:51)
Caused by: java.lang.RuntimeException: 单例构造器禁止反射调用
	at com.jerry.design.pattern.creational.singleton.LazySingleton.<init>(LazySingleton.java:20)
	... 5 more
```
咦？似乎好了，但其实不然。如果先执行的是 `getInstance()` 方法，那么到反射执行的时候就会抛异常。

但是如果调整下代码的顺序，先执行反射生成对象，然后再调用 `getInstance()` 那么，我们写的判断方法就不起作用了，仍然会生成2个对象。所以懒汉式，也就是单例不是在类加载时完成初始化的这种情况，是无法避免反射攻击的：
```java
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, 
            InvocationTargetException, InstantiationException {
        Class objectClass = LazySingleton.class;

        Constructor constructor = objectClass.getDeclaredConstructor();
        constructor.setAccessible(true);

        LazySingleton instance = LazySingleton.getInstance();
        LazySingleton newInstance = (LazySingleton) constructor.newInstance();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
com.jerry.design.pattern.creational.singleton.LazySingleton@34a245ab
com.jerry.design.pattern.creational.singleton.LazySingleton@7cc355be
false
```

可以看到单例再次失效了。

那么有没有什么既能防止序列化也能防止反射攻击的单例呢？答案是有的。

### 7、枚举单例

什么？枚举还可以单例？太没见过世面了，看看是个什么样子的吧：
```java
public enum EnumInstance {

    INSTANCE;

    private Object data;

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public static EnumInstance getInstance() {
        return INSTANCE;
    }
}
```

测试是否支持序列化：
```java
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        EnumInstance instance = EnumInstance.getInstance();
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("singleton_file"));
        oos.writeObject(instance);

        File file = new File("singleton_file");
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file));

        EnumInstance newInstance = (EnumInstance) ois.readObject();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
INSTANCE
INSTANCE
true
```

完全支持。

测试里面的 `data` 对象是否是同一个对象：
```java
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        EnumInstance instance = EnumInstance.getInstance();
        instance.setData(new Object());

        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("singleton_file"));
        oos.writeObject(instance);

        File file = new File("singleton_file");
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file));

        EnumInstance newInstance = (EnumInstance) ois.readObject();

        System.out.println(instance.getData());
        System.out.println(newInstance.getData());
        System.out.println(instance.getData() == newInstance.getData());
    }
```

运行结果：
```console
java.lang.Object@4459eb14
java.lang.Object@4459eb14
true
```

居然连 `data` 都是同一个对象，太牛逼了！原来在 `ObjectInputStream` 的源码中，在执行 `readObject()` 时，对于枚举类型会走到 `readEnum()` 方法中，获取枚举对象的名称 `name` ，因为枚举中 `name` 是唯一的，并且对应唯一的一个枚举常量，所以再通过 `name` 获取到的对象也就是唯一的那个常量对象。

紧接着看看反射会不会破坏单例呢？
```java
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, 
            InvocationTargetException, InstantiationException {
        Class objectClass = EnumInstance.class;

        Constructor constructor = objectClass.getDeclaredConstructor();
        constructor.setAccessible(true);

        EnumInstance newInstance = (EnumInstance) constructor.newInstance();
        EnumInstance instance = EnumInstance.getInstance();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
Exception in thread "main" java.lang.NoSuchMethodException: com.jerry.design.pattern.creational.singleton.EnumInstance.<init>()
	at java.lang.Class.getConstructor0(Class.java:3082)
	at java.lang.Class.getDeclaredConstructor(Class.java:2178)
	at com.jerry.design.pattern.creational.singleton.Test.main(Test.java:60)
``` 

发现直接报错了，提示说：`NoSuchMethodException` ，原来是它并没有获得到无参数构造器。通过 `Enum` 源码可以看到 `Enum` 类只有一个构造方法，分别需要两个参数，一个 `String` 类型的参数，一个 `int` 类型的参数。

那我们手动给它加上两个参数试试：
```java
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, 
            InvocationTargetException, InstantiationException {
        Class objectClass = EnumInstance.class;

        Constructor constructor = objectClass.getDeclaredConstructor(String.class, int.class);
        constructor.setAccessible(true);

        EnumInstance newInstance = (EnumInstance) constructor.newInstance("jerry", 123);
        EnumInstance instance = EnumInstance.getInstance();

        System.out.println(instance);
        System.out.println(newInstance);
        System.out.println(instance == newInstance);
    }
```

运行结果：
```console
Exception in thread "main" java.lang.IllegalArgumentException: Cannot reflectively create enum objects
	at java.lang.reflect.Constructor.newInstance(Constructor.java:417)
	at com.jerry.design.pattern.creational.singleton.Test.main(Test.java:63)
```

发现仍然报错，`IllegalArgumentException` ，并且报错信息解释说“无法通过反射创建枚举对象”。

如此说来，枚举类天然的支持了序列化的单例和反射的单例（如果想进一步了解原因的话，可以反编译刚才的枚举单例类查看原因）。

但是我们最终实际还是要在枚举中创建一些方法的，这样子才有用，枚举中如何创建方法呢？
```java
public enum EnumInstance {

    INSTANCE {
        public void printTest() {
            System.out.println("print test");
        }
    };

    public abstract void printTest();

    private Object data;

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public static EnumInstance getInstance() {
        return INSTANCE;
    }
}
```
注意两处的 `printTest()` 方法都是用 `public` 来声明的，否则外部是无法调用这个方法的。

### 8、容器单例

先看下容器单例是什么样子的：
```java
public class ContainerSingleton {

    private static Map<String, Object> singletonMap = new HashMap<>();

    private ContainerSingleton() {

    }

    public static void putInstance(String key, Object instance) {
        if (StringUtils.isNotBlank(key) && instance != null) {
            if (!singletonMap.containsKey(key)) {
                singletonMap.put(key, instance);
            }
        }
    }

    public static Object getInstance(String key) {
        return singletonMap.get(key);
    }

}
```
这里我们使用的是 `HashMap` ，它不是线程安全的。但是如果在类初始化的时候就把 `singletonMap` 初始化完成，即把所有需要放入map的对象全部放进去，那么也是可以的。否则如果两个线程同时在 `putInstance()` 的时候，后执行的那个线程是有可能将前一个线程放入的对象覆盖掉的，也就是线程不安全的

也可以通过使用 `HashTable` 来实现线程安全，但会影响性能。

它的用处是系统中存在很多的单例对象，使用这个容器单例可以统一将它们都管理起来。

### 9、ThreadLocal线程单例

`ThreadLocal` 其实并不能保证全局唯一，但是可以保证在每一个使员它的线程中唯一。来看看如何实现的：
```java
public class ThreadLocalInstance {

    private static final ThreadLocal<ThreadLocalInstance> threadLocalInstance =
            ThreadLocal.withInitial(ThreadLocalInstance::new);

    private ThreadLocalInstance() {

    }

    public static ThreadLocalInstance getInstance() {
        return threadLocalInstance.get();
    }
}
```

<Valine></Valine>