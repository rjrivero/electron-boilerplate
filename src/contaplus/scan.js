import drivelist from 'drivelist'
import fs from 'fs'
import path from 'path'

/**
 * Returns a list of GrupoSP folders.
 *
 * Uses the following config vars:
 * - folders: Set of 'GrupoSP' folders
 */
export var scan = function(config, refresh = false) {
    return new Promise((resolve, reject) => {
        if (!refresh && config.has('folders')) {
            resolve(config.get('folders'))
            return
        }
        // Enumerate drives
        drivelist.list((error, drives) => {
            if (error) {
                reject(error)
                return
            }
            // Build a set of directories to try
            let promises = new Array()
            for (let disk of drives) {
                for (let mount of disk.mountpoints) {
                    promises.push(testGrupoSP(mount.path))
                }
            }
            // If no dir found, resolve null
            if (promises.length <= 0) {
                resolve(null)
                return
            }
            // Return all the folders that have "GrupoSP" on it
            Promise.all(promises)
            .then((values) => {
                let filtered = new Array()
                for (let value of values) {
                    if (value) {
                        filtered.push(value)
                    }
                }
                if (filtered.length <= 0) {
                    resolve(null)
                } else {
                    config.set('folders', filtered)
                    resolve(filtered)
                }
            })
            .catch((err) => {
                reject(err)
            })
        })
    })
}

// Test if the given path has a "GrupoSP" folder
function testGrupoSP(mount) {
    return new Promise((resolve, reject) => {
        let test = path.join(mount, "GrupoSP")
        fs.stat(test, (err, stats) => {
            if (err) {
                if (err.code == "ENOENT") {
                    resolve(null)
                } else {
                    reject(err)
                }
             } else if (!stats.isDirectory()) {
                 resolve(null)
             } else  {
                 resolve(test)
             }
        })
    })
}