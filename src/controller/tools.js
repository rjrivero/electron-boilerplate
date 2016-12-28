// Removes any class that matches the given "pattern", and
// adds the new classes given by "add"
export function switchClass(item, pattern, add) {
    console.log("tools::switchClass")
    // Turn input pattern into regexp array
    let toRemove = new Array()
    for (let regex of pattern.split(" ")) {
        toRemove.push(new RegExp(regex))
    }
    // Remove classes from object
    item.removeClass((index, className) => {
        let matches = new Array()
        for (let currentClass of className.split(" ")) {
            for (let regex of toRemove) {
                if (regex.test(currentClass)) {
                    matches.push(currentClass)
                }
            }
        }
        return matches.join(" ")
    })
    // Add the given classes
    item.addClass(add)
}

// Bind toggles so when one is shown, the others are hidden
export function bindToggles() {
    console.log("tools::toggleAsistente")
    let bodies = new Array()
    $('a[data-toggle=hidden]').each((index, raw) => {
        let toggle = $(raw)
        let body = $(toggle.attr("data-target"))
        toggle.click((event) => {
            event.preventDefault()
            bodies.forEach((other) => {
                other.addClass("hidden")
            })
            body.removeClass("hidden")
        })
        bodies.push(body)
    })
}

// Force show, toggling with parent. See
// http://stackoverflow.com/questions/17750907/
export function showAsistente(item) {
    console.log("tools::showAsistente [" + item.attr("class") + "]")
    item.removeClass("hidden")
}

export function hideAsistente(item) {
    console.log("tools::hideAsistente [" + item.attr("class") + "]")
    item.addClass("hidden")
}

export function disableButton(item) {
    switchClass(item, "btn.-*", "btn-default disabled")
    item.prop("disabled", "disabled")
}

export function enableButton(item) {
    switchClass(item, "disabled btn.-*", "btn-default")
    item.prop("disabled", false)
}