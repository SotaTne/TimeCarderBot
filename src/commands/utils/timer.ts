import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionReplyOptions,
  CommandInteraction,
} from "discord.js";
import { Command } from "../../commands";

// タイマーコマンドの定義
const timerCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("timer")
    .setDescription("Start a simple timer and show the result"),

  async execute(interaction: Readonly<CommandInteraction>): Promise<void> {
    await interaction.reply(createReplyOptions());
  },
};

function createReplyOptions(): InteractionReplyOptions {
  const exampleEmbed = new EmbedBuilder()
    .setColor("#000000")
    .setAuthor({ name: "Text" })
    .setDescription("Text")
    .addFields(
      { name: "TextTitle", value: "Text", inline: true },
      { name: "TextTitle", value: "Text" }
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Invite")
      .setEmoji("➕")
      .setURL("https://stackoverflow.com")
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel("Another Invite")
      .setEmoji("➕")
      .setURL("https://stackoverflow.com")
      .setStyle(ButtonStyle.Link)
  );

  return {
    embeds: [exampleEmbed],
    components: [row],
    ephemeral: true,
  };
}

export default timerCommand;
