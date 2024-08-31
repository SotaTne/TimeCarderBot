import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: Readonly<CommandInteraction>) => Promise<void>;
}
