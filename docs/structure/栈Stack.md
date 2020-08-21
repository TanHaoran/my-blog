# 栈Stack

<Counter :path="'structure'" :name="'栈Stack'"></Counter>

## 一、定义

### 1、概念

栈是一种线性的数据结构，最大的特色就只能从一端添加元素，并且也只能从同一端取出元素，这一端称作为 `栈顶` 。它是先进后出（ `LIFO` ， `Last in first out` ）的模式，比起数组来说，它所具有的操作更少一些。

### 2、应用

* 各种undo操作
* 程序调用的系统栈

### 3、接口定义

首先定义一下栈 `Stack` ，这里我们定义为一个接口，因为可以实现栈功能的类后面会有多种：
```java
public interface Stack<E> {

    /**
     * 获取栈的元素个数
     *
     * @return
     */
    int getSize();

    /**
     * 栈是否为空
     *
     * @return
     */
    boolean isEmpty();

    /**
     * 向栈中存入一个元素
     *
     * @param e
     */
    void push(E e);

    /**
     * 从栈中取出一个元素
     *
     * @return
     */
    E pop();

    /**
     * 查看栈顶的元素
     *
     * @return
     */
    E peek();
}
```

## 二、数组栈 ArrayStack

### 1、实现

接下来利用前面我们自己实现的数组 `Array` ，实现 `Stack` 接口，完成栈的第一个实现 `ArrayStack` ：
```java
public class ArrayStack<E> implements Stack<E> {

    Array<E> array;

    public ArrayStack() {
        array = new Array<>();
    }

    public ArrayStack(int capacity) {
        array = new Array<>(capacity);
    }

    /**
     * 获取栈的容积
     *
     * @return
     */
    public int getCapacity() {
        return array.getCapacity();
    }

    /**
     * 获取栈的元素个数，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public int getSize() {
        return array.getSize();
    }

    /**
     * 栈是否为空，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return array.isEmpty();
    }

    /**
     * 向栈中存入一个元素，时间复杂度 O(1) 均摊
     *
     * @return
     */
    @Override
    public void push(E e) {
        array.addLast(e);
    }

    /**
     * 从栈中取出一个元素，时间复杂度 O(1) 均摊
     *
     * @return
     */
    @Override
    public E pop() {
        return array.removeLast();
    }

    /**
     * 查看栈顶的元素，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public E peek() {
        return array.getLast();
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        result.append("Stack: ");
        result.append('[');
        for (int i = 0; i < array.getSize(); i++) {
            result.append(array.get(i));
            if (i != array.getSize() - 1) {
                result.append(", ");
            }
        }
        result.append("] top");
        return result.toString();
    }

    public static void main(String[] args) {
        Stack<Integer> stack = new ArrayStack<>();
        for (int i = 0; i < 5; i++) {
            stack.push(i);
            System.out.println(stack);
        }

        stack.pop();

        System.out.println(stack);
    }
}
```

### 2、时间复杂度分析

接下来看看 `ArrayStack` 各个方法的时间复杂度分析：

| 方法 | 时间复杂度 |
| --- | --- |
| void push(e) | O(1) 均摊|
| E pop() | O(1) 均摊 |
| E peek() | O(1) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

关于 `push()` 和 `pop()` 操作来说，大部分情况下的时间复杂度都是 `O(1)` ，除非触发了底层 `Array` 的 `resize()` 方法。均摊算来下，这两个方法的时间复杂度仍是 `O(1)` 。

## 三、链表栈 LinkedListStack

### 1、实现

如果还没搞懂链表的实现，可以先看这一篇博客：[链表LinkedList](链表LinkedList.md) 。

接下来看一下用链表是如何实现栈的：
```java
public class LinkedListStack<E> implements Stack<E> {

    private LinkedList<E> list;

    public LinkedListStack() {
        list = new LinkedList<>();
    }

    /**
     * 获取栈的元素个数，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public int getSize() {
        return list.getSize();
    }

    /**
     * 栈是否为空，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return list.isEmpty();
    }

    /**
     * 向栈中存入一个元素，时间复杂度 O(1)
     *
     * @param e
     */
    @Override
    public void push(E e) {
        list.addFirst(e);
    }

    /**
     * 从栈中取出一个元素，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public E pop() {
        return list.removeFirst();
    }

    /**
     * 查看栈顶的元素，时间复杂度 O(1)
     *
     * @return
     */
    @Override
    public E peek() {
        return list.getFirst();
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        result.append("Stack: top ");
        result.append(list);
        return result.toString();
    }

    public static void main(String[] args) {
        Stack<Integer> stack = new LinkedListStack<>();
        for (int i = 0; i < 5; i++) {
            stack.push(i);
            System.out.println(stack);
        }

        stack.pop();

        System.out.println(stack);
    }
}
```

### 2、时间复杂度分析

接下来看看 `LinkedListStack` 各个方法的时间复杂度分析：

| 方法 | 时间复杂度 |
| --- | --- |
| void push(e) | O(1) |
| E pop() | O(1)  |
| E peek() | O(1) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

可以看出链表实现栈的性能还是很不错的。

## 四、性能对比

和对比队列性能的代码类似，看一下这两种栈的对比：
```java
public class Main {


    /**
     * 测试使用 stack 运行 operationCount 个 push 和 pop 操作所需要的时间，单位秒
     *
     * @param stack
     * @param operationCount
     * @return
     */
    private static double testQueue(Stack<Integer> stack, int operationCount) {
        long startTime = System.nanoTime();

        Random random = new Random();

        for (int i = 0; i < operationCount; i++) {
            stack.push(random.nextInt(Integer.MAX_VALUE));
        }

        for (int i = 0; i < operationCount; i++) {
            stack.pop();
        }

        long endTime = System.nanoTime();

        return (endTime - startTime) / 1000000000.0;
    }


    public static void main(String[] args) {
        int operationCount = 100000;
        Stack<Integer> arrayStack = new ArrayStack<>();
        double timeArrayStack = testQueue(arrayStack, operationCount);
        System.out.println("ArrayStack, time: " + timeArrayStack + " s");

        Stack<Integer> linkedListStack = new LinkedListStack<>();
        double timeLinkedListStack = testQueue(linkedListStack, operationCount);
        System.out.println("LinkedListStack, time: " + timeLinkedListStack + " s");

    }
}
```

在我电脑上的运行结果：
```console
ArrayStack, time: 0.0117279 s
LinkedListStack, time: 0.0087131 s
```

如果将操作数 `operationCount` 改大一些，例如10000000，那么此时有可能 `LinkedListStack` 的耗时要更长一些，因为在 `LinkedListStack` 内部需要经常 `new` 节点，所以会更耗费时间。

## 五、拓展

关于集合在 `LeetCode` 上的题，可以看这里：

* [【20】有效的括号](../leetcode/【20】有效的括号.md) 

<Valine></Valine>