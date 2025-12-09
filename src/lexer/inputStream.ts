import { isNewLine } from './helpers';

class InputStream {
  public line = 1;
  public column = 0;
  private position = 0;

  /**
   * @param text the input text to be processed
   */
  constructor(private text: string) {}

  /**
   * @returns the current character without consuming it
   */
  public peek(): string {
    return this.text.charAt(this.position);
  }

  /**
   * @returns the next character and advances the position
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
   * @returns true if the end of the input has been reached
   */
  public eof(): boolean {
    return this.position >= this.text.length;
  }
}

export { InputStream };
