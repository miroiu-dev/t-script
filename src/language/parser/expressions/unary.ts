import { Expression } from './expression';
import type { Token } from '@t-script/language/lexer';
import type { Visitor } from '../../visitor';

class Unary extends Expression {
  constructor(
    public operator: Token,
    public right: Expression
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}

export { Unary };
