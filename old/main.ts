import { init, wat2wasm } from "@wasmer/sdk";
import { log } from "node:console";
import { readFileSync } from "node:fs";
import { getTokens } from "./tokenizer";
import {
  Scope,
  Token,
  TokenType,
  _operator_levels,
  _operator_names,
} from "./definitions";
import {
  Module,
  Function,
  Const,
  LocalDefine,
  LocalGet,
  FunctionParam,
  TernaryOp,
  Item,
} from "./asm";

// let ldf = new LocalDefine('i32', 'something')

// log(ldf.asm())

// let lgt = new LocalGet(ldf)

// let c = new Const('i32', '123')

// let add = new TernaryOp(lgt, c, 'add')

// log(add.asm())

let asm = "";

let code = readFileSync("./code", { encoding: "utf-8" });

let tokens = getTokens(code);

console.log(tokens);

function ps(tokens: Token[]): Item {
  if (tokens.length == 1) {
    const token = tokens[0];
    if (token.type == TokenType.Constant) {
      return new Const("i32", token.value);
    }
  } else if (tokens.length == 3) {
    return new TernaryOp(
      ps([tokens[0]]),
      ps([tokens[2]]),
      _operator_names[tokens[1].value]
    );
  } else {
    let op0 = _operator_names[tokens[1].value];
    let op1 = _operator_names[tokens[3].value];
    if (_operator_levels[tokens[3].value] > _operator_levels[tokens[1].value]) {
      return new TernaryOp(ps([tokens[0]]), ps(tokens.slice(2)), op0);
    } else {
      return new TernaryOp(
        new TernaryOp(ps([tokens[0]]), ps([tokens[2]]), op0),
        ps(tokens.slice(4)),
        op1
      );
    }
  }
}

let c = 0;
let t: Token;

function parseBodyLine(tokens: Token[], c: number, func: Function): number {
  t = tokens[c++];
  if (t.type == TokenType.Keyword && t.value == "return") {
  }
}

function parseFunction(tokens: Token[], c: number, module) {
  t = tokens[c++];
  if (t.type !== TokenType.Keyword && t.value !== "fn") return null;

  t = tokens[c++];
  // log(t.type, t.value)
  let funcName = t.value;

  t = tokens[c++];
  // log(t.type, t.value)

  let params: FunctionParam[] = [];

  while (true) {
    t = tokens[c++];
    if (t.type == TokenType.SpecialCharacter) {
      if (t.value == ",") {
        continue;
      } else if (t.value == ")") {
        break;
      } else {
        throw new Error("Bad token at function definition.");
      }
    }

    if (t.type != TokenType.Identifier) throw new Error("Invalid param type");
    let paramType = t.value;

    t = tokens[c++];
    if (t.type != TokenType.Identifier) throw new Error("Invalid param name");
    let paramName = t.value;

    params.push(new FunctionParam(paramType, paramName));
  }

  t = tokens[c++];
  if (t.type != TokenType.Identifier) throw new Error("Invalid return type");
  let returnType = t.value;

  let func = new Function(funcName, params, returnType);

  console.log(func.asm());

  t = tokens[c++];
  if (t.type != TokenType.SpecialCharacter || t.value != "{")
    throw new Error("Invalid return type: " + t.value + " " + t.type);

  console.log(parseBodyLine(tokens, c, func));
}

parseFunction(tokens, 0, module);

// let wat = `
// (module
//   (func $add (param $lhs i32) (param $rhs i32) (result i32)
//     local.get $lhs
//     local.get $rhs
//     i32.add)
//   (export "add" (func $add))
// )
// `;

// let wat2 = `(module
//   (import "console" "log" (func $log (param i32)))
//   (func (export "logIt")
//     i32.const 13
//     call $log))
// `;
// const importObject = {
//   console: {
//     log(arg) {
//       console.log(arg);
//     },
//   },
// };

// async function main() {
//   await init();

//   let out = await wat2wasm(wat2);

//   WebAssembly.instantiate(out, importObject).then((wasmModule) => {
//     // Exported function live under instance.exports
//     console.log(wasmModule.instance.exports.logIt());

//     // const { add } = wasmModule.instance.exports;
//     // const sum = add(5, 6);
//     // console.log(sum); // Outputs: 11
//   });
// }

// main();
