import { PanelControl } from './panel'

/*
 Configuration panel with a login form
 */
export class CheckboxPanelControl extends PanelControl {

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

    Blur() {
        super.Blur()
        // disable the selector
        this.disableChecks()
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
        this.ShowSpinner()
        // First, hide all checkboxes
        this.cachedValues = null
        this.disableChecks()
        // Then, populate them with values
        let self = this
        this.GetValues().then((values) => {
            self.cachedValues = values.slice(0, 10)
            self.iterateChecks((index, line, box, span) => {
                line.removeClass("hidden")
                box.prop("disabled", false)
                box.prop("checked", values[index][1])
                span[0].innerHTML = values[index][0]
            })
            self.HideSpinner()
            self.triggerSelected()
        })
        .catch((err) => {
            self.HideSpinner()
            self.triggerError(err)
        })
    }

    // Get checked values and continue
    triggerSelected() {
        let cachedValues = this.cachedValues
        let self = this
        this.iterateChecks((index, line, box, span) => {
            let values = new Array()
            let checked = box.prop("checked")
            if (checked) {
                values.push(cachedValues[index])
            }
            self.SetValues(values)
        })
        super.triggerSelected()
    }
}