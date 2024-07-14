import { spawn } from "child_process";

function cmd(program, args) {
  const spawnOptions = { shell: true };
  console.log("CMD:", program, args.flat(), spawnOptions);
  const p = spawn(program, args.flat(), spawnOptions);
}

cmd("tsc", ["-w"]);
cmd("http-server", ["-p", "6969", "-a", "127.0.0.1", "-s", "-c-1"]);
