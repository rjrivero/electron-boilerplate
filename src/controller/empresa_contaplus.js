import { switchClass, disableButton, enableButton, hideAsistente, showAsistente } from './tools'

export class EmpresaContaplusControl {

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

    constructor(model) {
        console.log("empresa_contaplus::constructor")
        this.model = model
        this.heading = $("#empresa_contaplus_heading")
        this.body = $("#empresa_contaplus_body")
        this.select = $("#empresa_contaplus_select")
        this.apply = $("#empresa_contaplus_apply")
    }

    // Activates the control, sets focus on the tab
    Focus() {
        console.log("empresa_contaplus::Focus")
        let self = this
        // Give the focus style to the box
        switchClass(this.heading, "panel-.*", "panel-primary")
        // Show the panel body
        showAsistente(this.body)
        // Populate the selector.
        self.populateSelector(false)
    }

    Blur() {
        console.log("empresa_contaplus::Blur")
        // Give the plain style to the box
        switchClass(this.heading, "panel-.*", "panel-default")
        // Hide the body
        hideAsistente(this.body)
        // disable the selector
        this.disableSelector()
    }

    enableApply() {
        console.log("empresa_contaplus::enableApply")
        let apply = this.apply
        let select = this.select
        let self = this
        if (select.val()) {
            apply.off().on("click", (event) => {
                console.log("Activando empresa_contaplus_apply (" + select.val() + ")")
                event.preventDefault()
                if (select.val()) {
                    self.activateSelected(select.val())
                }
            })
            enableButton(apply)
        } else {
            disableButton(apply)
        }
    }

    enableSelector() {
        console.log("empresa_contaplus::enableSelector")
        let select = this.select
        let self = this
        // Apply, if selector has a value
        select.change((event) => {
            // Enable apply button
            self.enableApply()
        })
        // Bind select.change to Apply button activation
        select.prop("disabled", false)
    }

    disableSelector() {
        console.log("empresa_contaplus::disableSelector")
        // Disable Apply button until it is available
        disableButton(this.apply)
        // Disable selector
        let select = this.select
        select.prop("disabled", "disabled")
        select.children().remove()
    }

    activateSelected(selected) {
        console.log("empresa_contaplus::activateSelected (" + selected + ")")
        switchClass(this.heading, "panel-.*", "panel-success")
        hideAsistente(this.body)
        this.model.SetFolder(selected)
        if (this._onSelected) {
            this._onSelected(selected)
        }
    }

    // Populates the input select
    populateSelector(refresh = false) {
        console.log("empresa_contaplus::populateSelector")
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
        let savedValue = model.GetCompany()
        model.ScanCompanies(refresh).then((valueMap) => {
            let values = Array.from(valueMap.keys())
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
                // Bind select.change to Apply button activation
                self.enableSelector()
            }
            // Callback _onSelected or _onCleared
            if (matched) {
                // If manual refresh, require manual apply to...
                self.enableApply()
                if (!refresh) {
                    self.activateSelected(selected)
                }
            } else {
                if (self._onCleared) {
                    self._onCleared()
                }
            }
        })
        .catch((err) => {
            // Call _onCleared and _onError
            if (self._onCleared) {
                self._onCleared()
            }
            if (self._onError) {
                self._onError(err)
            }
        })
    }
}