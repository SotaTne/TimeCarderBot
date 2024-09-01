import { TextChannel } from "discord.js";

export type channelIdStruct = {
  channelId: string;
  userId: string;
};

export type timerChannel = {
  channel: TextChannel;
  userId: string;
};

export type time_data = Map<string, data_value>;

export type data_value = {
  workingStart?: number;
  whileBreakTime: number;
  workingEnd?: number;
};

export type mode = "working" | "break" | "none";
