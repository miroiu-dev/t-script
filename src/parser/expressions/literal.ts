import type { Visitor } from '../visitor';
import { Expression } from './expression';

class Literal extends Expression {
  constructor(public value: unknown) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpression(this);
  }
}

export { Literal };
