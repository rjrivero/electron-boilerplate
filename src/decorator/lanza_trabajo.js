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

    // Submit result and update progress bar
    Submit(progress) {
        console.debug("LanzaTrabajo::Submit")
        progress.css("width", "0%")
        return this.cohete.SubmitContaplus(this.contaplus, (percent) => {
            progress.css("width", percent + "%")
        })
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