# 队列Queue

<Counter :path="'structure'" :name="'队列Queue'"></Counter>

## 一、定义

### 1、概念

队列也是一种线性的数据结构，它的特点是从一端（队尾）添加元素，但是只能从另一端（队首）取出元素，这一端称作为 `栈顶` 。它是一种先进先出（ `FIFO` ， `First in first out` ）的模式，比起数组来说，它所具有的操作也更少一些。

### 2、接口定义

队列 `Queue` 也定义为一个接口，同样实现队列功能的类后面也会有多种：
```java
public interface Queue<E> {

    /**
     * 获取队列元素个数
     *
     * @return
     */
    int getSize();

    /**
     * 队列是否为空
     *
     * @return
     */
    boolean isEmpty();

    /**
     * 将一个元素入队列
     *
     * @param e
     */
    void enqueue(E e);

    /**
     * 从队首取出一个元素
     *
     * @return
     */
    E dequeue();

    /**
     * 获取队首的元素
     *
     * @return
     */
    E getFront();
}
```

## 二、数组队列 ArrayQueue

### 1、实现

接下来利用前面我们自己实现的数组 `Array` ，实现 `Queue` 接口，完成栈的第一个实现 `ArrayQueue` ：
```java
public class ArrayQueue<E> implements Queue<E> {

    private Array<E> array;

    public ArrayQueue() {
        array = new Array<>();
    }

    public ArrayQueue(int capacity) {
        array = new Array<>(capacity);
    }

    /**
     * 获取队列的容积
     *
     * @return
     */
    public int getCapacity() {
        return array.getCapacity();
    }

    /**
     * 获取队列元素个数，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public int getSize() {
        return array.getSize();
    }

    /**
     * 队列是否为空，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return array.isEmpty();
    }

    /**
     * 将一个元素入队列，时间复杂度 O(1) 均摊
     *
     * @param e
     */
    @Override
    public void enqueue(E e) {
        array.addLast(e);
    }

    /**
     * 从队首取出一个元素，时间复杂度 O(n)
     *
     * @return
     */
    @Override
    public E dequeue() {
        return array.removeFirst();
    }

    /**
     * 获取队首的元素，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public E getFront() {
        return array.getFirst();
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        result.append("Queue: ");
        result.append("front [");
        for (int i = 0; i < array.getSize(); i++) {
            result.append(array.get(i));
            if (i != array.getSize() - 1) {
                result.append(", ");
            }
        }
        result.append("] end");
        return result.toString();
    }

    public static void main(String[] args) {
        Queue<Integer> queue = new ArrayQueue<>();
        for (int i = 0; i < 10; i++) {
            queue.enqueue(i);
            System.out.println(queue);

            if (i % 3 == 2) {
                queue.dequeue();
                System.out.println(queue);
            }
        }
    }
}
```

### 2、时间复杂度分析

接下来看看 `ArrayQueue` 各个方法的时间复杂度分析：

| 方法 | 时间复杂度 |
| --- | --- |
| void enqueue(e) | O(1) 均摊|
| E dequeue() | O(n) |
| E front() | O(1) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

`enqueue` 和数组栈一样，因为都是向尾部添加元素，并有一定概率触发 `resize()` 方法，所以均摊时间复杂度为 `O(1)`。

但是 `dequeue` 方法出队列的时候是从队首出元素，其余的所有元素都需要向前挪一个位置，所以时间复杂度为 `O(n)`。当元素个数大到一定程度时，执行这个方法就会很耗时。

其余的方法的时间复杂度和 `ArrayStack` 类似。

## 三、循环队列 LoopQueue

### 1、优化数据队列 ArrayQueue

在数据队列ArrayQueue中，在对队列进行出队列 `dequeue()` 的时候，由于出队列后，每个元素都需要向前挪一位，导致时间复杂度为 `O(n)` ，那么怎么来优化这个操作呢？这时候就可以使用循环队列。

