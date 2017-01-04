// Receives a Map of Contaplus companies, filters those accepted
export function FiltroContaplus (contaplus, cohete) {
    return ((companies) => {
        console.debug("FiltroContaplus::(" +
            Array.from(companies.entries()) + ")")
        return new Promise((resolve, reject) => {
            resolve(companies)
        })
    })
}