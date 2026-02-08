import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import { AuthManager } from './auth';
import { ZyroBot } from './booster';
import { Logger } from './utils';

const auth = new AuthManager();
const bot = new ZyroBot();
const CONFIG_FILE = 'config.json';

interface Config {
    games: number[];
    webhook: string;
    webhookInterval: number;
}

let config: Config = {
    games: [730], // Default CS2
    webhook: '',
    webhookInterval: 0 // 0 = disabled
};

// Global State
let isLoggedIn = false;
let isBoosting = false;
let currentUsername = 'None';
let personaState = 1; // 1 = Online, 7 = Invisible
let startTime: number | null = null;

// Load config
if (fs.existsSync(CONFIG_FILE)) {
    try {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        bot.setWebhook(config.webhook);
        bot.setWebhookInterval(config.webhookInterval || 0);
        bot.setGames(config.games);
    } catch (e) {
        Logger.error("Failed to load config.json");
    }
}

function saveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function printHeader() {
    console.clear();
    console.log(chalk.magenta.bold(`
    ███████╗██╗   ██╗██████╗  ██████╗     ██████╗  ██████╗  ██████╗ ███████╗████████╗███████╗██████╗ 
    ╚══███╔╝╚██╗ ██╔╝██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
      ███╔╝  ╚████╔╝ ██████╔╝██║   ██║    ██████╔╝██║   ██║██║   ██║███████╗   ██║   █████╗  ██████╔╝
     ███╔╝    ╚██╔╝  ██╔══██╗██║   ██║    ██╔══██╗██║   ██║██║   ██║╚════██║   ██║   ██╔══╝  ██╔══██╗
    ███████╗   ██║   ██║  ██║╚██████╔╝    ██████╔╝╚██████╔╝╚██████╔╝███████║   ██║   ███████╗██║  ██║
    ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝     ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                                      NODE.JS EDITION
    `));

    // Game Name Helper
    const getGameName = (id: number) => {
        if (id === 730) return 'CS2';
        if (id === 570) return 'Dota 2';
        if (id === 440) return 'TF2';
        if (id === 252490) return 'Rust';
        return id.toString();
    };

    // Status Bar
    const loginStatus = isLoggedIn ? chalk.green(currentUsername) : chalk.red('Logged Out');
    let boostStatus = isBoosting ? chalk.green('ACTIVE') : chalk.red('INACTIVE');

    if (isBoosting) {
        const gameNames = config.games.map(getGameName).join(', ');
        boostStatus = chalk.green(`PLAYING: ${gameNames}`);
    }

    let uptime = '00:00:00';
    if (startTime) {
        const diff = Date.now() - startTime;
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        uptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const visStatus = personaState === 7 ? chalk.gray('INVISIBLE') : chalk.blue('ONLINE');

    console.log(chalk.white.bold(`    USER: [${loginStatus}]`));
    console.log(chalk.white.bold(`    STATUS: [${boostStatus}]`));
    console.log(chalk.white.bold(`    UPTIME: [${chalk.yellow(uptime)}]`));
    console.log(chalk.white.bold(`    VISIBILITY: [${visStatus}]`));
    console.log(chalk.gray('    ==========================================================================\n'));
}

async function handleLoginFlow(user: string, pass: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const client = bot.getClient();

        // Cleanup
        client.removeAllListeners('steamGuard');
        client.removeAllListeners('loggedOn');
        client.removeAllListeners('error');

        client.on('loggedOn', () => {
            isLoggedIn = true;
            currentUsername = user;
            bot.setPersonaState(personaState); // Ensure we set the state on login
            Logger.success('Login Successful! You can now Start Boosting.');
            resolve();
        });

        client.on('error', (err: any) => {
            Logger.error(`Login Error: ${err.message}`);
            resolve();
        });

        client.on('steamGuard', async (domain: any, callback: any, lastCodeWrong: any) => {
            if (lastCodeWrong) {
                console.log(chalk.red("Last Steam Guard code was wrong!"));
            }

            const { code } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'code',
                    message: `Steam Guard Code required (${domain ? 'Email' : 'Mobile App'}):`
                }
            ]);

            callback(code);
        });

        bot.login(user, pass);
    });
}

