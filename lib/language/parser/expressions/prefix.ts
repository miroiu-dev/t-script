import type { Token } from '@t-script/lexer';
import type { ExpressionVisitor } from '@t-script/visitors';

import { Expression } from './expression';

class Prefix extends Expression {
  constructor(
    public variable: Token,
    public operator: Token
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitPrefixExpression(this);
  }
}

export { Prefix };
