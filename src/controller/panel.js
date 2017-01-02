import { switchClass, disableButton, enableButton } from './panel_tools'

/*
 Basic configuration panel
 */
export class Panel {

    constructor(model, prefix) {
        // Connect controller controls
        console.log(prefix + "::constructor")
        this.prefix = prefix
        this.model = model
        this.heading = $("#" + prefix + "_heading")
        this.body = $("#" + prefix + "_body")
        this.apply = $("#" + prefix + "_apply")
        this.spinner = $("#" + prefix + "_spinner")
        // Bind controller methods
        let self = this
        this.apply.off().on("click", (event) => {
            console.log("Activando " + self.prefix + "_apply")
            event.preventDefault()
            if (self.canApply()) {
                self.triggerSelected()
            }
        })
    }

    // Activates the control, sets focus on the tab
    Focus() {
        console.log(this.prefix + "::Focus")
        // Give the focus style to the box
        switchClass(this.heading, "panel-.*", "panel-primary")
        // Show the panel body
        this.Show()
    }

    // Deactivate the control
    Blur(propagate = false) {
        console.log(this.prefix + "::Blur(" + propagate + ")")
        // Give the plain style to the box
        switchClass(this.heading, "panel-.*", "panel-default")
        // Hide the body
        this.Hide()
        if (propagate) {
            this.triggerCleared(propagate)
        }
    }

    // Show the panel body
    Show() {
        this.body.removeClass("hidden")
    }

    // Hide the Spinner layer
    Hide() {
        this.body.addClass("hidden")
    }

    // Update the state of the "apply" button
    updateApply() {
        console.log(this.prefix + "::updateApply")
        if (this.canApply()) {
            enableButton(this.apply)
        } else {
            disableButton(this.apply)
        }
    }

    // True if we can enable the "Accept" button
    canApply() {
        return true
    }

    // Send the "selected" event
    triggerSelected() {
        console.log(this.prefix + "::triggerSelected")
        switchClass(this.heading, "panel-.*", "panel-success")
        this.Hide()
        if (this._onSelected) {
            this._onSelected()
        }
    }

    // Send the "error" event
    triggerError(err) {
        console.log(this.prefix + "::triggerError (" + err + ")")
        switchClass(this.heading, "panel-.*", "panel-danger")
        if (this._onError) {
            this._onError(err)
        }
    }

    // Send the "cleared" event
    triggerCleared(propagated = false) {
        console.log(this.prefix + "::triggerCleared(" + propagated +")")
        if (!propagated) {
            switchClass(this.heading, "panel-.*", "panel-primary")
        }
        if (this._onCleared) {
            this._onCleared(propagated)
        }
    }

    // Show the Spinner layer
    showSpinner() {
        this.spinner.removeClass("hidden")
    }

    // Hide the Spinner layer
    hideSpinner() {
        this.spinner.addClass("hidden")
    }

    // Set a callback for when path is selected
    onSelected(f) {
        this._onSelected = f
    }

    // Set a callback for when selection is cleared
    onCleared(f) {
        this._onCleared = f
    }

    // Set a callback for errors
    onError(f) {
        this._onError = f
    }
}