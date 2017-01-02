import { SelectorPanel } from './panel_selector'

export class EmpresaContaplusControl extends SelectorPanel {

    constructor(model) {
        super(model, "empresa_contaplus")
    }

    // Set cached value to model
    setSelected(selected) {
        this.model.SetCompany(selected)
    }

    // Get cached value from model
    getSelected(selected) {
        return this.model.GetCompany()
    }

    // Turn the result from a model's scan to an option array
    scanValues(refresh) {
        return this.model.ScanCompanies(refresh).then((valueMap) => {
            if (!valueMap || !valueMap.size) {
                throw new Error("No se encuentran empresas.\n"
                    + "Por favor, cree al menos una empresa en Contaplus.")
            }
            return Array.from(valueMap.keys())
        })
    }
}