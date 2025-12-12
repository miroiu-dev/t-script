import * as Expression from './parser/expressions';

interface Visitor<T> {
  visitBinaryExpression(expression: Expression.Binary): T;
  visitGroupingExpression(expression: Expression.Grouping): T;
  visitLiteralExpression(expression: Expression.Literal): T;
  visitUnaryExpression(expression: Expression.Unary): T;
}

export type { Visitor };
