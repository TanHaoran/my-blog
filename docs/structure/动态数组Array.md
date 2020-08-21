# 动态数组Array

<Counter :path="'structure'" :name="'动态数组Array'"></Counter>

## 一、数组 Array

下面是一个自己实现的数组：
```java
public class Array<E> {

    private E[] data;

    /**
     * 有效元素
     */
    private int size;

    /**
     * 无参构造函数
     */
    public Array() {
        this(10);
    }

    /**
     * 构造函数
     *
     * @param capacity 传入数组的容量
     */
    public Array(int capacity) {
        data = (E[]) new Object[capacity];
        size = 0;
    }

    public Array(E[] array) {
        data = (E[]) new Object[array.length];
        for (int i = 0; i < array.length; i++) {
            data[i] = array[i];
        }
        size = array.length;
    }

    /**
     * 获取数组中元素个数
     *
     * @return
     */
    public int getSize() {
        return size;
    }

    /**
     * 数组容量
     *
     * @return
     */
    public int getCapacity() {
        return data.length;
    }

    /**
     * 数组是否为空
     *
     * @return
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 向所有元素最后添加一个元素
     *
     * @param e
     */
    public void addLast(E e) {
        add(size, e);
    }

    /**
     * 向所有元素的前面添加一个元素
     *
     * @param e
     */
    public void addFirst(E e) {
        add(0, e);
    }

    /**
     * 给指定位置插入一个元素
     *
     * @param index
     * @param e
     */
    public void add(int index, E e) {
        if (index < 0 || index > size) {
            throw new IllegalArgumentException("add failed. Require index >= 0 and index <= size");
        }
        
        if (size == data.length) {
            resize(2 * data.length);
        }

        for (int i = size - 1; i >= index; i--) {
            // 将数组中索引为 index 以及后面的元素都往后移动一位
            data[i + 1] = data[i];
        }

        data[index] = e;
        size++;
    }

    /**
     * 取出数组中第一个元素
     *
     * @return
     */
    public E getFirst() {
        return get(0);
    }

    /**
     * 取出数组中最后一个元素
     *
     * @return
     */
    public E getLast() {
        return get(size - 1);
    }

    /**
     * 获取索引为 index 的元素
     *
     * @param index
     * @return
     */
    public E get(int index) {
        if (index < 0 || index > size) {
            throw new IllegalArgumentException("get failed. index is illegal.");
        }
        return data[index];
    }

    /**
     * 设置索引为 index 位置的元素为 e
     *
     * @param index
     * @param e
     */
    public void set(int index, E e) {
        if (index < 0 || index > size) {
            throw new IllegalArgumentException("get failed. index is illegal.");
        }
        data[index] = e;
    }

    /**
     * 元素 e 是否存在在数组中
     *
     * @param e
     * @return
     */
    public boolean contains(E e) {
        for (int i = 0; i < size; i++) {
            if (data[i] == e) {
                return true;
            }
        }
        return false;
    }

    /**
     * 查找元素 e 的索引
     *
     * @param e
     * @return 如果不存在元素 e，则返回-1
     */
    public int find(E e) {
        for (int i = 0; i < size; i++) {
            if (data[i].equals(e)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 从数组中移除一个元素
     *
     * @param index
     * @return 被移除的元素
     */
    public E remove(int index) {
        if (index < 0 || index > size) {
            throw new IllegalArgumentException("add failed. Require index >= 0 and index <= size");
        }
        E ret = data[index];
        for (int i = index + 1; i < size; i++) {
            data[i - 1] = data[i];
        }
        size--;
        // 清除数组最后多余的一个引用
        data[size] = null;

        if (size == data.length / 2) {
            resize(data.length / 2);
        }
        return ret;
    }

    /**
     * 从数组中移除第一个元素
     *
     * @return 被移除的元素
     */
    public E removeFirst() {
        return remove(0);
    }

    /**
     * 从数组中移除最后一个元素
     *
     * @return 被移除的元素
     */
    public E removeLast() {
        return remove(size - 1);
    }

    /**
     * 从数组中移除值为 e 的元素
     *
     * @param e
     */
    public void removeElement(E e) {
        int index = find(e);
        if (index != -1) {
            remove(index);
        }
    }

    /**
     * 交换两个索引对应元素的位置
     *
     * @param i
     * @param j
     */
    public void swap(int i, int j) {
        if (i < 0 || i >= size || j < 0 || j >= size) {
            throw new IllegalArgumentException("index is illegal.");
        }
        E t = data[i];
        data[i] = data[j];
        data[j] = t;
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        result.append(String.format("Array: size = %d, capacity = %d\n", size, data.length));
        result.append('[');
        for (int i = 0; i < size; i++) {
            result.append(data[i]);
            if (i != size - 1) {
                result.append(", ");
            }
        }
        result.append(']');
        return result.toString();
    }

    /**
     * 给数组扩容
     *
     * @param newCapacity
     */
    private void resize(int newCapacity) {
        E[] newData = (E[]) (new Object[newCapacity]);
        for (int i = 0; i < size; i++) {
            newData[i] = data[i];
        }
        data = newData;
    }
}
```
它有添加、删除、修改、查询等方法。

