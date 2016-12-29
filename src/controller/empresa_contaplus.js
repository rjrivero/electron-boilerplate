import { SelectorPanelControl } from './common'

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
            return Array.from(valueMap.keys())
        })
    }
}