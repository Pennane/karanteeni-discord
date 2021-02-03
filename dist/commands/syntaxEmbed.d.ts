import { CommandConfiguration } from './Command';
interface SyntaxEmbedOptions {
    configuration: CommandConfiguration;
    heading?: string | null;
    body?: string | null;
}
declare const syntaxEmbed: (options: SyntaxEmbedOptions) => void;
export default syntaxEmbed;
