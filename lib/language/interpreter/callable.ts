import type { Interpreter } from './interpreter';

abstract class Callable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: unknown[]): unknown;
}

export { Callable };
