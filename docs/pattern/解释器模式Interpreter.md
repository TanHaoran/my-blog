# 解释器模式Interpreter

<Counter :path="'pattern'" :name="'解释器模式Interpreter'"></Counter>

## 一、概念

### 1、定义

给定一个语言，定义它的文法的一种表示，并定义一个解释器，这个解释器使用该表示来解释语言中的句子。

### 2、扩展

为了解释一种语言，而为语言创建的解释器

### 3、类型

行为型

### 4、适用场景

某个特定类型问题发生频率足够高

### 5、优点

语法由很多类表示，容易改变及扩展次“语言”

### 6、缺点

当语法规则数目太多时，增加了系统复杂度

### 7、相关设计模式

* 解释器模式和适配器模式

适配器模式不需要预先知道需要适配的规则，而对于解释器模式需要把规则写好，根据规则进行解释。

## 二、应用

首先声明一个接口，也是解释器模式中最终要的部分：

```java
public interface Interpreter {

    int interpret();
}
```

它包含一个解释的方法。

创建一个加法解释器：

```java
public class AddInterpreter implements Interpreter {

    private Interpreter firstExpression, secondExpression;

    public AddInterpreter(Interpreter firstExpression, Interpreter secondExpression) {
        this.firstExpression = firstExpression;
        this.secondExpression = secondExpression;
    }

    @Override
    public int interpret() {
        return firstExpression.interpret() + secondExpression.interpret();
    }

    @Override
    public String toString() {
        return "+";
    }
}
```

乘法解释器：

```java
public class MultiInterpreter implements Interpreter {

    private Interpreter firstExpression, secondExpression;

    public MultiInterpreter(Interpreter firstExpression, Interpreter secondExpression) {
        this.firstExpression = firstExpression;
        this.secondExpression = secondExpression;
    }

    @Override
    public int interpret() {
        return firstExpression.interpret() * secondExpression.interpret();
    }

    @Override
    public String toString() {
        return "*";
    }
}
```

数字解释器：

```java
public class NumberInterpreter implements Interpreter {

    private int number;

    public NumberInterpreter(int number) {
        this.number = number;
    }

    public NumberInterpreter(String number) {
        this.number = Integer.parseInt(number);
    }

    @Override
    public int interpret() {
        return number;
    }
}
```

这个类接受两种类型的构造参数，通过 `interpret()` 方法返回 `int` 类型。

在创建一个解释器的类，他有一个运算的方法：

```java
public class ExpressionParser {

    private Stack<Interpreter> stack = new Stack<>();

    public int parse(String str) {
        String[] strItemArray = str.split(" ");
        for (String symbol : strItemArray) {
            if (!OperatorUtil.isOperator(symbol)) {
                Interpreter numberExpression = new NumberInterpreter(symbol);
                stack.push(numberExpression);
                System.out.println(String.format("入栈：%d", numberExpression.interpret()));
            } else {
                // 是运算符可以计算
                Interpreter firstExpression = stack.pop();
                Interpreter secondExpression = stack.pop();
                System.out.println(String.format("出栈：%d 和 %d",
                        firstExpression.interpret(), secondExpression.interpret()));
                Interpreter operator = OperatorUtil.getExpressionObject(firstExpression, secondExpression, symbol);
                System.out.println(String.format("应用运算符：%s", operator));
                int result = operator.interpret();
                NumberInterpreter resultExpression = new NumberInterpreter(result);
                stack.push(resultExpression);
                System.out.println(String.format("阶段结果入栈：%d", resultExpression.interpret()));
            }
        }
        return stack.pop().interpret();
    }
}
```

里面用到的一个工具类：

```java
public class OperatorUtil {

    public static boolean isOperator(String symbol) {
        return (symbol.equals("+") || symbol.equals("*"));
    }

    public static Interpreter getExpressionObject(Interpreter firstExpression, Interpreter secondExpression,
                                                  String symbol) {
        if (symbol.equals("+")) {
            return new AddInterpreter(firstExpression, secondExpression);
        } else if (symbol.equals("*")) {
            return new MultiInterpreter(firstExpression, secondExpression);
        }
        return null;
    }
}
```

测试类：

```java
public class Test {

    public static void main(String[] args) {
        String inputStr = "6 100 11 + *";
        ExpressionParser expressionParser = new ExpressionParser();
        int result = expressionParser.parse(inputStr);
        System.out.println("解释器计算结果：" + result);
    }
}
```

执行结果：

```console
入栈：6
入栈：100
入栈：11
出栈：11 和 100
应用运算符：111
阶段结果入栈：111
出栈：111 和 6
应用运算符：666
阶段结果入栈：666
解释器计算结果：666
```

类图：

![解释器模式](https://yjtravel-public.oss-cn-beijing.aliyuncs.com/my-blog/pattern/interpreter.png)

## 三、源码中的应用

### 1、Pattern

正则表达式就是通过 `Pattern` 解析出来的。

### 2、ExpressionParser

`org.springframework.expression` 包下的 `ExpressionParser` 用来解析 `EL` 语法，它有3个实现类：`InternalSpelExpressionParser`、`SpelExpressionParser`、`TemplateAwareExpressionParser`，下面是演示它的使用方法：

```java
public class SpringTest {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();
        Expression expression = parser.parseExpression("100 * 2 + 400 * 1 + 66");
        int result = (int) expression.getValue();
        System.out.println(result);
    }
}
```

执行结果：

```console
666
```

<Valine></Valine>