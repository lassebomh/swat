import { inspect, ok } from "../utils";
import * as tk from "../tokenizer";

import {
  FunctionDeclaration,
  Module,
  Node,
  Scope,
  Variable,
  VariableAssignment,
  VariableDeclaration,
  VariableSignature,
} from "./types";
import { parseExpressions } from "./expressions";

export function parseVariableSignature(
  tokens: tk.Token[],
  i: number = 0,
  global: boolean
): [VariableSignature, number] {
  let t = tokens[i++];

  ok(tk.Keyword.as(t, "var"));

  t = tokens[i++];
  ok(t instanceof tk.Identifier);
  const name = t.value;

  t = tokens[i++];
  ok(t instanceof tk.Identifier);
  const type = t.value;

  return [new VariableSignature(name, type, global), i];
}

export function parseVariableDeclaration(
  tokens: tk.Token[],
  i: number = 0,
  global: boolean
): [VariableDeclaration, number] {
  let varSig: VariableSignature;

  [varSig, i] = parseVariableSignature(tokens, i, global);

  return [new VariableDeclaration(varSig), i];
}

export function parseVariableAssignment(
  tokens: tk.Token[],
  i: number = 0,
  scope: Scope
): [VariableAssignment, number] {
  let t = tokens[i++];
  ok(t instanceof tk.Identifier);
  const name = t.value;
  const type = scope.getLocalSignature(name)?.type;

  if (type === undefined) {
    throw new Error(`Variable ${name} isn't declared.`);
  }

  t = tokens[i++];
  ok(tk.Operator.as(t, "="));

  let expressions: Node[];
  [expressions, i] = parseExpressions(tokens, i, scope, [type]);

  t = tokens[i++];
  ok(tk.Delimiter.as(t, ";"));

  return [new VariableAssignment(name, expressions), i];
}

// const module = new Module();

// let fd = new FunctionDeclaration("", "i32", [], new Map(), new Map(), module);

// let i = 0;
// let tokens = new tk.Lexer(`var xyz i32; xyz = 123;`).tokenize();

// let varDec: VariableDeclaration;
// [varDec, i] = parseVariableDeclaration(tokens, i, fd);

// let varAssignment: VariableAssignment;
// [varAssignment, i] = parseVariableAssignment(tokens, i, fd);

// // inspect(varAssignment);
