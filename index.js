import fileSystem from "fs/promises";
import path from "path";
import url from "url";
import 'dotenv/config';

import { Client, Intents, Collection, MessageEmbed } from "discord.js";

const directory = "commands";

const pkg = JSON.parse(
    await fileSystem.readFile(
        path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "./package.json"),
        "utf8",
    ),
);

const commands = (new Collection());


const siblings = (await fileSystem.readdir(directory)).filter(
		(file) => path.extname(file) === ".js",
);

const promises = siblings.map(async (sibling) => {
		const filename = path.basename(sibling).split(path.extname(sibling))[0] || "";

		commands.set(
				(filename),
				(await import(url.pathToFileURL(path.resolve(directory, sibling)).toString())).default,
		);
});

await Promise.all(promises);

for (const [name, command] of commands.entries())
    if (!command.data.name) command.data.setName(name);

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = commands.get(interaction.commandName);

        if (!command) throw new ReferenceError(`Command \`${interaction.commandName}\` not found.`);

        await command.interaction(interaction);
})

client.once("ready", async (client) => {
		console.log(
			`Connected to Discord with ID ${client.application.id} and tag ${
				client.user?.tag || ""
			}`,
		);

		const GUILD_ID = process.env.GUILD_ID || "";
		const guilds = await client.guilds.fetch();

		guilds.forEach(async (guild) => {
			if (guild.id === GUILD_ID) {
				if (process.env.NODE_ENV !== "production") return;

				const { channels } = await guild.fetch();
				const { ERROR_CHANNEL } = process.env;

				if (!ERROR_CHANNEL)
					throw new ReferenceError("ERROR_CHANNEL is not set in the .env");

				const channel = await channels.fetch(ERROR_CHANNEL);

				if (!channel?.isText())
					throw new ReferenceError("Could not find error reporting channel");

				return await channel?.send({
					embeds: [
						new MessageEmbed()
							.setTitle("Bot restarted!")
							.setDescription(`Version ${pkg.version}`)
							.setColor("RANDOM"),
					],
				});
			}

			const guildCommands = await client.application?.commands
				.fetch({
					guildId: guild.id,
				})
				.catch(() => {});

			guildCommands?.forEach(async (command) => await command.delete().catch(() => {}));
		});

		const prexistingCommands = await client.application.commands.fetch({
			guildId: GUILD_ID,
		});

		const slashes = new Collection();

		for (const [key, command] of commands.entries()) {
			if (command.apply !== false)
				slashes.set(key, { command: command.data, permissions: command.permissions });
		}

		await Promise.all(
			prexistingCommands.map((command) => {
				if (slashes.has(command.name)) return false;

				return command.delete();
			}),
		);

		await Promise.all(
			slashes.map(async ({ command, permissions }, name) => {
				const newCommand = await (prexistingCommands.has(name)
					? client.application?.commands.edit(name, command.toJSON(), GUILD_ID)
					: client.application?.commands.create(command.toJSON(), GUILD_ID));

				if (permissions)
					await newCommand?.permissions.add({ guild: GUILD_ID, permissions });
			}),
		);
	});

await client.login(process.env.BOT_TOKEN);