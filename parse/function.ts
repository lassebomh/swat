import {
  Scope,
  Node,
  FunctionDeclaration,
  VariableDeclaration,
  VariableAssignment,
  FunctionReturn,
  Module,
  FunctionSignature,
  VariableSignature,
} from "./types";
import * as tk from "../tokenizer";
import { inspect, ok } from "../utils";
import {
  parseVariableAssignment,
  parseVariableDeclaration,
  parseVariableSignature,
} from "./variable";
import { parseExpressions } from "./expressions";

export function parseFunctionReturn(
  tokens: tk.Token[],
  i: number = 0,
  func: FunctionDeclaration
): [FunctionReturn, number] {
  let t = tokens[i++];
  ok(tk.Keyword.as(t, "return"));

  let expressions: Node[];
  [expressions, i] = parseExpressions(tokens, i, func, [
    func.signature.returnType,
  ]);

  t = tokens[i++];
  ok(tk.Delimiter.as(t, ";"));

  return [new FunctionReturn(func.signature.returnType, expressions), i];
}

export function parseFunctionSignature(
  tokens: tk.Token[],
  i: number
): [FunctionSignature, number] {
  let t = tokens[i++];
  ok(tk.Keyword.as(t, "func"));

  t = tokens[i++];
  ok(t instanceof tk.Function);

  const name = t.value;

  const args = new Map<string, VariableSignature>();

  t = tokens[i++];
  ok(tk.Delimiter.as(t, "("));

  while (true) {
    t = tokens[i++];
    if (tk.Delimiter.as(t, ")")) break;

    ok(t instanceof tk.Identifier);
    const argType = t.value;

    t = tokens[i++];
    ok(t instanceof tk.Identifier);
    args.set(t.value, new VariableSignature(t.value, argType, false));

    t = tokens[i++];
    if (!tk.Operator.as(t, ",")) break;
  }

  ok(tk.Delimiter.as(t, ")"));

  t = tokens[i++];
  ok(t instanceof tk.Identifier);
  const returnType = t.value;

  let funcSignature = new FunctionSignature(name, returnType, args);

  return [funcSignature, i];
}

export function parseFunction(
  tokens: tk.Token[],
  i: number = 0,
  module: Module,
  exported: boolean
): [FunctionDeclaration, number] {
  let funcSignature: FunctionSignature;

  [funcSignature, i] = parseFunctionSignature(tokens, i);

  let funcDecl = new FunctionDeclaration(
    funcSignature,
    [],
    new Map(),
    module,
    exported
  );

  let t = tokens[i++];
  ok(tk.Delimiter.as(t, "{"));

  while (true) {
    if (tk.Keyword.as(t, "var")) {
      let varDecl: VariableDeclaration;
      [varDecl, i] = parseVariableDeclaration(tokens, i, false);

      let t: tk.Token = tokens[i++];
      ok(tk.Delimiter.as(t, ";"));

      funcDecl.variables.set(varDecl.signature.name, varDecl.signature);

      funcDecl.children.push(varDecl);
    } else if (tk.Keyword.as(t, "return")) {
      let funcReturn: FunctionReturn;

      [funcReturn, i] = parseFunctionReturn(tokens, i, funcDecl);

      funcDecl.children.push(funcReturn);
    } else if (
      t instanceof tk.Identifier &&
      tk.Operator.as(tokens[i + 1], "=")
    ) {
      let variableAssignment: VariableAssignment;
      [variableAssignment, i] = parseVariableAssignment(tokens, i, funcDecl);

      funcDecl.children.push(variableAssignment);
    }

    t = tokens[i];

    if (tk.Delimiter.as(t, "}")) {
      break;
    }
  }

  i++;

  return [funcDecl, i];
}

// const module = new Module();

// let i = 0;
// let tokens = new tk.Lexer(`
// func MAIN(i32 a, i32 b) i32 {
//     var c i32;
//     c = 3 + c;
//     return 3;
// }
// `).tokenize();

// let funcDec: FunctionDeclaration;
// [funcDec, i] = parseFunction(tokens, i, module, false);

// // inspect(funcDec);
