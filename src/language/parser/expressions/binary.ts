import type { Token } from '@t-script/language/lexer';
import { Expression } from './expression';
import type { ExpressionVisitor } from '../../visitors/expressionVisitor';

class Binary extends Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

export { Binary };
