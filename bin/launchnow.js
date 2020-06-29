#!/usr/bin/env node

const chalk = require("chalk");
const path = require("path");
const package = require(path.relative(__dirname, "package.json"));
const { default: Axios } = require("axios");
const { exec } = require("child_process");
const { stdout, stderr } = require("process");
const respawn = require("respawn");

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

function get(dictionary, key) {
  try {
    let value = dictionary[key];
    return value;
  } catch (error) {
    return null;
  }
}

// Get github repository
if (get(package.launchnow, "github_repo") == null) {
  danger("No github repository set in package.json! ");
  danger(
    "Please read our github README (https://github.com/novmbr/launchnow/README.md) on the proper way of setting a script and repository."
  );
  process.exit();
}
// Get script
if (get(package.launchnow, "script") == null) {
  danger("No script set in package.json! ");
  danger(
    "Please read our github README (https://github.com/novmbr/launchnow/README.md) on the proper way of setting a script and repository."
  );
  process.exit();
}

good(
  "GitHub repository recognized as: " +
    chalk.reset(chalk.bold(package.launchnow.github_repo))
);
good(
  `Script recognized as: ` + chalk.reset(chalk.bold(package.launchnow.script))
);
user = package.launchnow.github_repo.split(":")[0];
repo = package.launchnow.github_repo.split(":")[1];

info("Checking if github repository is accessible...");
Axios.get(`https://api.github.com/repos/${user}/${repo}`)
  .then((res) => {
    good("Repository is accessible.");
  })
  .catch((err) => {
    danger("Repository is either private or does not exist.");
    proc.stop();
    process.exit();
  });

let latestCommit = "";

var proc = respawn(package.launchnow.script.split(" "), {
  name: "script", // set monitor name
  cwd: ".", // set cwd
  maxRestarts: -1, // how many restarts are allowed within 60s
  // or -1 for infinite restarts
  stdio: [],
  sleep: 1000, // time to sleep between restarts,
  fork: false, // fork instead of spawn
});
proc.start();
info("Process started.");

setInterval(() => {
  info("Checking for new push...");
  Axios.get(`https://api.github.com/repos/${user}/${repo}/commits/master`)
    .then((res) => {
      if (latestCommit == "") {
        latestCommit = res.data.sha;
        return;
      }
      if (res.data.sha != latestCommit) {
        proc.stop();
        proc.start();
        info("Restarted.");
      }
    })
    .catch((err) => {
      danger("Repository is either private or does not exist.");
      process.exit();
    });
}, 60000);
