# 迭代器模式Iterator

<Counter :path="'pattern'" :name="'迭代器模式Iterator'"></Counter>

## 一、概念

### 1、定义

定义一个创建对象的接口，但让实现这个接口的类来决定实例化哪个类。工厂方法让类的实例化推迟到子类中进行.

### 2、类型

创建型

### 3、适用场景

* 创建对象需要大量重复的代码
* 客户端（应用层）不依赖于产品类实现如何被创建、实现等细节
* 一个类通过其子类来制定创建哪个对象

### 4、优点

* 用户只需要关心所需产品对应的工厂，无序关心创建细节
* 加入新产品符合开闭原则，提高可扩展性

### 5、缺点

* 类的个数容易过多，增加复杂度
* 增加了系统的抽象性和理解难度

## 二、应用

继续接着上一篇博客 [简单工厂SimpleFactory](简单工厂SimpleFactory.md) 讲，英雄类还是那个英雄类，力量英雄和敏捷英雄的类也不变，这里就不重复写了。

这时，创建视频的工厂要变化了，变为了一个抽象类：

```java
public abstract class VideoFactory {

    public abstract Video getVideo();
}
```

创建视频的方法已经不在主工厂中进行了，移交到了子类中。

新建一个专门用于创建Java视频的工厂：

```java
public class JavaVideoFactory extends VideoFactory {

    @Override
    public Video getVideo() {
        return new JavaVideo();
    }
}
```

同理，创建一个专门用于创建Python视频的工厂：

```java
public class PythonVideoFactory extends VideoFactory {

    @Override
    public Video getVideo() {
        return new PythonVideo();
    }
}
```

这样一来，应用层就这样子调用了：

```java
public class Test {

    public static void main(String[] args) {
        VideoFactory videoFactory = new PythonVideoFactory();
        VideoFactory videoFactory2 = new JavaVideoFactory();
        Video video = videoFactory.getVideo();
        video.produce();
    }
}
```

运行结果：
```console
录制Python课程视频
```

如果后续有新的类型的视频需要创建，并不需要修改 `VideoFactory` 类了，只需要重新创建一个新类型视频以及创建新类型视频的工厂，然后在应用层 `new` 出来这个新英雄工厂，并调用它的 `getVideo()` 方法就可以创建新的视频了。

例如添加一个新的前端视频：

```java
public class FrontEndVideo extends Video {

    @Override
    public void produce() {
        System.out.println("录制FrontEnd课程视频");
    }
}
```

再来一个创建前端视频的工厂：

```java
public class FrontEndVideoFactory extends VideoFactory {

    @Override
    public Video getVideo() {
        return new FrontEndVideo();
    }
}
```

应用层代码：

```java
    public static void main(String[] args) {
        VideoFactory videoFactory = new PythonVideoFactory();
        VideoFactory videoFactory2 = new JavaVideoFactory();
        VideoFactory videoFactory3 = new FrontEndVideoFactory();
        Video video = videoFactory.getVideo();
        video.produce();
        Video frontEndVideo = videoFactory3.getVideo();
        frontEndVideo.produce();
    }
```

完全不用修改 `VideoFactory` 类了。

执行结果：

```console
录制Python课程视频
录制FrontEnd课程视频
```

此时的类图：

![工厂方法](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/factorymethod.png)

`VideoFactory` 将创建具体某个视频的职责交由子类工厂实现，应用层也只用创建出来具体的子类工厂，然后从子类工厂中创建视频。

这里需要明确个概念：

Java视频、Python视频都是一个产品等级，它们都同属于“视频”这个产品的等级，它们都是产品。工厂方法是用来解决同一产品等级的问题的。

## 三、源码中的应用

### 1、Collection

`Collection` 可以理解是一个抽象工厂，类中的 `Iterator<E> iterator()` 方法就是一个工厂方法。其中 `ArrayList` 对它进行了实现：

