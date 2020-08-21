# 集合Set

<Counter :path="'structure'" :name="'集合Set'"></Counter>

## 一、定义

### 1、概念

用于盛放元素的容器，集合内不会有重复的元素。

### 2、应用

* 客户访问统计
* 词汇量统计

### 3、接口定义

```java
public interface Set<E> {

    /**
     * 添加元素
     *
     * @param e
     */
    void add(E e);

    /**
     * 删除元素
     *
     * @param e
     */
    void remove(E e);

    /**
     * 是否包含 e 元素
     *
     * @param e
     * @return
     */
    boolean contains(E e);

    /**
     * 获取集合大小
     *
     * @return
     */
    int getSize();

    /**
     * 集合是否为空
     *
     * @return
     */
    boolean isEmpty();
}
```

## 二、二分搜索树集合 BinarySearchTreeSet

### 1、实现

底层使用我们之前博客 [二分搜索树BinarySearchTree](二分搜索树BinarySearchTree.md) 中的二分搜索树实现的集合:
```java
public class BinarySearchTreeSet<E extends Comparable<E>> implements Set<E> {

    private BinarySearchTree<E> binarySearchTree;

    public BinarySearchTreeSet() {
        binarySearchTree = new BinarySearchTree<>();
    }

    /**
     * 添加元素
     *
     * @param e
     */
    @Override
    public void add(E e) {
        binarySearchTree.add(e);
    }

    /**
     * 删除元素
     *
     * @param e
     */
    @Override
    public void remove(E e) {
        binarySearchTree.remove(e);
    }

    /**
     * 是否包含 e 元素
     *
     * @param e
     * @return
     */
    @Override
    public boolean contains(E e) {
        return binarySearchTree.contains(e);
    }

    /**
     * 获取集合大小
     *
     * @return
     */
    @Override
    public int getSize() {
        return binarySearchTree.getSize();
    }

    /**
     * 集合是否为空
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return binarySearchTree.isEmpty();
    }
}
```

### 2、应用

创建一个用来统计文件中单词量的工具类：
```java
public class FileOperation {

    /**
     * 读取文件名为 filename 中的内容，将所有单词放入 wordList 集合中
     *
     * @param filename
     * @param wordList
     * @return
     */
    public static boolean readFile(String filename, List<String> wordList) {
        if (filename == null || wordList == null) {
            System.out.println("filename is null or wordList is null");
            return false;
        }

        Scanner scanner;

        try {
            File file = new File(filename);
            if (file.exists()) {
                FileInputStream in = new FileInputStream(file);
                scanner = new Scanner(new BufferedInputStream(in), "UTF-8");
                scanner.useLocale(Locale.ENGLISH);
            } else {
                return false;
            }
        } catch (IOException e) {
            System.out.println("cannot open " + filename);
            return false;
        }

        if (scanner.hasNextLine()) {
            String content = scanner.useDelimiter("\\A").next();

            int start = firstCharacterIndex(content, 0);
            for (int i = start + 1; i <= content.length(); ) {
                if (i == content.length() || !Character.isLetter(content.charAt(i))) {
                    String word = content.substring(start, i).toLowerCase();
                    wordList.add(word);
                    start = firstCharacterIndex(content, i);
                    i = start + 1;
                } else {
                    i++;
                }
            }
        }

        return true;
    }

    /**
     * 寻找字符串 s 中，从 start 位置开始的第一个字母字符的位置
     *
     * @param s
     * @param start
     * @return
     */
    private static int firstCharacterIndex(String s, int start) {
        for (int i = start; i < s.length(); i++) {
            if (Character.isLetter(s.charAt(i))) {
                return i;
            }
        }
        return s.length();
    }
}
```

然后我们找一篇英文小说，进行单词量统计。
测试方法：
```java
    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        List<String> wordList = new ArrayList<>();
        FileOperation.readFile("pride-and-prejudice.txt", wordList);
        System.out.println("total words: " + wordList.size());

        Set<String> binarySearchTreeSet = new BinarySearchTreeSet<>();
        for (String word : wordList) {
            binarySearchTreeSet.add(word);
        }
        System.out.println("total different words: " + binarySearchTreeSet.getSize());
        long end = System.currentTimeMillis();
        System.out.println("total cost: " + (end - start) + " ms");
    }
```
在测试方法中首先统计出来文件中所有的单词量（包括重复的），然后使用我们自己的底层采用二分搜索树实现的集合统计不重复的单词量。

