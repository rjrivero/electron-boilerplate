import { LoginPanelControl } from './login_panel'

/*
 Configuration panel with a login form
 */
export class LoginCoheteControl extends LoginPanelControl {

    constructor(model) {
        super(model, "credenciales_usuario")
    }

    canApply() {
        return this.username.val()
    }

    GetCredentials() {
        return { email: this.model.GetEmail() }
    }

    CheckCredentials(email, pass) {
        let self = this
        return new Promise((resolve, reject) => {
            if (!pass) {
                // If not password, test if we have cached credentials
                if (email != this.GetCredentials().email) {
                    reject("Debe introducir nombre de usuario (email) y contraseña")
                } else {
                    // Todo: comprobar que tenemos credenciales cacheadas.
                    self.model.CheckToken().then((cached) => {
                        resolve(cached)
                    })
                    .catch((err) => { reject(err)})
                }
            } else if (!email) {
                // Test email and pass
                self.triggerError("Debe introducir nombre de usuario (email) y contraseña")
            } else {
                // Check credentials
                self.model.CheckEmail(email, pass)
                .then(() => {
                    return self.model.CheckToken()
                })
                .then((cached) => {
                    resolve(cached)
                })
                .catch((err) => {
                    reject(err)
                })
            }
        })
    }
}