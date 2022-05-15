import { SlashCommandBuilder } from "@discordjs/builders";
import moment from "moment-timezone";

const info = {
    data: new SlashCommandBuilder()
        .setDescription(
            "Get the time in a scpecific timezone",
        )
        .addStringOption(option =>
		option.setName('timezone')
			.setDescription('Your timezone')
			.setRequired(true)),

    async interaction(interaction) {
        const timezone = interaction.options.getString("timezone");
        if (timezone == "+" || timezone == "-") {
            console.log(".")
        };
        if (moment.tz.zone(timezone) != null) {
            const timezoneName = ((moment.tz(timezone).format("zz")[0].toLowerCase() != moment.tz(timezone).format("zz")[0].toUpperCase()) 
                                   ? `${ moment.tz(timezone).format("zz") } (UTC${ moment.tz(timezone).format("Z") })`
                                   : `UTC${ moment.tz(timezone).format("Z") }`)

            await interaction.reply(`The time in ${ timezoneName } is **${ moment.tz(timezone).format("HH:mm") }**`);
            return
        } else {
            await interaction.reply("Invalid zone!");
        }
    }
};

export default info;