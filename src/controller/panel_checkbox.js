import { Panel } from './panel'

/*
 Configuration panel with a login form
 */
export class CheckboxPanel extends Panel {

    constructor(model, prefix) {
        super(model, prefix)
        this.lines = new Array()
        this.boxes = new Array()
        this.spans = new Array()
        for (let i = 0; i < 10; i++) {
            this.lines[i] = $("#" + prefix + "_line_" + i)
            this.boxes[i] = $("#" + prefix + "_check_" + i)
            this.spans[i] = $("#" + prefix + "_label_" + i)
        }
    }

    Focus() {
        super.Focus()
        // Populate the selector.
        this.populateChecks()
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
        console.log(this.prefix + "::iterateChecks")
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
        console.log(this.prefix + "::disableChecks")
        this.iterateChecks((index, line, box, span) => {
            line.addClass("hidden")
            box.prop("disabled", "disabled")
            span[0].innerHTML = ""
        })
    }

    // Populates the input select
    populateChecks() {
        console.log(this.prefix + "::populateChecks")
        this.showSpinner()
        // First, hide all checkboxes
        this.cachedValues = null
        this.disableChecks()
        // Then, populate them with values
        let self = this
        this.scanValues().then((values) => {
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
            self.triggerSelected()
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
                values.push(cachedValues[index])
            }
        })
        this.setSelected(values)
        super.triggerSelected()
    }
}