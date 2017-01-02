import { CheckboxPanel } from './panel_checkbox'

/*
 Configuration panel with a login form
 */
export class EjerciciosContaplusControl extends CheckboxPanel {

    constructor(model) {
        super(model, "ejercicios_contaplus")
    }

    // Returns an array with triplets (code, checked, label)
    scanValues() {
        console.log("EjerciciosContaplus::GetValues")
        return new Promise((resolve, reject) => {
            resolve(this.model.GetAvailableYears())
        })
    }

    setSelected(checked) {
        this.model.SetSelectedYears(checked)
    }
}