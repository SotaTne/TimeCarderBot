import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../commands";
import { getTimerData, setTimerChannels, setTimerData } from "../..";
import { timerInit } from "../../timers/timer_channels_init";
import { get } from "http";

const TimerUpdateCommand = {
  data: new SlashCommandBuilder()
    .setName("timer_update")
    .setDescription("User and Channel setting update"),
  async execute(interaction) {
    if (typeof interaction.guildId !== "string") {
      interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: "Error",
            description: "This command must be executed in a server.",
          },
        ],
      });
    } else {
      const data = getTimerData();
      interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: "Success",
            description: "Timer channels have been updated.",
          },
        ],
      });
      setTimerChannels(await timerInit(interaction.client));
      setTimerData(data);
    }
  },
} as Command;

export default TimerUpdateCommand;
