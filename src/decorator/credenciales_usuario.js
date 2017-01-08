// Decorador para credenciales_usuario.

export class CredencialesUsuario {

    constructor(cohete) {
        this.cohete = cohete
    }

    GetCredentials() {
        console.debug(`LoginCohete::GetCredentials`)
        return { email: this.cohete.GetEmail() }
    }

    CheckCredentials(email, pass) {
        console.debug(`LoginCohete::CheckCredentials(${email})`)
        let self = this
        return new Promise((resolve, reject) => {
            if (!pass) {
                // There is no password and no email, return error
                if (email != self.GetCredentials().email) {
                    reject("Debe introducir nombre de usuario (email) y contraseña")
                } else {
                    // There is an email without password: test that
                    // we have cached credencials for that email.
                    self.cohete.CheckToken(email).then((valid) => {
                        resolve(valid)
                    })
                    .catch((err) => { reject(err)})
                }
            } else if (!email) {
                // There is a password but no email, unexpected.
                self.triggerError("Debe introducir nombre de usuario (email) y contraseña")
            } else {
                // There is both password and email, check them
                self.cohete.CheckEmail(email, pass)
                .then(() => {
                    return self.cohete.CheckToken(email)
                })
                .then((valid) => {
                    resolve(valid)
                })
                .catch((err) => {
                    reject(err)
                })
            }
        })
    }
}