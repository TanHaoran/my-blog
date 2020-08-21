# 线段树SegmentTree

<Counter :path="'structure'" :name="'线段树SegmentTree'"></Counter>

## 一、定义

线段树是一种二叉搜索树，与区间树相似，它将一个区间划分成一些单元区间，每个单元区间对应线段树中的一个叶结点。

使用线段树可以快速的查找某一个节点在若干条线段中出现的次数，时间复杂度为 `O(logN)`。

线段树不是完全二叉树。

线段树是平衡二叉树，即树的最大深度和最小深度最多相差1。

以求和为例：

![SegmentTree](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/basic/SegmentTree.png)

每个节点存放的是指定区间内元素之和。

线段树也可以用数组来表示，那些不满的元素可以使用空来表示。如果区间有 `n` 个元素，使用数组的来表示的话，最多需要 `4n` 的空间。

## 二、实现

```java
public class SegmentTree<E> {

    private E[] tree;
    private E[] data;

    public SegmentTree(E[] array) {
        data = (E[]) new Object[array.length];
        for (int i = 0; i < array.length; i++) {
            data[i] = array[i];
        }

        tree = (E[]) new Object[array.length * 4];
    }

    public int getSize() {
        return data.length;
    }

    public E get(int index) {
        if (index < 0 || index >= data.length) {
            throw new IllegalArgumentException("index is illegal.");
        }
        return data[index];
    }

    /**
     * 返回完全二叉树的数组表示中，当前索引左孩子节点的索引
     *
     * @param index
     * @return
     */
    private int leftChild(int index) {
        return 2 * index + 1;
    }

    /**
     * 返回完全二叉树的数组表示中，当前索引右孩子节点的索引
     *
     * @param index
     * @return
     */
    private int rightChild(int index) {
        return 2 * index + 2;
    }

}
```

<Valine></Valine>