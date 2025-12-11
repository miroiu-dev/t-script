import type { Visitor } from '../visitor';

abstract class Expression {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export { Expression };
