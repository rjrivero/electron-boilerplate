import { contaplus_manager } from '../model/contaplus'
import { switchClass, disableButton, enableButton, hideAsistente, showAsistente } from './tools'

export class RutaContaplus {

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

    constructor(config) {
        console.log("ruta_contaplus::constructor")
        this.config = config
        this.ruta_contaplus_heading = $("#ruta_contaplus_heading")
        this.ruta_contaplus_body = $("#ruta_contaplus_body")
        this.ruta_contaplus_select = $("#ruta_contaplus_select")
        this.ruta_contaplus_search = $("#ruta_contaplus_search")
        this.ruta_contaplus_apply = $("#ruta_contaplus_apply")
    }

    // Activates the control, sets focus on the tab
    Focus() {
        console.log("ruta_contaplus::Focus")
        let self = this
        // Enable search button
        enableButton(this.ruta_contaplus_search)
        this.ruta_contaplus_search.click((event) => {
            event.preventDefault()
            self.populateSelector(true)
        })
        // Disable Apply button until it is available
        disableButton(this.ruta_contaplus_apply)
        // Give the focus style to the box
        switchClass(this.ruta_contaplus_heading, "panel-.*", "panel-primary")
        // Do not show the body, there is an animation error if we do so...
        // See http://stackoverflow.com/questions/21162313
        showAsistente(this.ruta_contaplus_body)
        // Populate the selector. Allow any pending task to finish!
        setTimeout(() => { self.populateSelector(false) }, 0)
    }

    Blur() {
        console.log("ruta_contaplus::Blur")
        // Disable Apply button until it is available
        disableButton(this.ruta_contaplus_apply)
        // Disable selector
        this.ruta_contaplus_select.prop("disabled", "disabled")
        // Hide the body
        hideAsistente(this.ruta_contaplus_body)
        // Give the plain style to the box
        switchClass(this.ruta_contaplus_heading, "panel-.*", "panel-default")
    }

    enableApply() {
        console.log("ruta_contaplus::enableApply")
        let apply = this.ruta_contaplus_apply
        let select = this.ruta_contaplus_select
        let self = this
        if (select.val()) {
            console.log("Activando ruta_contaplus_apply")
            enableButton(apply)
            apply.click((event) => {
                event.preventDefault()
                if (select.val()) {
                    self.activateSelected(select.val())
                }
            })
        }
    }

    enableSelector() {
        console.log("ruta_contaplus::enableSelector")
        let select = this.ruta_contaplus_select
        let self = this
        // Bind select.change to Apply button activation
        select.prop("disabled", false)
        // Apply, if selector has a value
        self.enableApply()
        select.change((event) => {
            // Enable apply button
            self.enableApply()
        })
    }

    activateSelected(selected) {
        console.log("ruta_contaplus::activateSelected (" + selected + ")")
        switchClass(this.ruta_contaplus_heading, "panel-.*", "panel-success")
        hideAsistente(this.ruta_contaplus_body)
        if (this._onSelected) {
            this._onSelected(selected)
        }
    }

    // Populates the input select
    populateSelector(refresh = false) {
        console.log("ruta_contaplus::populateSelector")
        let config = this.config
        let select = this.ruta_contaplus_select
        let self = this
        // Initialize "selected" and "matched" flags
        let selected = ""
        let matched  = false
        contaplus_manager.Scan(config, refresh).then((folders) => {
            if (folders.length > 0) {
                // If we find some folders, clear selector
                select.find('option').remove().end()
                // Check if there is some default value selectable
                if (config.has("folder")) {
                    selected = config.get("folder")
                } else if (folders.length == 1) {
                    selected = folders[0]
                }
                // Populate selector
                for (let folder of folders) {
                    console.log("populateSelector (" + folder + ")")
                    let option = $('<option/>', {
                        value: folder,
                        text:  folder
                    })
                    // If current option matches selected val, propagate it
                    if (folder == selected) {
                        console.log("populateSelector: matched (" + selected + ")")
                        matched = true
                        option.prop("selected", true)
                    }
                    select.append(option)
                }
                // Bind select.change to Apply button activation
                self.enableSelector()
            }
            // Callback _onSelected or _onCleared
            if (matched) {
                self.activateSelected(selected)
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