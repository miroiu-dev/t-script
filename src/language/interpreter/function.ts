import type { Func } from '../parser/statements';
import type { Callable } from './callable';
import type { Interpreter } from './interpreter';

import { Environment } from './environment';

class TScriptFunction implements Callable {
  constructor(private declaration: Func) {}

  arity(): number {
    throw new Error('Method not implemented.');
  }

  call(interpreter: Interpreter, args: unknown[]): unknown {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      const paramName = this.declaration.params[i];

      if (paramName === undefined) {
        // TODO: this might not be necessary
        throw new Error('Parameter name is not defined.');
      }

      environment.define(paramName.text, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);

    return null;
  }

  toString(): string {
    return `<fn ${this.declaration.name.text}>`;
  }
}

export { TScriptFunction };
