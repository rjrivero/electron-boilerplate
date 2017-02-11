import { ContaplusCompany } from './contaplus'
import fs from 'fs';
import jwt from 'jsonwebtoken';
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

    // launches an ajax request
    _ajax(method, url, data, token) {
        let self = this
        let options = {
            method: method,
            mode: 'cors',
            headers: {
                Accept: 'application/json'
            }
        }
        if (token) {
            options.headers['X-Access-Token'] = token
        }
        if (data) {
            options.headers['Content-Type'] = 'application/json; charset=utf-8'
            options.body = JSON.stringify(data)
        }
        return fetch(url, options)
        .then((response) => {
            console.log(`Cohete::_ajax: Response with status ${response.status}`)
            return response.json().then((json) => {
                return { status: response.status, body: json }
            })
        })
        .catch((err) => {
            throw self._error(err)
        })
        .then((response) => {
            if (response.status == 200) {
                console.log(`Cohete::_ajax: Got Response ${JSON.stringify(response)}`)
                return response
            } else {
                throw self._error(response)
            }
        })
    }

    // Gets a request
    _get(url, data, token) {
        console.log(`CoheteModel::_get(${url})`)
        if (data) {
            let vars = Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&')
            url = url + "?" + vars
        }
        return this._ajax("GET", url, null, token)
    }

    // Posts a request
    _post(url, data, token) {
        console.log(`CoheteModel::_post(${url})`)
        return this._ajax("POST", url, data, token)
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
        let newErr = "<p>Error contactando con el servidor.\n" +
                     "Por favor compruebe sus credenciales y su conexión a Internet.\n</p>"
        if (err.body && err.body.message) {
            newErr += "<p>El servidor respondió: " + err.body.message + "</p>"
        } else if (err.status && err.status != 401) {
            newErr += "<p>Si el error persiste, por favor incluya estos detalles al reportar su incidencia:</p><pre>" + JSON.stringify(err) + "</pre>"
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
            let message = response.body
            if (message && message.success && message.data) {
                let payload = jwt.decode(message.data)
                if (payload && payload.sub) {
                    self.SetEmail(email)
                    self.setTenant(payload.sub)
                    self.setToken(message.data)
                    return true
                }
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
            let url = self.env.url_config.replace("TENANT", self.getTenant())
            let selection = contaplus.GetSelectedModel()
            progress_callback(100, "Configurando trabajos de actualización")
            return self._post(url, selection, self.getToken())
        })
        .then((done) => {
            return "Ejecución de trabajos completada"
        })
    }

    // Sends a "run" command, waits for completion
    runTask(progress_callback) {
        let self = this
        let url = self.env.url_process
        let progress = 10
        progress_callback(10, "Lanzando trabajo de actualización")
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