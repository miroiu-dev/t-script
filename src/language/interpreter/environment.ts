import type { Token } from '../lexer';
import { RuntimeError } from './errors';

class Environment {
  private values = new Map<string, unknown>();

  public get(name: Token): unknown {
    if (this.values.has(name.text)) {
      return this.values.get(name.text);
    }

    throw new RuntimeError(name, "Undefined variable '" + name.text + "'.");
  }

  public assign(name: Token, value: unknown): void {
    if (this.values.has(name.text)) {
      this.values.set(name.text, value);
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.text + "'.");
  }

  public define(name: string, value: unknown): void {
    this.values.set(name, value);
  }
}

export { Environment };
