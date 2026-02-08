import keytar from 'keytar';
import fs from 'fs';
import path from 'path';
import { Logger } from './utils';

const SERVICE_NAME = 'ZyroBoosterSteam';
const ENV_FILE = '.env';
const LAST_USER_FILE = 'last_user.txt';

export class AuthManager {
    private useKeytar: boolean = true;

    constructor() {
        // specific check if keytar is usable could be complex, assume yes for now
        // If keytar fails at runtime, we catch it.
    }

    async saveCredentials(username: string, password: string): Promise<boolean> {
        // Try Keytar
        try {
            await keytar.setPassword(SERVICE_NAME, username, password);
            fs.writeFileSync(LAST_USER_FILE, username);
            Logger.success('Credentials saved securely via Keytar (libsecret).');
            return true;
        } catch (error: any) {
            Logger.warn(`Keytar failed: ${error.message}. Falling back to .env file.`);
        }

        // Fallback to .env
        try {
            const envContent = `STEAM_USERNAME=${username}\nSTEAM_PASSWORD=${password}\n`;
            fs.writeFileSync(ENV_FILE, envContent);
            Logger.warn('Credentials saved to .env file (Plain Text).');
            return true;
        } catch (error: any) {
            Logger.error(`Failed to save credentials: ${error.message}`);
            return false;
        }
    }

    async getCredentials(): Promise<{ user: string | null, pass: string | null }> {
        // Try to get last user
        let username: string | null = null;
        if (fs.existsSync(LAST_USER_FILE)) {
            username = fs.readFileSync(LAST_USER_FILE, 'utf-8').trim();
        }

        if (username) {
            try {
                const password = await keytar.getPassword(SERVICE_NAME, username);
                if (password) {
                    return { user: username, pass: password };
                }
            } catch (error) {
                Logger.error(`Keytar retrieval failed: ${error}`);
            }
        }

        // Fallback to .env
        if (fs.existsSync(ENV_FILE)) {
            const content = fs.readFileSync(ENV_FILE, 'utf-8');
            const lines = content.split('\n');
            let envUser = null;
            let envPass = null;
            for (const line of lines) {
                if (line.startsWith('STEAM_USERNAME=')) envUser = line.split('=')[1].trim();
                if (line.startsWith('STEAM_PASSWORD=')) envPass = line.split('=')[1].trim();
            }
            if (envUser && envPass) {
                return { user: envUser, pass: envPass };
            }
        }

        return { user: null, pass: null };
    }

    async clearCredentials(): Promise<void> {
        let username: string | null = null;
        if (fs.existsSync(LAST_USER_FILE)) {
            username = fs.readFileSync(LAST_USER_FILE, 'utf-8').trim();
        }

        if (username) {
            try {
                await keytar.deletePassword(SERVICE_NAME, username);
                Logger.success('Credentials removed from Keytar.');
            } catch (e) { }
        }

        if (fs.existsSync(ENV_FILE)) {
            fs.unlinkSync(ENV_FILE);
            Logger.success('Credentials removed from .env.');
        }

        if (fs.existsSync(LAST_USER_FILE)) {
            fs.unlinkSync(LAST_USER_FILE);
        }
    }
}
