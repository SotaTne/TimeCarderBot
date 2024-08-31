export function getToken(): string {
  const token = process.env.DISCORD_TOKEN;
  if (token === undefined || token === null) {
    throw new Error("DISCORD_TOKEN is empty");
  }
  if (typeof token !== "string") {
    throw new Error("DISCORD_TOKEN is not a string");
  }
  if (!(/^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/.exec(token))) {
    throw new Error("DISCORD_TOKEN may be missing");
  }
  return token;
}

export function getGuildId(): string {
  const guildId = process.env.GUILD_ID;
  if (guildId === undefined || guildId === null) {
    throw new Error("GUILD_ID is empty");
  }
  if (typeof guildId !== "string") {
    throw new Error("GUILD_ID is not a string");
  }
  if (!(/^\d{17,19}$/.exec(guildId))) {
    throw new Error("GUILD_ID may be missing");
  }
  return guildId;
}

export function getClientId(): string {
  const clientId = process.env.CLIENT_ID;
  if (clientId === undefined || clientId === null) {
    throw new Error("CLIENT_ID is empty");
  }
  if (typeof clientId !== "string") {
    throw new Error("CLIENT_ID is not a string");
  }
  if (!(/^\d{17,19}$/.exec(clientId))) {
    throw new Error("CLIENT_ID may be missing");
  }
  return clientId;
}