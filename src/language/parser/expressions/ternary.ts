import type { ExpressionVisitor } from '@t-script/visitors';

import { Expression } from './expression';

class Ternary extends Expression {
  constructor(
    public condition: Expression,
    public thenBranch: Expression,
    public elseBranch: Expression
  ) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitTernaryExpression(this);
  }
}

export { Ternary };
