import drivelist from 'drivelist'
import fs from 'fs'
import path from 'path'
import Parser from 'node-dbf'
import domain from 'domain'

// Contaplus Company data
export class ContaplusCompany {

    constructor(item) {
        this.name = item.name
        this.years = (item.years === undefined) ? new Array() : item.years
        this.codes = (item.codes === undefined) ? new Array() : item.codes
    }

    // Push a new year and code
    Push(year, code) {
        this.years.push(year)
        this.codes.push(code)
        return this
    }

    // Returns the intersection of this and other
    Intersect(other) {
        console.debug("ContaplusCompany::Intersect (" + this + ") ^ (" + other + ")")
        let result = new ContaplusCompany({ name: this.name })
        // My years and codes
        let theseYears = this.years
        let theseCodes = this.codes
        // Compare to these years and codes
        let otherYears = other.years
        let otherCodes = other.codes
        for (let i = 0; i < otherYears.length; i++) {
            let year = otherYears[i]
            let code = (otherCodes) ? otherCodes[i] : null
            for (let j = 0; j < theseYears.length; j++) {
                // If years match
                if (year == theseYears[j] && (!code || code == theseCodes[j])) {
                    result.Push(theseYears[j], theseCodes[j])
                }
            }
        }
        return result
    }

    // Returns an array of options. Each option has three fields:
    // [ company(ContaplusCompany), checked(bool), label(string) ]
    // sorted by year (descending)
    Options() {
        console.debug("ContaplusCompany::Options")
        let options = new Array()
        for (let i = 0; i < this.years.length; i++) {
            // Create a single-code Contaplus Company
            let value = new ContaplusCompany({
                name: this.name,
            }).Push(this.years[i], this.codes[i])
            // Label is year plus code
            let label = value.years[0] + " (Cód." + value.codes[0] + ")"
            // Add the option
            options.push([value, false, label])
        }
        // sort by year, descending
        function cmp(a, b) {
            let yearA = a[0].years[0]
            let yearB = b[0].years[0]
            return (yearB > yearA) ? 1 : ((yearB < yearA) ? -1 : 0)
        }
        options.sort(cmp)
        return options
    }