运行结果：
```console
total words: 125901
total different words: 6530
total cost: 95 ms
```

### 3、时间复杂度分析

| 方法 | 时间复杂度 |
| --- | --- |
| add() | O(h)，平均是 O(logn) |
| contains() | O(h)，平均是 O(logn)   |
| remove() | O(h)，平均是 O(logn)  |

添加、查询、删除的时候时间复杂度实际上就是二分搜索树的高度，这里的 `h` 就是二分搜索树的高度，这3个操作的时间复杂度都是 `O(h)` 。至于 `O(logn)` 是怎么算的，下面 [性能对比](./集合Set.html#四、性能对比) 会说明。

注意，因为二分搜索树的排列不是唯一的，所以这里的 `O(h)` 平均时间复杂度是：`O(logn)`，最差的时候时间复杂度为 `O(n)`。

## 三、链表集合 LinkedListSet

### 1、实现

底层使用我们之前博客 [链表LinkedList](链表LinkedList.md) 中的链表实现的集合:
```java
public class LinkedListSet<E> implements Set<E> {

    private LinkedList<E> linkedList;

    public LinkedListSet() {
        linkedList = new LinkedList<>();
    }

    /**
     * 添加元素
     *
     * @param e
     */
    @Override
    public void add(E e) {
        if (!linkedList.contains(e)) {
            linkedList.addFirst(e);
        }
    }

    /**
     * 删除元素
     *
     * @param e
     */
    @Override
    public void remove(E e) {
        linkedList.removeElement(e);
    }

    /**
     * 是否包含 e 元素
     *
     * @param e
     * @return
     */
    @Override
    public boolean contains(E e) {
        return linkedList.contains(e);
    }

    /**
     * 获取集合大小
     *
     * @return
     */
    @Override
    public int getSize() {
        return linkedList.getSize();
    }

    /**
     * 集合是否为空
     *
     * @return
     */
    @Override
    public boolean isEmpty() {
        return linkedList.isEmpty();
    }

}
```

### 2、应用

同上面测试文件不重复单词统计一样：
```java
    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        List<String> wordList = new ArrayList<>();
        FileOperation.readFile("pride-and-prejudice.txt", wordList);
        System.out.println("total words: " + wordList.size());

        Set<String> linkedListSet = new LinkedListSet<>();
        for (String word : wordList) {
            linkedListSet.add(word);
        }
        System.out.println("total different words: " + linkedListSet.getSize());
        long end = System.currentTimeMillis();
        System.out.println("total cost: " + (end - start) + " ms");
    }
```

运行结果：
```console
total words: 125901
total different words: 6530
total cost: 2287 ms
```

### 3、时间复杂度分析

| 方法 | 时间复杂度 |
| --- | --- |
| add() | O(n) |
| contains | O(n)  |
| remove | O(n) |

因为在插入的过程需，需要对整个链表进行扫描来判断是否有重复元素，所以时间复杂度和查询都是 `O(n)` ，再删除的时候也需要查询元素，所以时间复杂度也是 `O(n)` 。

## 四、性能对比

二分搜索树集合和链表集合的时间复杂度如何对比呢？也就是 `h` 和 `n` 的关系是什么呢？

当树的所有元素满时，树的层级 `h` 和 元素总数 `n` 的关系是：`2^0 + 2^1 + 2^2 + ... + 2^(h - 1) = n` 经过计算可以得出：`2^h - 1 = n` ，也就是 `h = log2(n+1)` ，忽略掉常数后， `O(h)` 的时间复杂度为： `O(logn)`。

`O(logn)` 的时间复杂度已经是一种性能很高的算法了。

## 五、有序集合和无需集合

* 有序集合中的元素具有顺序性，基于搜索树实现
* 无需集合中的元素没有顺序性，基于哈希表实现

## 六、拓展

关于集合在 `LeetCode` 上的题，可以看这里：

* [【804】唯一摩尔斯密码词](../leetcode/【804】唯一摩尔斯密码词.md)

<Valine></Valine>