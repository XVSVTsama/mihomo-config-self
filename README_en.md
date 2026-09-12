English | [中文](README.md)

<p align="center">
  <img src="assets/avatar.png" alt="XVSVTsama" width="120" />
</p>

<h1 align="center">Mihomo (Clash Meta) Configuration Template </h1>

<p align="center">
  <strong>Extreme Personal Tailored Edition</strong> · Routing Configuration · Remote Override Scripts
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/XVSVTsama/mihomo-config-self?style=flat-square&label=License&color=informational" alt="License"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/commits/main"><img src="https://img.shields.io/github/last-commit/XVSVTsama/mihomo-config-self?style=flat-square&label=Last%20Commit&color=informational" alt="Last Commit"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self"><img src="https://img.shields.io/github/repo-size/XVSVTsama/mihomo-config-self?style=flat-square&label=Repo%20Size&color=informational" alt="Repo Size"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/stargazers"><img src="https://img.shields.io/github/stars/XVSVTsama/mihomo-config-self?style=flat-square&label=Stars&color=informational" alt="Stars"></a>
  <a href="https://github.com/XVSVTsama"><img src="https://img.shields.io/badge/XVSVTsama-Homepage-informational?style=flat-square" alt="Homepage"></a>
</p>

<p align="center">
  <a href="https://github.com/MetaCubeX/mihomo"><img src="https://img.shields.io/badge/Mihomo-Rule--based_Tunnel-000000?style=flat-square" alt="Mihomo"></a>
  <a href="https://github.com/MetaCubeX/mihomo"><img src="https://img.shields.io/badge/Mihomo_Core-Client_or_Server-000000?style=flat-square" alt="Mihomo Core"></a>
  <a href="https://github.com/appshubcc/Bettbox"><img src="https://img.shields.io/badge/Bettbox-Client/GUI-000000?style=flat-square" alt="Bettbox"></a>
  <a href="https://github.com/chen08209/FlClash"><img src="https://img.shields.io/badge/FlClash-Client/GUI-000000?style=flat-square" alt="FlClash"></a>
</p>

<p align="center">
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
  English | [中文](README.md)
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) that is **highly tailored to personal usage habits**.
> It is **not** an out-of-the-box, universal plug-and-play template. If you are not familiar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (`filter`), **proceed with caution**. Be sure to read the instructions below before copying!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After duplicating the repository, a bilingual repository will be generated: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; complete explanations will be saved as `README_full.md` and `README_full_en.md`, generating a simplified Chinese `README.md` and a simplified English `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<Filename>`.

   Default remote override script address (click the top right of the code block to copy):

Chinese Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

English Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js
```

   Attach this script to your subscription in Bettbox / FlClash clients:
   - Real nodes from the subscription are automatically populated into `proxies` and various "single-node" placeholder policy groups (`👉 手动切换`, `♻️ 自动选择`, `🔄 负载均衡`, `📲 Telegram`, `🎮 Games-Global`);
   - The `proxy-providers` bundled with the subscription are preserved as-is;
   - Dynamically merges `proxy-server-nameserver-policy` for DNS (managed by the script; the template does not pre-configure this key);
   - Policy groups can be individually disabled via the `ruleOptionsEnable` toggle at the top of the script, with related references automatically cleaned up.
   - `FCM Direct` feature toggle: Enabled by default, hiding the FCM group which contains only `DIRECT`. When disabled, only `👉 手动切换` is retained (the toggle only modifies nodes within the FCM group without removing the group itself).
   - `TGDC Experiment Split` feature toggle: Disabled by default. When enabled, the script routes Telegram traffic by IP rules, with priority given to `📲 Telegram-DC1-DC3-Miami`, `📲 Telegram-DC2-DC4-Amsterdam`, and `📲 Telegram-DC5-SG`. The DC5 group matches both Singapore and Hong Kong nodes because both are treated as interconnection candidates for that DC. The three experimental groups use `include-all-proxies` together with name filters for the United States/Miami, the Netherlands/Amsterdam, and Singapore/Hong Kong, respectively. If a group has no matching node, Mihomo falls back to the first suitable subscription node selected by the script; the selector excludes non-proxy types such as `DIRECT` and `REJECT`, along with names that appear to indicate low/high multipliers, downloads/free access, or promotional information, and falls back to `COMPATIBLE` if none is available. Once enabled, the original `📲 Telegram` group is renamed `📲 Telegram(兜底)`; the original Telegram process, domain, and CIDR rules are redirected to that fallback group, while the experimental DC/region IP rules are inserted ahead of them. When disabled, no experimental groups, providers, or rules are injected, and the original Telegram configuration remains unchanged.
   - `Master switch` feature toggle: Disabled by default; when enabled, you can choose among Telecom, Unicom, and Mobile with priority Telecom > Unicom > Mobile, taking only the first enabled option. It adds the corresponding domestic entry node for final node DNS resolution, while displaying the currently selected node in the `国内入口解析` display group. This feature introduces time-sensitive domestic public nodes, is experimental, and is provided for testing purposes only.
- The first line of the script is the Bettbox compatibility declaration (`Compatible_With_Bettbox`): the Bettbox client expects to recognize this declaration at the very beginning of the script (rather than reading the entire script). The script must adhere to this convention, and the declaration must remain at the top, otherwise the "Custom Rule Switches" entry will not be displayed.
The standard template embedded in the script stays in sync with the repository [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml).

## Node Domain & DNS Model

[<kbd>Read Online: Node Domains, Hosts & Private DNS Model</kbd>](https://XVSVTsama.github.io/mihomo-config-self/proxy-infrastructure-domain-protection-model.html)

> This document breaks down the distinct roles of `hosts` fake/real mappings, private DoH resolution, DNS policy, and the fake-IP filter, and how all four cooperate within the same node-resolution chain. It is aimed at people who want to write or understand node-resolution override scripts, and contains no real nodes, passwords, UUIDs, or subscription credentials. (This section and its description of the `dns.use-hosts` effect were written by AI.)

## Recommended Learning References, Subscription Conversion Projects & Clients
   [Looking for truly learnable references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends, and avoid any public online converters on the internet to significantly reduce the risk of sensitive node information leakage:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥 Popular 🔥

   Finding the above setup too cumbersome? Local conversion is also available 🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  Containerized/Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢 Simple and easy to use 🟢 / 🔴 Non-Flclash project
Subordinate 🔴

   This configuration must be used with clients running the native `mihomo` kernel without unofficial modifications 🎭, otherwise unknown errors may occur. Recommended downstream GUIs include:
   [Bettbox](https://github.com/appshubcc/Bettbox/releases)

<a id="core-features"></a>

## ✨ Essential Highlights (Why this setup?)

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-level traffic splitting strategies, custom-built entirely to address my personal network environment and usage pain points:

* **Rule-based TUN**: `tun` mode is enabled by default using the `gvisor` stack, achieving full device/protocol takeover and resolving issues where certain software ignores system proxies.
* **Aggressive DNS Resolution Experience**: Adopts `fake-ip` enhanced mode. Features a built-in intelligent DNS strategy combining domestic direct connection and hybrid DoH/DoT to precisely prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), [reddishJade](https://github.com/reddishJade/private_proxy), etc.), stripping out local rules to achieve automatic, seamless updates.
* **Obsessive-Compulsive Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Dedicated traffic splitting groups with **hardcoded** regular expression filtering to forcefully use only nodes labeled "USA|Residential" to prevent account bans or security flags.
    * **🎮 Gaming**: Dedicated UDP proxy passthrough and routing for mainstream gaming platforms.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / voice / real-time communication (3478-3479, 5349-5350, 19302-19309) to prevent bypassing traffic splitting strategies.
    * **SUB-RULE Process-level Blocking**: Hardcoded deep ad-blocking and privacy-tracking blocking rules targeting specific overseas reading applications (such as Tomato Novel Overseas Version `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>
