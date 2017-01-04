// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import { ipcMain, Menu, Tray } from 'electron'
import AutoLaunch from 'auto-launch'

export class Settings {

    constructor(app, window, env) {
        this.app = app
        this.window = window
        this.env = env
        this.tray = null
        this.quitting = false
        this.options = {
            "start_on_boot": env.start_on_boot,
            "minimize_to_tray": env.minimize_to_tray,
            "auto_update": env.auto_update
        }
        // Listen to "update-settings" event.
        let self = this
        ipcMain.removeAllListeners("update-settings")
        ipcMain.on("update-settings", (event, arg) => {
            // Asocio el minimize to tray con el start on boot
            arg.minimize_to_tray = arg.start_on_boot
            this.Update(arg)
        })
        // Create auto-launcher
        this.launcher = new AutoLaunch({
            name: env.name,
            isHidden: true
        })
    }

    // Builds system tray
    buildTray() {
        let self = this
        const trayMenu = Menu.buildFromTemplate([
            { label: 'Restaurar aplicación', click: () => { self.window.show() } },
            { label: 'Salir', click: () => {
                console.log("Quitting App!")
                self.quitting = true;
                self.app.quit();
            } }
        ])
        let platform = require('os').platform();
        let baseFolder = __dirname
        let trayImage = baseFolder + "/img/tray.png"
        // Determine appropriate icon for platform
        if (platform == "darwin") {
            trayImage = baseFolder + "/img/trayTemplate.png"
        }
        else if (platform == "win32") {
            trayImage = baseFolder + "\\img\\tray.ico"
        }
        let tray = new Tray(trayImage)
        if (platform == "darwin") {
            tray.setPressedImage(baseFolder + "/img/trayHighlight.png")
        }
        tray.setToolTip("Actualizador Contaplus")
        tray.setContextMenu(trayMenu)
        tray.on("double-click", () => {
            if (self.window) {
                self.window.show()
            }
        })
        return tray
    }

    // Update settings
    Update(options = null) {
        let self = this
        if (!options) {
            options = self.options
        }
        // Get settings
        let minimize_to_tray = options["minimize_to_tray"] || false
        let start_on_boot = options["start_on_boot"] || false
        if (start_on_boot) {
            minimize_to_tray = true
        }
        // Manage "minimize to tray" setting
        self.window.removeAllListeners("minimize")
        self.window.removeAllListeners("close")
        if (minimize_to_tray) {
            if (!self.tray) {
                self.tray = self.buildTray()
            }
            self.window.on("minimize", (event) => {
                event.preventDefault()
                self.window.hide();
            })
            self.window.on("close", (event) => {
                if (!self.quitting) {
                    event.preventDefault()
                    self.window.hide();
                }
            })
        } else {
            if (self.tray) {
                self.tray.destroy()
                self.tray = null
            }
        }
        self.options["minimize_to_tray"] = minimize_to_tray
        // Manage "start_on_boot" setting
        if (self.env.name === "production") {
            let prom = null
            if (start_on_boot) {
                prom = self.launcher.enable()
            } else {
                prom = self.launcher.disable()
            }
            prom.then((...args) => {
                console.log("Start on boot OK: " + args)
            })
            .catch((...err) => {
                console.log("Start on boot ERROR: " + err)
            })
        }
    }
}