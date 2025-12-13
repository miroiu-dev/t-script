import { Token, TokenType } from '@t-script/language/lexer';
import type {
  Binary,
  Grouping,
  Literal,
  Unary,
  Ternary,
  Expression,
  Variable,
  Assignment,
  Logical,
} from '@t-script/language/parser/expressions';
import type {
  ExpressionVisitor,
  StatementVisitor,
} from '@t-script/language/visitors';
import type {
  Block,
  ExpressionStatement,
  If,
  Statement,
  Var,
  While,
} from '@t-script/language/parser/statements';
import { RuntimeError } from './errors';
import { Environment } from './environment';

class Interpreter
  implements ExpressionVisitor<unknown>, StatementVisitor<void>
{
  private environment = new Environment();

  public interpret(statements: Statement[]): void {
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

  public visitExpressionStatement(statement: ExpressionStatement): void {
    this.evaluate(statement.expression);
  }

  public visitVariableExpression(expression: Variable): unknown {
    return this.environment.get(expression.name);
  }

  public visitAssignmentExpression(expression: Assignment): unknown {
    const value = this.evaluate(expression.value);
    this.environment.assign(expression.name, value);

    return value;
  }

  public visitVarStatement(statement: Var): void {
    let value: unknown = null;

    if (statement.initializer !== null) {
      value = this.evaluate(statement.initializer);
    }

    this.environment.define(statement.name.text, value);
  }

  public visitIfStatement(statement: If): void {
    const condition = this.evaluate(statement.condition);

    if (this.isTruthy(condition)) {
      this.execute(statement.thenBranch);
    } else if (statement.elseBranch !== null) {
      this.execute(statement.elseBranch);
    }
  }

  public visitBlockStatement(statement: Block): void {
    this.executeBlock(statement.statements, new Environment(this.environment));
  }

  private executeBlock(
    statements: Statement[],
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

  public visitLogicalExpression(expression: Logical): unknown {
    const left = this.evaluate(expression.left);

    if (expression.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expression.right);
  }

  public visitWhileStatement(statement: While): void {
    while (this.isTruthy(this.evaluate(statement.condition))) {
      this.execute(statement.body);
    }
  }

  public visitBinaryExpression(expression: Binary): unknown {
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

  public visitGroupingExpression(expression: Grouping): unknown {
    return this.evaluate(expression.expression);
  }

  public visitLiteralExpression(expression: Literal): unknown {
    return expression.value;
  }

  public visitUnaryExpression(expression: Unary): unknown {
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

  public visitTernaryExpression(expression: Ternary): unknown {
    const condition = this.evaluate(expression.condition);

    if (this.isTruthy(condition)) {
      return this.evaluate(expression.thenBranch);
    } else {
      return this.evaluate(expression.elseBranch);
    }
  }

  private evaluate(expression: Expression): unknown {
    return expression.accept(this);
  }

  private execute(statement: Statement): unknown {
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

  private assertNumber(operator: Token, operand: unknown) {
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
}

export { Interpreter };
