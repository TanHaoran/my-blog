# 备忘录模式Memento

<Counter :path="'pattern'" :name="'备忘录模式Memento'"></Counter>

## 一、概念

### 1、定义

保存一个对象的某个状态，以便在适当的时候恢复对象。

### 2、补充

“后悔药”

### 3、类型

行为型

### 4、适用场景

* 保存及恢复数据相关业务场景
* 后悔的时候，即想恢复到之前的状态

### 5、优点

* 为用户提供一种可恢复的机制
* 存档信息的封装

### 6、缺点

资源占用

### 7、相关设计模式

* 备忘录模式和状态模式

备忘录模式是用实例表示状态，存的存档是一个对象的实例；状态模式是用类表示状态。

## 二、应用

首先创建一个笔记类：

```java
public class Article {

    private String title;
    private String content;
    private String image;

    public Article(String title, String content, String image) {
        this.title = title;
        this.content = content;
        this.image = image;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public ArticleMemento saveToMemento() {
        ArticleMemento articleMemento = new ArticleMemento(title, content, image);
        return articleMemento;
    }

    public void undoFromMemento(ArticleMemento articleMemento) {
        this.title = articleMemento.getTitle();
        this.content = articleMemento.getContent();
        this.image = articleMemento.getImage();
    }

    @Override
    public String toString() {
        return "Article{" +
                "title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", image='" + image + '\'' +
                '}';
    }
}
```

其中 `saveToMemento()` 就是保存笔记的方法，`undoFromMemento()` 就是还原的方法。

看下 `ArticleMemento` 类：

```java
public class ArticleMemento {

    private String title;
    private String content;
    private String image;

    public ArticleMemento(String title, String content, String image) {
        this.title = title;
        this.content = content;
        this.image = image;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getImage() {
        return image;
    }

    @Override
    public String toString() {
        return "ArticleMemento{" +
                "title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", image='" + image + '\'' +
                '}';
    }
}
```

在看下 `ArticleMementoManager` 的管理类：

```java
public class ArticleMementoManager {

    private final Stack<ArticleMemento> ARTICLE_MEMENTO_STACK = new Stack<>();

    public ArticleMemento getMemento() {
        return ARTICLE_MEMENTO_STACK.pop();
    }

    public void addMemento(ArticleMemento articleMemento) {
        ARTICLE_MEMENTO_STACK.push(articleMemento);
    }
}
```

类图：

![备忘录模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/memento.png)

测试类：

```java
public class Test {

    public static void main(String[] args) {
        ArticleMementoManager articleMementoManager = new ArticleMementoManager();
        Article article = new Article("Java设计模式A", "内容A", "图片A");
        ArticleMemento articleMemento = article.saveToMemento();

        // 存档
        articleMementoManager.addMemento(articleMemento);
        System.out.println("原始：" + article);

        System.out.println("修改笔记 start");
        article.setTitle("Java设计模式B");
        article.setContent("内容B");
        article.setImage("图片B");
        System.out.println("修改笔记 end");

        System.out.println("修改1次后：" + article);

        articleMemento = article.saveToMemento();
        articleMementoManager.addMemento(articleMemento);

        article.setTitle("Java设计模式C");
        article.setContent("内容C");
        article.setImage("图片C");
        System.out.println("修改2次后：" + article);

        System.out.println("暂存回退 start");
        System.out.println("回退出栈1次");
        articleMemento = articleMementoManager.getMemento();
        article.undoFromMemento(articleMemento);
        System.out.println("回退1次：" + article);

        System.out.println("回退出栈2次");
        articleMemento = articleMementoManager.getMemento();
        article.undoFromMemento(articleMemento);
        System.out.println("暂存回退 end");
        System.out.println("回退2次：" + article);
    }

}
```

执行结果：

```console
原始：Article{title='Java设计模式A', content='内容A', image='图片A'}
修改笔记 start
修改笔记 end
修改1次后：Article{title='Java设计模式B', content='内容B', image='图片B'}
修改2次后：Article{title='Java设计模式C', content='内容C', image='图片C'}
暂存回退 start
回退出栈1次
回退1次：Article{title='Java设计模式B', content='内容B', image='图片B'}
回退出栈2次
暂存回退 end
回退2次：Article{title='Java设计模式A', content='内容A', image='图片A'}
```

## 三、源码中的应用

### spring 的 StateManageableMessageContext

`StateManageableMessageContext` 接口继承自 `MessageContext`，这个接口有3个方法：

```java
public interface StateManageableMessageContext extends MessageContext {

	/**
	 * Create a serializable memento, or token representing a snapshot of the internal state of this message context.
	 * @return the messages memento
	 */
	public Serializable createMessagesMemento();

	/**
	 * Set the state of this context from the memento provided. After this call, the messages in this context will match
	 * what is encapsulated inside the memento. Any previous state will be overridden.
	 * @param messagesMemento the messages memento
	 */
	public void restoreMessages(Serializable messagesMemento);

	/**
	 * Configure the message source used to resolve messages added to this context. May be set at any time to change how
	 * coded messages are resolved.
	 * @param messageSource the message source
	 * @see MessageContext#addMessage(MessageResolver)
	 */
	public void setMessageSource(MessageSource messageSource);
}
```

这就是使用了备忘录模式。

<Valine></Valine>