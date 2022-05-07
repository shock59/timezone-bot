import { SlashCommandBuilder } from "@discordjs/builders";

const info = {
    data: new SlashCommandBuilder()
        .setDescription(
            "Ping the bot.",
        ),

    async interaction(interaction) {
        await Promise.all([
            interaction.reply("Pong! 🏓")
        ]);
    }
};

export default info;