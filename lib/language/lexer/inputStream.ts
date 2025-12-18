import { isNewLine } from './helpers';

/**
 * A stream-based input processor for parsing text character by character.
 * Provides functionality to navigate through text while tracking line and column positions.
 */
class InputStream {
  public line = 1;
  public column = 0;
  private _position = 0;

  get position() {
    return this._position;
  }

  private set position(value: number) {
    this._position = value;
  }
  /**
   * * Creates a new input stream for the given text.
   * @param text - the input text to be processed
   */
  constructor(private text: string) {}

  /**
   * Extracts a portion of the input text between the specified positions.
   * This method provides direct access to the underlying text without affecting
   * the current stream position or line/column tracking.
   *
   * @param start - The starting index (inclusive, 0-based)
   * @param end - The ending index (exclusive, 0-based)
   * @returns The extracted substring from the input text
   */
  public extractText(start: number, end: number): string {
    return this.text.substring(start, end);
  }

  /**
   * Peeks at the current character without advancing the position.
   * @returns The current character at the position, or null character if EOF
   */
  public peek(): string {
    if (this.eof()) return '\0';
    return this.text.charAt(this.position);
  }

  /**
   *
   * Peeks at the next character without advancing the position.
   * @returns the next character, or null character if EOF
   */
  public peekNext(): string {
    if (this.position + 1 >= this.text.length) return '\0';
    return this.text.charAt(this.position + 1);
  }

  /**
   * Checks if the next character matches the expected character and consumes it if it does.
   * Updates position and column tracking when a match is found.
   *
   * @param expected - The character to match against
   * @returns `true` if the next character matches and was consumed, `false` otherwise
   */
  public match(expected: string): boolean {
    const nextCharacter = this.peek();

    if (this.eof() || nextCharacter !== expected) {
      return false;
    }

    this.position++;
    this.column++;

    return true;
  }

  /**
   * Consumes and returns the next character, advancing the position.
   * Automatically updates line and column tracking for newlines.
   * @returns The next character in the stream
   */
  public next(): string {
    const character = this.text.charAt(this.position++);

    if (isNewLine(character)) {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }

    return character;
  }

  /**
   * Checks if the end of the input stream has been reached.
   * @returns `true` if at end of input, `false` otherwise
   */
  public eof(): boolean {
    return this.position >= this.text.length;
  }
}

export { InputStream };
