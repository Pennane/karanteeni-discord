"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commandDirectoryName = './command_files';
const directory = fs_1.default.readdirSync(path_1.default.resolve(__dirname, commandDirectoryName));
const reservedNames = ['työkalut', 'komennot', 'hauskat', 'kuvat', 'admin', 'muut'];
let loadedTriggers = new Map();
let loadedCommands = new Map();
const loadCommand = (target) => __awaiter(void 0, void 0, void 0, function* () {
    let { file, directory } = target;
    const command = yield Promise.resolve().then(() => __importStar(require(`${directory}/${file}`)));
    if (!command)
        throw new Error(`Failed to load command from ${directory}/${file}`);
    let triggers = [];
    try {
        command.triggers.forEach((trigger) => {
            if (reservedNames.indexOf(trigger) !== -1) {
                throw new Error(`Warning! Command '${command.name}' tried to use a reserved name '${trigger}' as a trigger.`);
            }
            loadedTriggers.forEach((_triggers, _command) => {
                if (_triggers.indexOf(trigger) !== -1) {
                    throw new Error(`Warning! Command '${command.name}' interferes with command '${_command}' with the trigger '${trigger}'`);
                }
            });
            triggers.push(trigger);
        });
        loadedCommands.set(command.name, command);
        loadedTriggers.set(command.name, triggers);
    }
    catch (err) {
        console.info(`ERROR: ${file} : ${err} `);
    }
});
directory.forEach((file) => {
    if (!file.endsWith('.js') || !file.endsWith('.ts'))
        return;
    loadCommand({
        file: file,
        directory: commandDirectoryName
    });
});
const currentlyLoaded = () => {
    let _triggers = {};
    loadedTriggers.forEach((triggers, command) => {
        triggers.forEach((trigger) => {
            _triggers[trigger] = command;
        });
    });
    return { commands: loadedCommands, triggers: _triggers };
};
exports.default = currentlyLoaded;
