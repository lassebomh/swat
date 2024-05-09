import { Lexer } from "./tokenizer";
import { parseModule } from "./parse";
import { compileWat, formatWat, compileWasm } from "./wat";
import { inspect, log } from "./utils";

const code = `

export func MAIN(i32 a, i32 b) i32 {
  return a * b + 4;
}
`;

/*

continue
break
yield
return

FOO = block() : () -> () {

}


x = 0
i = 0

-> (next) {
  next = ++i < 50;
  x += 2;
}





*/

async function main() {
  // let tokens = new Lexer(code).tokenize();
  // inspect(tokens);

  // let module = parseModule(tokens);
  // inspect(module);

  // let wat = compileWat(module);

  const wat = `
    (module
      (func $SKIP
        br $MAIN
      )
      (func $MAIN (param $a i32) (result i32) (result i32)
        (block $MAIN
          call $SKIP
          i32.const 100
        )
      )
      (export "MAIN" (func $MAIN))
    )
  `;

  log(formatWat(wat));

  let exports: any = await compileWasm(wat, {
    console: {
      LOG: console.log,
      x: 24,
    },
  });

  log(exports.MAIN(1));
}

main();
