import { CheckboxPanelControl } from './checkbox_panel'

/*
 Configuration panel with a login form
 */
export class FuentesContaplusControl extends CheckboxPanelControl {

    constructor(model) {
        super(model, "fuentes_contaplus")
        this.values = null
    }

    // Returns an array with triplets (year, checked, label)
    GetValues() {
        console.log("FuentesContaplus::GetValues")
        return this.model.ScanFuentesAvailable()
    }

    SetValues(checked) {
        this.model.SetFuentesSelected(checked)
    }
}