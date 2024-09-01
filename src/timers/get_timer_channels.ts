import {
  ChannelType,
  Client,
  Collection,
  Guild,
  TextChannel,
  CategoryChannel,
} from "discord.js";
import { channelIdStruct, timerChannel } from "../types";

export function getTimerChannels(
  client: Client,
  guildId: string,
  channelsId?: channelIdStruct[] | string[]
): Collection<string, timerChannel> {
  const guild = client.guilds.cache.get(guildId);
  if (!(guild instanceof Guild)) {
    throw new Error(
      "The guild parameter must be an instance of a Discord.js Guild"
    );
  }
  if (!(client instanceof Client)) {
    throw new Error(
      "The client parameter must be an instance of a Discord.js Client"
    );
  }

  let channels = new Collection<string, timerChannel>();

  /*
  test

  console.log(`!channelsId: ${!channelsId}`);
  console.log(`!Array.isArray(channelsId): ${!Array.isArray(channelsId)}`);
  console.log(`channelsId.length === 0: ${(channelsId ?? []).length === 0}`);
  console.log(
    `typeof channelsId[0] !== "string": ${typeof (channelsId ?? [[]])[0] !== "string"}`
  );
  console.log(
    `typeof channelsId[0] === "object": ${typeof (channelsId ?? [""])[0] === "object"}`
  );
  console.log(
    `typeof (channelsId[0] as channelIdStruct).channelId === "string": ${
      typeof ((channelsId ?? [])[0] as channelIdStruct).channelId === "string"
    }`
  );
  console.log(
    `typeof (channelsId[0] as channelIdStruct).userId === "string": ${
      typeof ((channelsId ?? [])[0] as channelIdStruct).userId === "string"
    }`
  );
  */

  if (
    !channelsId ||
    !Array.isArray(channelsId) ||
    channelsId.length === 0 ||
    (typeof channelsId[0] !== "string" &&
      !(
        typeof channelsId[0] === "object" &&
        typeof (channelsId[0] as channelIdStruct).channelId === "string" &&
        typeof (channelsId[0] as channelIdStruct).userId === "string"
      ))
  ) {
    guild.channels.cache.forEach((channel) => {
      if (
        channel.type === ChannelType.GuildText &&
        channel.name.includes("timecarder")
      ) {
        const matcher = channel.name.match(/__(\d+)__/);
        if (matcher) {
          channels.set(channel.id, { channel, userId: matcher[1] });
        }
      } else if (
        channel.type === ChannelType.GuildCategory &&
        channel.name.includes("timecarder")
      ) {
        (channel as CategoryChannel).children.cache
          .filter((child): child is TextChannel => {
            return child.type === ChannelType.GuildText;
          })
          .forEach((textChannel) => {
            const matcher = textChannel.name.match(/__(\d+)__/);
            if (matcher) {
              channels.set(textChannel.id, {
                channel: textChannel,
                userId: matcher[1],
              });
            }
          });
      }
    });
  } else {
    channelsId.forEach((id) => {
      if (typeof id === "string") {
        const channel = guild.channels.cache.get(id);
        if (channel && channel.type === ChannelType.GuildCategory) {
          (channel as CategoryChannel).children.cache
            .filter((child): child is TextChannel => {
              return child.type === ChannelType.GuildText;
            })
            .forEach((textChannel) => {
              const matcher = textChannel.name.match(/__(\d+)__/);
              if (matcher) {
                channels.set(textChannel.id, {
                  channel: textChannel,
                  userId: matcher[1],
                });
              }
            });
        }
      } else if (
        typeof id === "object" &&
        typeof id.channelId === "string" &&
        typeof id.userId === "string"
      ) {
        const channel = guild.channels.cache.get(id.channelId);
        if (channel && channel.type === ChannelType.GuildText) {
          channels.set(channel.id, { channel, userId: id.userId });
        }
      }
    });
  }
  return channels;
}
