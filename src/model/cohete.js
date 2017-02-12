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

    // launches an ajax request.
    // Data can be null, a string (URL encoded) or an object (sent as JSON)
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
            if (typeof data === 'string') {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
                options.body = data
            } else {
                options.headers['Content-Type'] = 'application/json; charset=utf-8'
                options.body = JSON.stringify(data)
            }
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
            let vars = Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&')
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
            // Notify upload progress
            let streamFile = fs.createReadStream(stat.localFile)
            streamFile.on('data', callback)
            // Ugly workaround for Acens cert. See
            // http://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
            process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
            // Post file
            unirest.post(url)
            .header('Accept', 'application/json')
            .header('X-Access-Token', token)
            .field('folder', stat.remoteFolder)
            .attach('file', streamFile)
            .timeout(self.env.url_timeout)
            .end((response) => {
                if (response.ok) {
                    resolve(response)
                } else {
                    reject(response)
                }
            })
        })
        .then((response) => {
            // Undo hack...
            process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
            return response
        })
        .catch((err) => {
            console.log(`CoheteModel::_file: Error ${JSON.stringify(err)}`)
            throw self._error(err)
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
            throw new Error("Nombre de usuario o clave incorrectas")
        })
        .catch((err) => {
            // After a failure, remove tenant and token
            self.setTenant(null)
            self.setToken(null)
            throw err
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

    // Prefly Contaplus - Tests if Contaplus is configured
    PreflyContaplus(contaplus, progress_callback) {
        console.debug(`CoheteModel::PreflyContaplus`)
        progress_callback(100)
        // Check if there is currently some binding from
        // contaplus to sources
        let self = this
        let tenant = self.getTenant()
        let token = self.getToken()
        // If authentication fails, this._get throws an error.
        // We want to mimic that behaviour if there are no credentials
        if (!tenant || !token) {
            return Promise.reject(new Error("Nombre de usuario o contraseña incorrectos"))
        }
        // If we have both tenant and token, test it
        let url = this.env.url_validate.replace("TENANT", tenant)
        return this._get(url, null, token)
        .then((response) => {
            if (response.body.success) {
                let data = response.body.data
                if (data && data.length) {
                    return true
                }
                // Configuration not performed yet.
                // Send the selected data so that the end user
                // can configure their sources
                url = self.env.url_config.replace("TENANT", tenant)
                let selection = contaplus.GetSelectedModel(false)
                return this._post(url, selection, token)
                .then((message) => {
                    return false
                })
            }
        })
    }

    // Submits the files selected by contaplus
    SubmitContaplus(contaplus, progress_callback) {
        console.debug(`CoheteModel::SubmitContaplus`)
        let self = this
        return self.uploadAll(contaplus, progress_callback)
        .then((done) => {
            // Load contaplus config data
            let url = self.env.url_config.replace("TENANT", self.getTenant())
            let selection = contaplus.GetSelectedModel(true)
            progress_callback(100, "Configurando trabajos de actualización")
            return self._post(url, selection, self.getToken())
        })
        .then((done) => {
            // Run the contaplus update task
            return self.runTask(progress_callback)
        })
        .then((result) => {
            console.log(`CoheteModel::SubmitContaplus: result = ${JSON.stringify(result)}`)
            return "Todos los trabajos ejecutados correctamente"
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

    // Sends a "run" command, waits for completion
    runTask(progress_callback) {
        console.debug(`CoheteModel::runTask`)
        let progress = 10
        let self = this
        let refresh = "refresh=contaplus"
        let token = self.getToken()
        let url = self.env.url_process.replace("TENANT", self.getTenant())
        progress_callback(10, "Lanzando trabajo de actualización")
        return self._post(url + "?" + refresh, refresh, token)
        .then((response) => {
            // Start the job and get the task number
            let message = response.body.message
            if (message && message.running && message.order) {
                return message.order
            }
            throw self._error(response)
        })
        .then((task) => {
            return self.waitForTask(url, token, task, progress_callback)
        })
    }

    // Waits until the runner task is finished
    waitForTask(url, token, task, progress_callback) {
        console.debug(`CoheteModel::waitForTask(${task})`)
        // monitor for completion of the task
        let self = this
        let timeout = self.env.task_timeout
        let interval = self.env.task_interval
        let start = Date.now()
        let banner = "<p>Por favor espere mientras se procesan los datos en el servidor. Esta operación puede tardar unos minutos.</p>"
        progress_callback(100, banner)
        return new Promise((resolve, reject) => {
            self.checkTaskRunning(url, token, task, interval, (err, running) => {
                let elapsed = Date.now() - start
                if (err !== null) {
                    reject(self._error(err))
                } else if (!running) {
                    resolve(true)
                } else if (elapsed >= timeout) {
                    reject(new Error("Se sobrepasó el tiempo máximo de espera ejecutando la tarea"))
                } else {
                    let percent = Math.floor((elapsed * 100)/timeout)
                    let seconds = Math.floor(elapsed / 1000)
                    let mins = ("00" + Math.floor(seconds / 60)).slice(-2)
                    let secs = ("00" + (seconds % 60)).slice(-2)
                    progress_callback(100, banner + `<p>Procesando datos (tiempo transcurrido: ${mins}:${secs})</p>`)
                    return false // keep waiting
                }
                return true // done
            })
        })
    }

    // Checks the status of the task periodically.
    // The callback is called every "interval" milliseconds
    // with an error object (if any), and the state of
    // the task. If the callback returns "true", the
    // loop is interrupted. Otherwise, we keep asking.
    checkTaskRunning(url, token, task, interval, callback) {
        console.debug(`CoheteModel::checkTaskRunning(task: ${task}, interval: ${interval})`)
        let self = this
        setTimeout(() => {
            self._get(url, { check: task }, token)
            .then((response) => {
                console.debug(`CoheteModel::checkTaskRunning: current status = ${JSON.stringify(response.body)}`)
                let done = false
                // Give the callback a chance to report progress or stop
                let message = response.body.message
                if (message && !(message.running === undefined)) {
                    done = callback(null, message.running)
                } else {
                    callback(message, null)
                    done = true
                }
                // If not done yet, keep checking
                if (!done) {
                    self.checkTaskRunning(url, token, task, interval, callback)
                }
            })
            .catch((err) => { callback(err, null) })
        }, interval)
    }

    // Clears the cached configs
    RemoveConfig() {
        this.config.delete("email")
        this.config.delete("token")
        this.config.delete("tenant")
    }
}