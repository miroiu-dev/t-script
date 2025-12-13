import type { StatementVisitor } from '@t-script/visitors';
import type { Expression } from '@t-script/expressions';
import type { Token } from '@t-script/lexer';

import { Statement } from './statement';

class Return extends Statement {
  constructor(
    public keyword: Token,
    public value: Expression | null
  ) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitReturnStatement(this);
  }
}

export { Return };
