import { scan } from '../contaplus/scan';
import { companies } from '../contaplus/companies';

class RutaContaplus {

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

    // Connects all the plumbing associated to ruta_contaplus
    plumb(config) {
        // Bind all variables
        this.config = config
        this.ruta_contaplus_heading = $("#ruta_contaplus_heading")
        this.ruta_contaplus_body = $("#ruta_contaplus_body")
        this.ruta_contaplus_select = $("#ruta_contaplus_select")
        this.ruta_contaplus_search = $("#ruta_contaplus_search")
        this.ruta_contaplus_apply = $("#ruta_contaplus_apply")
        let self = this
        // Enable search button
        this.ruta_contaplus_search[0].className = "btn btn-default"
        this.ruta_contaplus_search.click((event) => {
            event.preventDefault()
            self.populate(true)
        })
        // Disable Apply button until it is available
        this.ruta_contaplus_apply[0].className = "btn disabled"
        // Bind select.change to Apply button activation
        this.ruta_contaplus_select.change((event) => {
            // Enable apply button
            self.ruta_contaplus_apply[0].className = "btn btn-default"
            self.ruta_contaplus_apply.click((event) => {
                event.preventDefault()
                if (select.value) {
                    if (self._onSelected) {
                        self._onSelected(select.value)
                    }
                }
            })
        })
    }

    // Populates the input select
    populate(refresh = false) {
        let config = this.config
        let select = this.ruta_contaplus_select
        let self = this
        // Initialize "selected" and "matched" flags
        let selected = ""
        let matched  = false
        scan(config, refresh).then((folders) => {
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
                select.prop("disabled", false)
                for (let folder of folders) {
                    let option = $('<option/>', {
                        value: folder,
                        text:  folder
                    })
                    // If current option matches selected val, propagate it
                    if (folder == selected) {
                        matched = true
                        option.prop("selected", true)
                    }
                    select.append(option)
                }
                if (!matched) {
                    let option = $('<option/>', {
                        value: "",
                        text:  "-- Seleccione una ruta --"
                    })
                    option.prop("selected", true)
                    select.append(option)
                }
            }
            // Callback _onSelected or _onCleared
            if (matched) {
                if (self._onSelected) {
                    self._onSelected(selected)
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

export var ruta_contaplus = new RutaContaplus()