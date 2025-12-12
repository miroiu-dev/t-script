import {
  Binary,
  Expression,
  Grouping,
  Literal,
  Ternary,
  Unary,
} from './expressions';
import type { Visitor } from '../visitor';

class AstPrinter implements Visitor<string> {
  visitTernaryExpression(expression: Ternary): string {
    return this.parenthesize(
      '?:',
      expression.condition,
      expression.thenBranch,
      expression.elseBranch
    );
  }
  print(expression: Expression): string {
    return expression.accept(this);
  }

  visitBinaryExpression(expression: Binary): string {
    return this.parenthesize(
      expression.operator.text,
      expression.left,
      expression.right
    );
  }

  visitGroupingExpression(expression: Grouping): string {
    return this.parenthesize('group', expression.expression);
  }

  visitLiteralExpression(expression: Literal): string {
    if (expression.value === null || expression.value === undefined) {
      return 'null';
    }

    return expression.value.toString();
  }

  visitUnaryExpression(expression: Unary): string {
    return this.parenthesize(expression.operator.text, expression.right);
  }

  private parenthesize(name: string, ...expressions: Expression[]): string {
    let log = `(${name}`;

    for (const expr of expressions) {
      log += ` ${expr.accept(this)}`;
    }

    log += ')';
    return log;
  }
}

export { AstPrinter };
