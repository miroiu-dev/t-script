import type { Func } from '@t-script/statements';
import type { Callable } from './callable';
import type { Interpreter } from './interpreter';

import { Environment } from './environment';
import { Return } from './errors';

class TScriptFunction implements Callable {
  constructor(
    private readonly declaration: Func,
    private readonly closure: Environment
  ) {}

  arity(): number {
    throw new Error('Method not implemented.');
  }

  call(interpreter: Interpreter, args: unknown[]): unknown {
    const environment = new Environment(this.closure);

    for (let i = 0; i < this.declaration.params.length; i++) {
      const paramName = this.declaration.params[i];

      if (paramName === undefined) {
        // TODO: this might not be necessary
        throw new Error('Parameter name is not defined.');
      }

      environment.define(paramName.text, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      return (returnValue as Return).value;
    }

    return null;
  }

  toString(): string {
    return `<fn ${this.declaration.name.text}>`;
  }
}

export { TScriptFunction };
