import type { StatementVisitor } from '@t-script/language/visitors';
import { Statement } from './statement';

class Block extends Statement {
  constructor(public statements: Statement[]) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitBlockStatement(this);
  }
}

export { Block };
