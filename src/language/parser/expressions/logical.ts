import type { Token } from '@t-script/language/lexer';
import type { ExpressionVisitor } from '@t-script/language/visitors';
import { Expression } from './expression';

class Logical extends Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitLogicalExpression(this);
  }
}

export { Logical };
