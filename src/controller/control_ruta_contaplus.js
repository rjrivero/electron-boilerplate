// Decorador para ruta_contaplus

export class RutaContaplus {

    constructor(contaplus) {
        this.contaplus = contaplus
    }

    // Set cached value to model
    SetSelected(selected) {
        console.debug("RutaContaplus::SetSelected(" + selected + ")")
        this.contaplus.SetSelectedFolder(selected)
    }

    // Get cached value from model
    GetSelected() {
        console.debug("RutaContaplus::GetSelected")
        return this.contaplus.GetSelectedFolder()
    }

    // Turn the result from a model's scan to an option array
    ScanValues(refresh = false) {
        console.debug("RutaContaplus::ScanValues(" + refresh + ")")
        return this.contaplus.ScanFolders(refresh)
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