#!/usr/bin/env node

const chalk = require("chalk");
const pjson = require("../package.json");
const { default: Axios } = require("axios");
const { exec } = require("child_process");

// LOGGING
function info(x) {
  console.log(chalk.blue("[❓]") + " " + chalk.blue(x));
}

function danger(x) {
  console.log(chalk.red("[👎]") + " " + chalk.red(x));
}

function warning(x) {
  cconsole.log(chalk.yellow("[⚠]") + " " + chalk.yellow(x));
}

function good(x) {
  console.log(chalk.green("[👍]") + " " + chalk.green(x));
}

let user;
let repo;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Get github repository
if (pjson.takeoff.github_repo == null) {
  danger("No github repository set in package.json! ");
  danger(
    "Please read our github guide (https://github.com/novmbr/takeoff) on the proper format of setting a script and repository."
  );
  process.exit();
}
// Get script
if (pjson.takeoff.script == null) {
  danger("No script set in package.json! ");
  danger(
    "Please read our github guide (https://github.com/novmbr/takeoff) on the proper format of setting a script and repository."
  );
  process.exit();
}

good(
  "GitHub repository recognized as: " +
    chalk.reset(chalk.bold(pjson.takeoff.github_repo))
);
good(`Script recognized as: ` + chalk.reset(chalk.bold(pjson.takeoff.script)));
user = pjson.takeoff.github_repo.split(":")[0];
repo = pjson.takeoff.github_repo.split(":")[1];

info("Checking if github repository is accessible...");
Axios.get(`https://api.github.com/repos/${user}/${repo}`)
  .then((res) => {
    good("Repository is accessible.");
  })
  .catch((err) => {
    danger("Repository is either private or does not exist.");
    process.exit();
  });

let latestCommit;

while (1) {
  Axios.get(`https://api.github.com/repos/${user}/${repo}/commits/master`)
    .then((res) => {})
    .catch((err) => {
      danger("Repository is either private or does not exist.");
      process.exit();
    });
}
