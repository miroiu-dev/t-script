import type { ExpressionVisitor } from '../../visitors/expressionVisitor';
import { Expression } from './expression';

class Grouping extends Expression {
  constructor(public expression: Expression) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitGroupingExpression(this);
  }
}

export { Grouping };
