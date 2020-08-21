# 建造者模式Builder

<Counter :path="'pattern'" :name="'建造者模式Builder'"></Counter>

## 一、概念

### 1、定义

将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。用户只需要指定需要创建的类型就可以得到它们，建造过程及细节不需要知道。

### 2、类型

创建型

### 3、适用场景

* 该对象有非常复杂的内部结构（很多属性）
* 想把复杂对象的创建和使用分离

### 4、优点

* 封装性好，创建和使用分离
* 扩展性好，建造类之间独立，一定程度上解耦

### 5、缺点

* 产生多余的Builder对象
* 产品内部发生变化，建造者都需要修改，成本较大

### 6、建造者模式和工厂模式的区别

* 建造者模式更注重方法的调用顺序；而工厂模式更注重于创建产品。
* 创建对象的粒度不同。建造者模式可以创建一些复杂的产品，由各种复杂的部件组成；而工厂模式创建出来的产品都是一个样子的。
* 关注点不同。工厂模式关注只要创建出来这个产品就可以了；建造者模式不只要创建出来这个产品，还要知道这个产品是由哪些部件组成的。
* 建造者模式在某些业务场景下（例如不一样的顺序导致产出不一样的产品），需要把顺序进行调整；而工厂则不关心顺序。

## 二、Coding

现在我们要自己组装一个电脑，那么一个电脑都需要什么属性呢？比如说主板、CPU、内存、显卡、电源等。
```java
public class Computer {

    private String mainBoard;
    private String cpu;
    private String memory;
    private String videoCard;
    private String power;

    // getter、setter、toString()方法
}
```

然后创建一个抽象的电脑建造者，它规定了建造每一个零件的方法，以及最终组装出来一台电脑的方法。
```java
public abstract class ComputerBuilder {

    public abstract void buildMainBoard(String mainBoard);

    public abstract void buildCpu(String cpu);

    public abstract void buildMemory(String memory);

    public abstract void buildVideoCard(String videoCard);

    public abstract void buildPower(String power);

    public abstract Computer makeComputer();
}
```
所有继承这个类的非抽象类都必须实现上面的所有方法。

接下来就是真正创建电脑的那个建造者：
```java
public class RealComputerBuilder extends ComputerBuilder {

    private Computer computer = new Computer();

    @Override
    public void buildMainBoard(String mainBoard) {
        computer.setMainBoard(mainBoard);
    }

    @Override
    public void buildCpu(String cpu) {
        computer.setCpu(cpu);
    }

    @Override
    public void buildMemory(String memory) {
        computer.setMemory(memory);
    }

    @Override
    public void buildVideoCard(String videoCard) {
        computer.setVideoCard(videoCard);
    }

    @Override
    public void buildPower(String power) {
        computer.setPower(power);
    }

    @Override
    public Computer makeComputer() {
        return computer;
    }
}
```
这个类内部创建了一个电脑，实现了抽象类中的所有构建电脑每一个零件的方法，并在 `makeComputer()` 中返回出这个电脑。

搞定了如果构建每一个零件的方法，我们开开心心地去电脑城配电脑了，电脑城会有一个专门给我们配电脑的卖家：
```java
public class Seller {

    private ComputerBuilder computerBuilder;

    public void setComputerBuilder(ComputerBuilder computerBuilder) {
        this.computerBuilder = computerBuilder;
    }

    public Computer makeComputer(String mainBoard, String cpu, String memory, String videoCard, String power) {
        computerBuilder.buildMainBoard(mainBoard);
        computerBuilder.buildCpu(cpu);
        computerBuilder.buildMemory(memory);
        computerBuilder.buildVideoCard(videoCard);
        computerBuilder.buildPower(power);
        return computerBuilder.makeComputer();
    }
}
```
通过 `setComputerBuilder()` 方法，卖家拿到我们配置每一个零部件的细节，通过 `makeComputer()` 一顿操作就给我们组装好一台电脑了。

