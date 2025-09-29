// Import necessary modules
const fs = require('fs');
const path = require('path');

// Function to load commands from a specified folder
function commandLoader(commandsMap, folderPath) {
    let found = 0;
    let loaded = 0;

    // Load .js files directly in the folder
    const rootFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of rootFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        found++;

        if (!command.name || !command.execute) {
            console.log(`[WARNING] Command in ${filePath} is missing "name" or "execute".`);
            continue;
        }

        commandsMap.set(command.name, command);

        if (Array.isArray(command.aliases)) {

            for (const alias of command.aliases) {
                commandsMap.set(alias, command);
            }
        }

        loaded++;
    }

    // Load .js files from subfolders
    const folders = fs.readdirSync(folderPath).filter(f => fs.lstatSync(path.join(folderPath, f)).isDirectory());

    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(filesPath, file);
            const command = require(filePath);

            found++;

            if (!command.name || !command.execute) {
                console.log(`[WARNING] Command in ${filePath} is missing "name" or "execute".`);
                continue;
            }

            commandsMap.set(command.name, command);

            if (Array.isArray(command.aliases)) {

                for (const alias of command.aliases) {
                    commandsMap.set(alias, command);
                }
            }

            loaded++;
        }
    }
    console.log(`[Loader] Loaded ${loaded} of ${found} commands.`);
}

module.exports = { 
    commandLoader 
}