// Decorador para credenciales_usuario.

export class CredencialesUsuario {

    constructor(cohete) {
        this.cohete = cohete
    }

    GetCredentials() {
        console.debug("LoginCohete::GetCredentials")
        return { email: this.cohete.GetEmail() }
    }

    CheckCredentials(email, pass) {
        console.debug("LoginCohete::CheckCredentials(" + email + ")")
        let self = this
        return new Promise((resolve, reject) => {
            if (!pass) {
                // If not password, test if we have cached credentials
                if (email != self.GetCredentials().email) {
                    reject("Debe introducir nombre de usuario (email) y contraseña")
                } else {
                    // Todo: comprobar que tenemos credenciales cacheadas.
                    self.cohete.CheckToken().then((cached) => {
                        resolve(cached)
                    })
                    .catch((err) => { reject(err)})
                }
            } else if (!email) {
                // Test email and pass
                self.triggerError("Debe introducir nombre de usuario (email) y contraseña")
            } else {
                // Check credentials
                self.cohete.CheckEmail(email, pass)
                .then(() => {
                    return self.cohete.CheckToken()
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