import {
  ChannelType,
  Client,
  Collection,
  Guild,
  GuildBasedChannel,
  TextChannel,
  CategoryChannel,
} from "discord.js";
import { type } from "os";

type channelIdStruct = {
  channelId: string;
  userId: string;
};

type timerChannel = {
  channel: TextChannel;
  userId: string;
};

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

  if (
    !channelsId ||
    !Array.isArray(channelsId) ||
    channelsId.length === 0 ||
    typeof channelsId[0] !== "string" ||
    !(
      typeof channelsId[0] === "object" &&
      typeof (channelsId[0] as channelIdStruct).channelId !== "string" &&
      typeof (channelsId[0] as channelIdStruct).userId !== "string"
    )
  ) {
    guild.channels.cache.forEach((channel) => {
      const matcher = channel.name.match(/__(\d+)__/);
      if (
        channel.type === ChannelType.GuildText &&
        channel.name.includes("timecarder") &&
        matcher
      ) {
        channels.set(channel.id, { channel, userId: matcher[1] });
      } else if (
        channel.type === ChannelType.GuildCategory &&
        channel.name.includes("timecarder")
      ) {
        let matcher: RegExpMatchArray | null;
        (channel as CategoryChannel).children.cache
          .filter((child): child is TextChannel => {
            matcher = child.name.match(/__(\d+)__/);
            return child.type === ChannelType.GuildText && Boolean(matcher);
          })
          .forEach((textChannel) => {
            if (Array.isArray(matcher) && matcher.length > 1) {
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
          {
            let matcher: RegExpMatchArray | null;

            (channel as CategoryChannel).children.cache
              .filter((child): child is TextChannel => {
                matcher = child.name.match(/__(\d+)__/);
                return (
                  child.type === ChannelType.GuildText &&
                  Boolean(child.name.match(/__(\d+)__/))
                );
              })
              .forEach((textChannel) => {
                if (Array.isArray(matcher) && matcher.length > 1) {
                  channels.set(textChannel.id, {
                    channel: textChannel,
                    userId: matcher[1],
                  });
                }
              });
          }
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
