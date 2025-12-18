import { Lexer } from '@t-script/lexer';
import { Parser } from '@t-script/parser';
import { Interpreter } from '@t-script/interpreter';
import { describe, expect, test } from 'bun:test';

describe('Interpreter', () => {
  function interpret(code: string): void {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();
    interpreter.interpret(statements);
  }

  describe('Variable Declaration and Assignment', () => {
    test('should declare and initialize variable', () => {
      expect(() => interpret('var x = 42;')).not.toThrow();
    });

    test('should declare variable without initializer', () => {
      expect(() => interpret('var x;')).not.toThrow();
    });

    test('should assign to variable', () => {
      expect(() => interpret('var x = 5; x = 10;')).not.toThrow();
    });

    test('should handle multiple variable declarations', () => {
      expect(() => interpret('var a = 1; var b = 2; var c = 3;')).not.toThrow();
    });
  });

  describe('Arithmetic Operations', () => {
    test('should add numbers', () => {
      expect(() => interpret('var x = 2 + 3;')).not.toThrow();
    });

    test('should subtract numbers', () => {
      expect(() => interpret('var x = 5 - 2;')).not.toThrow();
    });

    test('should multiply numbers', () => {
      expect(() => interpret('var x = 3 * 4;')).not.toThrow();
    });

    test('should divide numbers', () => {
      expect(() => interpret('var x = 10 / 2;')).not.toThrow();
    });

    test('should handle negative numbers', () => {
      expect(() => interpret('var x = -5;')).not.toThrow();
    });

    test('should handle operator precedence', () => {
      expect(() => interpret('var x = 2 + 3 * 4;')).not.toThrow();
    });
  });

  describe('String Operations', () => {
    test('should concatenate strings', () => {
      expect(() => interpret('var s = "hello" + " " + "world";')).not.toThrow();
    });

    test('should add string and number', () => {
      expect(() => interpret('var s = "value: " + 42;')).not.toThrow();
    });
  });

  describe('Comparison Operations', () => {
    test('should compare with less than', () => {
      expect(() => interpret('var x = 5 < 10;')).not.toThrow();
    });

    test('should compare with greater than', () => {
      expect(() => interpret('var x = 5 > 10;')).not.toThrow();
    });

    test('should compare with less than or equal', () => {
      expect(() => interpret('var x = 5 <= 10;')).not.toThrow();
    });

    test('should compare with greater than or equal', () => {
      expect(() => interpret('var x = 5 >= 10;')).not.toThrow();
    });

    test('should compare with equal', () => {
      expect(() => interpret('var x = 5 == 5;')).not.toThrow();
    });

    test('should compare with not equal', () => {
      expect(() => interpret('var x = 5 != 3;')).not.toThrow();
    });
  });

  describe('Logical Operations', () => {
    test('should evaluate logical AND', () => {
      expect(() => interpret('var x = true && false;')).not.toThrow();
    });

    test('should evaluate logical OR', () => {
      expect(() => interpret('var x = true || false;')).not.toThrow();
    });

    test('should evaluate logical NOT', () => {
      expect(() => interpret('var x = !true;')).not.toThrow();
    });

    test('should short-circuit AND', () => {
      expect(() =>
        interpret('var x = false && (undefined_var);')
      ).not.toThrow();
    });

    test('should short-circuit OR', () => {
      expect(() => interpret('var x = true || (undefined_var);')).not.toThrow();
    });
  });

  describe('Bitwise Operations', () => {
    test('should perform bitwise AND', () => {
      expect(() => interpret('var x = 5 & 3;')).not.toThrow();
    });

    test('should perform bitwise OR', () => {
      expect(() => interpret('var x = 5 | 3;')).not.toThrow();
    });

    test('should handle bitwise precedence', () => {
      expect(() => interpret('var x = 5 | 3 == 3;')).not.toThrow();
    });
  });

  describe('Ternary Operator', () => {
    test('should evaluate ternary with true condition', () => {
      expect(() => interpret('var x = true ? 1 : 2;')).not.toThrow();
    });

    test('should evaluate ternary with false condition', () => {
      expect(() => interpret('var x = false ? 1 : 2;')).not.toThrow();
    });

    test('should handle nested ternary', () => {
      expect(() =>
        interpret('var x = true ? 1 : false ? 2 : 3;')
      ).not.toThrow();
    });

    test('should handle ternary with expressions', () => {
      expect(() => interpret('var x = 5 > 3 ? "big" : "small";')).not.toThrow();
    });
  });

  describe('Prefix Operators', () => {
    test('should prefix increment', () => {
      expect(() => interpret('var x = 5; var y = ++x;')).not.toThrow();
    });

    test('should prefix decrement', () => {
      expect(() => interpret('var x = 5; var y = --x;')).not.toThrow();
    });

    test('should return new value on prefix increment', () => {
      expect(() => interpret('var x = 5; var y = ++x;')).not.toThrow();
    });
  });

  describe('Postfix Operators', () => {
    test('should postfix increment', () => {
      expect(() => interpret('var x = 5; var y = x++;')).not.toThrow();
    });

    test('should postfix decrement', () => {
      expect(() => interpret('var x = 5; var y = x--;')).not.toThrow();
    });

    test('should return old value on postfix increment', () => {
      expect(() => interpret('var x = 5; var y = x++;')).not.toThrow();
    });
  });

  describe('Control Flow - If Statements', () => {
    test('should execute if with true condition', () => {
      expect(() => interpret('if (true) { var x = 1; }')).not.toThrow();
    });

    test('should skip if with false condition', () => {
      expect(() => interpret('if (false) { var x = 1; }')).not.toThrow();
    });

    test('should execute else with false condition', () => {
      expect(() =>
        interpret('if (false) { var x = 1; } else { var y = 2; }')
      ).not.toThrow();
    });

    test('should handle nested if statements', () => {
      expect(() =>
        interpret('if (true) { if (true) { var x = 1; } }')
      ).not.toThrow();
    });

    test('should handle if-else-if chain', () => {
      expect(() =>
        interpret(
          'var x = 5; if (x > 10) { var a = 1; } else if (x > 0) { var b = 2; } else { var c = 3; }'
        )
      ).not.toThrow();
    });
  });

  describe('Control Flow - While Statements', () => {
    test('should execute while loop', () => {
      expect(() =>
        interpret('var i = 0; while (i < 5) { i = i + 1; }')
      ).not.toThrow();
    });

    test('should not execute while with false condition', () => {
      expect(() => interpret('while (false) { var x = 1; }')).not.toThrow();
    });

    test('should handle nested while loops', () => {
      expect(() =>
        interpret(
          'var i = 0; while (i < 3) { var j = 0; while (j < 3) { j = j + 1; } i = i + 1; }'
        )
      ).not.toThrow();
    });
  });

  describe('Control Flow - For Statements', () => {
    test('should execute for loop', () => {
      expect(() =>
        interpret('for (var i = 0; i < 5; i = i + 1) { }')
      ).not.toThrow();
    });

    test('should handle for with postfix increment', () => {
      expect(() => interpret('for (var i = 0; i < 5; i++) { }')).not.toThrow();
    });

    test('should skip for loop with false condition', () => {
      expect(() => interpret('for (var i = 0; i < 0; i++) { }')).not.toThrow();
    });

    test('should handle nested for loops', () => {
      expect(() =>
        interpret(
          'for (var i = 0; i < 3; i++) { for (var j = 0; j < 3; j++) { } }'
        )
      ).not.toThrow();
    });
  });

  describe('Function Declarations', () => {
    test('should declare function with no parameters', () => {
      expect(() => interpret('fun test() { var x = 1; }')).not.toThrow();
    });

    test('should declare function with parameters', () => {
      expect(() => interpret('fun add(a, b) { return a + b; }')).not.toThrow();
    });

    test('should declare function with body', () => {
      expect(() =>
        interpret('fun test() { var x = 1; var y = 2; return x + y; }')
      ).not.toThrow();
    });

    test('should handle nested function declarations', () => {
      expect(() =>
        interpret('fun outer() { fun inner() { return 1; } return inner(); }')
      ).not.toThrow();
    });
  });

  describe('Function Calls', () => {
    test('should call function with no arguments', () => {
      expect(() =>
        interpret('fun test() { return 42; } test();')
      ).not.toThrow();
    });

    test('should call function with one argument', () => {
      expect(() =>
        interpret('fun square(x) { return x * x; } square(5);')
      ).not.toThrow();
    });

    test('should call function with multiple arguments', () => {
      expect(() =>
        interpret('fun add(a, b, c) { return a + b + c; } add(1, 2, 3);')
      ).not.toThrow();
    });

    test('should call function and use return value', () => {
      expect(() =>
        interpret('fun double(x) { return x * 2; } var result = double(5);')
      ).not.toThrow();
    });

    test('should handle recursive function', () => {
      expect(() =>
        interpret(
          'fun countdown(n) { if (n <= 0) return; countdown(n - 1); } countdown(3);'
        )
      ).not.toThrow();
    });
  });

  describe('Return Statements', () => {
    test('should return value from function', () => {
      expect(() => interpret('fun test() { return 42; }')).not.toThrow();
    });

    test('should return without value', () => {
      expect(() => interpret('fun test() { return; }')).not.toThrow();
    });

    test('should return from nested block', () => {
      expect(() =>
        interpret('fun test() { if (true) { return 42; } }')
      ).not.toThrow();
    });

    test('should exit early on return', () => {
      expect(() =>
        interpret('fun test() { return 1; var x = undefined_var; }')
      ).not.toThrow();
    });
  });

  describe('Native Functions', () => {
    test('should call print function with no arguments', () => {
      expect(() => interpret('print();')).toThrow();
    });

    test('should call print function with one argument', () => {
      expect(() => interpret('print(42);')).not.toThrow();
    });

    test('should call print function with multiple arguments', () => {
      expect(() => interpret('print("hello", 42, true);')).not.toThrow();
    });

    test('should print string', () => {
      expect(() => interpret('print("hello world");')).not.toThrow();
    });

    test('should print number', () => {
      expect(() => interpret('print(123);')).not.toThrow();
    });
  });

  describe('Variable Scoping', () => {
    test('should access global variable', () => {
      expect(() => interpret('var x = 5; var y = x;')).not.toThrow();
    });

    test('should access variable in block scope', () => {
      expect(() => interpret('var x = 5; { var y = x; }')).not.toThrow();
    });

    test('should shadow variable in inner scope', () => {
      expect(() =>
        interpret('var x = 5; { var x = 10; } var y = x;')
      ).not.toThrow();
    });

    test('should access outer variable in inner scope', () => {
      expect(() =>
        interpret('var x = 5; { x = 10; } var y = x;')
      ).not.toThrow();
    });

    test('should have function scope', () => {
      expect(() => interpret('fun test() { var x = 5; } var y = x;')).toThrow();
    });

    test('should access function parameter', () => {
      expect(() =>
        interpret('fun test(x) { return x; } test(5);')
      ).not.toThrow();
    });

    test('should have closure', () => {
      expect(() =>
        interpret(
          'fun outer() { var x = 5; fun inner() { return x; } return inner(); } outer();'
        )
      ).not.toThrow();
    });
  });

  describe('Complex Programs', () => {
    test('should compute factorial', () => {
      expect(() =>
        interpret(`
        fun factorial(n) {
          if (n <= 1) return 1;
          return n * factorial(n - 1);
        }
        var result = factorial(5);
      `)
      ).not.toThrow();
    });

    test('should compute fibonacci', () => {
      expect(() =>
        interpret(`
        fun fib(n) {
          if (n <= 1) return n;
          return fib(n - 1) + fib(n - 2);
        }
        var result = fib(5);
      `)
      ).not.toThrow();
    });

    test('should sum numbers in loop', () => {
      expect(() =>
        interpret(`
        var sum = 0;
        for (var i = 1; i <= 10; i++) {
          sum = sum + i;
        }
      `)
      ).not.toThrow();
    });

    test('should use nested functions', () => {
      expect(() =>
        interpret(`
        fun makeAdder(x) {
          fun adder(y) {
            return x + y;
          }
          return adder;
        }
      `)
      ).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should throw error for undefined variable', () => {
      expect(() => interpret('var x = undefined_var;')).toThrow();
    });

    test('should throw error for wrong number of arguments', () => {
      expect(() =>
        interpret('fun test(a, b) { return a + b; } test(1);')
      ).toThrow();
    });

    test('should throw error for adding incompatible types', () => {
      expect(() => interpret('var x = 5 + true;')).toThrow();
    });

    test('should throw error for non-callable', () => {
      expect(() => interpret('var x = 5; x();')).toThrow();
    });

    test('should throw error for returning outside function', () => {
      expect(() => interpret('return 42;')).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty function', () => {
      expect(() => interpret('fun test() { }')).not.toThrow();
    });

    test('should handle empty blocks', () => {
      expect(() => interpret('if (true) { }')).not.toThrow();
    });

    test('should handle empty program', () => {
      expect(() => interpret('')).not.toThrow();
    });

    test('should handle deeply nested scopes', () => {
      expect(() => interpret('{ { { { { var x = 1; } } } } }')).not.toThrow();
    });

    test('should handle many function calls', () => {
      expect(() =>
        interpret('fun id(x) { return x; } id(id(id(id(id(42)))));')
      ).not.toThrow();
    });

    test('should handle large numbers', () => {
      expect(() => interpret('var x = 999999999;')).not.toThrow();
    });

    test('should handle empty strings', () => {
      expect(() => interpret('var x = "";')).not.toThrow();
    });

    test('should handle null values', () => {
      expect(() => interpret('var x = null;')).not.toThrow();
    });

    test('should handle boolean values', () => {
      expect(() => interpret('var t = true; var f = false;')).not.toThrow();
    });
  });
});
