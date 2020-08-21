# 映射Map

<Counter :path="'structure'" :name="'映射Map'"></Counter>

## 一、定义

### 1、概念

存储（键、值）数据对的数据结构(Key, Value)，根据键(Key)可以找到唯一的值(Value)。

### 2、接口定义

```java
public interface Map<K, V> {

    /**
     * 添加元素
     *
     * @param key
     * @param value
     */
    void add(K key, V value);

    /**
     * 删除元素
     *
     * @param key
     * @return
     */
    V remove(K key);

    /**
     * 是否包含键位 key 的元素
     *
     * @param key
     * @return
     */
    boolean contains(K key);

    /**
     * 或者键为 key 的元素
     *
     * @param key
     * @return
     */
    V get(K key);

    /**
     * 设置元素的值
     *
     * @param key
     * @param value
     */
    void set(K key, V value);

    /**
     * 获取映射元素的大小
     *
     * @return
     */
    int getSize();

    /**
     * 映射是否为空
     *
     * @return
     */
    boolean isEmpty();
}
```

## 二、链表映射 LinkedListMap

实现：
```java
public class LinkedListMap<K, V> implements Map<K, V> {

    private Node dummyHead;

    private int size;

    public LinkedListMap() {
        dummyHead = new Node();
        size = 0;
    }

    /**
     * 添加元素
     *
     * @param key
     * @param value
     */
    @Override
    public void add(K key, V value) {
        Node node = getNode(key);
        if (node == null) {
            dummyHead.next = new Node(key, value, dummyHead.next);
            size++;
        } else {
            node.value = value;
        }
    }

    /**
     * 删除元素
     *
     * @param key
     * @return
     */
    @Override
    public V remove(K key) {
        Node prev = dummyHead;

        while (prev.next != null) {
            if (prev.next.key.equals(key)) {
                break;
            }
            prev = prev.next;
        }

        if (prev.next != null) {
            Node delNode = prev.next;
            prev.next = delNode.next;
            delNode.next = null;
            size--;
            return delNode.value;
        }

        return null;
    }

    /**
     * 是否包含键位 key 的元素
     *
     * @param key
     * @return
     */
    @Override
    public boolean contains(K key) {
        return get(key) != null;
    }

    /**
     * 或者键为 key 的元素
     *
     * @param key
     * @return
     */
    @Override
    public V get(K key) {
        Node node = getNode(key);
        return node == null ? null : node.value;
    }

    /**
     * 设置元素的值
     *
     * @param key
     * @param value
     */
    @Override
    public void set(K key, V value) {
        Node node = getNode(key);
        if (node == null) {
            throw new IllegalArgumentException(key + " doesn't exist!");
        }
        node.value = value;
    }

    /**
     * 获取映射元素的大小
     *
     * @return
     */
    @Override
    public int getSize() {
        return size;
    }

    /**
     * 映射是否为空
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 根据 key 获取节点
     *
     * @param key
     * @return
     */
    private Node getNode(K key) {
        Node current = dummyHead.next;
        while (current != null) {
            if (current.key.equals(key)) {
                return current;
            }
            current = current.next;
        }

        return null;
    }

    private class Node {

        public K key;
        public V value;
        public Node next;

        public Node() {
            this(null);
        }

        public Node(K key) {
            this(key, null, null);
        }

        public Node(K key, V value, Node next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }

        @Override
        public String toString() {
            return key.toString() + ": " + value.toString();
        }
    }

}
```

测试方法：
```java
    public static void main(String[] args) {
        List<String> wordList = new ArrayList<>();
        if (FileOperation.readFile("pride-and-prejudice.txt", wordList)) {
            System.out.println("total words: " + wordList.size());

            Map<String, Integer> map = new LinkedListMap<>();
            for (String word : wordList) {
                if (map.contains(word)) {
                    map.set(word, map.get(word) + 1);
                } else {
                    map.add(word, 1);
                }
            }

            System.out.println("total different words: " + map.getSize());
            System.out.println("frequency of PRIDE: " + map.get("pride"));
            System.out.println("frequency of PREJUDICE: " + map.get("prejudice"));
        }
    }
```
还是之前读取 `pride-and-prejudice.txt` 这篇小说中的单子，并统计所有单词的出现频率。

```console
total words: 125901
total different words: 6530
frequency of PRIDE: 53
frequency of PREJUDICE: 11
```

## 三、链表映射 LinkedListMap

