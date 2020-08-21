# 二分搜索树BinarySearchTree

<Counter :path="'structure'" :name="'二分搜索树BinarySearchTree'"></Counter>

## 一、定义

### 1、二叉树

二叉树是一种树型结构，是由一个个节点组成，每一个节点除了保存元素值本身之外，还存有一个左子节点和右子节点。

* 每一个节点最多有两个孩子，每个节点最多有一个父亲，根节点没有父亲节点。
* 二叉树具有天然的递归结构，每个节点的左子树和右子树也都是一个二叉树。
* 二叉树不一定都是满的，即不一定每个节点都具有左子节点和右子节点。
* 只有一个根节点或者只有一个空也是二叉树。

### 2、二分搜索树 BinarySearchTree

二分搜索树也是二叉树。

* 每个节点的值大于其左子树的所有节点的值。
* 每个节点的值小于其右子树的所有节点的值。
* 每一颗子树也都是二分搜索树。
* 存储的元素必须具有可比较性。

## 二、实现

### 1、基础实现

```java
public class BinarySearchTree<E extends Comparable<E>> {

    private Node root;
    private int size;

    public BinarySearchTree() {
        root = null;
        size = 0;
    }

    public int getSize() {
        return size;
    }

    private class Node {
        private E e;
        private Node left;
        private Node right;

        public Node(E e) {
            this.e = e;
            left = null;
            right = null;
        }
    }
}
```
因为二分搜索树里面的元素都必须具有可比性，所以泛型中的类型需要实现 `Comparable` 接口。

### 2、添加

```java
    /**
     * 添加元素
     *
     * @param e
     */
    public void add(E e) {
        root = add(root, e);
    }

    /**
     * 向以 node 为节点为根节点的二分搜索树中插入元素 e
     *
     * @param node 插入新节点后二分搜索树的跟
     * @param e
     * @return
     */
    private Node add(Node node, E e) {
        if (node == null) {
            size++;
            return new Node(e);
        }

        if (e.compareTo(node.e) < 0) {
            node.left = add(node.left, e);
        } else if (e.compareTo(node.e) > 0) {
            node.right = add(node.right, e);
        }

        return node;
    }
```

### 3、查找

```java
    /**
     * 二分搜索树中是否包含元素 e
     *
     * @param e
     * @return
     */
    public boolean contains(E e) {
        return contains(root, e);
    }

    /**
     * 以 node 为根的节点是否包含元素 e
     *
     * @param node
     * @param e
     * @return
     */
    private boolean contains(Node node, E e) {
        if (node == null) {
            return false;
        }

        if (e.compareTo(node.e) < 0) {
            return contains(node.left, e);
        } else if (e.compareTo(node.e) > 0) {
            return contains(node.right, e);
        } else {
            return true;
        }
    }
```

### 4、遍历

#### (1) 前序遍历

```java
    /**
     * 前序遍历
     */
    public void preOrder() {
        preOrder(root);
    }

    /**
     * 以节点 node 为根节点进行前序遍历
     *
     * @param node
     */
    private void preOrder(Node node) {
        if (node == null) {
            return;
        }

        System.out.println(node.e);
        preOrder(node.left);
        preOrder(node.right);
    }
```

为了方便查看输出，复写了 `toString()` 方法：
```java
    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        generateBinarySearchTreeString(root, 0, result);
        return result.toString();
    }

    /**
     * 生成以 node 为根节点，深度为 depth 的描述二叉树的字符串
     *
     * @param node
     * @param depth
     * @param result
     */
    private void generateBinarySearchTreeString(Node node, int depth, StringBuilder result) {
        if (node == null) {
            result.append(generateDepthString(depth)).append("null\n");
            return;
        }

        result.append(generateDepthString(depth)).append(node.e).append("\n");
        generateBinarySearchTreeString(node.left, depth + 1, result);
        generateBinarySearchTreeString(node.right, depth + 1, result);
    }

    /**
     * 生成深度为 depth 的层级符号
     *
     * @param depth
     */
    private String generateDepthString(int depth) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < depth; i++) {
            result.append("--");
        }
        return result.toString();
    }
```

测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println("前序遍历：");
        binarySearchTree.preOrder();
        System.out.println();

        System.out.println(binarySearchTree);
    }
```

运行结果：
```console
前序遍历：
5
3
2
4
6
8

5
--3
----2
------null
------null
----4
------null
------null
--6
----null
----8
------null
------null
```

#### (2) 中序遍历

```java
    /**
     * 中序遍历
     */
    public void inOrder() {
        inOrder(root);
    }

    /**
     * 以 node 节点为根节点进行中序遍历
     *
     * @param node
     */
    private void inOrder(Node node) {
        if (node == null) {
            return;
        }

        inOrder(node.left);
        System.out.println(node.e);
        inOrder(node.right);
    }
```
测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println("中序遍历：");
        binarySearchTree.inOrder();
    }
```