    toString() {
        return JSON.stringify(this)
    }
}

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
        console.log("ContaplusModel::ScanFolders(" + refresh + ")")
        let config = this.config
        let self = this
        return new Promise((resolve, reject) => {
            if (!refresh && config.has('folders')) {
                resolve(config.get('folders'))
                return
            }
            // If refreshing folder discovery, remove caches
            if (refresh) {
                this.SetSelectedFolder(null)
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
        .then((folders) => {
            console.log("ContaplusModel::scanFolders:result = " + folders)
            return folders
        })
    }

    // Gets the currently selected folder
    GetSelectedFolder() {
        console.log("ContaplusModel::GetSelectedFolder")
        return this.config.get("folder")
    }

    // Selects a new folder
    SetSelectedFolder(folder) {
        console.log("ContaplusModel::SetSelectedFolder(" + folder + ")")
        // Remove companies if folder is being changed or cleared
        let config = this.config
        let currentFolder = this.GetSelectedFolder()
        if (!folder || (currentFolder && (folder != currentFolder))) {
            config.delete("companies")
        }
        if (folder) {
            config.set("folder", folder)
        } else {
            config.delete("folder")
        }
    }

    // Gets the list of available companies
    // "filterCompanies" is an optional filter function that
    // returns a promise filtering the set of available
    // companies, before saving them.
    ScanCompanies(refresh = false, filterCompanies = null) {
        console.log("ContaplusModel::ScanCompanies("+ refresh + ")")
        let config = this.config
        let self = this
        return new Promise((resolve, reject) => {
            let folder = self.GetSelectedFolder()
            if (!folder) {
                console.log("ContaplusModel::ScanCompanies: no folder set")
                reject("Contaplus Folder not set!")
                return
            }
            if (refresh) {
                // If we want a refresh, remove companies cache
                config.delete("companies")
            } else if (config.has('companies')) {
                resolve(self.unpackCompanies(config.get("companies")))
                return
            }
            try {
                // Need to use domain to catch unhandled exceptions in node-dbf
                // This is an ugly hack because parse-dbf fails with an uncaught
                // exception if the fie does not exist. Talk about ugly...
                // see https://nodejs.org/api/domain.html
                // Besides, this is deprecated in node v7.x
                let errDomain = domain.create()
                errDomain.on('error', function(err) {
                    reject(err)
                })
                errDomain.run(function() {
                    let companyPath = path.join(folder, "ContaBLD", "EMP", "Empresa.dbf")
                    let parser = new Parser(companyPath)
                    let companies = new Map()
                    parser.on('header', (header) => { /* catch errors */ })
                    parser.on('record', (record) => {
                        let name = record['NOMBRE']
                        let year = record['EJERCICIO']
                        let cod = record['COD']
                        if (name && year && cod) {
                            let currentCompany = companies.get(name)
                            if (currentCompany === undefined) {
                                currentCompany = new ContaplusCompany({
                                    name: name
                                })
                                companies.set(name, currentCompany)
                            }
                            currentCompany.Push(year, cod)
                        }
                    })
                    parser.on('end', (p) => {
                        resolve(companies)
                    })
                    parser.parse()
                })
            } catch (err) {
                reject(err)
            }
        })
        .then((companies) => {
            // Filter the companies, if they are not cached yet
            if (config.get("companies") === undefined) {
                if (filterCompanies) {
                    return filterCompanies(companies)
                }
            }
            return companies
        })
        .then((companies) => {
            // Pack the companies
            if (config.get("companies") === undefined) {
                config.set("companies", self.packCompanies(companies))
            }
            return companies
        })
    }

    // Turn a companies map to a JSON object, an array
    // of entries with { name: "", years: [], codes: [] }
    CompaniesToJSON(companies) {
        console.log("ContaplusModel::CompaniesToJSON")
        return this.packCompanies(companies)
    }

    // Filters a Company map using a JSON object
    // in the format { name: "", years: [], codes: [] }
    JSONToCompanies(originalCompanies, jsonData) {
        console.log("ContaplusModel::JSONToCompanies")
        let companies = new Map()
        for (let other of jsonData) {
            let original = originalCompanies.get(item.name)
            if (original) {
                let result = original.Intersect(other)
                if (result.years) {
                    companies.set(item.name, result)
                }
            }
        }
        return companies
    }

    // Gets the currently selected folder
    GetSelectedCompany() {
        console.log("ContaplusModel::GetSelectedCompany")
        return this.config.get("company")
    }

    // Selects a new folder
    SetSelectedCompany(company) {
        console.log("ContaplusModel::SetSelectedCompany(" + company + ")")
        // Remove companies if folder is being changed or cleared
        if (company) {
            this.config.set("company", company)
        } else {
            this.config.delete("company")
        }
    }

    // Returns an array with triples (year, checked, label)
    ScanYears(refresh = false, filterCompanies = null) {
        console.log("ContaplusModel::ScanYears(" + refresh + ")")
        let self = this
        return self.ScanCompanies(refresh, filterCompanies)
        .then((companies) => {
            let result  = new Array()
            if (companies) {
                let company = this.GetSelectedCompany()
                if (company) {
                    let current = companies.get(company)
                    if (current) {
                        result = current.Options()
                        if (result.length) {
                            result[0][1] = true
                        }
                    }
                }
            }
            return result
        })
    }

    // Sets the selected years
    SetSelectedYears(years) {
        console.log("ContaplusModel::SetSelectedYears (" + years + ")")
        this.years_selected = years
    }

    // Gets the selected years
    GetSelectedYears() {
        console.log("ContaplusModel::GetSelectedYears")
        if (this.years_selected === undefined) {
            this.years_selected = new Array()
        }
        return this.years_selected
    }

    // Unpacks a Map of company name => []years
    unpackCompanies(packedCompanies) {
        console.log("ContaplusModel::unpackCompanies")
        // Builds a Map (config-store saves an Array)
        let companies = new Map()
        for (let entry of packedCompanies) {
            companies.set(entry.name, new ContaplusCompany(entry))
        }
        return companies
    }

    // Packs a Map of companies to array name => years
    packCompanies(companies) {
        let values = Array.from(companies.values())
        console.log("ContaplusModel::packCompanies(" + values + ")")
        // Store as a hash (config-store cannot save a map)
        return values
    }

    // Tests if a file exists
    testFile(fileName, wantDir = true) {
        console.debug("ContaplusModel::testFile(" + fileName + ")")
        return new Promise((resolve, reject) => {
            fs.stat(fileName, (err, stats) => {
                if (err) {
                    if (err.code == "ENOENT") {
                        resolve(false)
                    } else {
                        reject(err)
                    }
                } else {
                    resolve(stats.isDirectory() == wantDir)
                }
            })
        })
        .then((isFile) => {
            console.log("ContaplusModel::testFile(" + fileName + ", " + wantDir + ") = " + isFile)
            return isFile
        })
    }

    // Test if the given path has a "GrupoSP" folder and an "Empresa.dbf" file
    testGrupoSP(mount) {
        console.debug("ContaplusModel::testGrupoSP(" + mount + ")")
        let self = this
        let test = path.join(mount, "GrupoSP")
        return self.testFile(test, true)
        .then((isDir) => {
            if (!isDir) {
                return false
            } else {
                let empFile = path.join(mount, "GrupoSP", "ContaBLD", "EMP", "Empresa.dbf")
                return self.testFile(empFile, false)
            }
        })
        .then((isFile) => {
            return (isFile ? test : null)
        })
    }

    // Remove configuration
    RemoveConfig() {
        this.config.delete("folders")
        this.config.delete("folder")
        this.config.delete("companies")
        this.config.delete("company")
        delete(this.years_selected)
    }
}