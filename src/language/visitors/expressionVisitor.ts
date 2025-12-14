import type {
  Binary,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Variable,
  Assignment,
  Logical,
  Call,
  Postfix,
  Prefix,
} from '@t-script/expressions';

interface ExpressionVisitor<T> {
  visitBinaryExpression(expression: Binary): T;
  visitGroupingExpression(expression: Grouping): T;
  visitLiteralExpression(expression: Literal): T;
  visitUnaryExpression(expression: Unary): T;
  visitTernaryExpression(expression: Ternary): T;
  visitVariableExpression(expression: Variable): T;
  visitAssignmentExpression(expression: Assignment): T;
  visitLogicalExpression(expression: Logical): T;
  visitCallExpression(expression: Call): T;
  visitPostfixExpression(expression: Postfix): T;
  visitPrefixExpression(expression: Prefix): T;
}

export type { ExpressionVisitor };
