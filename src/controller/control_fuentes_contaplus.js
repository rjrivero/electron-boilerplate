import { CheckboxPanel } from './panel_checkbox'

/*
 Configuration panel with a login form
 */
export class FuentesContaplusControl extends CheckboxPanel {

    constructor(model) {
        super(model, "fuentes_contaplus")
        this.values = null
    }

    // Returns an array with triplets (year, checked, label)
    scanValues() {
        console.log("FuentesContaplus::GetValues")
        return this.model.ScanAvailableSources()
    }

    setSelected(checked) {
        this.model.SetSelectedSources(checked)
    }
}