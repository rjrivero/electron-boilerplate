// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';

import Config from 'electron-config';
import { ruta_contaplus } from './controller/ruta_contaplus';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log('The author of this app is:', appDir.read('package.json', 'json').author);

document.addEventListener('DOMContentLoaded', function () {
    //document.getElementById('greet').innerHTML = greet();
    //document.getElementById('platform-info').innerHTML = os.platform();
    //document.getElementById('env-name').innerHTML = env.name;

    let config = new Config({ name: env.name })
    ruta_contaplus.plumb(config)
    //ruta_contaplus.populate()
    /*
    scan(config, true)
    .then((folders) => {
        if (folders.length > 0) {
            return companies(config, folders[0], true)
        }
        return new Map()
    })
    .then((companies) => {
        console.log(companies)
        console.log("STORE:")
        console.log(config.store)
    })
    .catch((err) => {
        console.log(err)
    })
    */
});