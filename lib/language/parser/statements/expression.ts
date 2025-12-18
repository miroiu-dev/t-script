import type { StatementVisitor } from '@t-script/visitors';

import { Statement } from './statement';
import { Expression as Expr } from '@t-script/expressions';

class Expression extends Statement {
  constructor(public expression: Expr) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}

export { Expression };
