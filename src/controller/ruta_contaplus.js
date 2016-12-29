import { SelectorPanelControl } from './common'
import { enableButton } from './tools'

export class RutaContaplusControl extends SelectorPanelControl {

    constructor(model) {
        super(model, "ruta_contaplus")
        this.search = $("#ruta_contaplus_search")
        let self = this
        this.search.off().on("click", (event) => {
            event.preventDefault()
            self.populateSelector(true)
        })
    }

    // Activates the control, sets focus on the tab
    Focus() {
        super.Focus()
        // Enable search button
        enableButton(this.search)
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