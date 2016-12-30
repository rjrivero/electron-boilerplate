import { CheckboxPanelControl } from './checkbox_panel'

/*
 Configuration panel with a login form
 */
export class FuentesContaplusControl extends CheckboxPanelControl {

    constructor(model) {
        super(model, "fuentes_contaplus")
        this.values = null
    }

    // Returns an array with pairs (year, checked)
    GetValues() {
        console.log("FuentesContaplus::GetValues")
        return new Promise((resolve, reject) => {
            resolve([
                ["Balance", true],
                ["Cuenta de resultados", true],
                ["Cobros", true],
                ["Compras", true],
                ["Facturas", true]
            ])
        })
    }

    SetValues(checked) {
    }
}