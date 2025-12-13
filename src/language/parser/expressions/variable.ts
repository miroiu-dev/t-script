import type { Token } from '@t-script/lexer';
import type { ExpressionVisitor } from '@t-script/visitors';

import { Expression } from './expression';

class Variable extends Expression {
  constructor(public name: Token) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitVariableExpression(this);
  }
}

export { Variable };
