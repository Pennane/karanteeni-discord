const fs = require('fs')
const path = require('path')

const Command = require('./Command.js')

const commandDirectoryName = './command_files'
const directory = fs.readdirSync(path.resolve(__dirname, commandDirectoryName))

const reservedNames = ['työkalut', 'komennot', 'hauskat', 'kuvat', 'admin', 'muut']

let loadedTriggers = new Map()
let loadedCommands = new Map()

function loadCommand(target) {
    if (!target) throw new Error('Did not receive a target to load the command from')

    let { file, directory } = target

    if (!file || !directory) throw new Error('Missing arguments')

    if (!file.endsWith('.js')) throw new Error('Command is not a javascript file')

    let command = new Command(require(directory + '/' + file), file)

    if (!command) throw new Error('Failed to load command. Check arguments.')

    let triggers = []

    try {
        command.triggers.forEach((trigger) => {
            if (reservedNames.indexOf(trigger) !== -1) {
                throw new Error(
                    `Warning! Command '${command.name}' tried to use a reserved name '${trigger}' as a trigger.`
                )
            }

            loadedTriggers.forEach((_triggers, _command) => {
                if (_triggers.indexOf(trigger) !== -1) {
                    throw new Error(
                        `Warning! Command '${command.name}' interferes with command '${_command}' with the trigger '${trigger}'`
                    )
                }
            })

            triggers.push(trigger)
        })

        loadedCommands.set(command.name, command)
        loadedTriggers.set(command.name, triggers)
    } catch (err) {
        console.info(`ERROR: ${file} : ${err} `)
    }
}

function unloadCommand(commandName) {
    if (loadedCommands.has(commandName)) {
        loadedCommands.delete(commandName)
        loadedTriggers.delete(commandName)
    }
}

directory.forEach((file) => {
    if (file.endsWith('.js')) {
        loadCommand({
            file: file,
            directory: commandDirectoryName
        })
    }
})

module.exports.loaded = () => {
    let _triggers = {}

    loadedTriggers.forEach((triggers, command) => {
        triggers.forEach((trigger) => {
            _triggers[trigger] = command
        })
    })

    return { commands: loadedCommands, triggers: _triggers }
}
