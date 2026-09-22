English | [中文](README.md)
</p>

<p align="center">
  <a href="README.md">English</a> | [中文](README.md)
</p>
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
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) **highly tailored to personal usage habits**.
> It is **not** an out-of-the-box, universal, beginner-friendly template. If you are not familiar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (`filter`), **copy it with caution**. Be sure to read the instructions below before copying!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> Copying the repository will generate a bilingual repo: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; complete instructions will be saved as `README_full.md` and `README_full_en.md`, generating simplified Chinese `README.md` and simplified English `README_en.md`. Your permanent configuration URL is `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<FileName>`.

   Default remote override script URL (you can copy it directly from the top-right corner of the code block):

Chinese Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

English Comments (may lag behind the Chinese version):

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js
```

   Attach this script to your subscription in Bettbox / FlClash clients:
   - Real nodes in the subscription are automatically populated into `proxies` and various "single node" placeholder policy groups (`👉 Manual Select`, `♻️ Auto Select`, `🔄 Load Balance`, `📲 Telegram`, `🎮 Games-Global`);
   - `proxy-providers` bundled with the subscription are retained as-is;
   - Dynamically merges DNS `proxy-server-nameserver-policy` (script takes precedence; the template does not pre-set this key);
   - You can disable policy groups individually via the `ruleOptionsEnable` toggle at the top of the script, which automatically cleans up related references.
   - `FCM Direct` feature toggle: Enabled by default, hiding the FCM group containing only `DIRECT`; when disabled, only `👉 Manual Select` is retained (the switch only modifies nodes within the FCM group without removing the group itself).
- `TGDC Experiment Split` feature toggle: Disabled by default; when enabled, the script prioritizes routing Telegram traffic via IP rules into three experimental groups: `📲 Telegram-DC1-DC3-Miami`, `📲 Telegram-DC2-DC4-Amsterdam`, and `📲 Telegram-DC5-SG`. Among them, the DC5 group matches both Singapore and Hong Kong nodes, as both locations can serve as interconnect candidates for this DC. The three experimental groups use `include-all-proxies` with name filtering to match US/Miami, Netherlands/Amsterdam, and Singapore/Hong Kong node names, respectively. If an experimental group has no matching nodes, Mihomo falls back to the first suitable node filtered by the script from subscription nodes; this filtering excludes non-proxy types like `DIRECT` and `REJECT`, as well as suspected low/high multiplier, download/free, and marketing info nodes, falling back to `COMPATIBLE` if none are found. When enabled, the original `📲 Telegram` group is renamed to `📲 Telegram(Fallback)`, original Telegram processes, domains, and CIDR rules point uniformly to this group, and experimental DC/regional IP rules are inserted with priority. When disabled, no experimental groups, rule providers, or rules are injected, and the original Telegram configuration remains unchanged.
   - Master switch: when enabled, only the first enabled operator in Telecom > Unicom > Mobile order takes effect.; disabled by default; when enabled, all three entry nodes for China Telecom, China Unicom, and China Mobile are added to the `国内入口解析` proxy group, where users manually select the actual entry node to use, applying the chosen entry for final node-resolution DNS. There is no script-automated priority among the three; their order in the configuration does not represent automatic switching or priority selection. This feature introduces time-sensitive domestic public nodes, which is an experimental capability intended for testing purposes only.
   - The first line of the script is the Bettbox compatibility declaration (`Compatible_With_Bettbox`): Bettbox clients are designed to recognize this declaration at the beginning of the script (rather than reading it fully). The script must follow this convention, and the declaration must remain pinned at the top, otherwise the "Custom Rule Switches" entry will not appear.
The standard template embedded in the script is kept in sync with [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) in the repository (in case of any discrepancy, the JS file prevails).

## Node Domain & DNS Model

[<kbd>Read Online: Node Domains, Hosts & Private DNS Model</kbd>](https://XVSVTsama.github.io/mihomo-config-self/proxy-infrastructure-domain-protection-model.html)

> This document breaks down the distinct roles of `hosts` fake/real mappings, private DoH resolution, DNS policy, and the fake-IP filter, and how all four cooperate within the same node-resolution chain. It is aimed at people who want to write or understand node-resolution override scripts, and contains no real nodes, passwords, UUIDs, or subscription credentials. (This section and its explanation of `dns.use-hosts` effects were written by AI.)

## Recommended Learning References, Subscription Conversion Projects, and Clients
   [Looking for truly educational references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends to completely avoid any public online conversion over the Internet, which will greatly reduce the risk of sensitive node information leakage:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥 Popular 🔥

   Finding the above self-hosting too troublesome? Local conversion is also available 🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  App-based / Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢 Simple and easy to use 🟢 / 🔴 Not a Flclash project subsidiary 🔴

   This configuration must be used on non-modded 🎭 clients running the native mihomo core, otherwise unknown errors may occur. Recommended upstream/downstream GUIs include:
   [Bettbox](https://github.com/appshubcc/Bettbox/releases)

<a id="core-features"></a>

## ✨ Essential Highlights (Why configure it this way?)

This configuration integrates modular remote rule providers and refined application-level traffic splitting policies, custom-built entirely to address my personal network environment and usage pain points:

* **Rule-based TUN**: `tun` mode is enabled by default using the `gvisor` stack, achieving full device/protocol interception and resolving issues where certain software ignores system proxies.
* **Aggressive DNS Resolution Experience**: Adopts `fake-ip` enhanced mode. Built-in smart DNS strategy based on domestic direct connection and mixed DoH/DoT to precisely prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), [reddishJade](https://github.com/reddishJade/private_proxy), etc.), stripping out local rules for automatic and seamless updates.
* **Obsessive-Compulsive Level Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent routing groups with **hardcoded** regular expression filtering to forcefully use only nodes tagged with "USA|Residential" to prevent account bans or security risks.
    * **🎮 Gaming**: Independent UDP proxy pass-through and routing for mainstream gaming platforms.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / Voice / Real-time Communications (3478-3479, 5349-5350, 19302-19309) to prevent bypassing traffic routing policies.
    * **SUB-RULE Process-level Blocking**: Hardcoded deep ad-removal and privacy-tracking blocking rules targeting specific overseas reading applications (such as Tomato Novel Overseas Edition `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>
