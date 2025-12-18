import * as Expr from '@t-script/expressions';
import { Lexer } from '@t-script/lexer';
import { Parser } from '@t-script/parser';
import * as Stmt from '@t-script/statements';
import { describe, expect, test } from 'bun:test';

describe('Parser', () => {
  function parse(code: string): Stmt.Statement[] {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
  }

  describe('Variable Declarations', () => {
    test('should parse variable declaration', () => {
      const statements = parse('var x = 5;');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Var).toBe(true);
      const varStmt = statements[0] as Stmt.Var;
      expect(varStmt.name.text).toBe('x');
      expect(varStmt.initializer instanceof Expr.Literal).toBe(true);
    });

    test('should parse const declaration', () => {
      const statements = parse('const y = 10;');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Var).toBe(true);
    });

    test('should parse variable without initializer', () => {
      const statements = parse('var z;');
      expect(statements).toHaveLength(1);
      const varStmt = statements[0] as Stmt.Var;
      expect(varStmt.initializer).toBeNull();
    });

    test('should parse multiple variable declarations', () => {
      const statements = parse('var a = 1; var b = 2; var c = 3;');
      expect(statements).toHaveLength(3);
      expect(statements[0] instanceof Stmt.Var).toBe(true);
      expect(statements[1] instanceof Stmt.Var).toBe(true);
      expect(statements[2] instanceof Stmt.Var).toBe(true);
    });
  });

  describe('Expression Statements', () => {
    test('should parse expression statement', () => {
      const statements = parse('42;');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Expression).toBe(true);
    });

    test('should parse assignment expression statement', () => {
      const statements = parse('x = 5;');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Expression).toBe(true);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Assignment).toBe(true);
    });

    test('should parse binary expression statement', () => {
      const statements = parse('2 + 3;');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Expression).toBe(true);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Binary).toBe(true);
    });
  });

  describe('Block Statements', () => {
    test('should parse empty block', () => {
      const statements = parse('{}');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Block).toBe(true);
      const block = statements[0] as Stmt.Block;
      expect(block.statements).toHaveLength(0);
    });

    test('should parse block with statements', () => {
      const statements = parse('{ var x = 1; x = 2; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Block).toBe(true);
      const block = statements[0] as Stmt.Block;
      expect(block.statements).toHaveLength(2);
    });

    test('should parse nested blocks', () => {
      const statements = parse('{ { x = 1; } }');
      expect(statements).toHaveLength(1);
      const block = statements[0] as Stmt.Block;
      expect(block.statements).toHaveLength(1);
      expect(block.statements[0] instanceof Stmt.Block).toBe(true);
    });
  });

  describe('If Statements', () => {
    test('should parse if without else', () => {
      const statements = parse('if (true) { x = 1; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.If).toBe(true);
      const ifStmt = statements[0] as Stmt.If;
      expect(ifStmt.thenBranch instanceof Stmt.Block).toBe(true);
      expect(ifStmt.elseBranch).toBeNull();
    });

    test('should parse if with else', () => {
      const statements = parse('if (x > 5) { y = 1; } else { y = 2; }');
      expect(statements).toHaveLength(1);
      const ifStmt = statements[0] as Stmt.If;
      expect(ifStmt.thenBranch instanceof Stmt.Block).toBe(true);
      expect(ifStmt.elseBranch instanceof Stmt.Block).toBe(true);
    });

    test('should parse if with condition expression', () => {
      const statements = parse('if (x == 5) { print("five"); }');
      expect(statements).toHaveLength(1);
      const ifStmt = statements[0] as Stmt.If;
      expect(ifStmt.condition instanceof Expr.Binary).toBe(true);
    });

    test('should parse if-else-if chain', () => {
      const statements = parse(
        'if (x > 5) { a = 1; } else if (x > 0) { a = 2; } else { a = 3; }'
      );
      expect(statements).toHaveLength(1);
      const ifStmt = statements[0] as Stmt.If;
      expect(ifStmt.elseBranch instanceof Stmt.If).toBe(true);
    });
  });

  describe('While Statements', () => {
    test('should parse while statement', () => {
      const statements = parse('while (x > 0) { x = x - 1; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.While).toBe(true);
      const whileStmt = statements[0] as Stmt.While;
      expect(whileStmt.condition instanceof Expr.Binary).toBe(true);
    });

    test('should parse while with simple condition', () => {
      const statements = parse('while (true) { break; }');
      expect(statements).toHaveLength(1);
      const whileStmt = statements[0] as Stmt.While;
      expect(whileStmt.condition instanceof Expr.Literal).toBe(true);
    });

    test('should parse while with complex body', () => {
      const statements = parse(
        'while (i < 10) { var j = 0; j = i * 2; i = i + 1; }'
      );
      expect(statements).toHaveLength(1);
      const whileStmt = statements[0] as Stmt.While;
      expect(whileStmt.body instanceof Stmt.Block).toBe(true);
    });
  });

  describe('For Statements', () => {
    test('should parse for with all parts', () => {
      const statements = parse(
        'for (var i = 0; i < 10; i = i + 1) { print(i); }'
      );
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Block).toBe(true);
    });

    test('should parse for without initializer', () => {
      const statements = parse('for (; i < 10; i = i + 1) { x = 1; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Block).toBe(true);
    });

    test('should parse for without condition', () => {
      const statements = parse('for (i = 0; ; i = i + 1) { x = 1; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Block).toBe(true);
    });

    test('should parse for without increment', () => {
      const statements = parse('for (i = 0; i < 10; ) { x = 1; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Block).toBe(true);
    });
  });

  describe('Function Declarations', () => {
    test('should parse function declaration', () => {
      const statements = parse('fun add(a, b) { return a + b; }');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Func).toBe(true);
      const funcStmt = statements[0] as Stmt.Func;
      expect(funcStmt.name.text).toBe('add');
      expect(funcStmt.params).toHaveLength(2);
    });

    test('should parse function with no parameters', () => {
      const statements = parse('fun greet() { print("hello"); }');
      expect(statements).toHaveLength(1);
      const funcStmt = statements[0] as Stmt.Func;
      expect(funcStmt.params).toHaveLength(0);
    });

    test('should parse function with single parameter', () => {
      const statements = parse('fun square(x) { return x * x; }');
      expect(statements).toHaveLength(1);
      const funcStmt = statements[0] as Stmt.Func;
      expect(funcStmt.params).toHaveLength(1);
      expect(funcStmt.params[0]?.text).toBe('x');
    });

    test('should parse function with multiple parameters', () => {
      const statements = parse('fun concat(a, b, c) { return a + b + c; }');
      expect(statements).toHaveLength(1);
      const funcStmt = statements[0] as Stmt.Func;
      expect(funcStmt.params).toHaveLength(3);
    });

    test('should parse nested functions', () => {
      const statements = parse(
        'fun outer() { fun inner() { return 1; } return inner(); }'
      );
      expect(statements).toHaveLength(1);
      const outerFunc = statements[0] as Stmt.Func;
      expect(outerFunc.body).toHaveLength(2);
      expect(outerFunc.body[0] instanceof Stmt.Func).toBe(true);
    });
  });

  describe('Return Statements', () => {
    test('should parse return with value', () => {
      const statements = parse('fun test() { return 42; }');
      expect(statements).toHaveLength(1);
      const funcStmt = statements[0] as Stmt.Func;
      expect(funcStmt.body[0] instanceof Stmt.Return).toBe(true);
    });

    test('should parse return without value', () => {
      const statements = parse('fun test() { return; }');
      expect(statements).toHaveLength(1);
      const funcStmt = statements[0] as Stmt.Func;
      const returnStmt = funcStmt.body[0] as Stmt.Return;
      expect(returnStmt.value).toBeNull();
    });

    test('should parse return with expression', () => {
      const statements = parse('fun test() { return a + b; }');
      expect(statements).toHaveLength(1);
      const funcStmt = statements[0] as Stmt.Func;
      const returnStmt = funcStmt.body[0] as Stmt.Return;
      expect(returnStmt.value instanceof Expr.Binary).toBe(true);
    });
  });

  describe('Complex Programs', () => {
    test('should parse factorial function', () => {
      const statements = parse(`
        fun factorial(n) {
          if (n <= 1) return 1;
          return n * factorial(n - 1);
        }
      `);
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Func).toBe(true);
    });

    test('should parse multiple statements', () => {
      const statements = parse(`
        var x = 10;
        while (x > 0) {
          print(x);
          x = x - 1;
        }
        var result = 0;
      `);
      expect(statements).toHaveLength(3);
      expect(statements[0] instanceof Stmt.Var).toBe(true);
      expect(statements[1] instanceof Stmt.While).toBe(true);
      expect(statements[2] instanceof Stmt.Var).toBe(true);
    });

    test('should parse mixed statements', () => {
      const statements = parse(`
        var x = 5;
        var y = 10;
        if (x < y) {
          print(x);
        }
        fun add(a, b) {
          return a + b;
        }
      `);
      expect(statements).toHaveLength(4);
    });
  });

  describe('Expression Parsing', () => {
    test('should parse literals', () => {
      const statements = parse('42; "hello"; true; null;');
      expect(statements).toHaveLength(4);
      expect(statements[0] instanceof Stmt.Expression).toBe(true);
      expect(
        (statements[0] as Stmt.Expression).expression instanceof Expr.Literal
      ).toBe(true);
    });

    test('should parse variable expression', () => {
      const statements = parse('x;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Variable).toBe(true);
    });

    test('should parse binary expression', () => {
      const statements = parse('2 + 3;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Binary).toBe(true);
    });

    test('should parse ternary expression', () => {
      const statements = parse('x > 5 ? 1 : 2;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Ternary).toBe(true);
    });

    test('should parse logical AND', () => {
      const statements = parse('x > 0 && y < 10;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Logical).toBe(true);
    });

    test('should parse logical OR', () => {
      const statements = parse('x == 0 || y == 0;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Logical).toBe(true);
    });

    test('should parse function call', () => {
      const statements = parse('print("hello");');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Call).toBe(true);
    });

    test('should parse grouping', () => {
      const statements = parse('(2 + 3) * 4;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Binary).toBe(true);
    });
  });

  describe('Operator Precedence', () => {
    test('should respect multiplication over addition', () => {
      const statements = parse('2 + 3 * 4;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      const binary = exprStmt.expression as Expr.Binary;
      expect(binary.right instanceof Expr.Binary).toBe(true);
    });

    test('should respect ternary over assignment', () => {
      const statements = parse('x = y > 5 ? 1 : 2;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      const assignment = exprStmt.expression as Expr.Assignment;
      expect(assignment.value instanceof Expr.Ternary).toBe(true);
    });

    test('should right-associate assignment', () => {
      const statements = parse('x = y = 5;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      const assignment = exprStmt.expression as Expr.Assignment;
      expect(assignment.value instanceof Expr.Assignment).toBe(true);
    });
  });

  describe('Unary and Postfix Operators', () => {
    test('should parse unary negation', () => {
      const statements = parse('-x;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Unary).toBe(true);
    });

    test('should parse logical NOT', () => {
      const statements = parse('!x;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Unary).toBe(true);
    });

    test('should parse prefix increment', () => {
      const statements = parse('++x;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Prefix).toBe(true);
    });

    test('should parse postfix increment', () => {
      const statements = parse('x++;');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Postfix).toBe(true);
    });
  });

  describe('Function Calls', () => {
    test('should parse call with no args', () => {
      const statements = parse('foo();');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      const call = exprStmt.expression as Expr.Call;
      expect(call.args).toHaveLength(0);
    });

    test('should parse call with one arg', () => {
      const statements = parse('foo(1);');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      const call = exprStmt.expression as Expr.Call;
      expect(call.args).toHaveLength(1);
    });

    test('should parse call with multiple args', () => {
      const statements = parse('foo(1, 2, 3);');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      const call = exprStmt.expression as Expr.Call;
      expect(call.args).toHaveLength(3);
    });

    test('should parse chained calls', () => {
      const statements = parse('foo()(1)(2);');
      expect(statements).toHaveLength(1);
      const exprStmt = statements[0] as Stmt.Expression;
      expect(exprStmt.expression instanceof Expr.Call).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should parse empty program', () => {
      const statements = parse('');
      expect(statements).toHaveLength(0);
    });

    test('should parse single statement', () => {
      const statements = parse('42;');
      expect(statements).toHaveLength(1);
    });

    test('should parse deeply nested expressions', () => {
      const statements = parse('((((42))));');
      expect(statements).toHaveLength(1);
      expect(statements[0] instanceof Stmt.Expression).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw for missing semicolon', () => {
      expect(() => parse('var x = 5')).toThrow();
    });

    test('should throw for invalid statement', () => {
      expect(() => parse('123 456;')).toThrow();
    });

    test('should throw for unclosed brace', () => {
      expect(() => parse('{ x = 1;')).toThrow();
    });

    test('should throw for unclosed parenthesis', () => {
      expect(() => parse('foo(1, 2;')).toThrow();
    });

    test('should throw for missing function body', () => {
      expect(() => parse('fun test()')).toThrow();
    });
  });
});
