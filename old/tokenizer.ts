import { log } from "console";
import {
    Token,
    TokenType,
    _alpha,
    _eol,
    _keywords,
    _letter,
    _number,
    _operator,
    _special,
    _whitespace,
} from "./definitions";

function isIdentifier(s: string, c: number): [boolean, number] {
    if (!_letter.includes(s[c])) {
        return [false, c];
    }

    let ok = false;
    while (_alpha.includes(s[c])) {
        ok = true;
        c++;
    }
    return [ok, c];
}

function isKeyword(s: string, c: number): [boolean, number] {
    const startC = c;

    let ok = false;
    while (_letter.includes(s[c])) {
        ok = true;
        c++;
    }
    if (!_keywords.includes(s.substring(startC, c))) {
        ok = false;
    }
    return [ok, c];
}

function isConstant(s: string, c: number): [boolean, number] {
    let ok = false;
    while (_number.includes(s[c])) {
        ok = true;
        c++;
    }
    if (_letter.includes(s[c])) {
        ok = false;
    }
    return [ok, c];
}

function isWhitespace(s: string, c: number): [boolean, number] {
    let ok = false;
    while (_whitespace.includes(s[c])) {
        ok = true;
        c++;
    }
    return [ok, c];
}
function isEOL(s: string, c: number): [boolean, number] {
    let ok = false;
    while (_eol.includes(s[c])) {
        ok = true;
        c++;
    }
    return [ok, c];
}

function isOperator(s: string, c: number): [boolean, number] {
    let ok = false;
    while (_operator.includes(s[c])) {
        ok = true;
        c++;
    }
    return [ok, c];
}

function isSpecialCharacter(s: string, c: number): [boolean, number] {
    let ok = false;
    if (_special.includes(s[c])) {
        ok = true;
        c++;
    }
    return [ok, c];
}

export function getTokens(code: string) {
    let tokens: Token[] = [];
    let c = 0;

    while (c < code.length) {

        let [keyword, cKeyword] = isKeyword(code, c);

        if (keyword) {
            tokens.push({
                type: TokenType.Keyword,
                value: code.substring(c, cKeyword),
                eol: false,
            });
            c = cKeyword;
            continue;
        }
        let [constant, cConstant] = isConstant(code, c);

        if (constant) {
            tokens.push({
                type: TokenType.Constant,
                value: code.substring(c, cConstant),
                eol: false,
            });
            c = cConstant;
            continue;
        }

        let [identifier, cIdentifier] = isIdentifier(code, c);
        if (identifier) {
            tokens.push({
                type: TokenType.Identifier,
                value: code.substring(c, cIdentifier),
                eol: false,
            });
            c = cIdentifier;
            continue;
        }

        let [operator, cOperator] = isOperator(code, c);
        if (operator) {
            tokens.push({
                type: TokenType.Operator,
                value: code.substring(c, cOperator),
                eol: false,
            });
            c = cOperator;
            continue;
        }

        let [special, cSpecial] = isSpecialCharacter(code, c);
        if (special) {
            tokens.push({
                type: TokenType.SpecialCharacter,
                value: code.substring(c, cSpecial),
                eol: false,
            });
            c = cSpecial;
            continue;
        }

        let [eol, cEOL] = isEOL(code, c);
        if (eol) {
            c = cEOL;
            if (tokens.length) {
                tokens[tokens.length - 1].eol = true;
            }
            continue;
        }

        let [ws, cWs] = isWhitespace(code, c);
        if (ws) {
            c = cWs;
            continue;
        }

        log('tokens', tokens)

        throw new Error("Missing expected token.");
    }

    return tokens;
}
