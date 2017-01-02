import unirest from 'unirest';

export class AjustesModel {

    constructor(config, env) {
        this.config = config
        this.env = env
    }

    ScanValues() {
        console.log("AjustesModel::ScanValues")
        let self = this
        return new Promise((resolve, reject) => {
            let start_on_boot = this.config.get("start_on_boot")
            let minimize_to_tray = this.config.get("minimize_to_tray")
            let auto_update = this.config.get("auto_update")
            let env = this.env
            let result = [
                ["start_on_boot",
                    (start_on_boot === undefined) ? env.start_on_boot : start_on_boot,
                    "Arrancar al iniciar sesión"],
                ["minimize_to_tray",
                    (minimize_to_tray === undefined) ? env.minimize_to_tray : minimize_to_tray,
                    "Mantener en la bandeja de tareas"],
                ["auto_update",
                    (auto_update === undefined) ? env.auto_update : auto_update,
                    "Actualizar automáticamente"]
            ]
            if (self.env.name !== 'production') {
                result.push(["remove_config",
                    false,
                    "Borrar todas las configuraciones"]
                )
            }
            resolve(result)
        })
    }

    SetSelected(options) {
        console.log("AjustesModel::SetSelected (" + options + ")")
        this.options = options
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