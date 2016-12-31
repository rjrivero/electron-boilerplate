export class SubmitModel {

    constructor(contaplus, cohete) {
        this.contaplus = contaplus
        this.cohete = cohete
        this.selectors = new Map()
        let selectors = this.selectors
        let self = this
        // Selectores para todos los campos necesarios
        selectors.set("usuario", () => {
            return cohete.GetEmail()
        })
        selectors.set("ruta", () => {
            return contaplus.GetFolder()
        })
        selectors.set("empresa", () => {
            return contaplus.GetCompany()
        })
        selectors.set("ejercicios", () => {
            return self.joinField(contaplus.GetYearsSelected(), 0)
        })
        selectors.set("fuentes", () => {
            return self.joinField(cohete.GetFuentesSelected(), 2)
        })
    }

    joinField(items, index) {
        let result = new Array()
        for (let item of items) {
            result.push(item[index])
        }
        return result.join(", ")
    }

    GetAttributes() {
        console.log("SubmitModel::GetAttributes")
        return Array.from(this.selectors.keys())
    }

    GetValue(value) {
        console.log("SubmitModel::GetValue(" + value + ")")
        let selector = this.selectors.get(value)
        return (selector ? selector() : null)
    }

    Submit(callback) {
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