import { Client, EmbedBuilder, TextChannel } from "discord.js";
import type { TEvent } from "../common/types.js";
import { TEventType } from "../common/types.js";
import { events } from "../common/events.js";
import { DateTime } from "luxon";

export class EventBroadcastService {
    private intervalId?: NodeJS.Timer;

    constructor(private readonly client: Client) {}

    startBroadcastOnChannel(broadcastChannelId: string) {
        const secondsToSkip = 60 - new Date().getSeconds();

        console.debug(
            `Skipping ${secondsToSkip} seconds to start event broadcasting. (ChannelId: ${broadcastChannelId})`
        );

        setTimeout(() => {
            this.broadcastEveryAvailableEvents(broadcastChannelId);

            this.intervalId = setInterval(() => {
                this.broadcastEveryAvailableEvents(broadcastChannelId);
            }, 1000 * 60);

            console.info(`Event broadcasting started. (ChannelId: ${broadcastChannelId})`);
        }, secondsToSkip * 1000);
    }

    private broadcastEveryAvailableEvents(broadcastChannelId: string) {
        const currentDateTime = DateTime.now().setZone("Europe/Budapest");

        events.forEach(async (event) => {
            const eventTimeDiff = event.times
                .map((eventTime) => {
                    return {
                        time: eventTime,
                        diff:
                            this.getMinuteOfHHmmTimeString(eventTime) -
                            (currentDateTime.hour * 60 + currentDateTime.minute),
                    };
                })
                .find(
                    (eventTime) =>
                        (eventTime.diff >= 0 && eventTime.diff <= 5) ||
                        (event.type === TEventType.IMPORTANT && eventTime.diff === 10)
                );

            if (typeof eventTimeDiff === "undefined") return;

            await this.sendEmbeddedEventReminderMessageToChannel(broadcastChannelId, event, eventTimeDiff);
        });
    }

    private getMinuteOfHHmmTimeString(HHmmTimeString: string): number {
        const particles = HHmmTimeString.split(":");
        return parseInt(particles[0]) * 60 + parseInt(particles[1]);
    }

    private async sendEmbeddedEventReminderMessageToChannel(
        channelId: string,
        event: TEvent,
        eventTimeDiff: { time: string; diff: number }
    ) {
        const channel = (await this.client?.channels.fetch(channelId)) as TextChannel;
        if (!channel) return;

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${event.name} (${eventTimeDiff.time})`)
            .setDescription(
                eventTimeDiff.diff === 0 ? "Event started." : `Event starting in ${eventTimeDiff.diff} minutes.`
            )
            .addFields({
                name: "Map",
                value: event.map,
            })
            .addFields({
                name: "Event times",
                value: event.times.map((eventTime) => `- ${eventTime}`).join("\n"),
                inline: true,
            })
            .addFields({
                name: "Possible rewards",
                value: event.rewards.map((eventTime) => `- ${eventTime}`).join("\n"),
                inline: true,
            })
            .setTimestamp();

        const sentMessage = await channel.send({ embeds: [exampleEmbed] });

        setTimeout(async () => {
            await sentMessage.delete();
        }, 60 * 1000);
    }
}
