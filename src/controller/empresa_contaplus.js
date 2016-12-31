import { SelectorPanelControl } from './selector_panel'

export class EmpresaContaplusControl extends SelectorPanelControl {

    constructor(model) {
        super(model, "empresa_contaplus")
    }

    // Set cached value to model
    setValue(selected) {
        this.model.SetCompany(selected)
    }

    // Get cached value from model
    getValue(selected) {
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