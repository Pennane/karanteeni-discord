const Discord = require('discord.js');

let embed = new Discord.MessageEmbed().setColor(0xF4E542);

const configuration = {
    name: "komppaniassaherätys",
    admin: false,
    syntax: "komppaniassaherätys",
    desc: "harvinaisen salainen komento",
    triggers: ["komppaniassaherätys", "patterissaherätys"],
    type: ["muut"],
    hidden: true,
    requireGuild: false
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            message.author.send('Komppaniassa herätys! Ovet auki, valot päälle. Taistelijat ylös punkasta. Hyvää huomenta komppania! \n\nTämän viestin jätti Susse ollessaan armeijassa. Punkassa rötinä oli kova ja odotus lomille sitäkin suurempi. Hajoaminen oli lähellä.')
            resolve()
        });
    },
    configuration
}
