import type { Token } from '@t-script/language/lexer';

class RuntimeError extends Error {
  constructor(
    public token: Token,
    message: string
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}

export { RuntimeError };
