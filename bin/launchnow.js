#!/usr/bin/env node

const chalk = require("chalk");
const path = require("path");
const package = require(path.join(process.cwd(), "package.json"));
const { default: Axios } = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const respawn = require("respawn");

// LOGGING
function info(x) {
  console.log(chalk.blue("[❓]") + " " + chalk.blue(x));
}

function danger(x) {
  console.log(chalk.red("[👎]") + " " + chalk.red(x));
}

function warning(x) {
  console.log(chalk.yellow("[⚠]") + " " + chalk.yellow(x));
}

function good(x) {
  console.log(chalk.green("[👍]") + " " + chalk.green(x));
}

let user;
let repo;
let check_interval;

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
// Check if .git exists
if (!fs.existsSync(path.relative(process.cwd(), ".git"))) {
  danger("No .git folder found!");
  danger(
    "You need to add a remote to the repository. Learn how to add a remote here: https://help.github.com/en/github/using-git/adding-a-remote"
  );
  danger(
    "If you already have a remote, make sure you are running launchnow in the root directory."
  );
  process.exit();
}

if (get(package.launchnow, "check_interval") == null) {
  warning("No check interval specified. Defaulting to 1 minute.");
  check_interval = 1;
} else {
  check_interval = package.launchnow.check_interval;
}

if (get(package.launchnow, "check_interval") < 1) {
  warning("Check interval has to be a minimum of 1. Setting to default of 1.");
  check_interval = 60000;
}

// Check if github_repo exists
if (get(package.launchnow, "github_repo") == null) {
  danger("No github repository set in package.json! ");
  danger(
    "Please read our github README (https://github.com/novmbr/launchnow/README.md) on the proper way of setting a script and repository."
  );
  process.exit();
}
// Check if script exists
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
good(
  "Check interval recognized as: " + chalk.reset(chalk.bold(check_interval))
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
  sleep: 1000, // time to sleep between restarts,
  fork: false, // fork instead of spawn
});

proc.start();

proc.on("stdout", (data) => {
  console.log(data.toString());
});

info("Process started.");

function checkPush() {
  info("Checking for new push...");
  Axios.get(`https://api.github.com/repos/${user}/${repo}/commits/master`)
    .then((res) => {
      if (latestCommit == "") {
        latestCommit = res.data.sha;
        return;
      }
      if (res.data.sha != latestCommit) {
        proc.stop(function () {
          info("New push! Fetching....");
          exec("git fetch", (err, stdout, stderr) => {
            if (err) {
              danger("Error: " + err);
              process.exit();
            }
          }).on("close", (code, signal) => {
            proc.start();
            good("Restarted.");
            latestCommit = res.data.sha;
          });
        });
      }
    })
    .catch((err) => {
      danger("Repository is either private or does not exist.");
      process.exit();
    });
}

checkPush();
setInterval(checkPush, check_interval * 60000);
