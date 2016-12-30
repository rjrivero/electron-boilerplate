import { switchClass, disableButton, enableButton, hideAsistente, showAsistente } from './tools'

/*
 Basic configuration panel
 */
export class PanelControl {

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

    // True if we can enable the "Accept" button
    canApply() {
        return true
    }

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
        showAsistente(this.body)
    }

    // Deactivate the control
    Blur() {
        console.log(this.prefix + "::Blur")
        // Give the plain style to the box
        switchClass(this.heading, "panel-.*", "panel-default")
        // Hide the body
        hideAsistente(this.body)
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

    // Send the "selected" event
    triggerSelected() {
        console.log(this.prefix + "::triggerSelected")
        switchClass(this.heading, "panel-.*", "panel-success")
        hideAsistente(this.body)
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
    triggerCleared() {
        console.log(this.prefix + "::triggerCleared")
        //switchClass(this.heading, "panel-.*", "panel-standard")
        if (this._onCleared) {
            this._onCleared()
        }
    }

    // show the Spinner layer
    ShowSpinner() {
        this.spinner.removeClass("hidden")
    }

    // hide the Spinner layer
    HideSpinner() {
        this.spinner.addClass("hidden")
    }
}

/*
 Configuration panel with an item selector
 */
export class SelectorPanelControl extends PanelControl{

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

    Blur() {
        super.Blur()
        // disable the selector
        this.disableSelector()
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
        this.setValue(this.select.val())
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
        let savedValue = this.getValue()
        self.ShowSpinner()
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
            self.HideSpinner()
            // Callback _onSelected or _onCleared
            if (matched) {
                // If manual refresh, require manual apply to trigger selected
                self.updateApply()
                if (!refresh) {
                    self.triggerSelected()
                } else {
                    // Keep consistent behaviour, even without triggering
                    self.setValue(selected)
                }
            } else {
                self.triggerCleared()
            }
        })
        .catch((err) => {
            self.HideSpinner()
            // Call _onCleared and _onError
            if (self._onCleared) {
                self._onCleared()
            }
            self.triggerError(err)
        })
    }
}