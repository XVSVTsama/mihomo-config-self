English | [中文](README.md)
</p>

<p align="center">
  <a href="#essential-highlights">Essential Highlights</a> &nbsp;&middot;&nbsp;
  <a href="#core-architecture">Core Architecture</a> &nbsp;&middot;&nbsp;
  <a href="#dns--routing-design">DNS & Routing Design</a> &nbsp;&middot;&nbsp;
  <a href="#features--script-capabilities">Features & Script Capabilities</a> &nbsp;&middot;&nbsp;
  <a href="#usage-guide">Usage Guide</a> &nbsp;&middot;&nbsp;
  <a href="#changelog">Changelog</a>
</p>

---

This repository stores a personal high-customization **Mihomo (Clash Meta) Configuration Template** and its corresponding **Remote Override Script**. It is designed with clean syntax, modularity, and high performance in mind, targeting complex multi-scene tunneling, extreme performance optimization, precision traffic classification, and seamless automated updates.

> **💡 Note**: This project is built as an Extreme Personal Tailored Edition. It integrates deeply with specific client environments and operational habits. It is open-source for reference and learning purposes; if you plan to adapt it for your own use, adjust the pathing, rule paths, and script logic to fit your specific setup.
  <a href="mihomo.yaml"><img src="https://img.shields.io/badge/YAML-%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6-yellow?style=flat-square&logo=yaml&logoColor=white" alt="YAML"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/yaml-syntax.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/yaml-syntax.yml?style=flat-square&label=YAML%20Syntax&color=informational" alt="YAML Syntax"></a>
  <a href="script_override.js"><img src="https://img.shields.io/badge/JavaScript-%E8%A6%86%E5%86%99%E8%84%9A%E6%9C%AC-yellow?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/js-syntax.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/js-syntax.yml?style=flat-square&label=JS%20Syntax&color=informational" alt="JavaScript Syntax"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/template-sync.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/template-sync.yml?style=flat-square&label=Template%20Sync&color=informational" alt="Template Sync"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/mihomo-check.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/mihomo-check.yml?style=flat-square&label=Mihomo%20Real%20Core&color=informational" alt="Mihomo Real Core"></a>
</p>
<p align="center">
  <a href="#remote-override">Remote Override JS</a> ·
  <a href="#core-features">Essential Highlights</a> ·
  <a href="#proxy-groups">Proxy Group Structure</a> ·
  <a href="#before-use">Must-Modify Before Use</a>
</p>

<p align="center">
  English | <a href="README.md">[中文](README.md)</a>
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) **closely tailored to personal usage habits**.
> It is **not** an out-of-the-box, universal plug-and-play template. If you are not familiar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (filter), please **exercise caution before copying**. Be sure to read the instructions below before copying this setup!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After cloning the repository, a bilingual repository will be generated: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; complete documentation will be saved as `README_full.md` and `README_full_en.md`, alongside simplified Chinese `README.md` and simplified English `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<FileName>`.

   Default remote override script URLs (click the top-right of the code block to copy):

Chinese Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

English Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js
```

   Attach this script to your subscription in Bettbox / FlClash clients:
   - Real nodes from the subscription are automatically populated into `proxies` and various "single node" placeholder policy groups (`👉 Manual Select`, `♻️ Auto Select`, `🔄 Load Balance`, `📲 Telegram`, `🎮 Games-Global`);
   - The subscription's built-in `proxy-providers` are preserved as-is;
   - Dynamically merge DNS `proxy-server-nameserver-policy` (based on the script; the template does not pre-configure this key);
   - Policy groups can be individually disabled via the `ruleOptionsEnable` toggle at the top of the script, with related references cleaned up automatically.
   - `FCM Direct` feature toggle: Enabled by default; the hidden FCM group contains only `DIRECT`. When disabled, only `👉 Manual Select` is retained (the toggle only modifies nodes within the FCM group without removing the group itself).
   - `TGDC Experiment Split` feature toggle: Disabled by default; when enabled, Telegram is split into DC1/DC3-Miami, DC2/DC4-Amsterdam, and DC5-Singapore groups with corresponding rules inserted, while the original `📲 Telegram` group acts as fallback. When disabled, the original Telegram rules, policy groups, and rule providers remain unchanged.
   - Master switch: when enabled, only the first enabled operator in Telecom > Unicom > Mobile order takes effect. When enabled, you can choose among China Telecom, China Unicom, and China Mobile, with priority set to Telecom > Unicom > Mobile. Only the first enabled option is taken, and corresponding domestic entry nodes are added for final node DNS resolution. This feature introduces time-sensitive domestic public nodes, representing an experimental capability provided for testing purposes only.
   - The first line of the script is the Bettbox compatibility declaration (`Compatible_With_Bettbox`): Bettbox clients are designed to recognize this declaration at the start of the script (rather than reading it fully); the script must adhere to this convention and the declaration must remain at the very top, otherwise the "custom rule switch" entry will not appear.
The standard template embedded in the script is kept in sync with the repository [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml).
## Recommended Learning References, Subscription Conversion Projects, and Clients
   [Looking for truly educational references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends to completely avoid any public online conversion over the internet, which will greatly reduce the leakage of sensitive node information:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥 Popular 🔥

   Is self-hosting the above conversions too cumbersome? Local conversion is also available 🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  App-based / Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢 Simple and easy to use 🟢 / 🔴 Non-Flclash project
Sub-attached 🔴

   This configuration must be used on non-modified 🎭 clients with the native mihomo core; otherwise, unknown errors may occur. Excellent downstream GUIs like [Bettbox](https://github.com/appshubcc/Bettbox/releases) are recommended.

<a id="core-features"></a>

## ✨ Essential Highlights

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-level traffic splitting strategies, born entirely to address my personal network environment and usage pain points:

* **Rule-based TUN**: Enabled by default with the `tun` mode using the `gvisor` stack, achieving full-device/full-protocol takeover and resolving issues where certain software ignores system proxies.
* **Aggressive DNS Resolution Experience**: Adopts the `fake-ip` enhanced mode. Built-in smart DNS strategies based on domestic direct connection and a mixture of DoH/DoT to precisely prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), and [reddishJade](https://github.com/reddishJade/private_proxy)), stripping away local rules for automatic and seamless updates.
* **OCD-Level Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent splitting groups with **hardcoded** regular expression filtering, forcing the use of nodes containing "US|Residential" to prevent account bans or risk controls.
    * **🎮 Gaming**: Independent UDP proxy forwarding and routing for mainstream gaming platforms.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / Voice / Real-time communications (3478-3479, 5349-5350, 19302-19309) to prevent bypassing traffic splitting policies.
    * **SUB-RULE Process-Level Blocking**: Hardcoded deep ad-blocking and privacy tracking blocking rules targeting specific overseas reading apps (such as Tomato Novel Overseas Version `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>

## 🗂 Proxy Groups

| Policy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched default overseas traffic | Optional manual, automatic, or load balancing |
| **🔄 Load Balance** | Adopts `sticky-sessions` strategy | Ensures the IP for the same domain remains unchanged in the short term |
| **👉 Manual Select** | Manually select specific nodes | / |
| **♻️ Auto Select** | `url-test` automatically tests and selects nodes with the lowest latency | Tolerance set to 50ms |
| **📲 Telegram** | Routes through proxy by default to prevent disconnection | Matches process names and specific IP ranges |
| **🎮 Games-Global** | International server gaming traffic | / |
| **✖️ Twitter** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Non-matching node names will cause this policy group to be empty!** |
| **🤖 AI大模型** | Matches only nodes whose names contain **"US|Residential"** | 🚨 **Mismatched node naming will result in an empty policy group!** |
| **🎵 TikTok** | Matches only nodes whose names contain **"US|Residential"** | 🚨 **Mismatched node naming will result in an empty policy group!** |
| **FCM** | Google FCM related domains (`hidden` hidden group) | Controlled by the `FCM Direct` switch: On = `DIRECT` only, Off = `👉 Manual Select` only |
> Note: 🔄 Load Balance / 👉 Manual Select / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global have empty `proxies` in the template (commented "Here are all single nodes"); enabling the override script will automatically populate them with all subscription nodes. If not using the script, manual filling is required.

<a id="before-use"></a>

## 🛠️ Mandatory Changes Before Use (Must-Read for Copycats)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following operations yourself:
1. **Inject Nodes**: It is recommended to directly use the override script above—real nodes from your subscription will be automatically populated into `proxies` and placeholder policy groups, and the `proxy-providers` included in your subscription will also be retained. If you do not use the script, you need to manually fill the node list or `proxy-providers` into this configuration (where `proxies: ~` is left blank by default).
2. **Modify Node Filter**: If your airport node names do not contain words like `US` or `Residential`, be sure to manually modify the `filter` field of the corresponding policy groups in the configuration, otherwise your AI, Twitter, and TikTok will completely fail to connect to the network.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Cosmic Disclaimer ⚠️⚠️⚠️


1. **Purely Personal Tweak, No Technical Support Provided**: The code in this repository serves only as a personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug Issues will not be accepted, and regular maintenance and updates are not guaranteed.** If the configuration throws errors on your device, please refer to the official Mihomo documentation to troubleshoot on your own.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country and region. The repository author **shall not be held responsible** for any cybersecurity issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or dissemination of the contents of this repository.
4. **Feature Breakage Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) and Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images properly, log in, or experience network connectivity issues. In case of network abnormalities, please prioritize troubleshooting the `rules` and `fake-ip-filter` in this configuration.