async function monitorStatus() {
    let dashboardActive = true;
    
    const refresh = () => {
        if (!dashboardActive) return;
        printHeader();
        console.log(chalk.cyan("    [MONITORING] Booster is running in background."));
        console.log(chalk.white("    Current Games: ") + chalk.yellow(config.games.join(', ')));
        console.log(chalk.gray("\n    Press ENTER to return to main menu..."));
    };

    refresh();
    const interval = setInterval(refresh, 1000);

    const rl = inquirer.createPromptModule();
    await rl([
        {
            type: 'input',
            name: 'return',
            message: ''
        }
    ]);

    dashboardActive = false;
    clearInterval(interval);
}

async function main() {
    // Attempt auto-login if creds exist?
    // Maybe not auto, but pre-fetch user.
    const savedCreds = await auth.getCredentials();
    if (savedCreds.user) {
        currentUsername = savedCreds.user + " (Saved)";
    }

    while (true) {
        printHeader();

        const choices = [];

        if (!isLoggedIn) {
            choices.push('Login');
        } else {
            if (!isBoosting) choices.push('Start Boosting');
            if (isBoosting) {
                choices.push('Monitor Status');
                choices.push('Stop Boosting');
            }
            choices.push(personaState === 1 ? 'Go Invisible' : 'Go Online');
        }

        choices.push('Settings (Games/Webhook)');
        choices.push('Exit');

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Choose an option:',
                choices: choices
            }
        ]);

        if (action === 'Login') {
            const currentCreds = await auth.getCredentials();
            let user = currentCreds.user;
            let pass = currentCreds.pass;

            if (!user || !pass) {
                console.log(chalk.yellow("No saved credentials found."));
                const answers = await inquirer.prompt([
                    { type: 'input', name: 'username', message: 'Steam Username:' },
                    { type: 'password', name: 'password', message: 'Steam Password:' }
                ]);
                user = answers.username;
                pass = answers.password;

                if (user && pass) {
                    await auth.saveCredentials(user, pass);
                }
            } else {
                console.log(chalk.green(`Using saved credentials for: ${user}`));
            }

            if (user && pass) {
                await handleLoginFlow(user, pass);
            }
        }
        else if (action === 'Start Boosting') {
            if (!isLoggedIn) {
                Logger.error("You must be logged in first!");
            } else {
                bot.startBoosting(config.games);
                isBoosting = true;
                startTime = Date.now();
                await monitorStatus();
            }
        }
        else if (action === 'Monitor Status') {
            await monitorStatus();
        }
        else if (action === 'Stop Boosting') {
            bot.stopBoosting();
            isBoosting = false;
            startTime = null;
        }
        else if (action === 'Go Invisible') {
            personaState = 7;
            if (isLoggedIn) bot.setPersonaState(7);
        }
        else if (action === 'Go Online') {
            personaState = 1;
            if (isLoggedIn) bot.setPersonaState(1);
        }
        else if (action === 'Settings (Games/Webhook)') {
            const { settingAction } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'settingAction',
                    message: 'What do you want to configure?',
                    choices: ['Edit Games', 'Set Webhook', 'Set Webhook Interval', 'Back']
                }
            ]);

            if (settingAction === 'Edit Games') {
                const { gameIds } = await inquirer.prompt([
                    { type: 'input', name: 'gameIds', message: 'Enter Game IDs (comma separated):', default: config.games.join(', ') }
                ]);
                const ids = gameIds.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
                config.games = ids;
                bot.setGames(ids);
                saveConfig();
                Logger.success(`Games updated: ${ids.join(', ')}`);
            }
            else if (settingAction === 'Set Webhook') {
                const { url } = await inquirer.prompt([
                    { type: 'input', name: 'url', message: 'Discord Webhook URL:', default: config.webhook }
                ]);
                config.webhook = url;
                bot.setWebhook(url);
                saveConfig();
                Logger.success("Webhook updated.");
            }
            else if (settingAction === 'Set Webhook Interval') {
                const { hours } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'hours',
                        message: 'Enter interval in HOURS for status updates (0 to disable):',
                        default: config.webhookInterval || 0,
                        validate: (val) => !isNaN(parseFloat(val)) || "Please enter a number."
                    }
                ]);
                const h = parseFloat(hours);
                config.webhookInterval = h;
                bot.setWebhookInterval(h);
                saveConfig();
                Logger.success(`Webhook interval set to: ${h} hours.`);
            }
        }
        else if (action === 'Exit') {
            bot.logOff();
            console.log(chalk.gray("Goodbye!"));
            process.exit(0);
        }

        if (action !== 'Exit') {
            await new Promise(r => setTimeout(r, 1500));
        }
    }
}

main();
