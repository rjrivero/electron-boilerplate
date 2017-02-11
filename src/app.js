// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import Config from 'electron-config';

import env from './env';
console.log('Loaded environment variables:', env);

// Models
import { ContaplusModel } from './model/contaplus';
import { CoheteModel } from './model/cohete';
import { AjustesModel } from './model/ajustes';

// Decorators
import { CredencialesUsuario } from './decorator/credenciales_usuario';
import { RutaContaplus } from './decorator/ruta_contaplus';
import { EmpresaContaplus } from './decorator/empresa_contaplus';
import { EjerciciosContaplus } from './decorator/ejercicios_contaplus';
//import { FuentesContaplus } from './decorator/fuentes_contaplus';
import { LanzaTrabajo } from './decorator/lanza_trabajo';

//Controls
import { bindToggles, showErrorDialog } from './controller/panel_tools';
import { CheckboxPanel } from './controller/panel_checkbox';
import { LoginPanel } from './controller/panel_login';
import { SelectorPanel } from './controller/panel_selector';
import { SubmitPanel } from './controller/panel_submit';

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
// console.log('The author of this app is:', appDir.read('package.json', 'json').author);

document.addEventListener('DOMContentLoaded', function () {
    //document.getElementById('greet').innerHTML = greet();
    //document.getElementById('platform-info').innerHTML = os.platform();
    //document.getElementById('env-name').innerHTML = env.name;

    // Activate the toggling of asistente
    bindToggles()

    // Configuration and models
    let config = new Config({ name: env.name })
    let contaplus = new ContaplusModel(config, env)
    let cohete = new CoheteModel(config, env)
    let ajustes = new AjustesModel(config, env)

    // Controllers
    let login_cohete = new LoginPanel("credenciales_usuario",
        new CredencialesUsuario(cohete))
    let ruta_contaplus = new SelectorPanel("ruta_contaplus",
        new RutaContaplus(contaplus))
    let empresa_contaplus = new SelectorPanel("empresa_contaplus",
        new EmpresaContaplus(contaplus, cohete))
    let ejercicios_contaplus = new CheckboxPanel("ejercicios_contaplus",
        new EjerciciosContaplus(contaplus, cohete))
    //let fuentes_contaplus = new FuentesContaplus("fuentes_contaplus", cohete_model)
    let lanza_trabajo = new SubmitPanel("lanza_trabajo",
        new LanzaTrabajo(contaplus, cohete))
    let panel_ajustes = new CheckboxPanel("ajustes", ajustes)

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
    ejercicios_contaplus.onSelected(() => { lanza_trabajo.Focus() })
    ejercicios_contaplus.onCleared(() => { lanza_trabajo.Blur(true) })
    ejercicios_contaplus.onError((err) => {
        showErrorDialog("Error leyendo ejercicios disponibles", err)
    })

    // Enlazar eventos de fuentes_contaplus
    /*fuentes_contaplus.onSelected(() => { lanza_trabajo.Focus() })
    fuentes_contaplus.onCleared(() => { lanza_trabajo.Blur(true) })
    fuentes_contaplus.onError((err) => {
        showErrorDialog("Error leyendo fuentes configurables", err)
    })*/

    // Enlazar eventos de lanza_trabajos
    lanza_trabajo.onSelected(() => { })
    lanza_trabajo.onCleared(() => { })
    lanza_trabajo.onError((err) => {
        showErrorDialog("Error ejecutando actualizacion de Contaplus", err)
    })

    // Enlazar eventos del panel ajustes
    panel_ajustes.onSelected(() => {
        panel_ajustes.Show()
        let ajustesMap = ajustes.GetSelectedAsMap()
        console.debug("panel_ajustes::onSelected " + Array.from(ajustesMap.entries()))
        if (ajustesMap.get("remove_config")) {
            console.debug("panel_ajustes::onSelected:CLEARING CONFIG")
            // Remove configs
            cohete.RemoveConfig()
            contaplus.RemoveConfig()
            ajustes.RemoveConfig()
            // Blur nodes, and focus login again
            login_cohete.Blur(true)
            panel_ajustes.Focus()
            login_cohete.Focus()
        }
    })
    panel_ajustes.onCleared(() => {
        panel_ajustes.Show()
    })
    panel_ajustes.onError((err) => {
        panel_ajustes.Show()
        showErrorDialog("Error leyendo ajustes de la aplicación", err)
    })

    panel_ajustes.Focus()
    login_cohete.Focus()
});