# 享元模式Flyweight

<Counter :path="'pattern'" :name="'享元模式Flyweight'"></Counter>

## 一、概念

### 1、定义

提供了减少对象数量从而改善应用所需的对象结构的方式，运用共享技术有效地支持大量细粒度的对象

### 2、类型

结构型

### 3、适用场景

* 常常应用于系统底层的开发，以便解决系统的性能问题 
* 系统有大量相似对象、需要缓冲池的场景

### 4、优点

* 减少对象的创建，降低内存中对象的数量，降低系统的内存，提高效率
* 减少内存之外的其他资源占用

### 5、缺点

* 需要关注内/外部状态、关注线程安全问题
* 使系统、程序的逻辑复杂化

### 6、扩展

#### 内部状态

在享元对象的内部，并且不会随着环境改变而改变的共享部分

#### 外部状态

在享元对象的外部，不能被共享的部分

### 7、相关设计模式

* 享元模式和代理模式

在代理模式中如果创建代理类所花费的资源和时间比较多，那么可以使用享元模式来提高处理速度

* 享元模式和单例模式

容器单例其实就是享元模式和单例模式的结合，因为享元模式就是一种复用对象的思想

## 二、Coding

到年底了，每个公司的部部门经理都需要做年终总结吧，一般会按照部门的顺序先后进行汇报，我们先来创建一个员工接口：
```java
public interface Employee {

    void report();
}
```
接口中有一个做报告的方法。

然后是部门经理，实现接口做报告：
```java
public class Manager implements Employee {

    private String title = "部门经理";
    private String department;
    private String reportContent;

    public Manager(String department) {
        this.department = department;
    }

    @Override
    public void report() {
        System.out.println(department + "部门【开始汇报】" + reportContent + "【汇报结束】");
    }

    public void setReportContent(String reportContent) {
        this.reportContent = reportContent;
    }
}
```
创建经理的时候需要知道经理的所在部门，这里还提供了一个设置汇报内容的方法。

这个类有几个属性需要注意一下： `title` 由于是内部私有的，并且不随外部环境变化而变化，所以这个是 `内部状态` ，而 `department` 由于根据 `setReportContent()` 的设置而改变，所以 `department` 是一个外部状态。

创建一个工厂类，专门生成部门经理对象：
```java
public class EmployeeFactory {

    private static final Map<String, Employee> EMPLOYEE_MAP = new HashMap<>();

    public static Employee getManager(String department) {
        Manager manager = (Manager) EMPLOYEE_MAP.get(department);

        if (manager == null) {
            manager = new Manager(department);
            System.out.print("创建" + department + "部门经理, ");
            String reportContent = department + "部门汇报内容：xxx。";
            manager.setReportContent(reportContent);
            System.out.println("创建报告。");
            EMPLOYEE_MAP.put(department, manager);
        }
        return manager;
    }
}
```
这里使用了一个 `EMPLOYEE_MAP` ，它的 `key` 是部门经理所在部门， `value` 就是部门经理。 `getManager()` 接受一个部门作为参数，生成一个部门经理对象，在生成对象的逻辑中进行判断，如果当前部门已经有经理做过汇报了，那么直接返回那个做过汇报的经理。

应用层，各个部门开始做报告，如果同一个部门第二次需要做报告的时候，直接从 `EMPLOYEE_MAP` 里面拿出来经理做报告：
```java
    private static final String DEPARTMENTS[] = {"RD", "QA", "PM", "BD"};

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            String department = DEPARTMENTS[(int) (Math.random() * DEPARTMENTS.length)];
            Manager manager = (Manager) EmployeeFactory.getManager(department);
            manager.report();
        }
    }
``` 

运行结果：
```console
创建PM部门经理, 创建报告。
PM部门【开始汇报】PM部门汇报内容：xxx。【汇报结束】
创建RD部门经理, 创建报告。
RD部门【开始汇报】RD部门汇报内容：xxx。【汇报结束】
PM部门【开始汇报】PM部门汇报内容：xxx。【汇报结束】
RD部门【开始汇报】RD部门汇报内容：xxx。【汇报结束】
创建QA部门经理, 创建报告。
QA部门【开始汇报】QA部门汇报内容：xxx。【汇报结束】
QA部门【开始汇报】QA部门汇报内容：xxx。【汇报结束】
RD部门【开始汇报】RD部门汇报内容：xxx。【汇报结束】
QA部门【开始汇报】QA部门汇报内容：xxx。【汇报结束】
RD部门【开始汇报】RD部门汇报内容：xxx。【汇报结束】
PM部门【开始汇报】PM部门汇报内容：xxx。【汇报结束】
```
可以看出，如果相同部门第二次需要做报告的时候，直接从 `EMPLOYEE_MAP` 中获取经理进行报告，省去了重复创建经理和写报告内容的步骤。

值得注意的是这里使用的是 `HashMap` ，并不能保证线程安全，如果需要线程安全的话，需要使用 `HashTable`。

<Valine></Valine>