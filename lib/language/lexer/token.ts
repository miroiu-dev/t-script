import { TokenType } from './tokenType';

class Token {
  constructor(
    public type: TokenType,
    public text: string,
    public literal: unknown,
    public line: number,
    public column: number,
    public length: number
  ) {}
}

export { Token };