现在看看应用层怎么调用：
```java
public class Test {

    public static void main(String[] args) {
        ComputerBuilder computerBuilder = new RealComputerBuilder();
        Seller seller = new Seller();
        seller.setComputerBuilder(computerBuilder);
        Computer computer = seller.makeComputer("技嘉X299X", "i9-10900X", "32G内存",
                "TitanRTX", "航嘉WD600K");
        System.out.println(computer);
    }
}
```

运行结果：
```console
Computer{mainBoard='技嘉X299X', cpu='i9-10900X', memory='32G内存', videoCard='TitanRTX', power='航嘉WD600K'}
```

过程是这样子的，我们自己定义好如何配置每一个电脑零部件的清单，将这个清单交给卖家，他按照清单以及所需要零部件帮我们配置好电脑。

但此时应用层负责创建电脑建造者、卖家以及通过卖家指定电脑每一个零部件的型号来创建电脑。此时给卖家指定电脑建造者的权利是交由应用层的。如何让应用层关心的内容尽可能更少些呢？

重新来写 `Computer` 类：
```java
public class Computer {

    private String mainBoard;
    private String cpu;
    private String memory;
    private String videoCard;
    private String power;

    @Override
    public String toString() {
        return "Computer{" +
                "mainBoard='" + mainBoard + '\'' +
                ", cpu='" + cpu + '\'' +
                ", memory='" + memory + '\'' +
                ", videoCard='" + videoCard + '\'' +
                ", power='" + power + '\'' +
                '}';
    }

    public Computer(ComputerBuilder computerBuilder) {
        this.mainBoard = computerBuilder.mainBoard;
        this.cpu = computerBuilder.cpu;
        this.memory = computerBuilder.memory;
        this.videoCard = computerBuilder.videoCard;
        this.power = computerBuilder.power;
    }

    public static class ComputerBuilder {

        private String mainBoard;
        private String cpu;
        private String memory;
        private String videoCard;
        private String power;

        public ComputerBuilder buildMainBoard(String mainBoard) {
            this.mainBoard = mainBoard;
            return this;
        }

        public ComputerBuilder buildCpu(String cpu) {
            this.cpu = cpu;
            return this;
        }

        public ComputerBuilder buildMemory(String memory) {
            this.memory = memory;
            return this;
        }

        public ComputerBuilder buildVideoCard(String videoCard) {
            this.videoCard = videoCard;
            return this;
        }

        public ComputerBuilder buildPower(String power) {
            this.power = power;
            return this;
        }

        public Computer build() {
            return new Computer(this);
        }
    }
}
```
我们在这个新版的类中创建了一个静态内部类，在这个内部类中保有和外部的 `Computer` 一样的属性，并在内部类的每一个 `buildXXX()` 方法中设置内部属性值并返回了当前内部类，最终通过 `build()` 方法将自己作为参数传给外部的 `Computer` 的构造方法中，设置好每一个零部件值后把新创建的电脑返回出去，从而完成完整的创建电脑过程。

这里注意这个内部类中的每一个 `buildXXX()` 方法都将内部类自己本身返回出去。

此时的调用层：
```java
    public static void main(String[] args) {
        Computer computer = new Computer.ComputerBuilder()
                .buildMainBoard("技嘉X299X")
                .buildCpu("i9-10900X")
                .buildMemory("32G内存")
                .buildVideoCard("TitanRTX")
                .buildPower("航嘉WD600K")
                .build();
        System.out.println(computer);
    }
```

运行结果：
```console
Computer{mainBoard='技嘉X299X', cpu='i9-10900X', memory='32G内存', videoCard='TitanRTX', power='航嘉WD600K'}
```

由于内部类的 `buildXXX()` 方法返回的还是内部类本身，所以可以继续通过 `链式调用` 完成建造，`链式调用` 较之前版本而言，可以明显的通过方法名来辨别传递什么参数，也可以减少误差的产生。

通过内部类 `ComputerBuilder` 的 `buildXXX()` 一系列方法完成设置每一个零部件的值，最终通过 `build` 建造出一台新电脑。这里需要建造电脑哪些零部件就调用对应的建造零部件的方法就可以，不需要建造的可以不调用，实现了按需调用。此时应用层只关心了具体建造者，并设置对应的属性就可以完成建造。

<Valine></Valine>
