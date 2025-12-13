import type { ExpressionVisitor } from '@t-script/visitors';

abstract class Expression {
  abstract accept<T>(visitor: ExpressionVisitor<T>): T;
}

export { Expression };
