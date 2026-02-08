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

export async function sendWebhook(url: string, title: string, message: string, color: number = 0x00ff00): Promise<void> {
    if (title === 'Steam Client Error' && message === lastErrorMessage) return;
    if (title === 'Steam Client Error') lastErrorMessage = message;

    if (!url || !url.startsWith('http')) return;

    try {
        await axios.post(url, {
            embeds: [{
                title: title,
                description: message,
                color: color,
                footer: {
                    text: `Zyro-Booster • ${new Date().toISOString()}`
                }
            }]
        });
        // Logger.info('Webhook sent successfully.');
    } catch (error: any) {
        Logger.warn(`Failed to send webhook: ${error.message}`);
    }
}

export function loadEnv(): void {
    const dotenv = require('dotenv');
    dotenv.config();
}
