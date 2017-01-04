//  Decorador para EjerciciosContaplus

import { FiltroContaplus } from './filtro_contaplus'

export class EjerciciosContaplus {

    constructor(contaplus, cohete) {
        this.contaplus = contaplus
        this.cohete = cohete
    }

    // Returns an array with triplets (code, checked, label)
    ScanValues(refresh = false) {
        console.debug("EjerciciosContaplus::ScanValues(" + refresh + ")")
        return this.contaplus.ScanYears(refresh,
            FiltroContaplus(this.contaplus, this.cohete))
    }

    SetSelected(selected) {
        console.debug("EjerciciosContaplus::SetSelected(" + selected + ")")
        this.contaplus.SetSelectedYears(selected)
    }

    GetSelected() {
        console.debug("EjerciciosContaplus::GetSelected")
        return this.contaplus.GetSelectedYears()
    }
}