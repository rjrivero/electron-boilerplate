import { SubmitPanel } from './panel_submit'

export class LanzaTrabajoControl extends SubmitPanel {

    constructor(model) {
        super(model, "lanza_trabajo")
    }

    // Get cached value from model
    getSelected() {
        return this.model.getSelected()
    }

    // Submit result and update progress bar
    submit(progress) {
        progress.css("width", "0%")
        return this.model.submit((percent) => {
            progress.css("width", percent + "%")
        })
    }
}