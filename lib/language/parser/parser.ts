import { Token, TokenType } from '@t-script/lexer';
import { ParseError } from './errors';

import * as Stmt from '@t-script/statements';
import * as Expr from '@t-script/expressions';

class Parser {
  private current = 0;
  constructor(private tokens: Token[]) {}

  public parse(): Stmt.Statement[] {
    const statements: Stmt.Statement[] = [];

    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  private declaration(): Stmt.Statement {
    if (this.match(TokenType.FUN)) {
      return this.func('function');
    }

    if (this.match(TokenType.VAR)) {
      return this.varDeclaration();
    }

    return this.statement();
  }

  private func(kind: string): Stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);

    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);

    const parameters: Token[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (parameters.length >= 255) {
          throw new ParseError("Can't have more than 255 parameters.");
        }

        parameters.push(
          this.consume(TokenType.IDENTIFIER, 'Expect parameter name.')
        );
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

    const body = this.block();

    return new Stmt.Func(name, parameters, body);
  }

  private varDeclaration(): Stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');
    let initializer: Expr.Expression | null = null;

    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Stmt.Var(name, initializer);
  }

  private statement(): Stmt.Statement {
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }
    if (this.match(TokenType.FOR)) {
      return this.forStatement();
    }

    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }

    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      return new Stmt.Block(this.block());
    }

    return this.expressionStatement();
  }

  private returnStatement(): Stmt.Statement {
    const keyword = this.previous();
    let value: Expr.Expression | null = null;

    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");

    return new Stmt.Return(keyword, value);
  }

  private forStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

    let initializer: Stmt.Statement | null;

    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr.Expression | null = null;

    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

    let increment: Expr.Expression | null = null;

    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = this.statement();

    if (increment !== null) {
      body = new Stmt.Block([body, new Stmt.Expression(increment)]);
    }

    if (condition === null) condition = new Expr.Literal(true);
    body = new Stmt.While(condition, body);

    if (initializer !== null) {
      body = new Stmt.Block([initializer, body]);
    }

    return body;
  }

  private whileStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
    const body = this.statement();

    return new Stmt.While(condition, body);
  }

  private ifStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");
    const thenBranch = this.statement();

    if (this.match(TokenType.ELSE)) {
      const elseBranch = this.statement();

      return new Stmt.If(condition, thenBranch, elseBranch);
    }

    return new Stmt.If(condition, thenBranch);
  }

  private block(): Stmt.Statement[] {
    const statements: Stmt.Statement[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private expressionStatement(): Stmt.Statement {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Stmt.Expression(expr);
  }

  private expression(): Expr.Expression {
    return this.assignment();
  }

  private assignment(): Expr.Expression {
    const expression = this.ternary();

    if (this.match(TokenType.EQUAL)) {
      // const equals = this.previous();
      const value = this.assignment();

      if (expression instanceof Expr.Variable) {
        const name = expression.name;
        return new Expr.Assignment(name, value);
      }

      throw new Error('Invalid assignment target.');
    }

    return expression;
  }

  private ternary(): Expr.Expression {
    let expression = this.or();

    if (this.match(TokenType.QUESTION_MARK)) {
      const thenBranch = this.expression();
      this.consume(TokenType.COLON, "Expect ':' after then branch of ternary");
      const elseBranch = this.ternary();

      expression = new Expr.Ternary(expression, thenBranch, elseBranch);
    }

    return expression;
  }

  private or(): Expr.Expression {
    let expression = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();

      expression = new Expr.Logical(expression, operator, right);
    }

    return expression;
  }

  private and(): Expr.Expression {
    let expression = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();

      expression = new Expr.Logical(expression, operator, right);
    }

    return expression;
  }

  private equality(): Expr.Expression {
    let expression = this.bitwise();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.bitwise();

      expression = new Expr.Binary(expression, operator, right);
    }

    return expression;
  }

  private bitwise(): Expr.Expression {
    let expression = this.comparison();

    while (this.match(TokenType.AMPERSAND, TokenType.PIPE)) {
      const operator = this.previous();
      const right = this.comparison();

      expression = new Expr.Binary(expression, operator, right);
    }

    return expression;
  }

  private comparison(): Expr.Expression {
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

      expression = new Expr.Binary(expression, operator, right);
    }

    return expression;
  }

  private term(): Expr.Expression {
    let expression = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();

      expression = new Expr.Binary(expression, operator, right);
    }

    return expression;
  }

  private factor(): Expr.Expression {
    let expression = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();

      expression = new Expr.Binary(expression, operator, right);
    }

    return expression;
  }

  private unary(): Expr.Expression {
    if (this.match(TokenType.PLUS_PLUS, TokenType.MINUS_MINUS)) {
      const operator = this.previous();
      const right = this.unary();

      if (!(right instanceof Expr.Variable)) {
        throw new ParseError(
          'Invalid left-hand side in prefix expression target.'
        );
      }

      return new Expr.Prefix(right.name, operator);
    }

    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();

      return new Expr.Unary(operator, right);
    }

    return this.postfix();
  }

  private postfix(): Expr.Expression {
    let expression = this.call();

    if (this.match(TokenType.PLUS_PLUS, TokenType.MINUS_MINUS)) {
      const operator = this.previous();

      if (!(expression instanceof Expr.Variable)) {
        throw new ParseError(
          'Invalid right-hand side in postfix expression target.'
        );
      }

      const name = expression.name;
      expression = new Expr.Postfix(name, operator);
    }

    return expression;
  }

  private call(): Expr.Expression {
    let expression = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expression = this.finishCall(expression);
      } else {
        break;
      }
    }

    return expression;
  }

  private primary(): Expr.Expression {
    if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
    if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
    if (this.match(TokenType.NULL)) return new Expr.Literal(null);
    if (this.match(TokenType.IDENTIFIER)) {
      const previousToken = this.previous();
      return new Expr.Variable(previousToken);
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      const previousToken = this.previous();
      return new Expr.Literal(previousToken.literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after");

      return new Expr.Grouping(expression);
    }

    throw new ParseError('Expect');
  }

  private finishCall(callee: Expr.Expression): Expr.Expression {
    const args: Expr.Expression[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      // this should not throw an error, but consume and keep on
      if (args.length >= 255) {
        throw new ParseError("Can't have more than 255 arguments.");
      }

      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const token = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after arguments."
    );

    return new Expr.Call(callee, token, args);
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
