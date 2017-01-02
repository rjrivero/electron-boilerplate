//  Decorador para EjerciciosContaplus

export class EjerciciosContaplus {

    constructor(contaplus) {
        this.contaplus = contaplus
    }

    // Returns an array with triplets (code, checked, label)
    ScanValues(refresh = false) {
        console.debug("EjerciciosContaplus::ScanValues(" + refresh + ")")
        return this.contaplus.ScanYears(refresh)
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