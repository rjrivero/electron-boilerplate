import { enableButton } from './panel_tools'
import { Panel } from './panel'

/*
 Configuration panel with an item selector
 */
export class SelectorPanel extends Panel {

    constructor(model, prefix) {
        super(model, prefix)
        this.select = $("#" + prefix + "_select")
        this.search = $("#" + prefix + "_search")
        // Apply, if selector has a value
        let self = this
        this.select.off().on('change', (event) => {
            // Enable apply button
            self.updateApply()
        })
        // Activate search button
        this.search.off().on("click", (event) => {
            event.preventDefault()
            self.populateSelector(true)
        })

    }

    Focus() {
        super.Focus()
        // Enable search button
        enableButton(this.search)
        // Populate the selector.
        this.populateSelector(false)
    }

    Blur(propagate) {
        // disable the selector
        this.disableSelector()
        super.Blur(propagate)
    }

    canApply() {
        return this.select.val()
    }

    disableSelector() {
        console.log(this.prefix + "::disableSelector")
        // Disable selector
        let select = this.select
        select.prop("disabled", "disabled")
        select.children().remove()
        // Disable Apply button until it is available
        this.updateApply()
    }

    triggerSelected() {
        // Set the value before propagating. Otherwise, the next
        // panel will not have the value available.
        this.setSelected(this.select.val())
        super.triggerSelected()
    }

    // Populates the input select
    populateSelector(refresh = false) {
        console.log(this.prefix + "::populateSelector")
        let select = this.select
        let self = this
        let model = this.model
        // Initialize "selected" and "matched" flags
        let selected = ""
        let matched  = false
        // Disable Selector and apply button until they are available
        this.disableSelector()
        // Get selected folder before rescanning. Otherwise,
        // "refresh = true" removes it.
        let savedValue = this.getSelected()
        self.showSpinner()
        self.scanValues(refresh).then((values) => {
            if (values.length > 0) {
                // Check if there is some default value selectable
                if (savedValue) {
                    selected = savedValue
                } else if (values.length == 1) {
                    selected = values[0]
                }
                // Populate selector
                for (let value of values) {
                    let option = $('<option/>', {
                        value: value,
                        text:  value
                    })
                    // If current option matches selected val, propagate it
                    if (value == selected) {
                        console.log("populateSelector: matched (" + selected + ")")
                        matched = true
                        option.prop("selected", true)
                    }
                    select.append(option)
                }
                if (!matched) {
                    let option = $('<option/>', {
                        value: "",
                        text:  " -- Seleccione una opción -- ",
                        selected: true
                    })
                    select.append(option)
                }
                // Enable selector
                this.select.prop("disabled", false)
            }
            self.hideSpinner()
            // Callback _onSelected or _onCleared
            if (matched) {
                // If manual refresh, require manual apply to trigger selected
                self.updateApply()
                if (!refresh) {
                    self.triggerSelected()
                } else {
                    // Keep consistent behaviour, even without triggering
                    self.setSelected(selected)
                }
            }
            if (!matched || refresh) {
                self.triggerCleared(false)
            }
        })
        .catch((err) => {
            self.hideSpinner()
            // Call _onCleared and _onError
            if (self._onCleared) {
                self._onCleared()
            }
            self.triggerError(err)
        })
    }
}