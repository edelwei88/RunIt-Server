import fs from "fs";
import { execSync } from "child_process";

export abstract class Compiler {
  static container_id: string;

  static init() {
    execSync(`docker build -t compiler/gcc ${__dirname}/docker_image`);
    this.container_id = execSync(`docker run -dit compiler/gcc /bin/sh`).toString().trim();
  }

  static compile(code: string): string {
    fs.writeFileSync(`${__dirname}/compiler/source.cpp`, code, { flag: 'w' });
    try {
      execSync(`docker cp ${__dirname}/compiler/source.cpp ${this.container_id}:/source.cpp`);
      execSync(`docker exec ${this.container_id} sh -c "g++ /source.cpp -o /executable"`);
      return execSync(`docker exec ${this.container_id} sh -c /executable`).toString();
    }
    catch (err: any) {
      return err.stderr.toString();
    }
  }
}
