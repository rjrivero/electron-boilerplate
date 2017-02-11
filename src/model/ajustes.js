import { ipcRenderer } from 'electron'


export class AjustesModel {

    constructor(config, env) {
        this.config = config
        this.env = env
        // Propagate settings
        let self = this
        self.ScanValues().then((options) => {
            self.SetSelected(options)
        })
    }

    ScanValues(refresh = false) {
        console.log("AjustesModel::ScanValues")
        let self = this
        return new Promise((resolve, reject) => {
            let start_on_boot = this.config.get("start_on_boot")
            let minimize_to_tray = this.config.get("minimize_to_tray")
            let auto_update = this.config.get("auto_update")
            let env = this.env
            let result = [
                /*
                ["start_on_boot",
                    (start_on_boot === undefined) ? env.start_on_boot : start_on_boot,
                    "Arrancar automáticamente al iniciar sesión"],
                ["auto_update",
                    (auto_update === undefined) ? env.auto_update : auto_update,
                    "Actualizar automáticamente"]*/
                ["minimize_to_tray",
                    (minimize_to_tray === undefined) ? env.minimize_to_tray : minimize_to_tray,
                    "Mantener la aplicación minimizada en la bandeja de aplicaciones"],
                ["remove_config",
                    false,
                    "Borrar todas las configuraciones"]
            ]
            if (self.env.name !== 'production') {
            }
            resolve(result)
        })
    }

    SetSelected(options) {
        console.log("AjustesModel::SetSelected (" + options + ")")
        let optionMap = new Object()
        // Propagate event to main thread
        this.options = options
        for (let option of options) {
            optionMap[option[0]] = option[1]
        }
        ipcRenderer.send("update-settings", optionMap)
    }

    GetSelected() {
        console.log("AjustesModel::GetSelected")
        if (this.options === undefined) {
            this.options = new Array()
        }
        return this.options
    }

    GetSelectedAsMap() {
        console.log("AjustesModel::GetSelectedAsMap")
        let result = new Map()
        for (let item of this.GetSelected()) {
            result.set(item[0], item[1])
        }
        return result
    }

    RemoveConfig() {
        this.config.delete("start_on_boot")
        this.config.delete("minimize_to_tray")
        this.config.delete("auto_update")
    }
}