import { ContaplusCompany } from './contaplus'
import fs from 'fs';
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

    // Posts a request
    _post(url, data, token) {
        console.log(`CoheteModel::_post(${url})`)
        let self = this
        return new Promise((resolve, reject) => {
            try {
                let req = unirest.post(url)
                .header('Accept', 'application/json')
                .timeout(self.env.url_timeout)
                if (token) {
                    req = req.header("X-Access-Token", token)
                }
                if (data) {
                    // XXX DEBUG
                    req = req.field("subject", data.email)
                    .field("secret", data.password)
                    //req = req.send(data)
                }
                req.end((response) => {
                    if (response.ok) {
                        resolve(response)
                    } else {
                        reject(self._error(response))
                    }
                })
            } catch(err) {
                reject(self._error(err))
            }
        })
    }

    // Gets a request
    _get(url, data, token) {
        console.log(`CoheteModel::_get(${url})`)
        let self = this
        return new Promise((resolve, reject) => {
            try {
                let req = unirest.get(url)
                .header('Accept', 'application/json')
                .timeout(self.env.url_timeout)
                if (token) {
                    req = req.header("X-Access-Token", token)
                }
                if (data) {
                    req = req.send(data)
                }
                req.end((response) => {
                    if (response.ok) {
                        resolve(response)
                    } else {
                        reject(self._error(response))
                    }
                })
            } catch(err) {
                reject(self._error(err))
            }
        })
    }

    // Posts a file
    _file(url, stat, token, callback) {
        console.log(`CoheteModel::_file(${url})`)
        let self = this
        return new Promise((resolve, reject) => {
            try {
                // Notify upload progress
                let streamFile = fs.createReadStream(stat.localFile)
                streamFile.on('data', callback)
                // Post file
                let req = unirest.post(url)
                .header('Accept', 'application/json')
                .timeout(self.env.url_timeout)
                if (token) {
                    req = req.header("X-Access-Token", token)
                }
                req.field('folder', stat.remoteFolder)
                .attach('file', streamFile)
                .end((response) => {
                    if (response.ok) {
                        resolve(response)
                    } else {
                        reject(self._error(response))
                    }
                })
            } catch(err) {
                reject(self._error(err))
            }
        })
    }

    // Formats a communication error "beautifully"
    _error(err) {
        console.log(`CoheteModel::_error(${err})`)
        let newErr = "Error contactando con el servidor.\n" +
                     "Por favor compruebe sus credenciales y su conexión a Internet.\n"
        if (err.body && err.body.message) {
            newErr += "El servidor respondió: " + err.body.message
        } else if (err.status && err.status != 401) {
            newErr += "Si el error persiste, por favor incluya estos detalles al reportar su incidencia:\n" + JSON.stringify(err)
        }
        return new Error(newErr)
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
        let credentials = {
            "email": email,
            "password": pass
        }
        return self._post(url, credentials, null)
        .then((response) => {
            let message = response.body.message
            if (message && message.subject && message.token) {
                self.SetEmail(email)
                self.setTenant(message.subject)
                self.setToken(message.token)
                return true
            }
            return false
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

    // Gets the cached tenant
    getTenant() {
        return this.config.get("tenant")
    }

    // sets the tenant name
    setTenant(tenant) {
        this.config.set("tenant", tenant)
    }

    // Check the token is still valid
    CheckToken(email) {
        console.log("CoheteModel::CheckToken")
        let url = this.env.url_validate
        let token = this.getToken()
        let self = this
        // The token is only valid if the email remains the same
        if(!token || (email && email != self.GetEmail())) {
            console.log(`No hay token, o el email guardado no coincide`)
            return Promise.resolve(false)
        }
        let tenant = self.getTenant()
        return self._get(url.replace("TENANT", tenant), null, token)
        .then((response) => {
            console.log("CheckToken: " + JSON.stringify(response.body))
            return response.body.success
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
        return self.uploadAll(contaplus, progress_callback)
        .then((done) => {
            console.log("Cohete::SubmitContaplus: Todos los ficheros correctamente subidos")
            return "Todos los trabajos correctamente ejecutados"
        })
    }

    // Uploads all files, reports progress
    uploadAll(contaplus, progress_callback) {
        console.debug(`CoheteModel::UploadAll`)
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
    }

    // Uploads a single file, reports progress
    uploadNext(stats, totalSize, index, progress_callback) {
        console.debug(`CoheteModel::uploadNext(stats, ${totalSize}, ${index})`)
        if (index >= stats.length) {
            return Promise.resolve(true)
        }
        let url = this.env.url_upload
        let tenant = this.getTenant()
        let token = this.getToken()
        let current = stats[index]
        let message = "Subiendo fichero " + current.localFile
        let progress = current.prevSize
        let self = this
        return self._file(url.replace("TENANT", tenant), current, token, (chunk) => {
            progress += chunk.length
            let percent = Math.min(Math.floor((progress * 100) / totalSize), 100)
            progress_callback(percent, message)

        })
        .then((response) => {
            console.log("uploadNext: " + JSON.stringify(response.body))
            // Fail early if any file upload does not work
            if (response.body.success !== true) {
                throw new Error("No se ha podido subir el fichero " + current.localFile +
                    ".\nEl error reportado por el servidor es " + response.body.message)
            }
            // If file upload was successful, go for the next one
            return self.uploadNext(stats, totalSize, index+1, progress_callback)
        })
    }

    // Clears the cached configs
    RemoveConfig() {
        this.config.delete("email")
        this.config.delete("token")
        this.config.delete("tenant")
    }
}