// Decorador para lanza_trabajo

export class LanzaTrabajo  {

    constructor(contaplus, cohete) {
        this.contaplus = contaplus
        this.cohete = cohete
    }

    // Get cached value from model
    GetSelected() {
        // Todos los valores seleccionados!
        console.debug("LanzaTrabajo::GetSelected")
        let contaplus = this.contaplus
        let cohete = this.cohete
        let result = new Map()
        result.set("usuario", cohete.GetEmail())
        result.set("ruta", contaplus.GetSelectedFolder())
        result.set("empresa", contaplus.GetSelectedCompany())
        result.set("ejercicios", this.joinField(
            contaplus.GetSelectedYears(), 0, "years", 0))
        //result.set("fuentes", this.joinField(cohete.GetSelectedSources(), 2))
        return result
    }

    // Test if the form is ready for submission
    Prefly(progress_callback) {
        console.debug("LanzaTrabajo::Prefly")
        return this.cohete.PreflyContaplus(this.contaplus, progress_callback)
    }

    // Submit result and update progress bar
    Submit(progress_callback) {
        console.debug("LanzaTrabajo::Submit")
        return this.cohete.SubmitContaplus(this.contaplus, progress_callback)
    }

    joinField(items, ...indexes) {
        let result = new Array()
        for (let item of items) {
            let value = item
            for (let index of indexes) {
                value = value[index]
            }
            result.push(value)
        }
        return result.join(", ")
    }
}