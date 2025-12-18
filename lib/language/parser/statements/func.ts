import type { Token } from '@t-script/lexer';
import type { StatementVisitor } from '@t-script/visitors';

import { Statement } from './statement';

class Func extends Statement {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Statement[]
  ) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitFunctionStatement(this);
  }
}

export { Func };
