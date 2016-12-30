import { SelectorPanelControl } from './selector_panel'

export class RutaContaplusControl extends SelectorPanelControl {

    constructor(model) {
        super(model, "ruta_contaplus")
    }

    // Set cached value to model
    setValue(selected) {
        this.model.SetFolder(selected)
    }

    // Get cached value from model
    getValue(selected) {
        return this.model.GetFolder()
    }

    // Turn the result from a model's scan to an option array
    scanValues(refresh) {
        return this.model.ScanFolders(refresh)
    }
}