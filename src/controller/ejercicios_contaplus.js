import { CheckboxPanelControl } from './checkbox_panel'

/*
 Configuration panel with a login form
 */
export class EjerciciosContaplusControl extends CheckboxPanelControl {

    constructor(model) {
        super(model, "ejercicios_contaplus")
        this.values = null
    }

    // Returns an array with pairs (year, checked)
    GetValues() {
        console.log("EjerciciosContaplus::GetValues")
        return new Promise((resolve, reject) => {
            resolve(this.model.GetYearsAvailable())
        })
    }

    SetValues(checked) {
        this.model.SetYearsSelected(checked)
    }
}