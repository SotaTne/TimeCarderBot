import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../commands";

const pingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
} as Command;

export default pingCommand;
