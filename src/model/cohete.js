import { ContaplusCompany } from './contaplus'
import unirest from 'unirest';

export class CoheteModel {

    constructor(config, env) {
        this.config = config
        this.env = env
    }

    // Gets the cached user's email
    GetEmail() {
        return this.config.get("email")
    }

    // Saves the cached user's email
    SetEmail(email) {
        // If email changes, then token must be cleared.
        let prevEmail = this.GetEmail()
        if (prevEmail && prevEmail != email) {
            this.config.delete("token")
        }
        this.config.set("email", email)
    }

    // Checks the email credentials are valid
    CheckEmail(email, pass) {
        console.log("CoheteModel::CheckEmail (" + email + ")")
        let env = this.env
        // Build request
        let url = env.url_credentials
        let username = env.url_username
        let password = env.url_password
        let self = this
        // Configure the client
        return new Promise((resolve, reject) => {
            unirest.post(url)
            .header('Accept', 'application/json')
            .field(username, email)
            .field(password, pass)
            .timeout(3000)
            .end((response) => {
                try {
                    if (response.ok) {
                        self.SetEmail(email)
                        self.setToken(response.body.message)
                        resolve(response.body)
                    } else {
                        let err = "Error contactando con el servidor.\n" +
                            "Por favor compruebe sus credenciales y su conexión a Internet.\n"
                        if (response.body && response.body.message) {
                            err += "El servidor respondió: " + response.body.message
                        }
                        reject(err)
                    }
                } catch(err) {
                    reject(err)
                }
            })
        })
    }

    // Gets the cached token
    getToken() {
        return this.config.get("token")
    }

    // Sets the cached token
    setToken(token) {
        this.config.set("token", token)
    }

    // Check the token is still valid
    CheckToken(email) {
        console.log("CoheteModel::CheckToken")
        let url = this.env.url_validate
        let token = this.getToken()
        let self = this
        return new Promise((resolve, reject) => {
            // The token is only valid if the email remains the same
            if(!token || (email && email != self.GetEmail())) {
                resolve(false)
            }
            unirest.get(url)
            .header("Accept", "application/json")
            .header("X-Access-Token", token)
            .timeout(3000)
            .end((response) => {
                try {
                    if (response.ok) {
                        console.log("CheckToken: " + JSON.stringify(response.body))
                        resolve(response.body.success === true)
                    } else if (response.code == 401) {
                        // Credentials are expired
                        reject("Nombre de usuario o contraseña incorrectos")
                    } else {
                        let err = "Error contactando con el servidor.\n" +
                            "Por favor compruebe sus credenciales y su conexión a Internet.\n"
                        if (response.body && response.body.message) {
                            err += "El servidor respondió: " + response.body.message
                        }
                        reject(err)
                    }
                } catch(err) {
                    reject(err)
                }
            })
        })
    }

    /*
    ScanSources() {
        console.log("CoheteModel::ScanSources")
        return new Promise((resolve, reject) => {
            let result = [
                ["balance", true, "Balance"],
                ["pyg", true, "Cuenta de resultados"],
                ["cobros", true, "Cobros"],
                ["compras", true, "Compras"],
                ["facturas", true, "Facturas"]
            ]
            this.fuentes = result
            resolve(result)
        })
    }

    SetSelectedSources(fuentes) {
        console.log("CoheteModel::SetSelectedSources (" + fuentes + ")")
        this.fuentes_selected = fuentes
    }

    GetSelectedSources() {
        console.log("CoheteModel::GetSelectedSources")
        if (this.fuentes_selected === undefined) {
            this.fuentes_selected = new Array()
        }
        return this.fuentes_selected
    }
    */

    // Submits the files selected by contaplus
    SubmitContaplus(contaplus, progress_callback) {
        console.debug(`CoheteModel::SubmitContaplus`)
        let self = this
        return contaplus.FilesToUpload()
        .then((stats) => {
            let totalSize = 0
            for (let item of stats) {
                if (!item.stats.size) {
                    throw new Error(`No se ha podido determinar el tamaño del fichero <b>${item.localFile}`)
                } else if (item.stats.size > self.env.max_file_size) {
                    throw new Error(`El fichero <b>${item.localFile} es demasiado grande, no se puede importar`)
                }
                // Total bytes up to this item
                item.prevSize = totalSize
                // Total of bytes to upload, including this item
                totalSize += item.stats.size
                item.postSize = totalSize
            }
            return stats
        })
        .then((stats) => {
            let statsLen = stats.length
            if (statsLen > 0) {
                let totalSize = stats[statsLen-1].postSize
                // unwind the stats array, uploading a file at a time
                return self.uploadNext(stats, totalSize, 0, progress_callback)
            }
            return true // done
        })
        .then((done) => {
            return "Todos los ficheros correctamente subidos"
        })
    }

    // Uploads a single file, reports progress
    uploadNext(stats, totalSize, index, progress_callback) {
        let self = this
        console.debug(`CoheteModel::uploadNext(stats, ${totalSize}, ${index})`)
        return new Promise((resolve, reject) => {
            if (index >= stats.length) {
                resolve(true)
                return
            }
            let current   = stats[index]
            let fileSize  = current.stats.size
            let progress  = current.prevSize
            let increment = fileSize / 10
            console.debug(`CoheteModel::uploadNext:current = ${current}, from byte ${progress} to byte ${progress+fileSize} in increments of ${increment}`)
            function chunk() {
                let percent = Math.min(Math.floor((progress * 100) / totalSize), 100)
                console.debug(`Progress: up to ${progress} of ${totalSize} (${percent}%)`)
                progress_callback(percent)
                if (progress >= fileSize) {
                    resolve(false) // this file is done, go for next one
                } else {
                    progress += increment
                    setTimeout(chunk, 250)
                }
            }
            setTimeout(chunk, 250)
        })
        .then((done) => {
            // If index < stats.length, go for next one
            if (!done) {
                return self.uploadNext(stats, totalSize, index+1, progress_callback)
            }
            // otherwise, we are done
            return true
        })
    }

    // Clears the cached configs
    RemoveConfig() {
        this.config.delete("email")
        this.config.delete("token")
    }
}