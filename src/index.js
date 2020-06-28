const chalk = require("chalk");
const pjson = require("../package.json");
const log = require("./log");
const { default: Axios } = require("axios");
const child_process = require("child_process");
const { time } = require("console");

let user;
let repo;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Get github repository
if (pjson.takeoff.github_repo == null) {
  log.danger("No github repository set in package.json! ");
  log.danger(
    "Please read our github guide (https://github.com/novmbr/takeoff) on the proper format of setting a script and repository."
  );
  process.exit();
}
// Get script
if (pjson.takeoff.script == null) {
  log.danger("No script set in package.json! ");
  log.danger(
    "Please read our github guide (https://github.com/novmbr/takeoff) on the proper format of setting a script and repository."
  );
  process.exit();
}

log.good(
  "GitHub repository recognized as: " +
    chalk.reset(chalk.bold(pjson.takeoff.github_repo))
);
log.good(
  `Script recognized as: ` + chalk.reset(chalk.bold(pjson.takeoff.script))
);
user = pjson.takeoff.github_repo.split(":")[0];
repo = pjson.takeoff.github_repo.split(":")[1];

log.info("Checking if github repository is accessible...");
Axios.get(`https://api.github.com/repos/${user}/${repo}`)
  .then((res) => {
    log.good("Repository is accessible.");
  })
  .catch((err) => {
    log.danger("Repository is either private or does not exist.");
    process.exit();
  });

var proc = child_process.exec(pjson.takeoff.script);
log.good("Script started...");

proc.stdout.on("data", function (data) {
  console.log("stdout: " + data.toString());
});

process.on("SIGINT", function () {
  proc.kill();
  log.danger("Killing process...");
});

while (true) {
  sleep(60000);
}
