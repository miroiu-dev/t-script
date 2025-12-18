import type { ExpressionVisitor } from '@t-script/visitors';
import type { Token } from '@t-script/lexer';

import { Expression } from './expression';

class Postfix extends Expression {
  constructor(
    public variable: Token,
    public operator: Token
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitPostfixExpression(this);
  }
}

export { Postfix };
