import type { Token } from '@t-script/lexer';
import type { ExpressionVisitor } from '@t-script/visitors';

import { Expression } from './expression';

class Call extends Expression {
  constructor(
    public calle: Expression,
    public paren: Token,
    public args: Expression[]
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitCallExpression(this);
  }
}

export { Call };
