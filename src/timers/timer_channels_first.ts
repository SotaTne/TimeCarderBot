import { Collection, Guild, GuildMember } from "discord.js";
import { timerChannel } from "../types";

export function timerFirstReply(
  notCollectsIds: string[],
  collectsIds: string[],
  timerChannels: Collection<string, timerChannel>
) {
  const send_message_timerChannels_non_collect: timerChannel[] = [];
  const send_message_timerChannels_collect: timerChannel[] = [];
  const guild = timerChannels.first()?.channel.guild;
  if (!(guild instanceof Guild)) {
    throw new Error(
      "The guild parameter must be an instance of a Discord.js Guild"
    );
  }
  timerChannels.forEach((channel) => {
    if (notCollectsIds.includes(channel.userId)) {
      send_message_timerChannels_non_collect.push(channel);
    }
    if (collectsIds.includes(channel.userId)) {
      send_message_timerChannels_collect.push(channel);
    }
  });
  send_message_timerChannels_non_collect.forEach((channel) => {
    channel.channel.send({
      embeds: [
        {
          title: "Cannot set the timer",
          description: `userId:${channel.userId} is not a member of the guild.`,
          color: 0xff0000,
        },
      ],
    });
  });
  send_message_timerChannels_collect.forEach((channel) => {
    const user = guild.members.cache.get(channel.userId);
    if (!(user instanceof GuildMember)) {
      console.error(`userId:${channel.userId}  is not a member of the guild.`);
      return;
    }
    channel.channel.send({
      embeds: [
        {
          title: "Timer set",
          description: `The timer has been set for id:${channel.userId} ${user.user.username}(${user.nickname}).`,
          color: 0x00ff00,
        },
      ],
    });
  });
}
