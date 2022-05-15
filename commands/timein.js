import { SlashCommandBuilder } from "@discordjs/builders";
import moment from "moment-timezone";

const info = {
    data: new SlashCommandBuilder()
        .setDescription(
            "Set your timezone, either a TZ entry or the offset from UTC",
        )
        .addStringOption(option =>
		option.setName('timezone')
			.setDescription('Your timezone.')
			.setRequired(true)),

    async interaction(interaction) {
        const timezone = interaction.options.getString("timezone");
        console.log(moment.tz(timezone));
        if (timezone == "+" || timezone == "-") {
            console.log(".")
        };
        if (moment.tz.zone(timezone) != null) {
            await interaction.reply(moment.tz(timezone).format("HH:mm"));
            return
        } else {
            await interaction.reply("Invalid zone!");
        }
    }
};

export default info;