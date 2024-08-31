import fs from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { getTimerChannels } from "./timers/time_card";
import { getGuildId, getToken } from "./tokens";
import { Command } from "./commands";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

commandFolders.forEach((folder) => {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  console.log(commandFiles);
  commandFiles.forEach(async (file) => {
    const filePath = path.join(commandsPath, file);

    const commandModule = await import(filePath);
    const command = commandModule.default || commandModule;
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      if (!("data" in command)) {
        console.error(
          `[WARNING] The command at ${filePath} is missing a required "data" property.`
        );
      }
      if (!("execute" in command)) {
        console.error(
          `[WARNING] The command at ${filePath} is missing a required "execute" property.`
        );
      }
    }
  });
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.once("ready", () => {
  client.guilds.cache.forEach((guild) => {
    try {
      const timerChannels = getTimerChannels(client, guild.id);
      console.log(`Guild: ${guild.name}, Timer Channels:`, timerChannels.size);
      timerChannels.forEach((channel) => {
        console.log(
          `Channel: ${channel.channel.name}, ID: ${channel.channel.id}`
        ); // Log the name and ID of each timer
        console.log(`User ID: ${channel.userId}`); // Log the user ID of each timer
      });
    } catch (error) {
      console.error(
        `Error getting timer channels for guild ${guild.name}:`,
        error
      );
    }
  });
});

client.login(getToken());
