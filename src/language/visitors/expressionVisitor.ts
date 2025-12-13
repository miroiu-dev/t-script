import type {
  Binary,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Variable,
  Assignment,
  Logical,
} from '@t-script/language/parser/expressions';

interface ExpressionVisitor<T> {
  visitBinaryExpression(expression: Binary): T;
  visitGroupingExpression(expression: Grouping): T;
  visitLiteralExpression(expression: Literal): T;
  visitUnaryExpression(expression: Unary): T;
  visitTernaryExpression(expression: Ternary): T;
  visitVariableExpression(expression: Variable): T;
  visitAssignmentExpression(expression: Assignment): T;
  visitLogicalExpression(expression: Logical): T;
}

export type { ExpressionVisitor };
