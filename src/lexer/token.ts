import { TokenType } from './tokenType';

class Token {
  constructor(
    public line: number,
    public column: number,
    public length: number,
    public type: TokenType,
    public literal: unknown,
    public text: string
  ) {}
}

export { Token };
