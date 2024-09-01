import fs from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { getToken } from "./tokens";
import { Command } from "./commands";
import { timerInit } from "./timers/timer_channels_init";
import { TimerChannelsClass } from "./data";
import { time_data, timerChannel } from "./types";
import { runTimer } from "./timers/runtimer";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection<string, Command>();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const timerClass = new TimerChannelsClass();

let isClientReady = false;

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
          `[警告] ${filePath} のコマンドに必要な "data" プロパティがありません。`
        );
      }
      if (!("execute" in command)) {
        console.error(
          `[警告] ${filePath} のコマンドに必要な "execute" プロパティがありません。`
        );
      }
    }
  });
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`準備完了！ ${readyClient.user.tag} としてログインしました。`);
  isClientReady = true;

  const timerChannels = await timerInit(client);
  setTimerChannels(timerChannels);
  runTimer(client, timerClass);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(
      `${interaction.commandName} に一致するコマンドが見つかりません。`
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "このコマンドの実行中にエラーが発生しました！",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "このコマンドの実行中にエラーが発生しました！",
        ephemeral: true,
      });
    }
  }
});

function ensureClientReady(): void {
  if (!isClientReady) {
    throw new Error("クライアントの準備ができていません。");
  }
}

function ensureTimerClassInstance(): void {
  if (!(timerClass instanceof TimerChannelsClass)) {
    throw new Error(
      "timerClassはTimerChannelsClassのインスタンスである必要があります"
    );
  }
}

export function setTimerChannels(timerChannels: timerChannel[]): void {
  ensureClientReady();
  ensureTimerClassInstance();
  timerClass.setTimerChannels(timerChannels);
}

export function getTimerData(): time_data {
  ensureClientReady();
  ensureTimerClassInstance();
  return timerClass.getData();
}

export function setTimerData(data: time_data): void {
  ensureClientReady();
  ensureTimerClassInstance();
  timerClass.setData(data);
}

export function startWorkingTimer(id: string): void {
  ensureClientReady();
  ensureTimerClassInstance();
  timerClass.startWorking(id);
}

export function stopWorkingTimer(id: string): void {
  ensureClientReady();
  ensureTimerClassInstance();
  timerClass.stopWorking(id);
}

export function endOfDay(): void {
  ensureClientReady();
  ensureTimerClassInstance();
  timerClass.endOfDay();
}

client.login(getToken());
