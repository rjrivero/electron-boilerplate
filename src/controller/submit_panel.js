import { PanelControl } from './panel'
import { showDialog } from './tools'

/*
 Configuration panel with a login form
 */
export class SubmitPanelControl extends PanelControl {

    constructor(model, prefix, attributes) {
        super(model, prefix)
        this.progress = $("#" + prefix + "_progress")
        this.table = $("#" + prefix + "_table")
        this.bindings = new Map()
        for (let entry of attributes) {
            let span = $("#" + prefix + "_" + entry)
            if (span) {
                span[0].innerHTML = ""
                this.bindings.set(entry, span)
            }
        }
    }

    Focus() {
        super.Focus()
        // Populate the table
        for (let entry of this.bindings.entries()) {
            let key = entry[0]
            let span = entry[1]
            span[0].innerHTML = this.GetValue(key)
        }
        //this.table.removeClass("hidden")
        this.updateApply()
    }

    Blur(propagate) {
        // disable the table
        for (let entry of this.bindings.entries()) {
            entry[1][0].innerHTML = ""
        }
        //this.table.addClass("hidden")
        super.Blur(propagate)
    }

    // Can apply if all values are available
    canApply() {
        console.log("SubmitPanelControl::canApply")
        for (let key of this.bindings.keys()) {
            if (!this.GetValue(key)) {
                return false
            }
        }
        return true
    }

    // Get checked values and continue
    triggerSelected() {
        let self = this
        self.ShowSpinner()
        self.Submit(self.progress).then((msg) => {
            self.HideSpinner()
            showDialog("success", "Actualizacion completada", msg)
        })
        .catch((err) => {
            self.HideSpinner()
            self.triggerError(err)
        })
    }
}