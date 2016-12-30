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
        let targets = bindToggle($(raw), bodies)
        bodies.push.apply(bodies, targets)
    })
}

// Bind a single toggle
function bindToggle(toggle, bodies) {
    // Each toggle may have several targets, space separated
    let ids = toggle.attr("data-target").split(" ")
    let targets = new Array()
    for (let item of ids) {
        console.log("Binding toggle " + item)
        targets.push($(item))
    }
    // Expands a toggle
    let expand = function(event) {
        event.preventDefault()
        // Hide other panels
        bodies.forEach((other) => {
            other.addClass("hidden")
        })
        // Open my panels
        targets.forEach((target) => {
            target.removeClass("hidden")
        })
        // Grab focus
        if (!toggle.is(":focus")) {
            toggle.focus()
        }
    }
    // Bind expand function to a global toggle
    let expander = $("#expand_" + ids[0].substring(1))
    if (expander) {
        expander.off().on("click", expand)
    }
    // Attach expand function to both click and focus
    toggle.off().on("click", expand)
    toggle.on("focus", expand)
    return targets
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