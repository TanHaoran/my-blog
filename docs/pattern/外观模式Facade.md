# 外观模式Facade

<Counter :path="'pattern'" :name="'外观模式Facade'"></Counter>

## 一、概念

### 1、定义

又叫门面模式，提供了一个统一的接口，用来访问子系统中的一群接口，外观模式定义了一个高层接口，让子系统更容易使用。

### 2、类型

结构型

### 3、适用场景

* 子系统越来越复杂，增加外观模式提供简单调用接口
* 构建多层系统结构，利用外观对象作为每层的入口，简化层间调用

### 4、优点

* 简化了调用过程，无需了解深入子系统，防止带来风险
* 减少系统依赖、松散耦合
* 更好的划分访问层次
* 符合迪米特法则，即最少知道原则

### 5、缺点

* 增加子系统、扩展子系统行为容易引入风险
* 不符合开闭原则

### 6、相关设计模式

* 外观模式和中介者模式

外观模式关注的是外接和子系统之间的交互；中介者模式关注的是子系统内部之间的交互

* 外观模式和单例模式

通常可以把外观模式的外观对象做成单例模式

* 外观模式和抽象工厂模式

外观类可以通过抽象工厂获取子系统的实例，子系统可以将内部对外观类屏蔽

## 二、Coding

各大商城的会员一般都会有积分吧，而且一定的积分是可以兑换商品的，我们想想看，用积分兑换礼品的时候后台都需要哪些逻辑操作呢？

1. 检测当前积分是否足够以及礼品的库存是否足够的校验系统
2. 进行积分支付的积分支付系统
3. 物流运输配送的物流配送系统

那么我们这就需要封装一个礼品兑换的类，然后内部融合这3个子系统。

首先创建一个礼品类：
```java
public class Gift {

    private String name;

    public Gift(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

接下来是上述的3个子系统，先是校验系统：
```java
public class QualifyService {

    public boolean isAvailable(Gift gift) {
        // 具体逻辑
        System.out.println("校验【" + gift.getName() + "】积分资格通过，库存通过");
        return true;
    }
}
```
这里假设直接校验通过。

积分支付系统：
```java
public class PointPaymentService {

    public boolean pay(Gift gift) {
        // 具体逻辑
        System.out.println("支付【" + gift.getName() + "】积分成功");
        return true;
    }
}
```

物流配送系统：
```java
public class ShippingService {

    public String shipGift(Gift gift) {
        // 具体逻辑
        System.out.println("【" + gift.getName() + "】进入物流系统");
        // 订单号
        String shippingOrderNo = "123";
        return shippingOrderNo;
    }
}
```

接下来就是融合3个子系统的礼品兑换类怎么使用呢：
```java
public class GiftExchangeService {

    private QualifyService qualifyService ;
    private PointPaymentService pointPaymentService ;
    private ShippingService shippingService ;

    public void setQualifyService(QualifyService qualifyService) {
        this.qualifyService = qualifyService;
    }

    public void setPointPaymentService(PointPaymentService pointPaymentService) {
        this.pointPaymentService = pointPaymentService;
    }

    public void setShippingService(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    public void giftExchange(Gift gift) {
        // 资格校验
        if (qualifyService.isAvailable(gift)) {
            // 积分支付
            if (pointPaymentService.pay(gift)) {
                // 物流运输生成订单号
                String shippingOrderNo = shippingService.shipGift(gift);
                System.out.println("物流系统下单订单号：" + shippingOrderNo);
            }
        }
    }
}
```
通过3个 `setter()` 方法将3个子系统注入，然后通过曝露的 `giftExchange()` 进行礼品兑换。

来看看应用层的使用：
```java
    public static void main(String[] args) {
        Gift gift = new Gift("U盘");
        GiftExchangeService giftExchangeService = new GiftExchangeService();

        giftExchangeService.setQualifyService(new QualifyService());
        giftExchangeService.setPointPaymentService(new PointPaymentService());
        giftExchangeService.setShippingService(new ShippingService());

        giftExchangeService.giftExchange(gift);
    }
```
将3个子系统设置到礼品兑换类中，然后进行礼品兑换。

运行结果：
```console
校验【U盘】积分资格通过，库存通过
支付【U盘】积分成功
【U盘】进入物流系统
物流系统下单订单号：123
```

不过到现在为止，应用层还耦合了3个子系统，需要对3个子系统进行创建并设置到外观对象中，所以这里需要改改礼品兑换类：
```java
public class GiftExchangeService {

    private QualifyService qualifyService = new QualifyService();
    private PointPaymentService pointPaymentService = new PointPaymentService();
    private ShippingService shippingService = new ShippingService();

    public void giftExchange(Gift gift) {
        // 资格校验
        if (qualifyService.isAvailable(gift)) {
            // 积分支付
            if (pointPaymentService.pay(gift)) {
                // 物流运输生成订单号
                String shippingOrderNo = shippingService.shipGift(gift);
                System.out.println("物流系统下单订单号：" + shippingOrderNo);
            }
        }
    }
}
```
让3个子系统在礼品兑换类初始化的时候就创建好，业务层就无需关注子系统的创建和设置了。

修改后的应用层：
```java
    public static void main(String[] args) {
        Gift gift = new Gift("U盘");
        GiftExchangeService giftExchangeService = new GiftExchangeService();
        giftExchangeService.giftExchange(gift);
    }
```
这样子，子系统就只和外观类通信，应用层也只和外观类通信。3个子系统的处理和应用层完全没有联系。

运行结果：
```console
校验【U盘】积分资格通过，库存通过
支付【U盘】积分成功
【U盘】进入物流系统
物流系统下单订单号：123
```

假如说目前我们礼品兑换包装类的版本是 `1.0` ，后面礼品兑换的逻辑需要新增子系统也就是升级到 `2.0` 版本，这里可以考虑在礼品兑换包装类的1.0版本基础上往上抽象出一个抽象类，然后对于 `2.0` 的包装类使用一个新的实现类来实现逻辑，在这个新的包装类中注入所需要的子系统，然后业务层直接调用礼品兑换抽象类的抽象方法即可。这样做也是起到了一个版本控制的效果。

<Valine></Valine>