## 二、时间复杂度分析

下面看看各个方法的时间复杂度分析

### 1、添加操作：

* `addLast(e)`

由于只用在数组末尾添加一个元素，所以时间复杂度： `O(1)`

* `addFirst(e)`

由于数组中每一个元素都需要向后移动，所以时间复杂度： `O(n)`

* `add(index, e)`

当 `index` 为0的时候，时间复杂度是 `O(n)` ，当 `index` 为数组的长度时，时间复杂度是和 时间复杂度： `O(n)`。平均求期望后，时间复杂度是 `O(n / 2)`，忽略掉后也就是 `O(n)`

* `resize(newCapacity)`

时间复杂度是： `O(1)`

综合3个添加的操作来说，最坏情况的时间复杂度是： `O(n)`，也就是说添加操作的时间复杂度是： `O(n)`。 

### 2、删除操作：

* removeLast(e)

同理，时间复杂度是： `O(1)`

* removeFirst(e)

同理，时间复杂度是： `O(n)`

* remove(index, e)

同理，时间复杂度是： `O(n)`

* `resize(newCapacity)`

时间复杂度是： `O(1)`

综合来看，删除操作的时间复杂度也是： `O(n)`

### 3、修改操作：

* set(index, e)

只要知道 `index` 索引，就可以直接操作，所以时间复杂度是： `O(1)`

### 4、查找操作：

* get(index)

因为知道了 `index` 索引，所以直接获取就可以，时间复杂度： `O(1)`

* contains(e)

因为不知道索引，所以需要查询，时间复杂度： `O(n)`

* find(e)

同理时间复杂度： `O(n)`

综合来看查找操作的时间复杂度是： 已知索引情况下是 `O(1)` ，未知索引情况下是 `O(n)`

总结如下：

| 操作类型 | 时间复杂度 |
| --- | --- |
| 增 | O(n) |
| 删 | O(n) |
| 改 | O(1) |
| 查 | 已知索引 O(1)，未知索引 O(n)  |

## 三、均摊复杂度
 
对于上面计算添加或者删除操作的时候，如果从空数组开始添加，每次调用的都是 `addLast(e)` 和 `removeLast(e)` 操作时，时间复杂度是 `O(1)` ，除非触发了扩容方法 `resize(newCapacity)` ，时间复杂度才会变成了 `O(n)` 。

假设这样子的情况：当前数组的 `capacity` 为8，从空数组开始添加，并且每次添加调用的都是 `addLast(e)` 方法，那么直到调用第9次的时候才会触发扩容 `resize(newCapacity)` 方法。也就是说在9次调用 `addLast(e)` 方法的时候，一共进行了17次基本操作（8次添加，扩容时候的8次位移，最后1次的添加）,平均每次的 `addLast(e)` 操作，约等于进行了2次基本操作。

如果用 `n` 来表示的话，假设 `capacity = n` ，`n + 1` 次 `addLast(e)` 操作，触发 `resize(newCapacity)` ，共进行了 `2n + 1` 次基本操作，平均每次 `addLast(e)` 操作约等于进行了2次基本操作。也就是说 `addLast(e)` 操作的时间复杂度是 `O(1)`的。这就是 `均摊时间复杂度`。

同理 `removeLast(e)` 的 `均摊时间复杂度` 也是 `O(1)`。

## 四、复杂度震荡

上面的假设都是从空数组开始添加的，假设一个数组的容量恰恰刚好到数组最大容量的时候，那么此时只要一执行 `addLast(e)` 方法就会触发 `resize(newCapacity)` ，在 `resize(newCapacity)` 后再进行 `removeLast(e)` 方法又会触发 `resize(newCapacity)` ，同理，这个时候反复调用 `addLast(e)` 和 `removeLast(e)` ，时间复杂度一直都是 `O(n)` ，那么此时添加和删除的操作的时间复杂度就是 `O(n)`，这个就叫做 `复杂度震荡`。

出现这个问题的原因是，在 `removeLast(e)` 的时候， `resize(newCapacity)` 执行的过于着急。解决方案是让缩小容量不要执行的过于“迅速”，例如当数组的 `size == capacity / 4` 的时候再进行 `resize(newCapacity)` ，并且缩小到 `capacity / 2` 以此类推。

将这个思想落实到代码中，对于 `remove(e)` 方法的代码做如下修改：
```java
    public E remove(int index) {
        if (index < 0 || index > size) {
            throw new IllegalArgumentException("add failed. Require index >= 0 and index <= size");
        }
        E ret = data[index];
        for (int i = index + 1; i < size; i++) {
            data[i - 1] = data[i];
        }
        size--;
        // 清除数组最后多余的一个引用
        data[size] = null;

        // 修改执行缩容的时机，以及让数组容量缩容后不能等于0
        if (size == data.length / 4 && data.length / 2 != 0) {
            resize(data.length / 2);
        }
        return ret;
    }
```
这下代码就完整了。

<Valine></Valine>