## 🗂 Proxy Groups
| Policy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmapped default overseas traffic | Optional manual, automatic, or load balancing |
| **🔄 Load Balancing** | Uses the `sticky-sessions` strategy | Ensures the IP for the same domain remains unchanged over short periods |
| **👉 Manual Select** | Manually select a specific node | / |
| **♻️ Auto Select** | `url-test` automatically tests and selects the node with the lowest latency | Tolerance set to 50ms |
| **📲 Telegram** | Routes through proxy by default when TGDC is disabled to prevent disconnections | Matches process names and specific IP ranges; renamed to `📲 Telegram (Fallback)` when TGDC is enabled |
| **📲 Telegram-DC1-DC3-Miami** | When TGDC is enabled, matches United States/Miami nodes | Prioritized matching based on Telegram DC IP rules; falls back to script-selected candidate nodes when no match is found |
| **📲 Telegram-DC2-DC4-Amsterdam** | When TGDC is enabled, matches Netherlands/Amsterdam nodes | Prioritized matching based on Telegram DC IP rules; falls back to script-selected candidate nodes when no match is found |
| **📲 Telegram-DC5-SG** | When TGDC is enabled, matches Singapore/Hong Kong nodes | DC5 experimental candidate group; falls back to script-selected candidate nodes when no match is found |
| **🎮 Games-Global** | International gaming traffic | / |
| **✖️ Twitter** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes with non-matching names will result in an empty policy group!** |
| **🤖 AI Models** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes with non-matching names will result in an empty policy group!** |
| **🎵 TikTok** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes with non-matching names will result in an empty policy group!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: On = `DIRECT` only, Off = `👉 Manual Select` only |

> Note: For 🔄 Load Balancing / 👉 Manual Select / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global, `proxies` is empty in the template (commented as "Here are all single nodes"); enabling the override script will automatically populate all subscription nodes. If not using the script, manual population is required.

<a id="before-use"></a>

## 🛠️ Must-Modify Before Use (Must-Read for Copying)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following operations yourself:
1. **Inject Nodes**: It is recommended to use the override script above directly—real nodes in your subscription will be automatically populated into `proxies` and all placeholder policy groups, and the subscription's own `proxy-providers` will also be retained. If you do not use the script, you need to manually populate the node list or `proxy-providers` into this configuration (where `proxies: ~` is left blank by default).
2. **Modify Node Filter Rules**: If the node names from your provider do not contain `US` or `Residential`, be sure to manually modify the `filter` field of the corresponding policy groups in the configuration file, otherwise your AI, Twitter, and TikTok will not be able to connect to the internet at all.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Universal Disclaimer ⚠️⚠️⚠️


1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository is intended solely for personal cloud backup and configuration reference. **We do not answer basic usage questions, do not accept non-bug-related Issues, and do not guarantee regular maintenance and updates.** If the configuration throws errors on your device, please consult the official Mihomo documentation to troubleshoot.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of circumvention nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country and region. The repository author **shall not be held responsible** for any cybersecurity issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or dissemination of the content in this repository.
4. **Functional Disruption Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) as well as Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images properly, log in, or experience network connectivity issues. In case of network anomalies, please prioritize troubleshooting the `rules` and `fake-ip-filter` in this configuration.
