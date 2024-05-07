import { log } from "console";
import { inspect as inspectUtil } from "util";
import { ok, equal } from "assert";

const inspect = (obj: any) => console.log(inspectUtil(obj, false, null, true));

export { ok, inspect, log, equal };
