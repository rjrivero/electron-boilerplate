import Parser from 'node-dbf'
import path from 'path'

/*
 * Returns a map[string][][year, code], with a list
 * of years and codes per company.
 *
 * Uses the following config vars:
 * - folder: Path to GrupoSP folder
 * - companies: result cache.
 */
export var companies = function(config, folder, refresh = false) {
    return new Promise((resolve, reject) => {
        if (!refresh && config.has('folder') && config.has('companies')) {
            // config.set cannot store a Map
            let companyArray = config.get('companies')
            let companies = new Map()
            if (!(companyArray === undefined)) {
                for (let entry of companyArray) {
                    companies[entry[0]] = entry[1]
                }
            }
            resolve(companies)
            return
        }
        let companyPath = path.join(folder, "ContaBLD", "EMP", "Empresa.dbf")
        let parser = new Parser(companyPath)
        let companies = new Map()
        parser.on('record', (record) => {
            let name = record['NOMBRE']
            let year = record['EJERCICIO']
            let cod = record['COD']
            if (name && year && cod) {
                let current = companies.get(name)
                if (current === undefined) {
                    current = new Array()
                    companies.set(name, current)
                }
                current.push([year, cod])
            }
        })
        parser.on('end', (p) => {
            config.set('folder', folder)
            let companyArray = new Array()
            for (let entry of companies.entries()) {
                companyArray.push(entry)
            }
            // config.set cannot store a Map
            config.set('companies', companyArray)
            resolve(companies)
        })
        try {
            parser.parse()
        } catch (err) {
            reject(err)
        }
    })
}