import { log } from "console";
import { inspect as inspectUtil } from "util";

const inspect = (obj: any) => console.log(inspectUtil(obj, false, null, true));

export abstract class Token<T extends Token<T, V> = any, V = any> {
  constructor(public value: V, public start: number, public end: number) {}
}

const delimiterValues = ["(", ")", ";", ".", "{", "}"] as const;
type DelimiterValue = (typeof delimiterValues)[number];

export class Delimiter extends Token<Delimiter, DelimiterValue> {
  static as(token: Token, value: DelimiterValue): token is Delimiter {
    return <boolean>(token.constructor === Delimiter) && token.value === value;
  }
}

const operatorValues = ["+", "-", "*", "/", "=", ","] as const;

export class Operator extends Token<Operator, string> {
  static as(token: Token, value: string): token is Operator {
    return <boolean>(token.constructor === Operator) && token.value === value;
  }
}

const keywordValues = [
  "var",
  "func",
  "return",
  "export",
  "import",
  "from",
] as const;
type KeywordValue = (typeof keywordValues)[number];

export class Keyword extends Token<Keyword, KeywordValue> {
  static as(token: Token, value: KeywordValue): token is Keyword {
    return <boolean>(token.constructor === Keyword) && token.value === value;
  }
}

export class Identifier extends Token<Identifier, string> {
  static as(token: Token, value: string): token is Identifier {
    return <boolean>(token.constructor === Identifier) && token.value === value;
  }
}

export class Number extends Token<Number, string> {
  static as(token: Token, value: string): token is Number {
    return <boolean>(token.constructor === Number) && token.value === value;
  }
}

export class Function extends Token<Function, string> {
  static as(token: Token, value: string): token is Function {
    return <boolean>(token.constructor === Function) && token.value === value;
  }
}

export class Lexer {
  private input: string;
  private currentPos: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  // Peek the next character without consuming it
  private peek(): string {
    return this.input[this.currentPos] ?? "";
  }

  // Consume the next character and advance the lexer
  private consume(): string {
    return this.input[this.currentPos++] ?? "";
  }

  // A method to tokenize the input
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let currentChar: string;

    while (this.currentPos < this.input.length) {
      currentChar = this.peek();

      if (this.isWhiteSpace(currentChar)) {
        this.consume(); // skip whitespace
      } else if (this.isDigit(currentChar)) {
        tokens.push(this.tokenizeNumber());
      } else if (this.isOperator(currentChar)) {
        tokens.push(this.tokenizeOperator());
      } else if (this.isLetter(currentChar)) {
        tokens.push(this.tokenizeIdentifier());
        // } else if (currentChar === '"' || currentChar === "'") {
        //   tokens.push(this.tokenizeString());
      } else if (this.isDelimiter(currentChar)) {
        tokens.push(
          new Delimiter(currentChar, this.currentPos, this.currentPos + 1)
        );
        this.consume();
      } else {
        // Unknown character
        throw new Error(`Unknown character: ${currentChar}`);
      }
    }

    return tokens;
  }

  private isWhiteSpace(c: string): boolean {
    return /\s/.test(c);
  }

  private isDigit(c: string): boolean {
    return /\d/.test(c);
  }

  private isLetter(c: string): boolean {
    return /[a-zA-Z_]/.test(c);
  }

  private isDelimiter(c: string): c is DelimiterValue {
    return delimiterValues.includes(<any>c);
  }

  private isOperator(c: string): boolean {
    return operatorValues.includes(<any>c);
  }

  private tokenizeNumber(): Number {
    let s = "";
    let start = this.currentPos;
    while (this.isDigit(this.peek())) {
      s += this.consume();
    }
    return new Number(s, start, this.currentPos);
  }

  private tokenizeOperator(): Operator {
    let s = "";
    let start = this.currentPos;
    while (this.isOperator(this.peek())) {
      s += this.consume();
    }
    return new Operator(s, start, this.currentPos);
  }

  private tokenizeIdentifier(): Identifier | Keyword | Function {
    let id = "";
    let start = this.currentPos;

    while (this.isLetter(this.peek()) || this.isDigit(this.peek())) {
      id += this.consume();
    }

    if (keywordValues.indexOf(<any>id) !== -1) {
      return new Keyword(id as KeywordValue, start, this.currentPos);
    } else if (id.toUpperCase() == id) {
      return new Function(id, start, this.currentPos);
    } else {
      return new Identifier(id, start, this.currentPos);
    }
  }

  // private tokenizeString(): Token {
  //   const quoteType = this.consume(); // consume the starting quote
  //   let strVal = "";
  //   let currentChar = this.peek();

  //   while (currentChar !== quoteType && this.currentPos < this.input.length) {
  //     strVal += this.consume();
  //     currentChar = this.peek();
  //   }

  //   if (currentChar === quoteType) {
  //     this.consume(); // consume the ending quote
  //   } else {
  //     console.error("Unterminated string literal");
  //   }

  //   return { type: TokenType.String, value: strVal };
  // }
}
