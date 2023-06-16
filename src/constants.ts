import { ConfigExtension } from "./types";

let filename = "index.html";
let path = "/public/";
let jsPath = "/build/static/js/";
let cfgPath = "";
const args = process.argv.slice(2);

const checkFileNameArg = (value, index) => {
  if(value === '--filename' || value === '--f') {
    if(args[index+1]) {
      filename = args[index+1];
    }
  }
}

const checkIndexPathArg = (value, index) => {
  if(value === '--path' || value === '--p') {
    if(args[index+1]) {
      path = args[index+1];
    }
  }
}

const checkJSPathArg = (value, index) => {
  if(value === '--jspath' || value === '--jsp') {
    if(args[index+1]) {
      jsPath = args[index+1];
    }
  }
}

const checkConfigArg = (value, index) => {
  if(value === '--configpath' || value === '--cfgp') {
    if(args[index+1]) {
      cfgPath = args[index+1];
    }
  }
}

args.forEach(function (value, index) {
  checkFileNameArg(value, index)
  checkIndexPathArg(value, index)
  checkJSPathArg(value, index)
});

const baseDir = process.cwd();
const configPath = (extension: ConfigExtension) =>
  process.cwd() + `${cfgPath}/csp.${extension}`;
const htmlPath = process.cwd() + `${path}${filename}`;
const javascriptPath = process.cwd() + `${jsPath}`;

export { baseDir, configPath, htmlPath, filename, javascriptPath };
