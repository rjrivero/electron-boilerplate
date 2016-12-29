import { switchClass, disableButton, enableButton, hideAsistente, showAsistente } from './tools'
import { PanelControl } from './common'

/*
 Configuration panel with a login form
 */
export class LoginCoheteControl extends PanelControl{

    constructor(model) {
        super(model, "credenciales_usuario")
        this.username = $("#credenciales_usuario_username")
        this.password = $("#credenciales_usuario_password")
        let self = this
        this.username.off().on("change", (event) => {
            self.updateApply()
        })
        this.password.off().on("change", (event) => {
            self.updateApply()
        })
    }

    Focus() {
        super.Focus()
        // Populate the selector.
        this.populateForm()
    }

    Blur() {
        super.Blur()
        // disable the selector
        this.disableForm()
    }

    canApply() {
        return this.username.val()
    }

    enableForm() {
        console.log(this.prefix + "::enableForm")
        this.username.prop("disabled", false)
        this.password.prop("disabled", false)
    }

    disableForm() {
        console.log(this.prefix + "::disableForm")
        // Disable selector
        this.username.prop("disabled", "disabled")
        this.password.prop("disabled", "disabled")
        this.updateApply()
    }

    // Clicked on Apply: Check credentials and move forward.
    triggerSelected() {
        // Validate credentials before triggering...
        let self  = this
        let email = this.username.val()
        let pass  = this.password.val()
        if (!pass) {
            // If not password, test if we have cached credentials
            if (email != this.model.GetEmail()) {
                self.triggerError("Debe introducir nombre de usuario (email) y contraseña")
            } else {
                // Todo: comprobar que tenemos credenciales cacheadas.
                super.triggerSelected()
            }
        } else if (!email) {
            // Test email and pass
            self.triggerError("Debe introducir nombre de usuario (email) y contraseña")
        } else {
            // Check credentials
            self.model.CheckCredentials(email, pass).then((data) => {
                super.triggerSelected()
            })
            .catch((err) => {
                self.triggerError(err)
            })
        }
    }

    // Populates the input select
    populateForm() {
        console.log(this.prefix + "::populateForm")
        let username = this.username
        let password = this.password
        let model = this.model
        if (model.GetEmail()) {
            username.val(model.GetEmail())
            this.updateApply()
        } else {
            username.val("")
        }
        this.enableForm()
    }
}