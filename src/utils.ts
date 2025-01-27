import * as util from "util";
import * as fs from "fs";
import chalk from "chalk";

import { baseDir, configPath, htmlPath, filename, javascriptPath } from "./constants";
import { CspConfig } from "./types";
import { createHash } from "crypto";
import { join } from "path";
// import { readFile } from "fs";

let env = "prod";
const args = process.argv.slice(2);

if (Array.isArray(args) && args[0] !== undefined) {
  env = args[0];
  console.log(`Using ${chalk.cyan(env)} as the environment`);
} else {
  console.log(`No env found, using ${chalk.cyan("prod")} as the default`);
}

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const hashToggle = true;

const patterns = {
  configName: new RegExp("(^|\\W)" + "(csp*?.(js|json))" + "($|\\W)", "gi"),
  configExtenstion: /(?:\.([^.]+))?$/,
  javascriptFiles: new RegExp("(^|\\W)" + "(main.*?.(js))" + "($|\\W)", "gi"),
};

async function getConfig() {
  const allFiles = fs.readdirSync(baseDir);
  const fileName = allFiles.find((fileName) =>
    Array.isArray(fileName.match(patterns.configName))
  );
  console.log(
    `Reading config from ${baseDir} for ${chalk.cyan("csp.js")} or ${chalk.cyan(
      "csp.json"
    )}`
  );
  if (!fileName) {
    throw new Error("No csp config found, should be either csp.json or csp.js");
  }
  const fileExtenstions = patterns.configExtenstion.exec(fileName);
  if (
    !fileExtenstions ||
    (fileExtenstions[1] !== "json" && fileExtenstions[1] !== "js")
  ) {
    throw new Error("csp should have either js or json as the extension");
  }
  const fileExtension = fileExtenstions[1];
  let config = null;
  if (fileExtension === "json") {
    config = JSON.parse(await readFile(configPath(fileExtension), "utf8"));
  }
  if (fileExtension === "js") {
    config = require(configPath(fileExtension));
  }
  if (!config[env]) {
    throw new Error(
      `Environment ${env} is not found at the config as a key, please refer to the documentation`
    );
  }
  return config[env];
}

async function loadHTML() {
  console.log(`NEW Loading existing from ${chalk.red(htmlPath)}`);
  const html = await readFile(htmlPath, "utf8");
  console.log(`${chalk.green("HTML")} is loaded`);
  return html;
}
async function writeToHtml(html: string) {
  console.log(
    `Writing to HTML with the ${chalk.greenBright("new")} CSP policy`
  );
  try {
    await writeFile(htmlPath, html, "utf8");
    console.log(chalk.blue(`Successfully generated CSP in ${filename}`));
  } catch (e) {
    console.log(chalk.red("Fail to generate CSP policy..."));
    throw e;
  }
}
async function formatCSP(config: CspConfig): Promise<string> {
  let content = "";
  for (const key in config) {
    const strs = config[key];
    content += `${key} `;
    if (Array.isArray(strs)) {
      content += strs.join(" ");
    } else {
      content += strs;
    }

    if(hashToggle && key === "script-src") {
      const hashes = await getHashes();
      content += " " + hashes.join(" ");
    }
    content += "; ";
  }
  return `<meta http-equiv="Content-Security-Policy" content="${content}" />`;
}

const computeHashes = (indexHtml) => {
  // const sw = /<script[\s\S]*?>([\s\S]*?)<\/script>/gm;
  const sw = /([\s\S]*?)/gm;

  const scriptHashes = [];
  scriptHashes.push(
    `'sha256-${createHash("sha256")
              .update(indexHtml, "utf8").digest("base64")}'`
  );

  return scriptHashes;
};

async function getHashes(): Promise<string[]> {
  const allFiles = fs.readdirSync(javascriptPath);
  const fileNames = allFiles.find((fileName) =>
    Array.isArray(fileName.match(patterns.javascriptFiles))
  );
  console.log(
    `Reading javascript files from ${javascriptPath} for ${chalk.cyan("*.js")}`
  );
  if (!fileNames) {
    throw new Error("No main JS file found, should be main.xxxxx.js");
  }
  let javascriptFile =  await readFile(`${javascriptPath}/${fileNames}`, "utf8");
  return computeHashes(javascriptFile);
}

export { readFile, writeFile, getConfig, loadHTML, writeToHtml, formatCSP };
