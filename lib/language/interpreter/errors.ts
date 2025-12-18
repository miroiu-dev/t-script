import type { Token } from '@t-script/lexer';

class RuntimeError extends Error {
  constructor(
    public token: Token | null,
    message: string
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}

class Return extends RuntimeError {
  constructor(public value: unknown) {
    super(null, '');
    this.name = 'Return';
    this.value = value;
  }
}

export { Return, RuntimeError };
