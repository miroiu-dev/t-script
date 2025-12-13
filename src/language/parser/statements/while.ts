import type { StatementVisitor } from '@t-script/language/visitors';
import type { Expression } from '../expressions';
import { Statement } from './statement';

class While extends Statement {
  constructor(
    public condition: Expression,
    public body: Statement
  ) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitWhileStatement(this);
  }
}

export { While };
