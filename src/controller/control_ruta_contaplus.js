import { SelectorPanel } from './panel_selector'

export class RutaContaplusControl extends SelectorPanel {

    constructor(model) {
        super(model, "ruta_contaplus")
    }

    // Set cached value to model
    setSelected(selected) {
        this.model.SetFolder(selected)
    }

    // Get cached value from model
    getSelected(selected) {
        return this.model.GetFolder()
    }

    // Turn the result from a model's scan to an option array
    scanValues(refresh) {
        return this.model.ScanFolders(refresh)
        .then((values) => {
            if (!values || !values.length) {
                throw new Error(
                    "No se encuentra la ruta de instalación de Contaplus.\n" +
                    "Por favor, compruebe que Contaplus está correctamente instalado en su equipo.")
            }
            return values
        })
    }
}