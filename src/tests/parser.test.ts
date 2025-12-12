import { AstPrinter, Parser } from '@t-script/language/parser';
import { describe, expect, test } from 'bun:test';
import * as Expression from '@t-script/language/parser/expressions';
import { Lexer, Token, TokenType } from '@t-script/language/lexer';

describe('parser', () => {
  test('print ast tree', () => {
    const printer = new AstPrinter();

    const ast = new Expression.Binary(
      new Expression.Unary(
        new Token(TokenType.MINUS, '-', null, 1, 1, 1),
        new Expression.Literal(123)
      ),
      new Token(TokenType.STAR, '*', null, 1, 5, 1),
      new Expression.Grouping(new Expression.Literal(45.67))
    );

    const result = printer.print(ast);
    expect(result).toBe('(* (- 123) (group 45.67))');
  });

  test('should handle equality check', () => {
    const lexer = new Lexer('1 == 1');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.EQUAL_EQUAL);
    expect(binary.left).toBeInstanceOf(Expression.Literal);
    expect(binary.right).toBeInstanceOf(Expression.Literal);
    expect((binary.left as Expression.Literal).value).toBe(1);
    expect((binary.right as Expression.Literal).value).toBe(1);
  });

  test('should handle basic arithmetic operations', () => {
    const lexer = new Lexer('2 + 3 * 4');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.PLUS);
    expect(binary.left).toBeInstanceOf(Expression.Literal);
    expect((binary.left as Expression.Literal).value).toBe(2);
    expect(binary.right).toBeInstanceOf(Expression.Binary);

    const rightBinary = binary.right as Expression.Binary;
    expect(rightBinary.operator.type).toBe(TokenType.STAR);
    expect((rightBinary.left as Expression.Literal).value).toBe(3);
    expect((rightBinary.right as Expression.Literal).value).toBe(4);
  });

  test('should handle subtraction and division', () => {
    const lexer = new Lexer('10 - 6 / 2');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.MINUS);
    expect(binary.left).toBeInstanceOf(Expression.Literal);
    expect((binary.left as Expression.Literal).value).toBe(10);
    expect(binary.right).toBeInstanceOf(Expression.Binary);

    const rightBinary = binary.right as Expression.Binary;
    expect(rightBinary.operator.type).toBe(TokenType.SLASH);
    expect((rightBinary.left as Expression.Literal).value).toBe(6);
    expect((rightBinary.right as Expression.Literal).value).toBe(2);
  });

  test('should handle grouped expressions', () => {
    const lexer = new Lexer('(2 + 3) * 4');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.STAR);
    expect(binary.left).toBeInstanceOf(Expression.Grouping);
    expect(binary.right).toBeInstanceOf(Expression.Literal);
    expect((binary.right as Expression.Literal).value).toBe(4);

    const grouping = binary.left as Expression.Grouping;
    expect(grouping.expression).toBeInstanceOf(Expression.Binary);
    const groupedBinary = grouping.expression as Expression.Binary;
    expect(groupedBinary.operator.type).toBe(TokenType.PLUS);
    expect((groupedBinary.left as Expression.Literal).value).toBe(2);
    expect((groupedBinary.right as Expression.Literal).value).toBe(3);
  });

  test('should handle unary operators', () => {
    const lexer = new Lexer('-5 + 3');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.PLUS);
    expect(binary.left).toBeInstanceOf(Expression.Unary);
    expect(binary.right).toBeInstanceOf(Expression.Literal);
    expect((binary.right as Expression.Literal).value).toBe(3);

    const unary = binary.left as Expression.Unary;
    expect(unary.operator.type).toBe(TokenType.MINUS);
    expect(unary.right).toBeInstanceOf(Expression.Literal);
    expect((unary.right as Expression.Literal).value).toBe(5);
  });

  test('should handle negation operator', () => {
    const lexer = new Lexer('!true');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Unary);

    const unary = ast as Expression.Unary;
    expect(unary.operator.type).toBe(TokenType.BANG);
    expect(unary.right).toBeInstanceOf(Expression.Literal);
    expect((unary.right as Expression.Literal).value).toBe(true);
  });

  test('should handle comparison operators', () => {
    const cases = [
      { input: '5 > 3', expectedOp: TokenType.GREATER, left: 5, right: 3 },
      { input: '2 < 7', expectedOp: TokenType.LESS, left: 2, right: 7 },
      {
        input: '4 >= 4',
        expectedOp: TokenType.GREATER_EQUAL,
        left: 4,
        right: 4,
      },
      { input: '3 <= 5', expectedOp: TokenType.LESS_EQUAL, left: 3, right: 5 },
      { input: '1 != 2', expectedOp: TokenType.BANG_EQUAL, left: 1, right: 2 },
    ];

    cases.forEach(({ input, expectedOp, left, right }) => {
      const lexer = new Lexer(input);
      const tokens = lexer.lex();
      const parser = new Parser(tokens);

      const ast = parser.parse();
      expect(ast).toBeTruthy();
      expect(ast).toBeInstanceOf(Expression.Binary);

      const binary = ast as Expression.Binary;
      expect(binary.operator.type).toBe(expectedOp);
      expect(binary.left).toBeInstanceOf(Expression.Literal);
      expect(binary.right).toBeInstanceOf(Expression.Literal);
      expect((binary.left as Expression.Literal).value).toBe(left);
      expect((binary.right as Expression.Literal).value).toBe(right);
    });
  });

  test('should handle string literals', () => {
    const lexer = new Lexer('"hello" + "world"');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.PLUS);
    expect(binary.left).toBeInstanceOf(Expression.Literal);
    expect(binary.right).toBeInstanceOf(Expression.Literal);
    expect((binary.left as Expression.Literal).value).toBe('hello');
    expect((binary.right as Expression.Literal).value).toBe('world');
  });

  test('should handle decimal numbers', () => {
    const lexer = new Lexer('3.14 * 2.5');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const binary = ast as Expression.Binary;
    expect(binary.operator.type).toBe(TokenType.STAR);
    expect(binary.left).toBeInstanceOf(Expression.Literal);
    expect(binary.right).toBeInstanceOf(Expression.Literal);
    expect((binary.left as Expression.Literal).value).toBe(3.14);
    expect((binary.right as Expression.Literal).value).toBe(2.5);
  });

  test('should handle complex nested expressions', () => {
    const lexer = new Lexer('(1 + 2) * (3 - 4) / 5');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Binary);

    const divBinary = ast as Expression.Binary;
    expect(divBinary.operator.type).toBe(TokenType.SLASH);
    expect(divBinary.left).toBeInstanceOf(Expression.Binary);
    expect(divBinary.right).toBeInstanceOf(Expression.Literal);
    expect((divBinary.right as Expression.Literal).value).toBe(5);

    const mulBinary = divBinary.left as Expression.Binary;
    expect(mulBinary.operator.type).toBe(TokenType.STAR);
    expect(mulBinary.left).toBeInstanceOf(Expression.Grouping);
    expect(mulBinary.right).toBeInstanceOf(Expression.Grouping);
  });

  test('should handle boolean literals', () => {
    const trueLexer = new Lexer('true');
    const trueTokens = trueLexer.lex();
    const trueParser = new Parser(trueTokens);
    const trueAst = trueParser.parse();
    expect(trueAst).toBeTruthy();
    expect(trueAst).toBeInstanceOf(Expression.Literal);
    expect((trueAst as Expression.Literal).value).toBe(true);

    const falseLexer = new Lexer('false');
    const falseTokens = falseLexer.lex();
    const falseParser = new Parser(falseTokens);
    const falseAst = falseParser.parse();
    expect(falseAst).toBeTruthy();
    expect(falseAst).toBeInstanceOf(Expression.Literal);
    expect((falseAst as Expression.Literal).value).toBe(false);

    const compLexer = new Lexer('true == false');
    const compTokens = compLexer.lex();
    const compParser = new Parser(compTokens);
    const compAst = compParser.parse();
    expect(compAst).toBeTruthy();
    expect(compAst).toBeInstanceOf(Expression.Binary);
    const compBinary = compAst as Expression.Binary;
    expect(compBinary.operator.type).toBe(TokenType.EQUAL_EQUAL);
    expect((compBinary.left as Expression.Literal).value).toBe(true);
    expect((compBinary.right as Expression.Literal).value).toBe(false);
  });

  test('should handle operator precedence correctly', () => {
    // Test: 1 + 2 * 3 should be parsed as 1 + (2 * 3)
    const lexer1 = new Lexer('1 + 2 * 3');
    const tokens1 = lexer1.lex();
    const parser1 = new Parser(tokens1);
    const ast1 = parser1.parse();
    expect(ast1).toBeInstanceOf(Expression.Binary);
    const binary1 = ast1 as Expression.Binary;
    expect(binary1.operator.type).toBe(TokenType.PLUS);
    expect((binary1.left as Expression.Literal).value).toBe(1);
    expect(binary1.right).toBeInstanceOf(Expression.Binary);
    const rightBinary1 = binary1.right as Expression.Binary;
    expect(rightBinary1.operator.type).toBe(TokenType.STAR);

    // Test: 1 * 2 + 3 should be parsed as (1 * 2) + 3
    const lexer2 = new Lexer('1 * 2 + 3');
    const tokens2 = lexer2.lex();
    const parser2 = new Parser(tokens2);
    const ast2 = parser2.parse();
    expect(ast2).toBeInstanceOf(Expression.Binary);
    const binary2 = ast2 as Expression.Binary;
    expect(binary2.operator.type).toBe(TokenType.PLUS);
    expect(binary2.left).toBeInstanceOf(Expression.Binary);
    const leftBinary2 = binary2.left as Expression.Binary;
    expect(leftBinary2.operator.type).toBe(TokenType.STAR);
    expect((binary2.right as Expression.Literal).value).toBe(3);

    // Test: 1 + 2 == 3 should be parsed as (1 + 2) == 3
    const lexer3 = new Lexer('1 + 2 == 3');
    const tokens3 = lexer3.lex();
    const parser3 = new Parser(tokens3);
    const ast3 = parser3.parse();
    expect(ast3).toBeInstanceOf(Expression.Binary);
    const binary3 = ast3 as Expression.Binary;
    expect(binary3.operator.type).toBe(TokenType.EQUAL_EQUAL);
    expect(binary3.left).toBeInstanceOf(Expression.Binary);
    expect((binary3.right as Expression.Literal).value).toBe(3);
  });

  test('should handle ternary operator', () => {
    const lexer = new Lexer('1 == 2 ? true : false');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Ternary);

    const ternary = ast as Expression.Ternary;
    expect(ternary.condition).toBeInstanceOf(Expression.Binary);
    expect(ternary.thenBranch).toBeInstanceOf(Expression.Literal);
    expect(ternary.elseBranch).toBeInstanceOf(Expression.Literal);
    expect((ternary.thenBranch as Expression.Literal).value).toBe(true);
    expect((ternary.elseBranch as Expression.Literal).value).toBe(false);

    const condition = ternary.condition as Expression.Binary;
    expect(condition.operator.type).toBe(TokenType.EQUAL_EQUAL);
    expect((condition.left as Expression.Literal).value).toBe(1);
    expect((condition.right as Expression.Literal).value).toBe(2);
  });

  test('should handle nested ternary operators', () => {
    const lexer = new Lexer('1 == 2 ? true : 3 == 4 ? false : null');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(Expression.Ternary);

    const outerTernary = ast as Expression.Ternary;
    expect(outerTernary.condition).toBeInstanceOf(Expression.Binary);
    expect(outerTernary.thenBranch).toBeInstanceOf(Expression.Literal);
    expect(outerTernary.elseBranch).toBeInstanceOf(Expression.Ternary);
    expect((outerTernary.thenBranch as Expression.Literal).value).toBe(true);

    const innerTernary = outerTernary.elseBranch as Expression.Ternary;
    expect(innerTernary.condition).toBeInstanceOf(Expression.Binary);
    expect(innerTernary.thenBranch).toBeInstanceOf(Expression.Literal);
    expect(innerTernary.elseBranch).toBeInstanceOf(Expression.Literal);
    expect((innerTernary.thenBranch as Expression.Literal).value).toBe(false);
    expect((innerTernary.elseBranch as Expression.Literal).value).toBe(null);
  });
});
