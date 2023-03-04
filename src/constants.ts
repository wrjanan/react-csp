import { ConfigExtension } from "./types";
import path from "path";

let filename = "index.html";
const args = process.argv.slice(2);

args.forEach(function (value, index) {
  if(value === '--filename' || value === '--f') {
    if(args[index+1]) {
      filename = args[index+1];
    }
  }
});

const baseDir = process.cwd();
const configPath = (extension: ConfigExtension) =>
path.join(process.cwd(), `csp.${extension}`);
const htmlPath = path.join(process.cwd(), "public", filename);
const javascriptPath = path.join(process.cwd(), "build", "static", "js");

export { baseDir, configPath, htmlPath, filename, javascriptPath };
