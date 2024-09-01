import { data_value, mode, time_data } from "../types";
import { TimerChannelsClass } from "../data";
import {
  APIActionRowComponent,
  APIMessageActionRowComponent,
} from "discord-api-types/v9";

import {
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  Message, // Import Message type
} from "discord.js";
import {
  endOfDay,
  getTimerData,
  startWorkingTimer,
  stopWorkingTimer,
} from "..";
import { isToday } from "./is_today";

const UPDATE_INTERVAL = 3000;

let mode_map = new Map<string, mode>();
let data_map: time_data = new Map<string, data_value>();

async function handleInteraction(interaction: any) {
  if (!interaction.isButton()) return;

  const [action, userId] = interaction.customId.split("_");

  const userName =
    interaction.client.users.cache.get(userId)?.username || userId;

  let mode = mode_map.get(userId) ?? "none";

  if (action === "start") {
    startWorkingTimer(userId);
    mode = "working";
    mode_map.set(userId, "working"); // mode_mapの更新を追加
  } else if (action === "stop") {
    stopWorkingTimer(userId);
    mode = "break";
    mode_map.set(userId, "break"); // mode_mapの更新を追加
  }

  await interaction.reply({ content: "Action received!", ephemeral: true });

  // Fetch the channel and message to update after interaction
  const channel = interaction.channel;
  data_map = getTimerData();
  const timerData = data_map.get(userId) ?? {
    workingStart: undefined,
    whileBreakTime: 0,
    workingEnd: undefined,
  };
  const updatedEmbed = createTimerEmbed(
    userName,
    timerData,
    mode_map.get(userId) ?? "none"
  ); // mode_mapを使用してモードを取得

  // Find the message that was sent for this user and update it
  const messages = await channel.messages.fetch();
  const sentMessage = messages.find(
    (msg: Message) =>
      msg.author.id === interaction.client.user?.id && msg.embeds.length > 0
  );

  if (sentMessage) {
    try {
      await sentMessage.edit({ embeds: [updatedEmbed] });
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  }
}

export async function runTimer(
  client: Client,
  timer_class: TimerChannelsClass
): Promise<void> {
  console.log("Running Timer");
  const channels = timer_class.getTimerChannels();
  data_map = getTimerData();

  channels.forEach(async (channel) => {
    mode_map.set(channel.userId, "none");
    const userId = channel.userId;
    const userName =
      channel.channel.client.users.cache.get(userId)?.username || userId;

    const timerData = new Map(data_map);
    if (!timerData.has(userId)) {
      timerData.set(userId, {
        workingStart: undefined,
        whileBreakTime: 0,
        workingEnd: undefined,
      });
    }
    const embed = createTimerEmbed(
      userName,
      timerData.get(userId) ?? {
        workingStart: undefined,
        whileBreakTime: 0,
        workingEnd: undefined,
      },
      mode_map.get(userId) ?? "none"
    );

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`start_${userId}`)
          .setLabel("Start Work")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`stop_${userId}`)
          .setLabel("Stop Work")
          .setStyle(ButtonStyle.Danger)
      )
      .toJSON() as APIActionRowComponent<APIMessageActionRowComponent>;

    const sentMessage = await channel.channel.send({
      embeds: [embed],
      components: [row],
    });

    const updateTimerEmbed = async () => {
      try {
        const updatedTimerData = data_map.get(userId) ?? {
          workingStart: undefined,
          whileBreakTime: 0,
          workingEnd: undefined,
        };
        const updatedEmbed = createTimerEmbed(
          userName,
          updatedTimerData,
          mode_map.get(userId) ?? "none"
        );
        await sentMessage.edit({ embeds: [updatedEmbed] });
        if (isToday(Date.now(), "jp")) {
          endOfDay();
        }
        //console.log(`Updated timer embed for user: ${userId}`);
      } catch (error) {
        //console.error("Failed to update timer embed:", error);
      }
    };

    // Set interval to update the timer embed
    setInterval(updateTimerEmbed, UPDATE_INTERVAL);
  });

  // Register event listener once
  client.on("interactionCreate", handleInteraction);
}

function createTimerEmbed(
  userName: string,
  timerData: data_value,
  mode: mode //"working" | "break" | "none"
): EmbedBuilder {
  const { workingStart, workingEnd, whileBreakTime } = timerData;
  let color =
    mode === "working" ? 0x00ff00 : mode === "break" ? 0xffff00 : 0x808080;

  const elapsedTime =
    mode === "working" && workingStart
      ? Date.now() - workingStart! - whileBreakTime!
      : mode === "break" && workingEnd
        ? whileBreakTime + Date.now() - workingEnd
        : 0;

  const formattedTime = formatTime(elapsedTime);

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`Timer for User: ${userName}`)
    .setDescription(
      mode === "working"
        ? `Working Time: ${formattedTime}`
        : mode === "break"
          ? `Break Time: ${formattedTime}`
          : `Not Started`
    );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // ゼロ埋めして2桁で表示
  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}
