import { CheckboxPanelControl } from './checkbox_panel'

/*
 Configuration panel with a login form
 */
export class EjerciciosContaplusControl extends CheckboxPanelControl {

    constructor(model) {
        super(model, "ejercicios_contaplus")
        this.values = null
    }

    // Returns an array with pairs (year, checked)
    GetValues() {
        console.log("EjerciciosContaplus::GetValues")
        return new Promise((resolve, reject) => {
            let result = new Array()
            let companies = this.model.GetCompanies()
            let company = this.model.GetCompany()
            if (companies && company) {
                let current = companies.get(company)
                if (current) {
                    let years = new Array()
                    for (let [year, code] of current) {
                        years.push(year)
                    }
                    // sort descending
                    years.sort((a, b) => {
                        return ((a < b) ? 1 : ((a > b) ? -1 : 0))
                    })
                    // Ony check the first one by default
                    let checked = true
                    for (let year of years) {
                        result.push([year, checked])
                        checked = false
                    }
                }
            }
            this.values = result
            console.log("EjerciciosContaplus::GetValues: result = " + result)
            resolve(result)
        })
    }

    SetValues(checked) {
        this.model.SetYears(checked)
    }
}