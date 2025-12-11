import type { Visitor } from '../visitor';
import { Expression } from './expression';

class Grouping extends Expression {
  constructor(public expression: Expression) {
    super();
  }

  override accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpression(this);
  }
}

export { Grouping };
