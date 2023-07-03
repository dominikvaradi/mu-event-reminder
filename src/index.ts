import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { EventBroadcastService } from "./services/event-broadcast.service.js";

dotenv.config();

if (!process.env.BOT_TOKEN || !process.env.BROADCAST_CHANNEL_ID) {
    throw new Error("Cannot find 'BOT_TOKEN' or 'BROADCAST_CHANNEL_ID' environment variable.");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.on("ready", (botClient) => {
    console.info(`${botClient.user.tag} bot logged in.`);

    const eventBroadcastService = new EventBroadcastService(botClient);
    eventBroadcastService.startBroadcastOnChannel(process.env.BROADCAST_CHANNEL_ID!);
});

await client.login(process.env.BOT_TOKEN);
