import Command, { CommandExecutor } from '../Command'

const configuration = {
    name: 'komppaniassaherätys',
    admin: false,
    syntax: 'komppaniassaherätys',
    desc: 'harvinaisen salainen komento',
    triggers: ['komppaniassaherätys', 'patterissaherätys'],
    type: ['muut'],
    hidden: true,
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise<void>(
        async (resolve, reject): Promise<any> => {
            message.author.send(
                'Komppaniassa herätys! Ovet auki, valot päälle. Taistelijat ylös punkasta. Hyvää huomenta komppania! \n\nTämän viestin jätti Susse ollessaan armeijassa. Punkassa rötinä oli kova ja odotus lomille sitäkin suurempi. Hajoaminen oli lähellä.'
            )
            resolve()
        }
    )
}

export default new Command({
    configuration,
    executor
})
