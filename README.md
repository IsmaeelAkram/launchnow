<p align="center">
    <img src="https://raw.githubusercontent.com/novmbr/art/master/launchnow/launchnow.png" />
</p>

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)

launchnow is an easy-to-use tool for developers who don't want to `git fetch` from their servers all the time.

## Installation

You need to install with `npm install -g launchnow` on your computer and the server.

## Usage

In your **package.json** file, add this:

```
"launchnow": {
	"script": "npm start"
}
```

**YOU NEED TO ALLOW PORT 2424 THROUGH THE FIREWALL. IF NOT, THE CLIENT WILL NOT BE ABLE TO REQUEST A RE-DEPLOY.**
Now, on your server, run `launchnow server`. Launchnow will run and start your project automatically. Now, whenever you want your server to fetch and restart, you can run `launchnow client <IP_OF_SERVER>`. The server will receive the request on port 2424 to fetch and restart.
