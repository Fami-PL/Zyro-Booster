# 🚀 Zyro-Booster

> **Professional, Open-Source Steam Hour Booster powered by Node.js & TypeScript.**  
> *Secure, Efficient, and Beautiful.*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Steam](https://img.shields.io/badge/Steam-000000?style=for-the-badge&logo=steam&logoColor=white)

---

## ✨ Features

- **🔐 Secure Authentication**: 
  - Uses system keychain (**libsecret**, **Keytar**) for enterprise-grade security.
  - Optional `.env` file fallback for headless servers.
- **🎮 Multi-Game Boosting**: 
  - Boost **CS2**, **TF2**, **Dota 2**, **Rust**, and any other Steam game simultaneously.
  - Automatically recognizes popular App IDs.
- **📡 Discord Webhooks**: 
  - **Live Status Updates**: Get notified about bot status every X hours.
  - **Anti-Spam Error Logging**: Smart deduplication prevents error spam.
- **🔄 Auto-Reconnect System**: 
  - Smart 5-minute retry loop ensures 24/7 uptime even after connection drops.
- **🕵️ Visibility Control**: 
  - Toggle between **Online** and **Invisible** mode while boosting.
- **⚡ Interactive CLI**: 
  - Beautiful, cursor-based menu using `inquirer`.
  - Real-time **UPTIME** display and status header.

---

## 🛠️ Installation

### Prerequisites
- **Node.js** (v18 or newer)
- **Linux** (Debian, Ubuntu, Fedora, Arch, etc.) or **Android (Termux)**

### 1-Click Installers

We provide automated scripts for major platforms:

| Platform | Command |
| :--- | :--- |
| **Debian / Ubuntu / Kali** | `./install_debian.sh` |
| **Fedora / RHEL / CentOS** | `./install_fedora.sh` |
| **Arch Linux / Manjaro**   | `./install_arch.sh` |
| **Android (Termux)**       | `./install_termux.sh` |

**Manual Installation:**
```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Start
./run.sh
```

---

## 🚀 Usage

Run the booster with:
```bash
./run.sh
```

### Main Menu

1.  **Login**  
    Securely log in to Steam. Supports Steam Guard (Email & Mobile App). Credits are saved securely.

2.  **Start Boosting**  
    Begins idling the configured games. The header will update to show `STATUS: [PLAYING: CS2, TF2]`.

3.  **Stop Boosting**  
    Stops the idling process without logging out.

4.  **Go Invisible / Online**  
    Change your community status instantly.

5.  **Settings**  
    - **Edit Games**: Add game App IDs (e.g., `730, 440`).
    - **Set Webhook**: Add your Discord Webhook URL for notifications.
    - **Set Webhook Interval**: Configure how often you want status updates (e.g., every 6 hours).

---

## ⚙️ Configuration

Your settings are stored locally in `config.json`.
Credentials are stored **encrypted** in your system's keychain.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a Pull Request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**Disclaimer**: This tool is for educational purposes. Use at your own risk.
