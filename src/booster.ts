import SteamUser from 'steam-user';
import { Logger, sendWebhook } from './utils';

export class ZyroBot {
    private client: any;
    private isBoosting: boolean = false;
    private games: number[] = [730]; // Default CS2
    private webhookUrl: string = '';
    private webhookPing: string = '';
    private personaState: number = 1; // Default Online (1)

    constructor() {
        this.client = new SteamUser();

        this.client.on('loggedOn', () => {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            Logger.success('Successfully logged into Steam!');
            Logger.info(`SteamID: ${this.client.steamID}`);
            this.client.setPersona(this.personaState);
            if (this.isBoosting) {
                this.startBoosting(this.games);
            }
        });

        this.client.on('error', (err: any) => {
            Logger.error(`Steam Client Error: ${err.message}`);
            if (this.webhookUrl) {
                sendWebhook(this.webhookUrl, 'Steam Client Error', `Error: ${err.message}`, 0xff0000, undefined, this.webhookPing);
            }
            this.triggerReconnect();
        });

        this.client.on('disconnected', (eresult: any, msg: any) => {
            Logger.warn(`Disconnected from Steam (${eresult}): ${msg}`);
            this.triggerReconnect();
        });

        this.client.on('steamGuard', (domain: any, callback: any) => {
            Logger.warn("Steam Guard Code required! But this bot is running in headless mode mostly.");
            Logger.warn("Please restart and login via the CLI to provide the code interactively if needed.");
        });
    }

    public setWebhook(url: string) {
        this.webhookUrl = url;
    }

    public setWebhookPing(ping: string) {
        this.webhookPing = ping;
    }

    public setGames(games: number[]) {
        this.games = games;
    }

    public async login(accountName: string, password: string, twoFactorCode?: string, authCode?: string): Promise<void> {
        Logger.info(`Attempting to log in as ${accountName}...`);

        try {
            const logOnOptions: any = {
                accountName: accountName,
                password: password
            };
            this.lastLoginArgs = logOnOptions;

            if (twoFactorCode) logOnOptions.twoFactorCode = twoFactorCode;
            if (authCode) logOnOptions.authCode = authCode;

            this.client.logOn(logOnOptions);
        } catch (e: any) {
            Logger.error(`Login exception: ${e.message}`);
        }
    }

    public startBoosting(gameIds: number[]): void {
        this.games = gameIds;
        this.isBoosting = true;
        Logger.info(`Starting boost for games: ${gameIds.join(', ')}`);
        this.client.gamesPlayed(gameIds);

        if (this.webhookUrl) {
            const gameNames = gameIds.map(id => {
                const names: { [key: number]: string } = { 730: 'CS2', 570: 'Dota 2', 440: 'TF2', 252490: 'Rust' };
                return names[id] || `Game ${id}`;
            });

            sendWebhook(
                this.webhookUrl,
                'Booster Started',
                `Successfully started boosting session!`,
                0x00ff88,
                [
                    { name: '🎮 Games', value: gameNames.join(', '), inline: false },
                    { name: '🆔 Game IDs', value: gameIds.join(', '), inline: false },
                    { name: '👁️ Persona State', value: this.personaState === 7 ? 'Invisible' : 'Online', inline: true },
                    { name: '⏰ Started At', value: new Date().toLocaleString(), inline: true }
                ],
                this.webhookPing
            );
        }
        this.restartInterval();
    }

    public stopBoosting(): void {
        this.isBoosting = false;
        this.client.gamesPlayed([]);
        Logger.info('Boosting stopped.');

        if (this.webhookUrl) {
            sendWebhook(
                this.webhookUrl,
                'Booster Stopped',
                'Boosting session has been stopped.',
                0xffaa00,
                [
                    { name: '⏰ Stopped At', value: new Date().toLocaleString(), inline: false }
                ],
                this.webhookPing
            );
        }
        if (this.intervalId) clearInterval(this.intervalId);
    }

    public logOff(): void {
        this.client.logOff();
        Logger.info("Logged off.");
    }

    public setPersonaState(state: number): void {
        this.personaState = state;
        if (this.client.steamID) {
            this.client.setPersona(state);
            Logger.info(`Persona state set to: ${state === 7 ? 'Invisible' : 'Online'}`);
        }
    }

    private intervalId: NodeJS.Timeout | null = null;
    private webhookInterval: number = 0; // 0 = disabled
    private reconnectTimer: NodeJS.Timeout | null = null;
    private lastLoginArgs: any = null;

    public setWebhookInterval(hours: number) {
        this.webhookInterval = hours;
        this.restartInterval();
    }

    private triggerReconnect() {
        if (this.reconnectTimer) return; // Already scheduled

        const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes
        Logger.warn(`Connection lost! Attempting to reconnect in 5 minutes...`);

        if (this.webhookUrl) {
            sendWebhook(this.webhookUrl, 'Connection Lost', 'Steam connection lost. Auto-reconnecting in 5 minutes...', 0xffaa00, undefined, this.webhookPing);
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.lastLoginArgs) {
                Logger.info("Attempting auto-reconnect...");
                this.client.logOn(this.lastLoginArgs);
            } else {
                Logger.error("Cannot auto-reconnect: No stored credentials in memory.");
            }
        }, RETRY_DELAY);
    }

    private restartInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.webhookInterval > 0 && this.isBoosting && this.webhookUrl) {
            Logger.info(`Webhook status updates enabled: Every ${this.webhookInterval} hour(s).`);
            this.intervalId = setInterval(() => {
                if (this.isBoosting && this.webhookUrl) {
                    const gameNames = this.games.map(id => {
                        const names: { [key: number]: string } = { 730: 'CS2', 570: 'Dota 2', 440: 'TF2', 252490: 'Rust' };
                        return names[id] || `Game ${id}`;
                    });

                    sendWebhook(
                        this.webhookUrl,
                        'Status Update',
                        `Boosting session is still active and running smoothly.`,
                        0x00d4ff,
                        [
                            { name: '🎮 Active Games', value: gameNames.join(', '), inline: false },
                            { name: '👁️ Persona State', value: this.personaState === 7 ? 'Invisible' : 'Online', inline: true },
                            { name: '⏰ Update Time', value: new Date().toLocaleString(), inline: true }
                        ],
                        this.webhookPing
                    );
                }
            }, this.webhookInterval * 3600 * 1000);
        }
    }

    // Helper to get raw client if needed (e.g. for steam guard manual handling in CLI)
    public getClient(): any {
        return this.client;
    }
}
