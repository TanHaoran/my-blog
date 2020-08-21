# 堆Heap

<Counter :path="'structure'" :name="'堆Heap'"></Counter>

## 一、定义

### 1、二叉堆

#### 特性：

* 根节点的索引是从 `0` 开始的。
* 数中元素不满的节点一定在树的右下侧（`完全二叉树`）。
* 堆中某个节点的值总是不大于其父节点的值（`最大堆`）。
* 左孩子（如果存在的话）的索引是当前节点索引 `i` 的 `i * 2 + 1` ，右孩子（如果存在的话）的索引是当前索引 `i` 的 `i * 2 + 2` 。
* 父节点的索引是当前节点索引 `i` 的 `(i - 1) / 2` 。
* 是一种平衡二叉树，即树的最大深度和最小深度最多相差1

## 二、实现

```java
public class MaxHeap<E extends Comparable<E>> {

    private Array<E> data;

    public MaxHeap() {
        data = new Array<>();
    }

    public MaxHeap(int capacity) {
        data = new Array<>(capacity);
    }

    public MaxHeap(E[] array) {
        data = new Array<>(array);
        for (int i = parent(array.length - 1); i >= 0; i--) {
            siftDown(i);
        }
    }

    /**
     * 堆中元素个数
     *
     * @return
     */
    public int size() {
        return data.getSize();
    }

    /**
     * 堆是否为空
     *
     * @return
     */
    public boolean isEmpty() {
        return data.isEmpty();
    }

    /**
     * 返回 index 索引元素的父亲节点的索引
     *
     * @param index
     * @return
     */
    private int parent(int index) {
        if (index == 0) {
            throw new IllegalArgumentException("index-0 doesn't have parent.");
        }
        return (index - 1) / 2;
    }

    /**
     * 返回索引元素左孩子节点的索引
     *
     * @param index
     * @return
     */
    private int leftChild(int index) {
        return index * 2 + 1;
    }

    /**
     * 返回索引元素右孩子节点的索引
     *
     * @param index
     * @return
     */
    private int rightChild(int index) {
        return index * 2 + 2;
    }

    /**
     * 添加元素
     *
     * @param e
     */
    public void add(E e) {
        data.addLast(e);
        siftUp(data.getSize() - 1);
    }

    /**
     * 上浮元素
     *
     * @param k
     */
    private void siftUp(int k) {
        // 如果当前元素的值比父元素的值还小，则需要交换位置
        while (k > 0 && data.get(parent(k)).compareTo(data.get(k)) < 0) {
            data.swap(k, parent(k));
            k = parent(k);
        }
    }

    /**
     * 获取最大元素
     *
     * @return
     */
    public E findMax() {
        if (data.getSize() == 0) {
            throw new IllegalArgumentException("can not find max when heap is empty.");
        }
        return data.get(0);
    }

    /**
     * 取出最大元素
     *
     * @return
     */
    public E extractMax() {
        E result = findMax();

        // 删除元素
        data.swap(0, data.getSize() - 1);
        data.removeLast();

        siftDown(0);

        return result;
    }

    /**
     * 下沉元素
     *
     * @param k
     */
    private void siftDown(int k) {
        while (leftChild(k) < data.getSize()) {
            // 左孩子
            int j = leftChild(k);
            // 如果有右孩子，使用 j 记录右孩子的索引
            if (j + 1 < data.getSize() && data.get(j + 1).compareTo(data.get(j)) > 0) {
                j = rightChild(k);
            }

            // 如果孩子的元素比自己小，则跳出循环；否则交换元素并继续下沉
            if (data.get(k).compareTo(data.get(j)) >= 0) {
                break;
            }
            data.swap(k, j);
            k = j;
        }
    }

    /**
     * 取出最大的元素并替换成元素 e
     *
     * @param e
     * @return
     */
    public E replace(E e) {
        E result = findMax();
        data.set(0, e);
        siftDown(0);
        return result;
    }
}
```

测试堆的添加方法：
```java
    public static void main(String[] args) {
        int n = 1000000;

        MaxHeap<Integer> maxHeap = new MaxHeap<>();
        Random random = new Random();
        for (int i = 0; i < n; i++) {
            maxHeap.add(random.nextInt(Integer.MAX_VALUE));
        }

        int[] array = new int[n];
        for (int i = 0; i < n; i++) {
            array[i] = maxHeap.extractMax();
        }

        for (int i = 1; i < n; i++) {
            if (array[i - 1] < array[i]) {
                throw new IllegalArgumentException("error");
            }
        }

        System.out.println("test MaxHeap completed.");
    }
```

执行结果：
```console
test MaxHeap completed.
```

测试堆的通过数组初始化方法，并比较和一个个添加元素哪个性能好：
```java
public class Main {

    private static double testHeap(Integer[] testData, boolean isHeapify) {
        long startTime = System.nanoTime();

        MaxHeap<Integer> maxHeap;
        if (isHeapify) {
            maxHeap = new MaxHeap<>(testData);
        } else {
            maxHeap = new MaxHeap<>();
            for (Integer num : testData) {
                maxHeap.add(num);
            }
        }

        int[] array = new int[testData.length];
        for (int i = 0; i < testData.length; i++) {
            array[i] = maxHeap.extractMax();
        }

        for (int i = 1; i < testData.length; i++) {
            if (array[i - 1] < array[i]) {
                throw new IllegalArgumentException("error");
            }
        }

        System.out.println("test MaxHeap completed.");

        long endTime = System.nanoTime();

        return (endTime - startTime) / 1000000000.0;
    }

    public static void main(String[] args) {
        int n = 1000000;

        Random random = new Random();
        Integer[] testData = new Integer[n];
        for (int i = 0; i < n; i++) {
            testData[i] = random.nextInt(Integer.MAX_VALUE);
        }

        double timeWithoutHeapify = testHeap(testData, false);
        System.out.println("without heapify: " + timeWithoutHeapify + " s");

        double timeWithHeapify = testHeap(testData, true);
        System.out.println("with heapify: " + timeWithHeapify + " s");
    }
}
```

执行结果：
```console
test MaxHeap completed.
without heapify: 0.6605964 s
test MaxHeap completed.
with heapify: 0.6364642 s
```

可以看出，直接通过数组初始化的方法性能要好很多。

## 三、时间复杂度

| 方法 | 时间复杂度 |
| --- | --- |
| void add(E e) | O(logn) |
| E extractMax() | O(logn) |
| MaxHeap(E[] array) | O(n) |

<Valine></Valine>