import type { ExpressionVisitor } from '../../visitors/expressionVisitor';

abstract class Expression {
  abstract accept<T>(visitor: ExpressionVisitor<T>): T;
}

export { Expression };