也就是说在元素出队列后，不要进行挪动元素的操作，因为这个时候队列内元素的位置顺序还是正确的，所以我们可以用一个变量 `front` ，来表明目前队首元素的索引位置，以及一个变量 `tail` ，来表名队尾的索引位置，注意这个队尾位置索引是当有新元素要插入时应当插入的位置。

当队列开始为空的时候，实际上 `front` 和 `tail` 应当都指向索引为0的位置，所以可以通过 `front == tail` 来进行判断队列是否为空。

![队列为空](https://raw.githubusercontent.com/TanHaoran/my-blog/master/LoopQueue.jpg)

这样当一些列入队操作和出队操作后，队首元素的前面是有可能有空位置的，因为可能由于出队操作 `front` 并不指向索引为0的位置。

![队列前面有空位置](https://raw.githubusercontent.com/TanHaoran/my-blog/master/LoopQueue2.jpg)

此时如果 `front` 已经在队尾的位置，这时候再进行入队操作的时候， 应当怎么办呢？

![队尾循环到前面](https://raw.githubusercontent.com/TanHaoran/my-blog/master/LoopQueue3.jpg)

这时候在添加元素的时候， `front` 就不能再进行加1的操作了，而是应当循环到了索引为0的位置，也就是应当进行 `tail = (tail + 1) % size ` 的操作。

![队尾循环到前面](https://raw.githubusercontent.com/TanHaoran/my-blog/master/LoopQueue4.jpg)

如果再继续入队操作，直到 `tail` 和 `front` 的索引只差1的时候，为了不和前面判断队列是否为空有冲突，所以这时候就应当是队列放满的情况，也就是通过 `tail + 1 == front` 来判断队列是否放满，这样也就浪费了一个空间。

![队尾循环到前面](https://raw.githubusercontent.com/TanHaoran/my-blog/master/LoopQueue5.jpg)

### 2、实现

将上面整理的逻辑用代码实现下吧，因为这次我们的逻辑是循环队列，所以内部实现不能在使用之前的 `Array` 队列了。
```java
public class LoopQueue<E> implements Queue<E> {

    private E[] data;

    /**
     * 队首的位置
     */
    private int front;
    /**
     * 队尾的位置
     */
    private int tail;

    /**
     * 队列的元素
     */
    private int size;

    public LoopQueue() {
        this(10);
    }

    public LoopQueue(int capacity) {
        data = (E[]) new Object[capacity + 1];
        front = 0;
        tail = 0;
        size = 0;
    }

    public int getCapacity() {
        return data.length - 1;
    }

    /**
     * 获取队列元素个数，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public int getSize() {
        return size;
    }

    /**
     * 队列是否为空，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return front == tail;
    }

    /**
     * 将一个元素入队列，时间复杂度 O(1) 均摊
     *
     * @param e
     */
    @Override
    public void enqueue(E e) {
        // 队列满时，扩容2倍
        if ((tail + 1) % data.length == front) {
            resize(getCapacity() * 2);
        }

        data[tail] = e;
        tail = (tail + 1) % data.length;
        size++;
    }

    /**
     * 从队首取出一个元素，时间复杂度 O(1) 均摊
     *
     * @return
     */
    @Override
    public E dequeue() {
        if (isEmpty()) {
            throw new IllegalArgumentException("Cannot dequeue from an empty queue.");
        }
        E e = data[front];
        data[front] = null;
        front = (front + 1) % data.length;
        size--;
        if (size == getCapacity() / 4 && getCapacity() / 2 != 0) {
            resize(getCapacity() / 2);
        }
        return e;
    }

    /**
     * 获取队首的元素，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public E getFront() {
        if (isEmpty()) {
            throw new IllegalArgumentException("Queue is empty.");
        }
        return data[front];
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        result.append(String.format("Queue: size = %d, capacity = %d\n", size, getCapacity()));
        result.append("front [");
        for (int i = front; i != tail; i = (i + 1) % data.length) {
            result.append(data[i]);
            if ((i + 1) % data.length != tail) {
                result.append(", ");
            }
        }
        result.append("] tail");
        return result.toString();
    }

    /**
     * 扩容
     *
     * @param newCapacity
     */
    private void resize(int newCapacity) {
        E[] newData = (E[]) (new java.lang.Object[newCapacity + 1]);
        for (int i = 0; i < size; i++) {
            newData[i] = data[(front + i) % data.length];
        }
        data = newData;
        front = 0;
        tail = size;
    }

    public static void main(String[] args) {
        Queue<Integer> queue = new LoopQueue<>();
        for (int i = 0; i < 10; i++) {
            queue.enqueue(i);
            System.out.println(queue);

            if (i % 3 == 2) {
                queue.dequeue();
                System.out.println(queue);
            }
        }
    }
}
```

### 3、时间复杂度分析

接下来看看 `LoopQueue` 各个方法的时间复杂度分析：

| 方法 | 时间复杂度 |
| --- | --- |
| void enqueue(e) | O(1) 均摊|
| E dequeue() | O(1) 均摊 |
| E getFront() | O(1) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

由于修改了逻辑，采用循环队列的方式使得 `dequeue` 在执行时，只需要出队一个元素并修改队首 `front` 索引即可，再考虑到扩容的问题，所以这个方法的均摊时间复杂度就为 `O(1)`。

其余方法的时间复杂度和 `ArrayQueue` 是一致的。

## 三、链表队列 LinkedListQueue

### 1、实现

`LinkedListQueue` 底层用到的链表并不完全和 [链表LinkedList](链表LinkedList.md) 中的链表一模一样，这里给链表新增了一个头节点 `head` 和尾节点 `tail` ，并且尾节点只管入队操作，头节点只管出队操作：
```java
public class LinkedListQueue<E> implements Queue<E> {

    /**
     * 头节点
     */
    private Node head;

    /**
     * 尾节点
     */
    private Node tail;

    private int size;

    public LinkedListQueue() {
        head = null;
        tail = null;
        size = 0;
    }

    /**
     * 获取队列元素个数
     *
     * @return
     */
    @Override
    public int getSize() {
        return size;
    }

    /**
     * 队列是否为空
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 将一个元素入队列
     *
     * @param e
     */
    @Override
    public void enqueue(E e) {
        if (tail == null) {
            tail = new Node(e);
            head = tail;
        } else {
            tail.next = new Node(e);
            tail = tail.next;
        }
        size++;
    }

    /**
     * 从队首取出一个元素
     *
     * @return
     */
    @Override
    public E dequeue() {
        if (isEmpty()) {
            throw new IllegalArgumentException("cannot dequeue from an empty queue");
        }

        Node result = head;
        head = head.next;
        result.next = null;
        // 这里需要处理当队列只有一个元素的情况
        if (head == null) {
            tail = null;
        }
        size--;

        return result.e;
    }

    /**
     * 获取队首的元素
     *
     * @return
     */
    @Override
    public E getFront() {
        if (isEmpty()) {
            throw new IllegalArgumentException("queue is empty");
        }
        return head.e;
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();

        result.append("Queue: front ");

        Node current = head;
        while (current != null) {
            result.append(current).append("->");
            current = current.next;
        }
        result.append("null tail");

        return result.toString();
    }

    private class Node {

        public E e;
        public Node next;

        public Node() {
            this(null, null);
        }

        public Node(E e) {
            this(e, null);
        }

        public Node(E e, Node next) {
            this.e = e;
            this.next = next;
        }

        @Override
        public String toString() {
            return e.toString();
        }
    }

    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedListQueue<>();
        for (int i = 0; i < 10; i++) {
            queue.enqueue(i);
            System.out.println(queue);

            if (i % 3 == 2) {
                queue.dequeue();
                System.out.println(queue);
            }
        }
    }
}
```

### 2、时间复杂度

| 方法 | 时间复杂度 |
| --- | --- |
| void enqueue(e) | O(1) |
| E dequeue() | O(1) |
| E getFront() | O(1) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

## 四、最大堆队列 PriorityQueue （优先队列）

### 1、实现

这里的底层是用到了最大堆，可以先看这篇博客：[堆Heap](堆Heap.md)

```java
public class PriorityQueue<E extends Comparable<E>> implements Queue<E> {

    private MaxHeap<E> maxHeap;

    public PriorityQueue() {
        maxHeap = new MaxHeap<>();
    }

    /**
     * 获取队列元素个数
     *
     * @return
     */
    @Override
    public int getSize() {
        return maxHeap.size();
    }

    /**
     * 队列是否为空
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return maxHeap.isEmpty();
    }

    /**
     * 将一个元素入队列
     *
     * @param e
     */
    @Override
    public void enqueue(E e) {
        maxHeap.add(e);
    }

    /**
     * 从队首取出一个元素
     *
     * @return
     */
    @Override
    public E dequeue() {
        return maxHeap.extractMax();
    }

    /**
     * 获取队首的元素
     *
     * @return
     */
    @Override
    public E getFront() {
        return maxHeap.findMax();
    }
}
```

### 2、时间复杂度

| 方法 | 时间复杂度 |
| --- | --- |
| void enqueue(e) | O(logn) |
| E dequeue() | O(logn) |
| E getFront() | O(1) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

## 五、性能对比

几种队列的实现我们都实现了，那么哪种性能更好呢？我们写一个测试用例对比一下：
```java
public class Main {

    /**
     * 测试使用 queue 运行 operationCount 个 enqueue 和 dequeue 操作所需要的时间，单位秒
     *
     * @param queue
     * @param operationCount
     * @return
     */
    private static double testQueue(Queue<Integer> queue, int operationCount) {
        long startTime = System.nanoTime();

        Random random = new Random();

        for (int i = 0; i < operationCount; i++) {
            queue.enqueue(random.nextInt(Integer.MAX_VALUE));
        }

        for (int i = 0; i < operationCount; i++) {
            queue.dequeue();
        }

        long endTime = System.nanoTime();

        return (endTime - startTime) / 1000000000.0;
    }


    public static void main(String[] args) {
        int operationCount = 100000;

        Queue<Integer> arrayQueue = new ArrayQueue<>();
        double timeArrayQueue = testQueue(arrayQueue, operationCount);
        System.out.println("ArrayQueue, time: " + timeArrayQueue + " s");

        Queue<Integer> loopQueue = new LoopQueue<>();
        double timeLoopQueue = testQueue(loopQueue, operationCount);
        System.out.println("LoopQueue, time: " + timeLoopQueue + " s");

        Queue<Integer> linkedListQueue = new LinkedListQueue<>();
        double timeLinkedListQueue = testQueue(linkedListQueue, operationCount);
        System.out.println("LinkedListQueue, time: " + timeLinkedListQueue + " s");

        Queue<Integer> priorityQueue= new PriorityQueue<>();
        double timePriorityQueue = testQueue(priorityQueue, operationCount);
        System.out.println("PriorityQueue, time: " + timePriorityQueue + " s");

    }
}
```

这里初始化了每一种队列，并对每一个队列都进行10000次的入队和出队操作，并记录下两种队列执行所有操作所需要的时间。

在我电脑上的运行结果如下：
```console
ArrayQueue, time: 2.7572782 s
LoopQueue, time: 0.0106832 s
LinkedListQueue, time: 0.0096948 s
PriorityQueue, time: 0.0398684 s
```
可以看出来，循环队列和链表队列由于时间复杂度一致，总体还是要比数组队列的性能要好一些，其实数组队列多出来的那些时间主要是表现在出队 `dequeue()` 操作上。

由于数组队列的 `dequeue()` 操作时间复杂度是 `O(n)`，所以整个 `testQueue()` 方法对于数组队列来说时间复杂度就是 `O(n^2)` ；而循环队列的 `dequeue()` 操作时间复杂度是 `O(1)`，所以整个 `testQueue()` 方法对于数组队列来说时间复杂度就是 `O(n)` 。

<Valine></Valine>