import type { Token } from '@t-script/language/lexer';
import { Expression } from './expression';
import type { ExpressionVisitor } from '@t-script/language/visitors';

class Variable extends Expression {
  constructor(public name: Token) {
    super();
  }

  override accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitVariableExpression(this);
  }
}

export { Variable };
