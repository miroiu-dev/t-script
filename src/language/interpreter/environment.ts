import type { Token } from '../lexer';
import { RuntimeError } from './errors';

class Environment {
  public enclosing: Environment | null = null;
  private values = new Map<string, unknown>();

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
  }

  public get(name: Token): unknown {
    if (this.values.has(name.text)) {
      return this.values.get(name.text);
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, "Undefined variable '" + name.text + "'.");
  }

  public assign(name: Token, value: unknown): void {
    if (this.values.has(name.text)) {
      this.values.set(name.text, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.text + "'.");
  }

  public define(name: string, value: unknown): void {
    this.values.set(name, value);
  }
}

export { Environment };
