import { LexerError } from './errors';
import {
  isAlpha,
  isAlphaNumeric,
  isBackslash,
  isDigit,
  isHexDigit,
  isNewLine,
} from './helpers';
import { InputStream } from './inputStream';
import { keywords } from './keywords';
import { Token } from './token';
import { TokenType } from './tokenType';

//TODO: better errors

class Lexer {
  private start = 0;
  private tokens: Token[] = [];
  private source: InputStream;

  constructor(source: string) {
    this.source = new InputStream(source);
  }

  /**
   * Lexes the input source code and returns an array of tokens.
   * @return {Token[]} An array of tokens representing the lexed source code.
   */
  public lex(): Token[] {
    while (!this.source.eof()) {
      this.start = this.source.position;
      this.scanToken();
    }

    this.addToken(TokenType.EOF);

    return this.tokens;
  }

  private scanToken() {
    const character = this.source.next();

    switch (character) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '[':
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case ']':
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '?':
        this.addToken(TokenType.QUESTION_MARK);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '/': {
        const matchesBackslash = this.source.match('/');
        const matchesStar = this.source.match('*');

        if (matchesBackslash) {
          this.consumeSingleLineComment();
          break;
        }

        if (matchesStar) {
          this.consumeMultiLineComment();
          break;
        }

        this.addToken(TokenType.SLASH);

        break;
      }
      case '!': {
        const matchesEquals = this.source.match('=');
        this.addToken(matchesEquals ? TokenType.BANG_EQUAL : TokenType.BANG);

        break;
      }
      case '>': {
        const matchesEquals = this.source.match('=');
        this.addToken(
          matchesEquals ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );

        break;
      }
      case '<': {
        const matchesEquals = this.source.match('=');
        this.addToken(matchesEquals ? TokenType.LESS_EQUAL : TokenType.LESS);

        break;
      }
      case '=': {
        const matchesEquals = this.source.match('=');
        this.addToken(matchesEquals ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);

        break;
      }
      case '&': {
        const matchesAmpersand = this.source.match('&');
        this.addToken(matchesAmpersand ? TokenType.AND : TokenType.AMPERSAND);

        break;
      }
      case '|': {
        const matchesPipe = this.source.match('|');
        this.addToken(matchesPipe ? TokenType.OR : TokenType.PIPE);

        break;
      }
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.source.line++;
        this.source.column = 0;
        break;
      case '"': {
        const stringLiteral = this.consumeString();
        this.addToken(TokenType.STRING, stringLiteral);

        break;
      }
      default: {
        if (isDigit(character)) {
          const numberLiteral = this.consumeNumber();
          this.addToken(TokenType.NUMBER, numberLiteral);

          break;
        }

        if (isAlpha(character)) {
          const type = this.consumeIdentifierOrKeyword();
          this.addToken(type);

          break;
        }

        throw new LexerError(character, this.source.line, this.source.column);
      }
    }
  }

  private addToken(type: TokenType, literal: unknown = null) {
    const isEndOfFile = type === TokenType.EOF;
    const text =
      isEndOfFile ? '\0' : (
        this.source.extractText(this.start, this.source.position)
      );

    const token = new Token(
      type,
      text,
      literal,
      this.source.line,
      this.source.column,
      text.length
    );

    this.tokens.push(token);
  }

  private consumeString(): string {
    let literal = '';

    while (this.source.peek() !== '"' && !this.source.eof()) {
      if (isBackslash(this.source.peek())) {
        this.source.next(); // consume the backslash

        switch (this.source.peek()) {
          case 'n':
            literal += '\n';
            break;
          case 't':
            literal += '\t';
            break;
          case 'r':
            literal += '\r';
            break;
          case '"':
            literal += '"';
            break;
          case '\\':
            literal += '\\';
            break;
          case '0':
            literal += '\0';
            break;
          case 'u': {
            // Unicode escape sequence: \uXXXX
            this.source.next(); // consume 'u'

            const hexDigits = this.consumeHexDigits(4);
            const codePoint = parseInt(hexDigits, 16);

            literal += String.fromCharCode(codePoint);

            continue;
          }
          case 'x': {
            // Hex escape sequence: \xXX
            this.source.next(); // consume 'x'

            const hexDigits = this.consumeHexDigits(2);
            const codePoint = parseInt(hexDigits, 16);

            literal += String.fromCharCode(codePoint);

            continue;
          }
          default:
            throw new LexerError(
              `Invalid escape sequence.`,
              this.source.line,
              this.source.column
            );
        }

        this.source.next(); // consume the escaped character
        continue;
      }

      if (isNewLine(this.source.peek())) {
        this.source.line++;
        this.source.column = 0;
      }

      literal += this.source.next();
    }

    if (this.source.eof()) {
      throw new LexerError(
        'Unterminated string.',
        this.source.line,
        this.source.column
      );
    }

    this.source.next(); // Consume the closing "

    return literal;
  }

  private consumeIdentifierOrKeyword(): TokenType {
    while (isAlphaNumeric(this.source.peek())) {
      this.source.next();
    }

    const text = this.source.extractText(this.start, this.source.position);
    const keyword = keywords[text];

    return keyword ?? TokenType.IDENTIFIER;
  }

  private consumeNumber(): number {
    while (isDigit(this.source.peek())) {
      this.source.next();
    }

    if (this.source.peek() === '.' && isDigit(this.source.peekNext())) {
      this.source.next();

      while (isDigit(this.source.peek())) {
        this.source.next();
      }
    }

    const literal = this.source.extractText(this.start, this.source.position);

    return Number(literal);
  }

  private consumeSingleLineComment(): void {
    while (!isNewLine(this.source.peek()) && !this.source.eof()) {
      this.source.next();
    }
  }

  private consumeMultiLineComment(): void {
    while (!this.source.eof()) {
      const matchesStar = this.source.match('*');
      const matchesSlash = this.source.match('/');

      if (matchesStar && matchesSlash) {
        return;
      }

      this.source.next();
    }

    if (this.source.eof()) {
      throw new LexerError(
        'Unterminated multi-line comment.',
        this.source.line,
        this.source.column
      );
    }
  }

  private consumeHexDigits(take: number): string {
    let hexDigits = '';

    for (let start = 0; start < take; start++) {
      const character = this.source.peek();

      if (!isHexDigit(character)) {
        throw new LexerError(
          'Invalid Unicode escape sequence.',
          this.source.line,
          this.source.column
        );
      }

      hexDigits += this.source.next();
    }

    return hexDigits;
  }
}

export { Lexer };
