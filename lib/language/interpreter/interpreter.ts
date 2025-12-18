import type { ExpressionVisitor, StatementVisitor } from '@t-script/visitors';

import { Token, TokenType } from '@t-script/lexer';
import { Callable } from './callable';
import { Environment } from './environment';
import { Return, RuntimeError } from './errors';
import { TScriptFunction } from './function';
import { Print } from './native';

import * as Expr from '@t-script/expressions';
import * as Stmt from '@t-script/statements';

class Interpreter
  implements ExpressionVisitor<unknown>, StatementVisitor<void>
{
  public globals = new Environment();
  private environment = this.globals;

  constructor() {
    this.globals.define('print', new Print());
  }

  public interpret(statements: Stmt.Statement[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        console.error(error.message);
      }
    }
  }

  public visitExpressionStatement(statement: Stmt.Expression): void {
    this.evaluate(statement.expression);
  }

  public visitVariableExpression(expression: Expr.Variable): unknown {
    return this.environment.get(expression.name);
  }

  public visitAssignmentExpression(expression: Expr.Assignment): unknown {
    const value = this.evaluate(expression.value);
    this.environment.assign(expression.name, value);

    return value;
  }

  public visitVarStatement(statement: Stmt.Var): void {
    let value: unknown = null;

    if (statement.initializer !== null) {
      value = this.evaluate(statement.initializer);
    }

    this.environment.define(statement.name.text, value);
  }

  public visitIfStatement(statement: Stmt.If): void {
    const condition = this.evaluate(statement.condition);

    if (this.isTruthy(condition)) {
      this.execute(statement.thenBranch);
    } else if (statement.elseBranch !== null) {
      this.execute(statement.elseBranch);
    }
  }

  public visitBlockStatement(statement: Stmt.Block): void {
    this.executeBlock(statement.statements, new Environment(this.environment));
  }

  public executeBlock(
    statements: Stmt.Statement[],
    environment: Environment
  ): void {
    const previous = this.environment;

    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  public visitCallExpression(expression: Expr.Call): unknown {
    const calle = this.evaluate(expression.calle);
    const args = expression.args.map(arg => this.evaluate(arg));
    const func = calle as Callable;
    const arity = func.arity();

    if (arity >= 0 && args.length !== arity) {
      throw new RuntimeError(
        expression.paren,
        `Expected ${func.arity()} arguments but got ${args.length}.`
      );
    }

    // here check for function and class;
    if (!(calle instanceof Callable)) {
      throw new RuntimeError(
        expression.paren,
        'Can only call functions and classes.'
      );
    }

    return func.call(this, args);
  }

  public visitPostfixExpression(expression: Expr.Postfix): unknown {
    const [oldValue] = this.evaluateStep(
      expression.variable,
      expression.operator
    );

    return oldValue;
  }

  public visitPrefixExpression(expression: Expr.Prefix): unknown {
    const [_, newValue] = this.evaluateStep(
      expression.variable,
      expression.operator
    );

    return newValue;
  }

  public visitReturnStatement(statement: Stmt.Return): void {
    let value: unknown = null;

    if (statement.value !== null) {
      value = this.evaluate(statement.value);
    }

    throw new Return(value);
  }

  public visitLogicalExpression(expression: Expr.Logical): unknown {
    const left = this.evaluate(expression.left);

    if (expression.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expression.right);
  }

  public visitWhileStatement(statement: Stmt.While): void {
    while (this.isTruthy(this.evaluate(statement.condition))) {
      this.execute(statement.body);
    }
  }

  public visitFunctionStatement(statement: Stmt.Func): void {
    const func = new TScriptFunction(statement, this.environment);

    this.environment.define(statement.name.text, func);
  }

  public visitBinaryExpression(expression: Expr.Binary): unknown {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.PLUS: {
        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }

        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }

        throw new RuntimeError(
          expression.operator,
          'Operands must be two numbers or two strings.'
        );
      }
      case TokenType.PIPE:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) | (right as number);
      case TokenType.AMPERSAND:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) & (right as number);
      case TokenType.MINUS:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.STAR:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) * (right as number);
      case TokenType.SLASH:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) / (right as number);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.GREATER:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) >= (right as number);
      case TokenType.LESS:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        this.assertNumbers(expression.operator, left, right);
        return (left as number) <= (right as number);
    }

    return null;
  }

  public visitGroupingExpression(expression: Expr.Grouping): unknown {
    return this.evaluate(expression.expression);
  }

  public visitLiteralExpression(expression: Expr.Literal): unknown {
    return expression.value;
  }

  public visitUnaryExpression(expression: Expr.Unary): unknown {
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.assertNumber(expression.operator, right);
        return -(right as number);
    }

    return null;
  }

  public visitTernaryExpression(expression: Expr.Ternary): unknown {
    const condition = this.evaluate(expression.condition);

    if (this.isTruthy(condition)) {
      return this.evaluate(expression.thenBranch);
    } else {
      return this.evaluate(expression.elseBranch);
    }
  }

  private evaluate(expression: Expr.Expression): unknown {
    return expression.accept(this);
  }

  private execute(statement: Stmt.Statement): unknown {
    return statement.accept(this);
  }

  private isTruthy(value: unknown): boolean {
    if (value === null) return false;
    if (typeof value === 'boolean') return value;

    return true;
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }

  private assertNumber(
    operator: Token,
    operand: unknown
  ): asserts operand is number {
    if (typeof operand === 'number') return;

    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private assertNumbers(operator: Token, left: unknown, right: unknown) {
    if (typeof left === 'number' && typeof right === 'number') return;

    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  private stringify(value: unknown): string {
    if (value === null || value === undefined) return 'null';

    if (typeof value === 'number') {
      let text = value.toString();

      if (text.endsWith('.0')) {
        text = text.slice(0, -2);
      }

      return text;
    }

    return value.toString();
  }

  private evaluateStep(
    variable: Token,
    operator: Token
  ): [oldValue: number, newValue: number] {
    const value = this.environment.get(variable);

    this.assertNumber(operator, value);

    let newValue: number;

    switch (operator.type) {
      case TokenType.PLUS_PLUS:
        newValue = value + 1;
        break;
      case TokenType.MINUS_MINUS:
        newValue = value - 1;
        break;
      default:
        throw new RuntimeError(operator, 'Unsupported postfix operator.');
    }

    this.environment.assign(variable, newValue);

    return [value, newValue];
  }
}

export { Interpreter };
