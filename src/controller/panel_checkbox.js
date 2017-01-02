import { enableButton } from './panel_tools'
import { Panel } from './panel'

/*
 Configuration panel with a login form
 */
export class CheckboxPanel extends Panel {

    constructor(prefix, model) {
        super(prefix, model)
        this.search = $("#" + prefix + "_search")
        this.lines = new Array()
        this.boxes = new Array()
        this.spans = new Array()
        for (let i = 0; i < 10; i++) {
            this.lines[i] = $("#" + prefix + "_line_" + i)
            this.boxes[i] = $("#" + prefix + "_check_" + i)
            this.spans[i] = $("#" + prefix + "_label_" + i)
        }
        // Activate search button
        if (this.search) {
            let self = this
            this.search.off().on("click", (event) => {
                event.preventDefault()
                self.populateChecks(true)
            })
        }
    }

    Focus() {
        super.Focus()
        // Enable search button
        if (this.search) {
            enableButton(this.search)
        }
        // Populate the selector.
        this.populateChecks(false)
    }

    Blur(propagate) {
        // disable the checkboxes
        this.disableChecks()
        super.Blur(propagate)
    }

    canApply() {
        return (this.cachedValues && this.cachedValues.length)
    }

    iterateChecks(each) {
        console.debug(this.prefix + "::iterateChecks")
        let lines = this.lines
        let boxes = this.boxes
        let spans = this.spans
        let lower = 0
        if (this.cachedValues && this.cachedValues.length > 0) {
            lower = Math.min(10, this.cachedValues.length)
        }
        for (let i = 0; i < lower; i++) {
            each(i, lines[i], boxes[i], spans[i])
        }
        for (let i = lower; i < 10; i++) {
            lines[i].addClass("hidden")
            boxes[i].prop("disabled", "disabled")
            spans[i][0].innerHTML =""
        }
        this.updateApply()
    }

    disableChecks() {
        console.debug(this.prefix + "::disableChecks")
        this.iterateChecks((index, line, box, span) => {
            line.addClass("hidden")
            box.prop("disabled", "disabled")
            span[0].innerHTML = ""
        })
        // After iteration, remove cached values
        delete(this.cachedValues)
    }

    // Populates the input select
    populateChecks(refresh = false) {
        console.debug(this.prefix + "::populateChecks")
        this.showSpinner()
        // First, hide all checkboxes
        this.cachedValues = null
        this.disableChecks()
        // Then, populate them with values
        let self = this
        this.model.ScanValues(refresh).then((values) => {
            // Each value is an array with three entries:
            // value, checked, and label.
            self.cachedValues = values.slice(0, 10)
            self.iterateChecks((index, line, box, span) => {
                line.removeClass("hidden")
                box.prop("disabled", false)
                box.prop("checked", values[index][1])
                span[0].innerHTML = values[index][2]
            })
            self.hideSpinner()
            if (!refresh) {
                self.triggerSelected()
            }
        })
        .catch((err) => {
            self.hideSpinner()
            self.triggerError(err)
        })
    }

    // Get checked values and continue
    triggerSelected() {
        let cachedValues = this.cachedValues
        let self = this
        let values = new Array()
        this.iterateChecks((index, line, box, span) => {
            if (box.prop("checked")) {
                // Update the "selected" property
                cachedValues[index][1] = true
                values.push(cachedValues[index])
            }
        })
        this.model.SetSelected(values)
        super.triggerSelected()
    }
}