import type {
  Block,
  ExpressionStatement,
  If,
  Var,
  While,
} from '@t-script/language/parser/statements';

interface StatementVisitor<T> {
  visitExpressionStatement(statement: ExpressionStatement): T;
  visitVarStatement(statement: Var): T;
  visitBlockStatement(statement: Block): T;
  visitIfStatement(statement: If): T;
  visitWhileStatement(statement: While): T;
}

export type { StatementVisitor };
