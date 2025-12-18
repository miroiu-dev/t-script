import { type Interpreter } from '@t-script/interpreter';
import { Callable } from '../callable';

class Print extends Callable {
  arity(): number {
    return -1;
  }

  call(_: Interpreter, args: unknown[]): unknown {
    if (args.length === 0) {
      throw new Error('print expects at least one argument.');
    }

    console.log(...args);

    return null;
  }
}

export { Print };
