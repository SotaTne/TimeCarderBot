import fs from "node:fs";
import path from "node:path";
import { Command } from "./commands";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { getToken, getGuildId, getClientId } from "./tokens";

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
const token = getToken();
const clientId = getClientId();
const guildId = getGuildId();

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: string) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = require(filePath);
    const command: Command = commandModule.default || commandModule;

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      if (!("data" in command)) {
        console.error(
          `The command at ${filePath} is missing a required "data" property.`
        );
      }
      if (!("execute" in command)) {
        console.error(
          `The command at ${filePath} is missing a required "execute" property.`
        );
      }
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    if (!(data instanceof Array)) {
      throw new Error("The data returned from the REST API was not an array.");
    }

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