运行结果：
```console
中序遍历：
2
3
4
5
6
8
```

#### (3) 后序遍历

```java
    /**
     * 后序遍历
     */
    public void postOrder() {
        postOrder(root);
    }

    /**
     * 以 node 节点为根节点进行后序遍历
     *
     * @param node
     */
    private void postOrder(Node node) {
        if (node == null) {
            return;
        }

        postOrder(node.left);
        postOrder(node.right);
        System.out.println(node.e);
    }
```
测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println("后序遍历：");
        binarySearchTree.postOrder();
    }
```

运行结果：
```console
后序遍历：
2
4
3
8
6
5
```

#### (4) 前序遍历（非递归）

```java
    /**
     * 非递归前序遍历
     */
    public void preOrderNoRecursive() {
        Stack<Node> stack = new Stack<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            Node current = stack.pop();
            System.out.println(current.e);
            if (current.right != null) {
                stack.push(current.right);
            }
            if (current.left != null) {
                stack.push(current.left);
            }
        }
    }
```
测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println("前序遍历(非递归）：");
        binarySearchTree.preOrderNoRecursive();
    }
```

运行结果：
```console
前序遍历(非递归）：
5
3
2
4
6
8
```

#### (5) 层序遍历

层序遍历也叫广度优先遍历：
```java
    /**
     * 层序遍历
     */
    public void levelOrder() {
        Queue<Node> stack = new LinkedList<>();
        stack.add(root);

        while (!stack.isEmpty()) {
            Node current = stack.remove();
            System.out.println(current.e);
            if (current.right != null) {
                stack.add(current.right);
            }
            if (current.left != null) {
                stack.add(current.left);
            }
        }
    }
```

层序遍历的意义：

* 更快的找到问题的解
* 常用于算法设计中 - 最短路径
* 图中的深度优先遍历和广度优先遍历

测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println("层序遍历：");
        binarySearchTree.levelOrder();
    }
```

运行结果：
```console
层序遍历：
5
6
3
8
4
2
```

### 5、删除

#### (1) 删除最小值

```java

    /**
     * 寻找最小元素
     *
     * @return
     */
    public E minimum() {
        if (size == 0) {
            throw new IllegalArgumentException("Binary search tree is empty");
        }
        return minimum(root).e;
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
    public E removeMin() {
        E result = minimum();
        root = removeMin(root);
        return result;
    }

    /**
     * 删除以 node 为根的最小节点，返回删除后二分搜索树的跟
     *
     * @param node
     * @return
     */
    private Node removeMin(Node node) {
        if (node.left == null) {
            Node rightNode = node.right;
            node.right = null;
            size--;
            return rightNode;
        }

        node.left = removeMin(node.left);
        return node;
    }
```

测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();

        int n = 1000;
        Random random = new Random();
        for (int i = 0; i < n; i++) {
            binarySearchTree.add(random.nextInt(10000));
        }

        List<Integer> nums = new ArrayList<>();
        while (!binarySearchTree.isEmpty()) {
            nums.add(binarySearchTree.removeMin());
        }
        System.out.println(nums);
        for (int i = 1; i < nums.size(); i++) {
            if (nums.get(i - 1) > nums.get(i)) {
                throw new IllegalArgumentException("error");
            }
        }
        System.out.println("removeMin() test completed.");
    }
```
向二分搜索树中插入1000个数字，然后以从小到大的顺序取出来，然后进行大小对比，如果对比正确就说明测试通过。

#### (2) 删除最大值

```java
    /**
     * 寻找最大元素
     *
     * @return
     */
    public E maximum() {
        if (size == 0) {
            throw new IllegalArgumentException("Binary search tree is empty");
        }
        return maximum(root).e;
    }

    /**
     * 获取以 node 为根的最大值所在的节点
     *
     * @param node
     * @return
     */
    private Node maximum(Node node) {
        if (node.right == null) {
            return node;
        }

        return maximum(node.right);
    }

    /**
     * 删除最大值所在节点，返回最大值元素
     *
     * @return
     */
    public E removeMax() {
        E result = maxmum();
        root = removeMax(root);
        return result;
    }

    /**
     * 删除以 node 为根的最大节点，返回删除后二分搜索树的跟
     *
     * @param node
     * @return
     */
    private Node removeMax(Node node) {
        if (node.right == null) {
            Node leftNode = node.left;
            node.left = null;
            size--;
            return leftNode;
        }

        node.right = removeMax(node.right);
        return node;
    }
```

测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();

        int n = 1000;
        Random random = new Random();
        for (int i = 0; i < n; i++) {
            binarySearchTree.add(random.nextInt(10000));
        }

        List<Integer> nums = new ArrayList<>();
        while (!binarySearchTree.isEmpty()) {
            nums.add(binarySearchTree.removeMax());
        }
        System.out.println(nums);
        for (int i = 1; i < nums.size(); i++) {
            if (nums.get(i - 1) < nums.get(i)) {
                throw new IllegalArgumentException("error");
            }
        }
        System.out.println("removeMax() test completed.");
    }
