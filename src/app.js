// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import Config from 'electron-config';

import { bindToggles } from './controller/tools';
import { ContaplusModel } from './model/contaplus';
import { CoheteModel } from './model/cohete';
import { RutaContaplusControl } from './controller/ruta_contaplus';
import { EmpresaContaplusControl } from './controller/empresa_contaplus';
import { LoginCoheteControl } from './controller/login_cohete';

import env from './env';

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

    // Activate the toggling of asistente
    bindToggles()

    // Bind events from controllers
    let config = new Config({ name: env.name })
    let contaplus_model = new ContaplusModel(config, env)
    let cohete_model = new CoheteModel(config, env)
    let ruta_contaplus = new RutaContaplusControl(contaplus_model)
    let empresa_contaplus = new EmpresaContaplusControl(contaplus_model)
    let login_cohete = new LoginCoheteControl(cohete_model)

    // Enlazar eventos de ruta_contaplus
    ruta_contaplus.onSelected(() => {
        empresa_contaplus.Focus()
    })
    ruta_contaplus.onCleared(() => {
        empresa_contaplus.Blur(true)
    })

    // Enlazar eventos de empresa_contaplus
    empresa_contaplus.onSelected(() => {
        login_cohete.Focus()
    })
    empresa_contaplus.onCleared(() => {
        login_cohete.Blur(true)
    })

    ruta_contaplus.Focus()
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