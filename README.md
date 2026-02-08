# 🚀 Zyro-Booster

> **Professional, Open-Source Steam Hour Booster powered by Node.js & TypeScript.**  
> *Secure, Efficient, and Beautiful.*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Steam](https://img.shields.io/badge/Steam-000000?style=for-the-badge&logo=steam&logoColor=white)

---

## ✨ Features

- **🔐 Secure Authentication**: 
  - Uses system keychain (**Windows Credential Manager**, **Keychain**, **libsecret**) for security.
  - Optional `.env` file fallback for headless servers.
- **🎮 Multi-Game Boosting**: 
  - Boost **CS2**, **TF2**, **Dota 2**, **Rust**, and more simultaneously.
- **📡 Discord Webhooks**: 
  - Live Status Updates + Anti-Spam Error Logging.
- **🔄 Auto-Reconnect System**: 
  - Smart 5-minute retry loop ensures 24/7 uptime.
- **🕵️ Visibility Control**: 
  - Toggle between **Online** and **Invisible** mode.
- **⚡ Interactive CLI**: 
  - Beautiful menu with real-time **UPTIME** display.

---

## 🛠️ Installation

### Prerequisites
- **Node.js** (v18 or newer)
- **Operating System**: Windows, Linux, or Android (Termux)

### 🚀 Quick Start (1-Click)

| Platform | Command / Script |
| :--- | :--- |
| **Windows**                | Double-click `run.bat` |
| **Debian / Ubuntu / Kali** | `./install_debian.sh` |
| **Fedora / RHEL / CentOS** | `./install_fedora.sh` |
| **Arch Linux / Manjaro**   | `./install_arch.sh` |
| **Android (Termux)**       | `./install_termux.sh` |

**Manual Installation (Any OS):**
```bash
npm install
npm run build
npm start
```

---

## 🚀 Usage

1.  **Login**: Supports Steam Guard (Email & Mobile). Credentials saved securely.
2.  **Start Boosting**: idling begins. Status header shows `PLAYING: [Games]`.
3.  **Settings**: Configure Game IDs and Discord Webhook.

---

## ⚙️ Configuration
Settings in `config.json`. Passwords are encrypted in your OS keychain.

---

**Disclaimer**: For educational purposes only. Use at your own risk.