```
向二分搜索树中插入1000个数字，然后以从大到小的顺序取出来，然后进行对比，如果对比正确就说明测试通过。

#### (3) 删除任意节点

```java

    /**
     * 删除元素为 e 的节点
     *
     * @param e
     */
    public void remove(E e) {
        root = remove(root, e);
    }

    /**
     * 删除掉以 node 为根的二分搜索树中值为 e 的节点，并返回删除后二分搜索树的根节点
     *
     * @param node
     * @param e
     * @return
     */
    private Node remove(Node node, E e) {
        if (node == null) {
            return null;
        }

        if (e.compareTo(node.e) < 0) {
            node.left = remove(node.left, e);
            return node;
        } else if (e.compareTo(node.e) > 0) {
            node.right = remove(node.right, e);
            return node;
        } else {
           ht = null;
                size--; // 待删除的节点左子树为空的情况
                                   if (node.left == null) {
                                       Node rightNode = node.right;
                                       node.rig
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
```
这里实际上是通过寻找待删除节点的 `后继节点` ，也就是待删除节点的右子树中最小的元素的节点来作为新节点的。其实也可以通过找待删除节点的 `前驱节点` ，即待删除节点的左子树中最大元素的节点作为新节点。

这里值得注意的是第50行代码在进行 `removeMin()` 的时候，代码中是进行了 `size--` 的操作，但实际上这时候这个节点还未删除，因为我们需要将这个节点作为新的根节点，所以这里是暂时多减了1，应当使用 `size++` 加回来。但是最后删除掉节点后还需要再进行 `size--` 的操作，也就是说给“扯平了”，所以这里就没有相关 `size` 的操作了。

### 6、floor和ceil

`floor` 是指获取比给定值小与等于的元素中最大的那个元素。
```java
    /**
     * 查询不大于 e 的元素中最大元素
     *
     * @param e
     * @return
     */
    public E floor(E e) {
        if (size == 0 || minimum().compareTo(e) > 0) {
            return null;
        }

        return floor(root, e).e;
    }

    /**
     * 在以 node 为根节点的二分搜索树中查询不大于 e 的元素中最大元素
     *
     * @param node
     * @param e
     * @return
     */
    private Node floor(Node node, E e) {
        if (node == null) {
            return null;
        }

        // 如果该 node 的 e 和 e 相等，就是本身
        if (node.e.compareTo(e) == 0) {
            return node;
        }

        // 如果该 node 比 e 要大的话
        if (node.e.compareTo(e) > 0) {
            return floor(node.left, e);
        }

        // 如果 node 比 e 小，可能是，也能是不是，需要到 node 的右子树中查询
        Node tempNode = floor(node.right, e);
        // 如果能查询到就返回查询到的，否则就返回上级的 node
        if (tempNode != null) {
            return tempNode;
        }
        return node;
    }
```

测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println(binarySearchTree.floor(7));
    }
```

运行结果：
```console
6
```

`ceil` 是指获取比给定值大与等于的元素中最小的那个元素。
```java
    /**
     * 查询不小于 e 的元素中最小元素
     *
     * @param e
     * @return
     */
    public E ceil(E e) {
        if (size == 0 || maxmum().compareTo(e) < 0) {
            return null;
        }

        return ceil(root, e).e;
    }

    /**
     * 在以 node 为根节点的二分搜索树中查询不小于 e 的元素中最小元素
     *
     * @param node
     * @param e
     * @return
     */
    private Node ceil(Node node, E e) {
        if (node == null) {
            return null;
        }

        // 如果该 node 的 e 和 e 相等，就是本身
        if (node.e.compareTo(e) == 0) {
            return node;
        }

        // 如果该 node 比 e 要小的话，需要到右子树中查询更大点的
        if (node.e.compareTo(e) < 0) {
            return ceil(node.right, e);
        }

        // 如果 node 比 e 大，可能是，也能是不是，需要到 node 的左子树中查询
        Node tempNode = floor(node.left, e);
        // 如果能查询到就返回查询到的，否则就返回上级的 node
        if (tempNode != null) {
            return tempNode;
        }
        return node;
    }
```

测试：
```java
    public static void main(String[] args) {
        BinarySearchTree<Integer> binarySearchTree = new BinarySearchTree<>();
        int[] nums = {5, 3, 6, 8, 4, 2};

        for (int i = 0; i < nums.length; i++) {
            binarySearchTree.add(nums[i]);
        }

        System.out.println(binarySearchTree.ceil(7));
    }
```

运行结果：
```console
8
```

### 7、rank和select

`rank` 是指获取给定元素在二分搜索树中排名。

`select` 是指根据排名获取二分搜索树中的元素。

这两个方法有兴趣的可以实现一下。

<Valine></Valine>