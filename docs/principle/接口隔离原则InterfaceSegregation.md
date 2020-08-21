# 接口隔离原则InterfaceSegregation

<Counter :path="'principle'" :name="'接口隔离原则InterfaceSegregation'"></Counter>

## 一、概念

### 1、定义

用多个专门的接口，而不使用单一的总接口，客户端不应该一类它不需要的接口。

### 2、注意事项

* 一个类对一个类的依赖应该建立在最小的接口上
* 建立单一接口，不要建立庞大臃肿的接口
* 尽量细化接口，接口中的方法尽量少
* 注意适度原则，一定要适度

### 3、优点

符合高内聚低耦合的设计思想，从而使得类具有很好的可读性、可扩展性和可维护性。

## 二、应用

先创建一个动物行为的接口：

```java
public interface IAnimalAction {

    void eat();

    void fly();

    void swim();
}
```

创建一个 `Dog` 类实现这个接口：

```java
public class Dog implements IAnimalAction {

    @Override
    public void eat() {

    }

    @Override
    public void fly() {
        
    }

    @Override
    public void swim() {

    }
}
```

狗因为没有飞的行为，所以它的 `fly()` 方法是一个空实现。

创建一个 `Bird` 类实现这个接口：

```java
public class Bird implements IAnimalAction {

    @Override
    public void eat() {

    }

    @Override
    public void fly() {

    }

    @Override
    public void swim() {

    }
}
```

鸟不会游泳，所以它的 `swim()` 方法也是一个空实现。

现在的类图：

![接口隔离原则未拆分](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/interfacesegregation_1.png)

为了避免差生过多的空实现，需要将接口再细分。

将上面的 `IAnimalAction` 拆分为3个接口：

```java
public interface IFlyAnimalAction {

    void fly();
}
```

```java
public interface IEatAnimalAction {

    void eat();
}
```

```java
public interface ISwimAnimalAction {

    void swim();
}
```

此时 `Dog` 类就可以修改为这样：

```java
public class Dog implements IEatAnimalAction, ISwimAnimalAction {

    @Override
    public void eat() {

    }

    @Override
    public void swim() {

    }
}
```

只需要实现它自己需要实现的接口就行。

此时的类图：

![接口隔离原则拆分](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/principle/interfacesegregation_2.png)

此时 `Dog` 类所实现的接口的粒度更细，使接口互相隔离，如果后需要新需求是可以随意组装进行实现的。

这里是不是发现接口隔离原则和单一职责原则比较像呢。单一职责原则可以针对类、接口和方法，其中在接口级别强调的是在同一个接口中的职责要单一，也就是说可以有多个方法但是都是同一个职责；而接口隔离原则只针对接口来说，强调的是接口互相的隔离。

<Valine></Valine>