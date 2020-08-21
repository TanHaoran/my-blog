# 原型模式Prototype

<Counter :path="'pattern'" :name="'原型模式Prototype'"></Counter>

## 一、概念

### 1、定义

指原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。不需要知道任何创建的细节，不调用构造方法。

### 2、类型

创建型

### 3、适用场景

* 类初始化小号较多资源
* `new` 产生的一个对象需要非常繁琐的过程（数据准备、访问权限等）
* 构造方法比较复杂
* 循环体中需要生产大量对象

### 4、优点

* 原型模式性能比直接 `new` 一个对象性能高
* 简化创建过程

### 5、缺点

* 必须配备克隆方法
* 对克隆复杂对象或对克隆出的对象机型复杂改造时，容易引入风险
* 深拷贝、浅拷贝要运用得当

### 6、扩展

* 深克隆

需要克隆出来的对象中的引用类型指向不同的对象，使用深克隆。

* 浅克隆

克隆出来的对象中的引用类型不需要指向不同的对象，使用浅克隆。

## 二、Coding

### 1、原型模式的使用

邮件我们应该都发过吧，尤其是工作当中我们需要写日报、周报的时候都需要发送邮件，有时候还需要给这个抄送那个抄送等等。先创建邮件类：
```java
public class Mail {

    private String name;
    private String emailAddress;
    private String content;

    public Mail() {
        // 比较繁琐复杂的过程在这里
        System.out.println("创建一封邮件");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "Mail{" +
                "name='" + name + '\'' +
                ", emailAddress='" + emailAddress + '\'' +
                ", content='" + content + '\'' +
                '}' + super.toString();
    }

}
```
假设在构造方法中会有比较繁琐麻烦复杂的过程。在 `toString()` 方法中还增加了 `super.toString()` 方法方便查看对象的内存地址。

接着创建一个用于发送邮件的工具类：
```java
public class MailUtil {

    public static void sendMail(Mail mail) {
        String outputContent = "向{0}领导发送邮件，邮件地址：{1}，邮件内容：{2}，发送成功";
        System.out.println(MessageFormat.format(outputContent, mail.getName(),
                mail.getEmailAddress(), mail.getContent()));
    }

    public static void saveOriginMailRecord(Mail mail) {
        System.out.println("存储邮件的原始记录，邮件原始内容：" + mail.getContent());
    }
}
```
这个工具类中有2个方法，一个方法用于给领导发送邮件，另一个方法用于储存原始的邮件内容。

接下来看实际场景：我们写日报，需要给好几个领导发送邮件，并且希望能把最开始的邮件模板进行保存。应用层这么写：
```java
    public static void main(String[] args) {
        Mail mail = new Mail();
        mail.setContent("邮件初始化的模板内容。");

        for (int i = 0; i < 10; i++) {
            mail.setName("领导" + i);
            mail.setEmailAddress("领导" + i + "@qq.com");
            mail.setContent("日报已发送！");
            MailUtil.sendMail(mail);
        }

        MailUtil.saveOriginMailRecord(mail);
    }
```

运行结果：
```console
创建一封邮件
向领导0领导发送邮件，邮件地址：领导0@qq.com，邮件内容：日报已发送！，发送成功
向领导1领导发送邮件，邮件地址：领导1@qq.com，邮件内容：日报已发送！，发送成功
向领导2领导发送邮件，邮件地址：领导2@qq.com，邮件内容：日报已发送！，发送成功
向领导3领导发送邮件，邮件地址：领导3@qq.com，邮件内容：日报已发送！，发送成功
向领导4领导发送邮件，邮件地址：领导4@qq.com，邮件内容：日报已发送！，发送成功
向领导5领导发送邮件，邮件地址：领导5@qq.com，邮件内容：日报已发送！，发送成功
向领导6领导发送邮件，邮件地址：领导6@qq.com，邮件内容：日报已发送！，发送成功
向领导7领导发送邮件，邮件地址：领导7@qq.com，邮件内容：日报已发送！，发送成功
向领导8领导发送邮件，邮件地址：领导8@qq.com，邮件内容：日报已发送！，发送成功
向领导9领导发送邮件，邮件地址：领导9@qq.com，邮件内容：日报已发送！，发送成功
存储邮件的原始记录，邮件原始内容：日报已发送！
```

