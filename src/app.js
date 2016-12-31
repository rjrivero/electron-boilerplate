// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import Config from 'electron-config';

import { bindToggles, showErrorDialog } from './controller/tools';
import { ContaplusModel } from './model/contaplus';
import { CoheteModel } from './model/cohete';
import { SubmitModel } from './model/submit';
import { RutaContaplusControl } from './controller/ruta_contaplus';
import { EmpresaContaplusControl } from './controller/empresa_contaplus';
import { EjerciciosContaplusControl } from './controller/ejercicios_contaplus';
import { FuentesContaplusControl } from './controller/fuentes_contaplus';
import { LoginCoheteControl } from './controller/login_cohete';
import { LanzaTrabajoControl } from './controller/lanza_trabajo';

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
    let submit_model = new SubmitModel(contaplus_model, cohete_model)
    let login_cohete = new LoginCoheteControl(cohete_model)
    let ruta_contaplus = new RutaContaplusControl(contaplus_model)
    let empresa_contaplus = new EmpresaContaplusControl(submit_model)
    let ejercicios_contaplus = new EjerciciosContaplusControl(contaplus_model)
    let fuentes_contaplus = new FuentesContaplusControl(cohete_model)
    let lanza_trabajo = new LanzaTrabajoControl(submit_model)

    // Enlazar eventos de login_cohete
    login_cohete.onSelected(() => { ruta_contaplus.Focus() })
    login_cohete.onCleared(() => { ruta_contaplus.Blur(true) })
    login_cohete.onError((err) => {
        showErrorDialog("Error iniciando sesión", err)
    })

    // Enlazar eventos de ruta_contaplus
    ruta_contaplus.onSelected(() => { empresa_contaplus.Focus() })
    ruta_contaplus.onCleared(() => { empresa_contaplus.Blur(true) })
    ruta_contaplus.onError((err) => {
        showErrorDialog("Error detectando ruta de instalación de contaplus", err)
    })

    // Enlazar eventos de empresa_contaplus
    empresa_contaplus.onSelected(() => { ejercicios_contaplus.Focus() })
    empresa_contaplus.onCleared(() => { ejercicios_contaplus.Blur(true) })
    ruta_contaplus.onError((err) => {
        showErrorDialog("Error leyendo empresas disponibles", err)
    })

    // Enlazar eventos de ejercicios_contaplus
    ejercicios_contaplus.onSelected(() => { fuentes_contaplus.Focus() })
    ejercicios_contaplus.onCleared(() => { fuentes_contaplus.Blur(true) })
    ejercicios_contaplus.onError((err) => {
        showErrorDialog("Error leyendo ejercicios disponibles", err)
    })

    // Enlazar eventos de fuentes_contaplus
    fuentes_contaplus.onSelected(() => { lanza_trabajo.Focus() })
    fuentes_contaplus.onCleared(() => { lanza_trabajo.Blur(true) })
    fuentes_contaplus.onError((err) => {
        showErrorDialog("Error leyendo fuentes configurables", err)
    })

    // Enlazar eventos de lanza_trabajos
    lanza_trabajo.onSelected(() => { })
    lanza_trabajo.onCleared(() => { })
    lanza_trabajo.onError((err) => {
        showErrorDialog("Error ejecutando actualizacion de Contaplus", err)
    })

    login_cohete.Focus()
});