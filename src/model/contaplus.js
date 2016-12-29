import drivelist from 'drivelist'
import fs from 'fs'
import path from 'path'
import Parser from 'node-dbf'

export class ContaplusModel {

    // config is an electron-config object
    constructor(config) {
        this.config = config
    }

    /**
     * Returns a list of GrupoSP folders.
     *
     * Uses the following config vars:
     * - folders: Set of 'GrupoSP' folders
     */
    ScanFolders(refresh = false) {
        console.log("ContaplusModel::ScanFolders")
        let config = this.config
        let self = this
        return new Promise((resolve, reject) => {
            if (!refresh && config.has('folders')) {
                resolve(config.get('folders'))
                return
            }
            // If refreshing folder discovery, remove caches
            if (refresh) {
                this.SetFolder(null)
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

    // Gets the currentl selected folder
    GetFolder() {
        console.log("ContaplusModel::GetFolder")
        return this.config.get("folder")
    }

    // Selects a new folder
    SetFolder(folder) {
        console.log("ContaplusModel::SetFolder(" + folder + ")")
        // Remove companies if folder is being changed or cleared
        let config = this.config
        let currentFolder = this.GetFolder()
        if (!folder || (currentFolder && (folder != currentFolder))) {
            config.delete("companies")
            config.delete("company")
        }
        if (folder) {
            config.set("folder", folder)
        } else {
            config.delete("folder")
        }
    }

    ScanCompanies(refresh = false) {
        console.log("ContaplusModel::ScanCompanies")
        let config = this.config
        let self = this
        return new Promise((resolve, reject) => {
            let ended  = false
            let folder = self.GetFolder()
            if (!folder) {
                console.log("ContaplusModel::ScanCompanies: no folder set")
                reject("Contaplus Folder not set!")
                return
            }
            if (!refresh && config.has('companies')) {
                // Build a Map (config-store saves an Array)
                let companyArray = config.get('companies')
                let companies = new Map()
                for (let entry of companyArray) {
                    companies.set(entry[0], entry[1])
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
                // Store as a hash (config-store cannot save a map)
                let companyArray = new Array()
                for (let entry of companies.entries()) {
                    companyArray.push(entry)
                }
                config.set('companies', companyArray)
                console.log("RESOLVING: " + Array.from(companies.keys()))
                resolve(companies)
            })
            try {
                parser.parse()
            } catch (err) {
                reject(err)
            }
        })
    }

    // Gets the currentl selected folder
    GetCompany() {
        console.log("ContaplusModel::GetCompany")
        return this.config.get("company")
    }

    // Selects a new folder
    SetCompany(company) {
        console.log("ContaplusModel::SetCompany(" + company + ")")
        // Remove companies if folder is being changed or cleared
        if (company) {
            this.config.set("company", company)
        } else {
            this.config.delete("company")
        }
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