执行发现，邮件工具类保存的是后一次发给最后一个领导时的邮件内容。要怎么解决呢，一种方式是把 `saveOriginMailRecord()` 方法挪到 `for` 循环之前执行，另一种方式就是在 `for` 循环中创建新的对象并发送。假设由于业务逻辑，这个保存模板内容的过程必须放在 `for` 循环之后执行，再加上这个创建邮件的过程很复杂麻烦，那么该怎么做呢？这时候就需要是用到 `原型模式`。

回到 `Mail` 类，让这个类实现 `Cloneable` 接口，如下：
```java
public class Mail implements Cloneable {

    private String name;
    private String emailAddress;
    private String content;

    public Mail() {
        System.out.println("Mail class constructor");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "Mail{" +
                "name='" + name + '\'' +
                ", emailAddress='" + emailAddress + '\'' +
                ", content='" + content + '\'' +
                '}' + super.toString();
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        System.out.println("克隆一封邮件");
        return super.clone();
    }
}
```
在新接口中实现父类的 `clone()` 方法即可。

回到应用层，这么修改：
```java
    public static void main(String[] args) throws CloneNotSupportedException {
        Mail mail = new Mail();
        mail.setContent("邮件初始化的模板内容。");

        for (int i = 0; i < 10; i++) {
            Mail mailTemp = (Mail) mail.clone();
            mailTemp.setName("领导" + i);
            mailTemp.setEmailAddress("领导" + i + "@qq.com");
            mailTemp.setContent("日报已发送！");
            MailUtil.sendMail(mailTemp);
        }

        MailUtil.saveOriginMailRecord(mail);
    }
```

运行结果：
```console
创建一封邮件
克隆一封邮件
向领导0领导发送邮件，邮件地址：领导0@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导1领导发送邮件，邮件地址：领导1@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导2领导发送邮件，邮件地址：领导2@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导3领导发送邮件，邮件地址：领导3@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导4领导发送邮件，邮件地址：领导4@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导5领导发送邮件，邮件地址：领导5@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导6领导发送邮件，邮件地址：领导6@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导7领导发送邮件，邮件地址：领导7@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导8领导发送邮件，邮件地址：领导8@qq.com，邮件内容：日报已发送！，发送成功
克隆一封邮件
向领导9领导发送邮件，邮件地址：领导9@qq.com，邮件内容：日报已发送！，发送成功
存储邮件的原始记录，邮件原始内容：邮件初始化的模板内容。
```

在 `for` 循环的第一步就调用了 `mail` 对象的 `clone()` 方法来生成一个临时的 `Mail` 对象。 并且这个克隆出来的对象和之前的 `mail` 对象是不同的两个对象。

### 2、通过抽象类实现原型模式

假设有一个抽象的父类：
```java
public abstract class Parent implements Cloneable {

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

子类继承这个类：
```java
public class Child extends Parent {

    public static void main(String[] args) throws CloneNotSupportedException {
        Child b = new Child();
        b.clone();
    }
}
```
由于继承的关系，子类自然也就具有克隆的方法了。

### 3、深克隆和浅克隆

现在我们有没有这样一个疑问，如果对象中有成员属性是对象的情况，那么克隆出来的对象的这个属性也是不同的对象吗？

还是刚才的邮件类，我们精简些，只给一个发送时间的属性：
```java
public class Mail implements Cloneable {

    private Date sendTime;

    public Date getSendTime() {
        return sendTime;
    }

    public void setSendTime(Date sendTime) {
        this.sendTime = sendTime;
    }

