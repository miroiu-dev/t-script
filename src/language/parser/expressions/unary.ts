import { Expression } from './expression';
import type { Token } from '@t-script/language/lexer';
import type { ExpressionVisitor } from '../../visitors/expressionVisitor';

class Unary extends Expression {
  constructor(
    public operator: Token,
    public right: Expression
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}

export { Unary };
