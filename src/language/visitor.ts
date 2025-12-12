import type {
  Binary,
  Grouping,
  Literal,
  Ternary,
  Unary,
} from '@t-script/language/parser/expressions';

interface Visitor<T> {
  visitBinaryExpression(expression: Binary): T;
  visitGroupingExpression(expression: Grouping): T;
  visitLiteralExpression(expression: Literal): T;
  visitUnaryExpression(expression: Unary): T;
  visitTernaryExpression(expression: Ternary): T;
}

export type { Visitor };
