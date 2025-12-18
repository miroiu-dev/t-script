import type {
  Block,
  Expression,
  Func,
  If,
  Return,
  Var,
  While,
} from '@t-script/statements';

interface StatementVisitor<T> {
  visitExpressionStatement(statement: Expression): T;
  visitVarStatement(statement: Var): T;
  visitBlockStatement(statement: Block): T;
  visitIfStatement(statement: If): T;
  visitWhileStatement(statement: While): T;
  visitFunctionStatement(statement: Func): T;
  visitReturnStatement(statement: Return): T;
}

export type { StatementVisitor };
