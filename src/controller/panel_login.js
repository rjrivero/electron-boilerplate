import { Panel } from './panel'

/*
 Configuration panel with a login form
 */
export class LoginPanel extends Panel {

    constructor(model, prefix) {
        super(model, prefix)
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
        console.log(this.prefix + "::triggerSelected (outer)")
        // Validate credentials before triggering...
        let self  = this
        let email = this.username.val()
        let pass  = this.password.val()
        self.showSpinner()
        self.checkCredentials(email, pass)
        .then((cached) => {
            self.hideSpinner()
            if (cached) {
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
        console.log(this.prefix + "::populateForm")
        let username = this.username
        let password = this.password
        let model = this.model
        let cred  = this.getCredentials()
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