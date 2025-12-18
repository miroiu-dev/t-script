import type { Expression } from '@t-script/expressions';
import type { StatementVisitor } from '@t-script/visitors';

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
