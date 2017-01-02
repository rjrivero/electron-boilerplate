import { Panel } from './panel'

/*
 Configuration panel with a login form
 */
export class LoginPanel extends Panel {

    constructor(prefix, model) {
        super(prefix, model)
        this.username = $("#" + prefix + "_username")
        this.password = $("#" + prefix + "_password")
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

    Blur(propagate) {
        // disable the form
        this.disableForm()
        super.Blur(propagate)
    }

    enableForm() {
        console.debug(this.prefix + "::enableForm")
        this.username.prop("disabled", false)
        this.password.prop("disabled", false)
    }

    disableForm() {
        console.debug(this.prefix + "::disableForm")
        // Disable selector
        this.username.prop("disabled", "disabled")
        this.password.prop("disabled", "disabled")
        this.updateApply()
    }

    canApply() {
        return this.username.val()
    }

    // Clicked on Apply: Check credentials and move forward.
    triggerSelected() {
        // Validate credentials before triggering...
        let self  = this
        let email = this.username.val()
        let pass  = this.password.val()
        self.showSpinner()
        self.model.CheckCredentials(email, pass)
        .then((cached) => {
            self.hideSpinner()
            if (cached) {
                self.password.val("")
                super.triggerSelected()
            }
        })
        .catch((err) => {
            self.hideSpinner()
            self.triggerError(err)
        })
    }

    // Populates the input select
    populateForm() {
        console.debug(this.prefix + "::populateForm")
        let username = this.username
        let password = this.password
        let cred  = this.model.GetCredentials()
        if (cred.email) {
            username.val(cred.email)
            this.updateApply()
            // Try to validate cached tokens
            this.triggerSelected()
        } else {
            username.val("")
        }
        this.enableForm()
    }
}