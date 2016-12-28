import drivelist from 'drivelist'
import fs from 'fs'
import path from 'path'

class ContaplusManager {

    /**
     * Returns a list of GrupoSP folders.
     *
     * Uses the following config vars:
     * - folders: Set of 'GrupoSP' folders
     */
    Scan(config, refresh = false) {
        let self = this
        return new Promise((resolve, reject) => {
            if (!refresh && config.has('folders')) {
                resolve(config.get('folders'))
                return
            }
            // Enumerate drives
            drivelist.list((error, drives) => {
                if (error) {
                    reject(error)
                    return
                }
                // Build a set of directories to try
                let promises = new Array()
                for (let disk of drives) {
                    for (let mount of disk.mountpoints) {
                        promises.push(self.testGrupoSP(mount.path))
                    }
                }
                // If no dir found, resolve null
                if (promises.length <= 0) {
                    resolve(null)
                    return
                }
                // Return all the folders that have "GrupoSP" on it
                Promise.all(promises)
                .then((values) => {
                    let filtered = new Array()
                    for (let value of values) {
                        if (value) {
                            filtered.push(value)
                        }
                    }
                    if (filtered.length <= 0) {
                        resolve(null)
                    } else {
                        config.set('folders', filtered)
                        resolve(filtered)
                    }
                })
                .catch((err) => {
                    reject(err)
                })
            })
        })
    }

    Companies(config, folder, refresh = false) {
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

    // Test if the given path has a "GrupoSP" folder
    testGrupoSP(mount) {
        return new Promise((resolve, reject) => {
            let test = path.join(mount, "GrupoSP")
            fs.stat(test, (err, stats) => {
                if (err) {
                    if (err.code == "ENOENT") {
                        resolve(null)
                    } else {
                        reject(err)
                    }
                } else if (!stats.isDirectory()) {
                    resolve(null)
                } else  {
                    resolve(test)
                }
            })
        })
    }
}

export var contaplus_manager = new ContaplusManager()