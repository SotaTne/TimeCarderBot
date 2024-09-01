import { Client, Collection, TextChannel } from "discord.js";
import { getTimerChannels } from "./get_timer_channels";
import { getGuildId } from "../tokens";
import { timerFirstReply } from "./timer_channels_first";
import { userCheck } from "./user_check";
import { channelIdStruct, timerChannel } from "../types";

export async function timerInit(
  client: Client,
  channelsId?: channelIdStruct[] | string[]
): Promise<timerChannel[]> {
  if (!(client instanceof Client)) {
    throw new Error(
      "The client parameter must be an instance of a Discord.js Client"
    );
  }

  try {
    const timerChannels: Collection<string, timerChannel> = getTimerChannels(
      client,
      getGuildId(),
      channelsId
    );
    const allUserIdsUnknown = timerChannels.map((channel) => channel.userId);
    const { collectsIds, notCollectsIds } = await userCheck(
      client,
      getGuildId(),
      allUserIdsUnknown
    );
    timerFirstReply(notCollectsIds, collectsIds, timerChannels);
    const timerCollectChannels: timerChannel[] = [];
    timerChannels.forEach((channel) => {
      if (collectsIds.includes(channel.userId)) {
        timerCollectChannels.push(channel);
      }
    });
    return timerCollectChannels;
  } catch (error) {
    console.error("Error getting timer channels for guild :", error);
    return [];
  }
}
