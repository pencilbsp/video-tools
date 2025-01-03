import { promisify } from "util";
import { exec as _exec } from "child_process";

const exec = promisify(_exec);

export default exec;
