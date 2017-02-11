import { showDialog } from './panel_tools'
import { Panel } from './panel'

/*
 Configuration panel with a submit option
 */
export class SubmitPanel extends Panel {

    constructor(prefix, model) {
        super(prefix, model)
        this.progress = $("#" + prefix + "_progress")
        this.table = $("#" + prefix + "_table")
        this.notice = $("#" + prefix + "_notice")
        this.refresh = $("#" + prefix + "_refresh")
        let self = this
        this.refresh.off().on("click", (event) => {
            console.log("Activando " + self.prefix + "_refresh")
            event.preventDefault()
            self.canApply().then((can) => {
                if(can) {
                    self.triggerSelected()
                }
            })
        })
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

    // Can apply if all values are available, and preflight works
    canApply() {
        // First of all, can only apply if all fields have values
        let self = this
        for (let entry of self.model.GetSelected().entries()) {
            if (!entry[1]) {
                self.notice.addClass('hidden')
                return Promise.resolve(false)
            }
        }
        // All fields populated, let's see if it is OK to run
        self.progress.css("width", "0%")
        self.showSpinner()
        return self.model.Prefly(self.updateSpinner.bind(self))
        .catch((err) => {
            console.log(`SubmitPanel::canApply:PreflightError = ${JSON.stringify(err)}`)
            return false
        })
        .then((can) => {
            self.hideSpinner()
            // Show the notice if the backend is not configured.
            if (can) {
                self.notice.addClass('hidden')
            } else {
                self.notice.removeClass('hidden')
            }
            return can
        })
    }

    // Get checked values and continue
    triggerSelected() {
        let self = this
        self.progress.css("width", "0%")
        self.showSpinner()
        self.model.Submit(self.updateSpinner.bind(self)).then((msg) => {
            self.hideSpinner()
            showDialog("success", "Actualizacion completada", msg)
        })
        .catch((err) => {
            self.hideSpinner()
            self.triggerError(err)
        })
    }
}