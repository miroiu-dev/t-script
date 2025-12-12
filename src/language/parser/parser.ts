import { Token, TokenType } from '@t-script/language/lexer';
import * as Expression from '@t-script/language/parser/expressions';
import { ParseError } from './errors';

class Parser {
  private current = 0;
  constructor(private tokens: Token[]) {}

  public parse(): Expression.Expr | null {
    try {
      return this.expression();
    } catch (error) {
      if (error instanceof ParseError) {
        console.error(error.message);
        return null;
      }

      return null;
    }
  }

  private expression(): Expression.Expr {
    return this.equality();
  }

  private equality(): Expression.Expr {
    let expression = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();

      expression = new Expression.Binary(expression, operator, right);
    }

    return expression;
  }

  private comparison(): Expression.Expr {
    let expression = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();

      expression = new Expression.Binary(expression, operator, right);
    }

    return expression;
  }

  private term(): Expression.Expr {
    let expression = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();

      expression = new Expression.Binary(expression, operator, right);
    }

    return expression;
  }

  private factor(): Expression.Expr {
    let expression = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();

      expression = new Expression.Binary(expression, operator, right);
    }

    return expression;
  }

  private unary(): Expression.Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();

      return new Expression.Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expression.Expr {
    if (this.match(TokenType.FALSE)) return new Expression.Literal(false);
    if (this.match(TokenType.TRUE)) return new Expression.Literal(true);
    if (this.match(TokenType.NULL)) return new Expression.Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      const previousToken = this.previous();
      return new Expression.Literal(previousToken.literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");

      return new Expression.Grouping(expression);
    }

    throw new ParseError('Expect expression.');
  }

  private synchonize(): void {
    this.next();

    while (!this.isAtEnd()) {
      const previousToken = this.previous();
      const currentToken = this.peek();

      if (previousToken.type === TokenType.SEMICOLON) {
        return;
      }

      switch (currentToken.type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.CONST:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.RETURN:
          return;
      }

      this.next();
    }
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.next();

    const currentToken = this.peek();
    throw new ParseError(message + 'failed' + currentToken.text);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.next();

        return true;
      }
    }

    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;

    const currentToken = this.peek();
    return currentToken.type === type;
  }

  private peek(): Token {
    const currentToken = this.tokens[this.current];
    if (!currentToken) throw new Error('No more tokens available');

    return currentToken;
  }

  private next(): Token {
    if (!this.isAtEnd()) this.current++;

    return this.previous();
  }

  private previous(): Token {
    const previousToken = this.tokens[this.current - 1];
    if (!previousToken) throw new Error('No more tokens available');

    return previousToken;
  }

  private isAtEnd(): boolean {
    const currentToken = this.peek();
    return currentToken.type === TokenType.EOF;
  }
}

export { Parser };
