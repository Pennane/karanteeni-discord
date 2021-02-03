"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../Command"));
const configuration = {
    name: 'komppaniassaherätys',
    admin: false,
    syntax: 'komppaniassaherätys',
    desc: 'harvinaisen salainen komento',
    triggers: ['komppaniassaherätys', 'patterissaherätys'],
    type: ['muut'],
    hidden: true,
    requireGuild: false
};
const executor = (message, client, args) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        message.author.send('Komppaniassa herätys! Ovet auki, valot päälle. Taistelijat ylös punkasta. Hyvää huomenta komppania! \n\nTämän viestin jätti Susse ollessaan armeijassa. Punkassa rötinä oli kova ja odotus lomille sitäkin suurempi. Hajoaminen oli lähellä.');
        resolve();
    }));
};
exports.default = new Command_1.default({
    configuration,
    executor
});
