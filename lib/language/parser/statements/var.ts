import type { Expression } from '@t-script/expressions';
import type { Token } from '@t-script/lexer';
import type { StatementVisitor } from '@t-script/visitors';

import { Statement } from './statement';

class Var extends Statement {
  constructor(
    public name: Token,
    public initializer: Expression | null
  ) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitVarStatement(this);
  }
}

export { Var };