    @Override
    public String toString() {
        return "Mail{" +
                "sendTime=" + sendTime +
                '}' + super.toString();
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```
在 `toString()` 方法中也增加了内存地址的输出。

执行测试类：
```java
    public static void main(String[] args) throws CloneNotSupportedException {
        Date sendTime = new Date();
        Mail mail = new Mail();
        mail.setSendTime(sendTime);
        Mail mail2 = (Mail) mail.clone();

        System.out.println(mail);
        System.out.println(mail2);
    }
```

运行结果：
```console
Mail{sendTime=Sat Feb 08 17:35:49 CST 2020}com.jerry.pattern.creational.prototype.Mail@677327b6
Mail{sendTime=Sat Feb 08 17:35:49 CST 2020}com.jerry.pattern.creational.prototype.Mail@14ae5a5
```
可以看出，克隆出来的对象是不同的两个对象，这个没问题。

接着看看如果改变了原始对象的 `sendTime` 属性后，新克隆出来的对象的 `sendTime` 会受影响吗？
```java
    public static void main(String[] args) throws CloneNotSupportedException {
        Date sendTime = new Date();
        Mail mail = new Mail();
        mail.setSendTime(sendTime);
        Mail mail2 = (Mail) mail.clone();

        mail.getSendTime().setTime(1234567890L);

        System.out.println(mail);
        System.out.println(mail2);
    }
```

运行结果：
```console
Mail{sendTime=Thu Jan 15 14:56:07 CST 1970}com.jerry.pattern.creational.prototype.Mail@677327b6
Mail{sendTime=Thu Jan 15 14:56:07 CST 1970}com.jerry.pattern.creational.prototype.Mail@14ae5a5
```
咦？克隆后的对象居然因为原始对象改变了成员属性而自己的属性也跟着改变了。原来现在这样子的克隆并不真正意义上的完全克隆，因为成员属性和原始对象还是同一个对象的，这个就叫做 `浅克隆`。

那么如何变成 `深克隆` 呢，只需要修改 `Mail` 对象的 `clone()` 方法：
```java
    @Override
    protected Object clone() throws CloneNotSupportedException {
        Mail mail = (Mail) super.clone();
        mail.sendTime = (Date) mail.sendTime.clone();
        return mail;
    }
```
重新运行上面的测试方法，运行结果：
```console
Mail{sendTime=Thu Jan 15 14:56:07 CST 1970}com.jerry.pattern.creational.prototype.Mail@677327b6
Mail{sendTime=Sat Feb 08 17:37:42 CST 2020}com.jerry.pattern.creational.prototype.Mail@14ae5a5
```
可以看出尽管修改了原始对象的 `sendTime` 属性，克隆出来的对象的 `sendTime` 属性还是没有变化的，因为它们是两个不同的对象了。

为了避免一些麻烦，还是推荐都使用 `深克隆`。

### 4、克隆破坏单例

那么克隆是否能破坏单例呢？我们用之前的饿汉式进行演示。如果还不清楚单例的话，先看看这篇博客 [单例模式Singleton](单例模式Singleton.md) 首先给饿汉式添加 `Cloneable` 接口，默认实现父类的方法：
```java
public class HungrySingleton implements Serializable, Cloneable {

    private final static HungrySingleton hungrySingleton;

    static {
        hungrySingleton = new HungrySingleton();
    }

    private HungrySingleton() {
        if (hungrySingleton != null) {
            throw new RuntimeException("单例构造器禁止反射调用");
        }
    }

    public static HungrySingleton getInstance() {
        return hungrySingleton;
    }

    private Object readResolve() {
        return hungrySingleton;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```
这里默认实现 `clone()` 方法的时候权限是 `protected` 的。

测试如下：
```java
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, 
            InvocationTargetException {
        HungrySingleton hungrySingleton = HungrySingleton.getInstance();
        Method method = hungrySingleton.getClass().getDeclaredMethod("clone");
        method.setAccessible(true);

        HungrySingleton cloneHungrySingleton = (HungrySingleton) method.invoke(hungrySingleton);
        System.out.println(hungrySingleton);
        System.out.println(cloneHungrySingleton);
    }
```
这里我们通过反射克隆出新对象，如果想要通过调用 `clone()` 方法实现克隆，需要将前面 `HungrySingleton` 类的 `clone()` 方法权限修改为 `public` 。

运行结果：
```console
com.jerry.design.pattern.creational.singleton.HungrySingleton@7cc355be
com.jerry.design.pattern.creational.singleton.HungrySingleton@6e8cf4c6
```

测试执行后发现克隆出来的对象和原来的对象是两个对象，也就是说破坏了单例。

怎么修改呢？在 `clone()` 方法中直接返回单例对象就可以了：
```java
    @Override
    protected Object clone() throws CloneNotSupportedException {
        return getInstance();
    }
```

重新运行上面的测试，运行结果：
```console
com.jerry.design.pattern.creational.singleton.HungrySingleton@7cc355be
com.jerry.design.pattern.creational.singleton.HungrySingleton@7cc355be
```

总结如下：如果不想克隆破坏单例的话，有两种方式：
1. 不让单例实现 `Cloneable` 接口
2. 如果实现了 `Cloneable` 接口，需要在 `clone()` 方法中返回单例

<Valine></Valine>