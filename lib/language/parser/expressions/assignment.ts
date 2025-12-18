import type { ExpressionVisitor } from '@t-script/visitors';
import type { Token } from '@t-script/lexer';

import { Expression } from './expression';

class Assignment extends Expression {
  constructor(
    public name: Token,
    public value: Expression
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitAssignmentExpression(this);
  }
}

export { Assignment };
