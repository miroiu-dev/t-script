import type { StatementVisitor } from '@t-script/language/visitors';
import { Statement } from './statement';
import type { Expression } from '../expressions';

export class ExpressionStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }

  override accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}
