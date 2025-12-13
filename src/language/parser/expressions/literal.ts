import type { ExpressionVisitor } from '@t-script/visitors';

import { Expression } from './expression';

class Literal extends Expression {
  constructor(public value: unknown) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitLiteralExpression(this);
  }
}

export { Literal };
