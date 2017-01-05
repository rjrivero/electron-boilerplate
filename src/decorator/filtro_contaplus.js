import { ContaplusCompany } from '../model/contaplus'

// Receives a Map of Contaplus companies, filters those accepted
export function FiltroContaplus (contaplus, cohete) {
    return ((companies) => {
        console.debug("FiltroContaplus::(" +
            Array.from(companies.values()) + ")")
        return new Promise((resolve, reject) => {
            // Filter entries below 2007
            let result = new Map()
            for (let entry of companies.values()) {
                let newEntry = new ContaplusCompany({ name: entry.name })
                let years = entry.years
                let codes = entry.codes
                for(let j = 0; j < years.length; j++) {
                    if (years[j] >= 2010) {
                        newEntry.Push(years[j], codes[j])
                    }
                }
                if (newEntry.years.length > 0) {
                    result.set(newEntry.name, newEntry)
                }
            }
            resolve(result)
        })
    })
}