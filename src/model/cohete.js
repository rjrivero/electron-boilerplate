import { Client } from 'node-rest-client';

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

    CheckCredentials(email, pass) {
        return this.checkEmail(email, pass)
    }

    checkEmail(email, pass) {
        let env = this.env
        // Build request
        let url = env.url_credentials
        let username = env.url_username
        let password = env.url_password
        let self = this
        let cred = new Object()
        cred[username] = email
        cred[password] = pass
        let options = {
            headers: { "Content-Type": "application/json" },
            requestConfig: {
                timeout: 3000 //request timeout in milliseconds
                //noDelay: true, //Enable/disable the Nagle algorithm
                //keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
                //keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
            },
            responseConfig: {
                timeout: 3000 //response timeout
            }
        }
        // Configure the client
        let client = new Client(options)
        return new Promise((resolve, reject) => {
            client.post(url, { data: cred }, function (data, response) {
                console.log("CREDENCIALES PROBADAS: " + JSON.stringify(data))
                self.SetEmail(email)
                resolve(data)
            })
            .on("requestTimeout", (req) => {
                reject("No se puede conectar con el servidor de autenticación")
            })
            .on("responseTimeout", (res) => {
                reject("No se han podido comprobar las credenciales")
            })
            .on("error", (err) => {
                reject(err)
            })
        })
    }
}