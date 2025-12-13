import type { Interpreter } from './interpreter';

interface Callable {
  arity(): number;
  call(interpreter: Interpreter, args: unknown[]): unknown;
}

export type { Callable };
