// Decorador para EmpresaContaplus

import { FiltroContaplus } from './filtro_contaplus'

export class EmpresaContaplus {

    constructor(contaplus, cohete) {
        this.contaplus = contaplus
        this.cohete = cohete
    }

    // Turn the result from a model's scan to an option array
    ScanValues(refresh = false) {
        console.debug("EmpresaContaplus::ScanValues(" + refresh + ")")
        let self = this
        return self.contaplus.ScanCompanies(refresh,
            FiltroContaplus(self.contaplus, self.cohete))
        .then((valueMap) => {
            if (!valueMap || !valueMap.size) {
                throw new Error("No se encuentran empresas.\n"
                    + "Por favor, cree al menos una empresa en Contaplus.")
            }
            // TODO: pasar las empresas por un endpoint.
            return Array.from(valueMap.keys())
        })
    }

    // Set cached value to model
    SetSelected(selected) {
        console.debug("EmpresaContaplus::SetSelected(" + selected + ")")
        this.contaplus.SetSelectedCompany(selected)
    }

    // Get cached value from model
    GetSelected() {
        console.debug("EmpresaContaplus::GetSelected")
        return this.contaplus.GetSelectedCompany()
    }
}