import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export class Logger {
    private static timestamp(): string {
        return new Date().toLocaleTimeString();
    }

    static info(message: string): void {
        console.log(`${chalk.cyan(`[${this.timestamp()}]`)} ${chalk.green('[INFO]')} ${message}`);
    }

    static warn(message: string): void {
        console.log(`${chalk.cyan(`[${this.timestamp()}]`)} ${chalk.yellow('[WARNING]')} ${message}`);
    }

    static error(message: string): void {
        console.log(`${chalk.cyan(`[${this.timestamp()}]`)} ${chalk.red('[ERROR]')} ${message}`);
    }

    static success(message: string): void {
        console.log(`${chalk.cyan(`[${this.timestamp()}]`)} ${chalk.magenta('[SUCCESS]')} ${message}`);
    }

    static debug(message: string): void {
        // console.log(`${chalk.gray(`[DEBUG] ${message}`)}`);
    }
}

let lastErrorMessage = '';

export async function sendWebhook(
    url: string,
    title: string,
    message: string,
    color: number = 0x00ff00,
    fields?: Array<{ name: string, value: string, inline?: boolean }>,
    ping: string = ''
): Promise<void> {
    if (title === 'Steam Client Error' && message === lastErrorMessage) return;
    if (title === 'Steam Client Error') lastErrorMessage = message;

    if (!url || !url.startsWith('http')) return;

    // Discord Steam Icons
    const STEAM_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png';
    const BOOSTER_ICON = 'https://raw.githubusercontent.com/SteamDatabase/SteamDatabase/master/icons/apple-touch-icon.png';

    // Emoji mapping for different message types
    const emojiMap: { [key: string]: string } = {
        'Booster Started': '🚀',
        'Booster Stopped': '⏹️',
        'Status Update': '📊',
        'Steam Client Error': '❌',
        'Connection Lost': '⚠️',
        'Login Success': '✅'
    };

    const emoji = emojiMap[title] || '📢';

    // Create thumbnail URL based on status
    const thumbnailMap: { [key: string]: string } = {
        'Booster Started': BOOSTER_ICON,
        'Booster Stopped': 'https://cdn-icons-png.flaticon.com/512/5996/5996660.png',
        'Status Update': 'https://cdn-icons-png.flaticon.com/512/3524/3524388.png',
        'Steam Client Error': 'https://cdn-icons-png.flaticon.com/512/753/753345.png',
        'Connection Lost': 'https://cdn-icons-png.flaticon.com/512/4201/4201973.png'
    };

    try {
        const embed: any = {
            author: {
                name: 'Zyro Booster',
                icon_url: STEAM_ICON
            },
            title: `${emoji} ${title}`,
            description: message,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Zyro-Booster • Steam Hour Booster',
                icon_url: STEAM_ICON
            }
        };

        // Add thumbnail if available
        if (thumbnailMap[title]) {
            embed.thumbnail = {
                url: thumbnailMap[title]
            };
        }

        // Add fields if provided
        if (fields && fields.length > 0) {
            embed.fields = fields;
        }

        await axios.post(url, {
            content: ping ? `<@${ping.replace(/[<@&>]/g, '')}>` : '',
            embeds: [embed]
        });
    } catch (error: any) {
        Logger.warn(`Failed to send webhook: ${error.message}`);
    }
}

export function loadEnv(): void {
    const dotenv = require('dotenv');
    dotenv.config();
}
