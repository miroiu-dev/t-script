import type { Token } from '@t-script/lexer';
import type { ExpressionVisitor } from '@t-script/visitors';

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
