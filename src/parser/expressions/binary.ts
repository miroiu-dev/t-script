import type { Token } from '@t-script/lexer';
import { Expression } from './expression';
import type { Visitor } from '../visitor';

class Binary extends Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression
  ) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

export { Binary };
