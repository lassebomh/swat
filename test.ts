import { Lexer } from "./tokenizer";
import { parseModule } from "./parse";
import { compileWat, formatWat, compileWasm } from "./wat";
import { inspect, log } from "./utils";

const code = `

export func MAIN(i32 a, i32 b) i32 {
  return a * b + 4;
}
`;

async function main() {
  let module = parseModule(new Lexer(code).tokenize());

  inspect(module);

  let wat = compileWat(module);

  log(formatWat(wat));

  let exports: any = await compileWasm(wat, {
    console: {
      LOG: console.log,
      x: 24,
    },
  });

  log(exports.MAIN(5, 8));
}

main();
