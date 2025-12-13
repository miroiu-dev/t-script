import { Token, TokenType } from '@t-script/language/lexer';
import { ParseError } from './errors';
import {
  Binary,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Variable,
  type Expression,
} from './expressions';
import { ExpressionStatement, Var, type Statement } from './statements';
import { Assignment } from './expressions/assignment';

class Parser {
  private current = 0;
  constructor(private tokens: Token[]) {}

  public parse(): Statement[] {
    const statements: Statement[] = [];

    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  private declaration(): Statement {
    if (this.match(TokenType.VAR)) {
      return this.varDeclaration();
    }

    return this.statement();
  }

  private varDeclaration(): Statement {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');
    let initializer: Expression | null = null;

    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Var(name, initializer);
  }

  private statement(): Statement {
    return this.expressionStatement();
  }

  private expressionStatement(): Statement {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new ExpressionStatement(expr);
  }

  private expression(): Expression {
    return this.assignment();
  }

  private assignment(): Expression {
    const expression = this.ternary();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expression instanceof Variable) {
        const name = expression.name;
        return new Assignment(name, value);
      }

      throw new Error('Invalid assignment target.');
    }

    return expression;
  }

  private ternary(): Expression {
    let expression = this.equality();

    if (this.match(TokenType.QUESTION_MARK)) {
      const thenBranch = this.expression();
      this.consume(TokenType.COLON, "Expect ':' after then branch of ternary");
      const elseBranch = this.ternary();

      expression = new Ternary(expression, thenBranch, elseBranch);
    }

    return expression;
  }

  private equality(): Expression {
    let expression = this.bitwise();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.bitwise();

      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private bitwise(): Expression {
    let expression = this.comparison();

    while (this.match(TokenType.AMPERSAND, TokenType.PIPE)) {
      const operator = this.previous();
      const right = this.comparison();

      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private comparison(): Expression {
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

      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private term(): Expression {
    let expression = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();

      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private factor(): Expression {
    let expression = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();

      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private unary(): Expression {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();

      return new Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expression {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NULL)) return new Literal(null);
    if (this.match(TokenType.IDENTIFIER)) {
      const previousToken = this.previous();
      return new Variable(previousToken);
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      const previousToken = this.previous();
      return new Literal(previousToken.literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after");

      return new Grouping(expression);
    }

    throw new ParseError('Expect');
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
