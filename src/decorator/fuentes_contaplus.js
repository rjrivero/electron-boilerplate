// Decorador para FuentesContaplus

export class FuentesContaplus {

    constructor(cohete) {
        this.cohete = cohete
    }

    // Returns an array with triplets (year, checked, label)
    ScanValues(refresh = false) {
        console.debug("FuentesContaplus::ScanValues(" + refresh + ")")
        return this.cohete.ScanSources()
    }

    SetSelected(checked) {
        console.debug("FuentesContaplus::SetSelected(" + values + ")")
        this.cohete.SetSelectedSources(checked)
    }

    GetSelected() {
        console.debug("FuentesContaplus::SetSelected")
        return this.cohete.GetSelectedSources()
    }
}