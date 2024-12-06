"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
class Compiler {
    static init() {
        (0, child_process_1.execSync)(`docker build -t compiler/gcc ${__dirname}/docker_image`);
        this.container_id = (0, child_process_1.execSync)(`docker run -dit compiler/gcc /bin/sh`).toString().trim();
    }
    static compile(code) {
        fs_1.default.writeFileSync(`${__dirname}/compiler/source.cpp`, code, { flag: 'w' });
        (0, child_process_1.execSync)(`docker cp ${__dirname}/compiler/source.cpp ${this.container_id}:/source.cpp`);
        return (0, child_process_1.execSync)(`docker exec ${this.container_id} sh -c "g++ /source.cpp -o /executable && /executable"`).toString();
    }
}
exports.Compiler = Compiler;
