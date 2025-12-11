import type * as Expression from './expressions';
import type { Visitor } from './visitor';

class AstPrinter implements Visitor<string> {
  print(expression: Expression.Expr): string {
    return expression.accept(this);
  }

  visitBinaryExpression(expression: Expression.Binary): string {
    return this.parenthesize(
      expression.operator.text,
      expression.left,
      expression.right
    );
  }

  visitGroupingExpression(expression: Expression.Grouping): string {
    return this.parenthesize('group', expression.expression);
  }

  visitLiteralExpression(expression: Expression.Literal): string {
    if (expression.value === null || expression.value === undefined) {
      return 'null';
    }

    return expression.value.toString();
  }

  visitUnaryExpression(expression: Expression.Unary): string {
    return this.parenthesize(expression.operator.text, expression.right);
  }

  private parenthesize(
    name: string,
    ...expressions: Expression.Expr[]
  ): string {
    let log = `(${name}`;

    for (const expr of expressions) {
      log += ` ${expr.accept(this)}`;
    }

    log += ')';
    return log;
  }
}

export { AstPrinter };
