import unirest from 'unirest';

export class CoheteModel {

    constructor(config, env) {
        this.config = config
        this.env = env
    }

    GetEmail() {
        return this.config.get("email")
    }

    SetEmail(email) {
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
                        self.SetToken(response.body.message)
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

    GetToken() {
        return this.config.get("token")
    }

    SetToken(token) {
        this.config.set("token", token)
    }

    // Check the token is still valid
    CheckToken() {
        console.log("CoheteModel::CheckToken")
        let url = this.env.url_validate
        let token = this.config.get("token")
        let self = this
        return new Promise((resolve, reject) => {
            if(!token) {
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
                        if (response.body.message) {
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

    GetSelectedSources(fuentes) {
        console.log("CoheteModel::GetSelectedSources")
        if (this.fuentes_selected === undefined) {
            this.fuentes_selected = new Array()
        }
        return this.fuentes_selected
    }

    SubmitContaplus(contaplus, callback) {
        console.log("SubmitModel::Submit")
        return new Promise((resolve, reject) => {
            let progress = 0
            function increment() {
                callback(progress)
                if (progress >= 100) {
                    resolve("Todos los ficheros actualizados")
                } else {
                    progress += 5
                    setTimeout(increment, 250)
                }
            }
            setTimeout(increment, 250)
            callback(progress)
        })
    }
}