## 🗂 Proxy Groups
| Policy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched default overseas traffic | Optional manual, automatic, or load balancing |
| **🔄 Load Balance** | Uses `sticky-sessions` policy | Ensures the IP for the same domain remains unchanged in a short time |
| **👉 Manual Select** | Manually select a specific node | / |
| **♻️ Auto Select** | `url-test` automatically tests and selects the node with the lowest latency | Tolerance set to 50ms |
| **📲 Telegram** | Routes through proxy by default when TGDC is disabled | Matches process names and specific IP ranges; renamed to `📲 Telegram(兜底)` when TGDC is enabled |
| **📲 Telegram-DC1-DC3-Miami** | When TGDC is enabled, matches United States/Miami nodes | Takes priority for Telegram DC IP rules; falls back to the script-selected candidate when empty |
| **📲 Telegram-DC2-DC4-Amsterdam** | When TGDC is enabled, matches Netherlands/Amsterdam nodes | Takes priority for Telegram DC IP rules; falls back to the script-selected candidate when empty |
| **📲 Telegram-DC5-SG** | When TGDC is enabled, matches Singapore/Hong Kong nodes | Experimental DC5 candidate group; falls back to the script-selected candidate when empty |
| **🎮 Games-Global** | International gaming traffic | / |
| **✖️ Twitter** | Only matches nodes containing **"US|Residential"** in their names | 🚨 **Mismatched node naming will result in an empty policy group!** |
| **🤖 AI Models** | Only matches nodes containing **"US|Residential"** in their names | 🚨 **Mismatched node naming will result in an empty policy group!** |
| **🎵 TikTok** | Only matches nodes containing **"US|Residential"** in their names | 🚨 **Mismatched node naming will result in an empty policy group!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: On = `DIRECT` only, Off = `👉 Manual Select` only |

> Note: In the template, `proxies` is empty for 🔄 Load Balance / 👉 Manual Select / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global (with the comment "Here are all single nodes"). Once the override script is enabled, all subscription nodes will be automatically populated here; manual population is required if you do not use the script.

<a id="before-use"></a>

## 🛠️ Mandatory Changes Before Use (Must Read for Copiers)

Since this is a personal configuration, `proxies: ~` is left blank. You must complete the following actions yourself:
1. **Inject Nodes**: It is recommended to use the override script above—real nodes from your subscription will be automatically populated into `proxies` and all placeholder policy groups, and the `proxy-providers` bundled with your subscription will also be preserved. If you do not use the script, you need to manually fill the node list or `proxy-providers` into this configuration (where `proxies: ~` is left empty by default).
2. **Modify Node Filter Rules (Filter)**: If your airport nodes do not contain the words `US` or `Residential` in their names, make sure to manually modify the `filter` field of the corresponding policy groups in the configuration, otherwise your AI, Twitter, and TikTok will completely fail to connect to the internet.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to remove the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Universal Disclaimer ⚠️⚠️⚠️


1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository is intended solely for personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug issues will not be accepted, and regular maintenance and updates are not guaranteed.** If the configuration throws errors on your device, please refer to the official Mihomo documentation to troubleshoot on your own.
2. **No Network Services Provided**: This configuration is strictly for local routing rule distribution and **does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions whatsoever.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country or region. The **repository author shall not be held liable** for any cybersecurity issues, privacy leaks, data loss, or legal disputes arising from the use, modification, or dissemination of the contents of this repository.
4. **Feature Disruption Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) as well as Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images properly, log in, or experience network connectivity issues. In case of network anomalies, please check the `rules` and `fake-ip-filter` in this configuration first.