实现：
```java
public class BinarySearchTreeMap<K extends Comparable<K>, V> implements Map<K, V> {

    private Node root;
    private int size;

    public BinarySearchTreeMap() {
        root = null;
        size = 0;
    }

    /**
     * 添加元素
     *
     * @param key
     * @param value
     */
    @Override
    public void add(K key, V value) {
        root = add(root, key, value);
    }

    /**
     * 向以 node 为节点为根节点的二分搜索树中插入元素 key, value
     *
     * @param node  插入新节点后二分搜索树的根
     * @param key
     * @param value
     * @return
     */
    private Node add(Node node, K key, V value) {
        if (node == null) {
            size++;
            return new Node(key, value);
        }

        if (key.compareTo(node.key) < 0) {
            node.left = add(node.left, key, value);
        } else if (key.compareTo(node.key) > 0) {
            node.right = add(node.right, key, value);
        } else {
            node.value = value;
        }

        return node;
    }

    /**
     * 删除元素
     *
     * @param key
     * @return
     */
    @Override
    public V remove(K key) {
        Node node = getNode(root, key);
        if (node != null) {
            root = remove(root, key);
            return node.value;
        }
        return null;
    }

    /**
     * 删除以 node 为根节点的二分搜索树的 key 所在的节点
     *
     * @param node
     * @param key
     * @return
     */
    private Node remove(Node node, K key) {
        if (node == null) {
            return null;
        }

        if (key.compareTo(node.key) < 0) {
            node.left = remove(node.left, key);
            return node;
        } else if (key.compareTo(node.key) > 0) {
            node.right = remove(node.right, key);
            return node;
        } else {
            // 待删除的节点左子树为空的情况
            if (node.left == null) {
                Node rightNode = node.right;
                node.right = null;
                size--;
                return rightNode;
            }

            // 待删除的节点右子树为空的情况
            if (node.right == null) {
                Node leftNode = node.left;
                node.left = null;
                size--;
                return leftNode;
            }

            // 待删除的节点左、右子树都不为空的情况
            // 删除待删除节点右子树中最小的节点，用这个节点顶替待删除的节点
            Node successor = minimum(node.right);
            successor.left = node.left;
            successor.right = removeMin(node.right);
            node.left = null;
            node.right = null;
            return successor;
        }
    }

    /**
     * 获取以 node 为根的最小值所在的节点
     *
     * @param node
     * @return
     */
    private Node minimum(Node node) {
        if (node.left == null) {
            return node;
        }

        return minimum(node.left);
    }

    /**
     * 删除最小值所在节点，返回最小值元素
     *
     * @return
     */
    private Node removeMin(Node node){
        if(node.left == null){
            Node rightNode = node.right;
            node.right = null;
            size --;
            return rightNode;
        }

        node.left = removeMin(node.left);
        return node;
    }


    /**
     * 是否包含键位 key 的元素
     *
     * @param key
     * @return
     */
    @Override
    public boolean contains(K key) {
        return getNode(root, key) != null;
    }

    /**
     * 或者键为 key 的元素
     *
     * @param key
     * @return
     */
    @Override
    public V get(K key) {
        Node node = getNode(root, key);
        return node == null ? null : node.value;
    }

    /**
     * 设置元素的值
     *
     * @param key
     * @param value
     */
    @Override
    public void set(K key, V value) {
        Node node = getNode(root, key);
        if (node == null) {
            throw new IllegalArgumentException(key + " doesn't exist!");
        }
        node.value = value;
    }

    /**
     * 获取映射元素的大小
     *
     * @return
     */
    @Override
    public int getSize() {
        return size;
    }

    /**
     * 映射是否为空
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 以 node 为根节点的二分搜索树中，key 所在的节点
     *
     * @param node
     * @param key
     * @return
     */
    private Node getNode(Node node, K key) {
        if (node == null) {
            return null;
        }

        if (key.compareTo(node.key) < 0) {
            return getNode(node.left, key);
        } else if (key.compareTo(node.key) > 0) {
            return getNode(node.right, key);
        } else {
            return node;
        }
    }

    private class Node {

        public K key;
        public V value;
        public Node left;
        public Node right;

        public Node(K key, V value) {
            this.key = key;
            this.value = value;
            this.left = null;
            this.right = null;
        }
    }

}
```

## 四、性能对比

编写读取小说单词频率的测试：
```java
    public static void main(String[] args) {
        String filename = "pride-and-prejudice.txt";

        Map<String, Integer> binarySearchTreeMap = new BinarySearchTreeMap<>();
        double timeBinarySearchTreeMap = testMap(binarySearchTreeMap, filename);
        System.out.println("BinarySearchTreeMap: " + timeBinarySearchTreeMap + " s");

        System.out.println("------");

        Map<String, Integer> linkedListMap = new LinkedListMap<>();
        double timeLinkedListMap = testMap(linkedListMap, filename);
        System.out.println("LinkedListMap: " + timeLinkedListMap + " s");

    }

    private static double testMap(Map<String, Integer> map, String filename) {
        long startTime = System.nanoTime();

        List<String> wordList = new ArrayList<>();
        if (FileOperation.readFile(filename, wordList)) {
            System.out.println("total words: " + wordList.size());

            for (String word : wordList) {
                if (map.contains(word)) {
                    map.set(word, map.get(word) + 1);
                } else {
                    map.add(word, 1);
                }
            }

            System.out.println("total different words: " + map.getSize());
            System.out.println("frequency of PRIDE: " + map.get("pride"));
            System.out.println("frequency of PREJUDICE: " + map.get("prejudice"));
        }

        long endTime = System.nanoTime();

        return (endTime - startTime) / 1000000000.0;
    }
```

在我电脑上的运行结果：
```console
total words: 125901
total different words: 6530
frequency of PRIDE: 53
frequency of PREJUDICE: 11
BinarySearchTreeMap: 0.1410216 s
------
total words: 125901
total different words: 6530
frequency of PRIDE: 53
frequency of PREJUDICE: 11
LinkedListMap: 10.0664007 s
```

可以明显看出，二分搜索树实现的映射要比链表实现的映射性能要好很多。

再看看两个时间复杂度的对比：

| 方法 | BinarySearchTreeMap | LinkedListMap |
| --- | --- | --- |
| add() | O(h)，平均是 O(logn) | O(n) |
| remove() | O(h)，平均是 O(logn)   | O(n) |
| set() | O(h)，平均是 O(logn)  | O(n) |
| get() | O(h)，平均是 O(logn)  | O(n) |
| contains() | O(h)，平均是 O(logn)  | O(n) |

## 五、有序映射和无需映射

* 有序映射中的元素具有顺序性，基于搜索树实现
* 无需映射中的元素没有顺序性，基于哈希表实现

<Valine></Valine>