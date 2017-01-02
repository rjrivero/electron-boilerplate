export class SubmitModel {

    constructor(contaplus, cohete) {
        this.contaplus = contaplus
        this.cohete = cohete
        this.selectors = new Map()
        let selectors = this.selectors
        let self = this
    }

    joinField(items, index) {
        let result = new Array()
        for (let item of items) {
            result.push(item[index])
        }
        return result.join(", ")
    }

    getSelected() {
        // Todos los valores seleccionados!
        let result = new Map()
        let contaplus = this.contaplus
        let cohete = this.cohete
        result.set("usuario", cohete.GetEmail())
        result.set("ruta", contaplus.GetFolder())
        result.set("empresa", contaplus.GetCompany())
        result.set("ejercicios", this.joinField(contaplus.GetSelectedYears(), 0))
        result.set("fuentes", this.joinField(cohete.GetSelectedSources(), 2))
        return result
    }

    submit(callback) {
        console.log("SubmitModel::Submit")
        return new Promise((resolve, reject) => {
            let progress = 0
            function increment() {
                callback(progress)
                if (progress >= 100) {
                    resolve("Todos los ficheros actualizados")
                } else {
                    progress += 5
                    setTimeout(increment, 250)
                }
            }
            setTimeout(increment, 250)
            callback(progress)
        })
    }

    ScanCompanies(refresh = false) {
        return this.contaplus.ScanCompanies(refresh)
    }

    // Gets a Map of company name => []years
    GetCompanies() {
        return this.contaplus.GetCompanies()
    }

    // Gets the currently selected folder
    GetCompany() {
        return this.contaplus.GetCompany()
    }

    // Selects a new folder
    SetCompany(company) {
        this.contaplus.SetCompany(company)
    }
}