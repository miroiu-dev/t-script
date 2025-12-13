import type { StatementVisitor } from '@t-script/language/visitors';
import type { Expression } from '../expressions';
import { Statement } from './statement';

class If extends Statement {
  constructor(
    public condition: Expression,
    public thenBranch: Statement,
    public elseBranch: Statement | null = null
  ) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitIfStatement(this);
  }
}

export { If };
