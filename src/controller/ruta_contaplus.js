import { switchClass, disableButton, enableButton, hideAsistente, showAsistente } from './tools'

export class RutaContaplusControl {

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
        console.log("ruta_contaplus::constructor")
        this.model = model
        this.heading = $("#ruta_contaplus_heading")
        this.body = $("#ruta_contaplus_body")
        this.select = $("#ruta_contaplus_select")
        this.search = $("#ruta_contaplus_search")
        this.apply = $("#ruta_contaplus_apply")
    }

    // Activates the control, sets focus on the tab
    Focus() {
        console.log("ruta_contaplus::Focus")
        let self = this
        // Give the focus style to the box
        switchClass(this.heading, "panel-.*", "panel-primary")
        // Show the panel body
        showAsistente(this.body)
        // Enable search button
        self.enableSearch()
        // Populate the selector.
        self.populateSelector(false)
    }

    Blur(propagate) {
        console.log("ruta_contaplus::Blur")
        // Give the plain style to the box
        switchClass(this.heading, "panel-.*", "panel-default")
        // Hide the body
        hideAsistente(this.body)
        // disable the selector
        this.disableSelector()
        if (propgae && self._onCleared) {
            self._onCleared()
        }
    }

    enableSearch() {
        console.log("ruta_contaplus::enableSearch")
        // Enable search button
        let self = this
        let search = this.search
        search.off().on("click", (event) => {
            event.preventDefault()
            self.populateSelector(true)
        })
        enableButton(search)
    }

    enableApply() {
        console.log("ruta_contaplus::enableApply")
        let apply = this.apply
        let select = this.select
        let self = this
        if (select.val()) {
            apply.off().on("click", (event) => {
                console.log("Activando ruta_contaplus_apply (" + select.val() + ")")
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
        console.log("ruta_contaplus::enableSelector")
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
        console.log("ruta_contaplus::disableSelector")
        // Disable Apply button until it is available
        disableButton(this.apply)
        // Disable selector
        let select = this.select
        select.prop("disabled", "disabled")
        select.find('option').remove().end()
    }

    activateSelected(selected) {
        console.log("ruta_contaplus::activateSelected (" + selected + ")")
        switchClass(this.heading, "panel-.*", "panel-success")
        hideAsistente(this.body)
        this.model.SetFolder(selected)
        if (this._onSelected) {
            this._onSelected(selected)
        }
    }

    // Populates the input select
    populateSelector(refresh = false) {
        console.log("ruta_contaplus::populateSelector")
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
        let savedFolder = model.GetFolder()
        model.ScanFolders(refresh).then((folders) => {
            if (folders.length > 0) {
                // Check if there is some default value selectable
                if (savedFolder) {
                    selected = savedFolder
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