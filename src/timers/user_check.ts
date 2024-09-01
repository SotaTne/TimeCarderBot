import { Client } from "discord.js";

export async function userCheck(
  client: Client,
  guildId: string,
  userIds: string[]
): Promise<{ collectsIds: string[]; notCollectsIds: string[] }> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error(
      "The guild parameter must be an instance of a Discord.js Guild"
    );
  }
  if (!(client instanceof Client)) {
    throw new Error(
      "The client parameter must be an instance of a Discord.js Client"
    );
  }

  const collectsIds: string[] = [];
  const notCollectsIds: string[] = [];

  for (const userId of userIds) {
    try {
      // キャッシュからメンバーを取得し、キャッシュになければfetchする
      const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));
      if (member) {
        collectsIds.push(userId); // ユーザーがギルドに存在する場合
      } else {
        notCollectsIds.push(userId); // ユーザーがギルドに存在しない場合
      }
    } catch (error) {
      // fetchが失敗した場合もユーザーが存在しないとみなす
      notCollectsIds.push(userId);
    }
  }

  console.log(
    `1089383386696659096 , ${guild.members.cache.has("1089383386696659096")}`
  );

  return {
    collectsIds,
    notCollectsIds,
  };
}
