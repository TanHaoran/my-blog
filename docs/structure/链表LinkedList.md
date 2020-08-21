# 链表LinkedList

<Counter :path="'structure'" :name="'链表LinkedList'"></Counter>

## 一、定义

### 1、概念

链表是最简单的一种动态数据结构。链表的数据存储在“节点” `Node` 中，每一个节点同时存有下一个节点的地址。

### 2、优点

真正的动态数据结构，不需要处理固定容量的问题

### 3、缺点

丧失了随机访问的能力

## 二、实现

下面是 `LinkedList` 的实现：
```java
public class LinkedList<E> {

    /**
     * 虚拟头结点
     */
    private Node dummyHead;

    /**
     * 元素个数
     */
    private int size;

    public LinkedList() {
        dummyHead = new Node(null, null);
        size = 0;
    }

    /**
     * 获取链表中元素个数，时间复杂度 O(1)
     *
     * @return
     */
    public int getSize() {
        return size;
    }

    /**
     * 链表是否为空，时间复杂度 O(1)
     *
     * @return
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 向链表的 index 位置添加元素 e ，时间复杂度 O(n)
     *
     * @param index
     * @param e
     */
    public void add(int index, E e) {
        if (index < 0 || index > size) {
            throw new IllegalArgumentException("add failed. Illegal index.");
        }

        Node prev = dummyHead;
        // 从0开始，循环index-1次就可以拿到插入位置的前一个结点
        for (int i = 0; i < index; i++) {
            prev = prev.next;
        }

        prev.next = new Node(e, prev.next);
        size++;
    }

    /**
     * 向链表头部添加元素，时间复杂度 O(1)
     *
     * @param e
     */
    public void addFirst(E e) {
        add(0, e);
    }

    /**
     * 向链表的尾部添加元素 e ，时间复杂度 O(n)
     *
     * @param e
     */
    public void addLast(E e) {
        add(size, e);
    }

    /**
     * 获取 index 位置的元素
     *
     * @param index
     */
    public E get(int index) {
        if (index < 0 || index >= size) {
            throw new IllegalArgumentException("get failed. Illegal index.");
        }

        Node current = dummyHead.next;
        for (int i = 0; i < index; i++) {
            current = current.next;
        }

        return current.e;
    }

    /**
     * 获取第一个元素
     *
     * @return
     */
    public E getFirst() {
        return get(0);
    }

    /**
     * 获取最后一个元素
     *
     * @return
     */
    public E getLast() {
        return get(size - 1);
    }

    /**
     * 更新 index 位置的元素为 e ，时间复杂度 O(n)
     *
     * @param index
     * @param e
     */
    public void set(int index, E e) {
        if (index < 0 || index >= size) {
            throw new IllegalArgumentException("set failed. Illegal index.");
        }

        Node current = dummyHead.next;
        for (int i = 0; i < index; i++) {
            current = current.next;
        }
        current.e = e;
    }

    /**
     * 链表中是否存在 e ，时间复杂度 O(n)
     *
     * @param e
     * @return
     */
    public boolean contains(E e) {
        Node current = dummyHead.next;
        while (current != null) {
            if (current.e.equals(e)) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    /**
     * 从链表中删除 index 位置的元素，时间复杂度 O(n)
     *
     * @param index
     * @return
     */
    public E remove(int index) {
        if (index < 0 || index >= size) {
            throw new IllegalArgumentException("set failed. Illegal index.");
        }

        Node prev = dummyHead;
        for (int i = 0; i < index; i++) {
            prev = prev.next;
        }

        Node result = prev.next;
        prev.next = result.next;
        result.next = null;
        size--;

        return result.e;
    }

    /**
     * 从链表中删除第一个元素，时间复杂度 O(1)
     *
     * @return
     */
    public E removeFirst() {
        return remove(0);
    }

    /**
     * 从链表中删除最后一个元素，时间复杂度 O(n)
     *
     * @return
     */
    public E removeLast() {
        return remove(size - 1);
    }

    /**
     * 从链表中删除元素 e
     *
     * @param e
     */
    public void removeElement(E e) {
        Node prev = dummyHead;

        while (prev.next != null) {
            if (prev.next.e.equals(e)) {
                break;
            }
            prev = prev.next;
        }

        if (prev.next != null) {
            Node delNode = prev.next;
            prev.next = delNode.next;
            delNode.next = null;
        }
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();

        Node current = dummyHead.next;
        while (current != null) {
            result.append(current).append("->");
            current = current.next;
        }
        result.append("null");

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

}
```
可以看出，链表内部有一个 `Node` 内部类来表示每一个节点，`Node` 中的 `e` 用来存储数据，`next` 用来指向下一个节点。链表中比较重要一个点是 `虚拟头节点` ，它不存储任何数据，它是用来统一添加时的逻辑操作。

## 三、时间复杂度分析

接下来看看 `LinkedList` 各个方法的时间复杂度分析：

| 方法 | 时间复杂度 |
| --- | --- |
| void addLast(e) | O(n) |
| void addFirst(e) | O(1) |
| void add(index, e) | O(n) |
| E removeLast(e) | O(n) |
| E removeFirst(e) | O(1) |
| E remove(index, e) | O(n) |
| void set(index, e) | O(n) |
| E get(index) | O(n) |
| boolean contains(e) | O(n) |
| int getSize() | O(1)  |
| boolean isEmpty() | O(1) |

可以看出，链表的增删改查总体来看时间复杂度都是 `O(n)` ，但是如果只对链表头进行增、删和查，那么时间复杂度是 `O(1)`。

## 四、拓展

关于集合在 `LeetCode` 上的题，可以看这里：

* [【203】移除链表元素](../leetcode/【203】移除链表元素.md) 

<Valine></Valine>