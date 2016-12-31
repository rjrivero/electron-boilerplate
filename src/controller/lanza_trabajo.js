import { SubmitPanelControl } from './submit_panel'

export class LanzaTrabajoControl extends SubmitPanelControl {

    constructor(model) {
        super(model, "lanza_trabajo", model.GetAttributes())
    }

    // Get cached value from model
    GetValue(param) {
        return this.model.GetValue(param)
    }

    // Submit result and update progress bar
    Submit(progress) {
        progress.css("width", "0%")
        return this.model.Submit((percent) => {
            progress.css("width", percent + "%")
        })
    }
}