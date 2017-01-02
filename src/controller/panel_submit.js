import { showDialog } from './panel_tools'
import { Panel } from './panel'

/*
 Configuration panel with a login form
 */
export class SubmitPanel extends Panel {

    constructor(prefix, model) {
        super(prefix, model)
        this.progress = $("#" + prefix + "_progress")
        this.table = $("#" + prefix + "_table")
        this.bindings = new Map()
        for (let entry of this.model.GetSelected().keys()) {
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
        let values = this.model.GetSelected()
        for (let entry of this.bindings.entries()) {
            let key = entry[0]
            let span = entry[1]
            let val = values.get(key) || ""
            span[0].innerHTML = val
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
        for (let entry of this.model.GetSelected().entries()) {
            if (!entry[1]) {
                return false
            }
        }
        return true
    }

    // Get checked values and continue
    triggerSelected() {
        let self = this
        self.showSpinner()
        self.model.Submit(self.progress).then((msg) => {
            self.hideSpinner()
            showDialog("success", "Actualizacion completada", msg)
        })
        .catch((err) => {
            self.hideSpinner()
            self.triggerError(err)
        })
    }
}