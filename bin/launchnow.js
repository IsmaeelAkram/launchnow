#!/usr/bin/env node

const chalk = require("chalk");
const express = require("express");
const path = require("path");
const package = require(path.join(process.cwd(), "package.json"));
const { default: Axios } = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const respawn = require("respawn");

const args = process.argv.splice(2);

let type = "none";
if (args[0].includes("server")) {
  type = "server";
}
if (args[0].includes("client")) {
  type = "client";
}

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

if (type == "server") {
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
  // Check if script exists
  if (get(package.launchnow, "script") == null) {
    danger("No script set in package.json! ");
    danger(
      "Please read our github README (https://github.com/novmbr/launchnow/README.md) on the proper way of setting a script and repository."
    );
    process.exit();
  }
  good(
    `Script recognized as: ` + chalk.reset(chalk.bold(package.launchnow.script))
  );

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

  function fetchAndRestart() {
    info("Fetching...");
    exec("git fetch", (err, stdout, stderr) => {
      if (err) {
        danger("Error: " + err);
        process.exit();
      }
    }).on("close", (code, signal) => {
      proc.start();
      good("Restarted.");
    });
  }

  const app = express();

  app.get("/deploy", (req, res) => {
    fetchAndRestart();
    return res.status(200);
  });

  app.listen(2424, () => good("Launchnow server running on port 2424."));
} else if (type == "client") {
  let serverIP = args[1];
  Axios.get(`http://${serverIP}:2424/deploy`)
    .then(() => {
      good("Sent deploy request.");
    })
    .catch((err) => {
      danger("Server not reachable.");
    });
} else if (type == "none") {
  danger(
    "Are you running a launchnow server or are you trying to deploy? Use" +
      chalk.white("launchnow server") +
      chalk.red(" to run a server and ") +
      chalk.white("launchnow client <IP>") +
      chalk.red(" to re-deploy a server.")
  );
}
