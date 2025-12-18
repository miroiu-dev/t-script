import type { StatementVisitor } from '@t-script/visitors';

abstract class Statement {
  abstract accept<T>(visitor: StatementVisitor<T>): T;
}

export { Statement };
