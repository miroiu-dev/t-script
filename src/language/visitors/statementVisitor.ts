import type {
  ExpressionStatement,
  Var,
} from '@t-script/language/parser/statements';

interface StatementVisitor<T> {
  visitExpressionStatement(statement: ExpressionStatement): T;
  visitVarStatement(statement: Var): T;
}

export type { StatementVisitor };