```java
    public Iterator<E> iterator() {
        return new Itr();
    }

    /**
     * An optimized version of AbstractList.Itr
     */
    private class Itr implements Iterator<E> {
        int cursor;       // index of next element to return
        int lastRet = -1; // index of last element returned; -1 if no such
        int expectedModCount = modCount;

        public boolean hasNext() {
            return cursor != size;
        }

        @SuppressWarnings("unchecked")
        public E next() {
            checkForComodification();
            int i = cursor;
            if (i >= size)
                throw new NoSuchElementException();
            Object[] elementData = ArrayList.this.elementData;
            if (i >= elementData.length)
                throw new ConcurrentModificationException();
            cursor = i + 1;
            return (E) elementData[lastRet = i];
        }

        public void remove() {
            if (lastRet < 0)
                throw new IllegalStateException();
            checkForComodification();

            try {
                ArrayList.this.remove(lastRet);
                cursor = lastRet;
                lastRet = -1;
                expectedModCount = modCount;
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }

        @Override
        @SuppressWarnings("unchecked")
        public void forEachRemaining(Consumer<? super E> consumer) {
            Objects.requireNonNull(consumer);
            final int size = ArrayList.this.size;
            int i = cursor;
            if (i >= size) {
                return;
            }
            final Object[] elementData = ArrayList.this.elementData;
            if (i >= elementData.length) {
                throw new ConcurrentModificationException();
            }
            while (i != size && modCount == expectedModCount) {
                consumer.accept((E) elementData[i++]);
            }
            // update once at end of iteration to reduce heap write traffic
            cursor = i;
            lastRet = i - 1;
            checkForComodification();
        }

        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
    }
```

`ArrayList` 相当于一个具体工厂，`Iterator` 相当于抽象产品，`Itr` 就是具体的产品。

`ArrayList` 相关的类图：

![工厂方法2](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/factorymethod_2.png)

### 2、URLStreamHandlerFactory

`URLStreamHandlerFactory` 是一个接口，它是解决在 `jdk` 中协议扩展使用到的接口：

```java
public interface URLStreamHandlerFactory {
    /**
     * Creates a new {@code URLStreamHandler} instance with the specified
     * protocol.
     *
     * @param   protocol   the protocol ("{@code ftp}",
     *                     "{@code http}", "{@code nntp}", etc.).
     * @return  a {@code URLStreamHandler} for the specific protocol.
     * @see     java.net.URLStreamHandler
     */
    URLStreamHandler createURLStreamHandler(String protocol);
}
```

`URLStreamHandlerFactory` 就是一个抽象工厂，`URLStreamHandler createURLStreeamHandler(String protocal)` 就是一个工厂方法。有一个 `Launcher` 类的的内部类 `Factory` 实现了这个接口：

```java
    private static class Factory implements URLStreamHandlerFactory {
        private static String PREFIX = "sun.net.www.protocol";

        private Factory() {
        }

        public URLStreamHandler createURLStreamHandler(String var1) {
            String var2 = PREFIX + "." + var1 + ".Handler";

            try {
                Class var3 = Class.forName(var2);
                return (URLStreamHandler)var3.newInstance();
            } catch (ReflectiveOperationException var4) {
                throw new InternalError("could not load " + var1 + "system protocol handler", var4);
            }
        }
    }
```

这个 `Factory` 就是一个具体工厂。`URLStreamHandler` 就相当于抽象产品，`sun.net.www.protocol.http` 包下的 `Handler` 就是对抽象类 `URLStreamHandler` 的实现：

```java
public class Handler extends URLStreamHandler {
    protected String proxy;
    protected int proxyPort;

    protected int getDefaultPort() {
        return 80;
    }

    public Handler() {
        this.proxy = null;
        this.proxyPort = -1;
    }

    public Handler(String var1, int var2) {
        this.proxy = var1;
        this.proxyPort = var2;
    }

    protected URLConnection openConnection(URL var1) throws IOException {
        return this.openConnection(var1, (Proxy)null);
    }

    protected URLConnection openConnection(URL var1, Proxy var2) throws IOException {
        return new HttpURLConnection(var1, var2, this);
    }
}
```

这个 `Handler` 就是一个具体产品。

### 3、ILoggerFactory

`ILoggerFactory` 也是一个工厂方法

```java
public interface ILoggerFactory {
  
  /**
   * Return an appropriate {@link Logger} instance as specified by the
   * <code>name</code> parameter.
   * 
   * <p>If the name parameter is equal to {@link Logger#ROOT_LOGGER_NAME}, that is 
   * the string value "ROOT" (case insensitive), then the root logger of the 
   * underlying logging system is returned.
   * 
   * <p>Null-valued name arguments are considered invalid.
   *
   * <p>Certain extremely simple logging systems, e.g. NOP, may always
   * return the same logger instance regardless of the requested name.
   * 
   * @param name the name of the Logger to return
   * @return a Logger instance 
   */
  public Logger getLogger(String name);
}
```

这个 `getLogger()` 方法就是一个工厂方法。

它的相关类图：

![工厂方法3](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/factorymethod_3.png)

可以看出，具体的工厂有3个：`NOPLoggerFactory`、`LoggerContext` 和 `SubstituteLoggerFactory`。

<Valine></Valine>