import { init, wat2wasm } from "@wasmer/sdk";

const initPromise = init();

export async function compileWasm(wat: string, importObject: any = {}) {
  await initPromise;

  let out = await wat2wasm(wat);

  return (await WebAssembly.instantiate(out, importObject)).instance.exports;

  // console.log(wasmModule.instance.exports.logIt());
  // const { add } = wasmModule.instance.exports;
  // const sum = add(5, 6);
  // console.log(sum); // Outputs: 11
}

export function formatWat(wat: string): string {
  let indent = 0;

  let i = 0;
  while (i < wat.length) {
    const char = wat[i++];

    if (char == "(") {
      indent++;
    } else if (char == ")") {
      indent--;
    } else if (char == "\n") {
      let a = wat.slice(0, i);
      let b = wat.slice(i);
      let whitespace = Array((indent - (wat[i] == ")" ? 1 : 0)) * 4)
        .fill(" ")
        .join("");
      i += whitespace.length;
      wat = a + whitespace + b;
    }
  }

  return wat;
}
