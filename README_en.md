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
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) **closely tailored to personal usage habits**.
> It is **not** an out-of-the-box, universal, plug-and-play template. If you are not familiar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (filters), please **proceed with caution**. Be sure to read the instructions below before copying!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> Copying the repository will generate a bilingual repository: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; complete documentation will be saved as `README_full.md` and `README_full_en.md`, generating simplified Chinese `README.md` and simplified English `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<YourUsername>/<YourRepoName>/main/<Filename>`.

   Default remote override script URLs (click the copy button in the top right corner of the code block):

Chinese comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

English comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js
```

   Attach the script to your subscription in Bettbox / FlClash clients:
   - Real nodes from the subscription are automatically populated into `proxies` and various "single node" placeholder policy groups (👉 Manual Select, ♻️ URL Test, 🔄 Load Balance, 📲 Telegram, 🎮 Games-Global);
   - The subscription's built-in `proxy-providers` are preserved as-is;
   - Dynamically merges DNS `proxy-server-nameserver-policy` (controlled by the script; the template does not pre-populate this key);
   - You can disable individual policy groups using the `ruleOptionsEnable` switches at the top of the script, which automatically cleans up related references.
   - `FCM Direct` feature toggle: Enabled by default, hiding the FCM group which only contains `DIRECT`; when disabled, only `👉 Manual Select` is retained (the switch only modifies nodes within the FCM group without removing the group itself).
- `TGDC Experiment Split` feature toggle: Disabled by default; when enabled, the script prioritizes Telegram traffic routing via IP rules into three experimental groups: `📲 Telegram-DC1-DC3-Miami`, `📲 Telegram-DC2-DC4-Amsterdam`, and `📲 Telegram-DC5-SG`. The DC5 group matches both Singapore and Hong Kong nodes, as both locations can serve as interconnection candidates for this DC. The three experimental groups use `include-all-proxies` with name filtering to match node names in the US/Miami, Netherlands/Amsterdam, and Singapore/Hong Kong respectively. If an experimental group has no matching nodes, Mihomo falls back to the first suitable node filtered by the script from the subscription nodes. This filtering excludes non-proxy types like `DIRECT` and `REJECT`, as well as suspected low-multiplier, high-multiplier, download/free, and promotional nodes, falling back to `COMPATIBLE` if none are found. When enabled, the original `📲 Telegram` group is renamed to `📲 Telegram(Fallback)`, original Telegram processes, domains, and CIDR rules are uniformly directed to this group, and experimental DC/regional IP rules are inserted with higher priority. When disabled, no experimental groups, rule providers, or rules are injected, and the original Telegram configuration remains unchanged.
   - Master switch: when enabled, only the first enabled operator in Telecom > Unicom > Mobile order takes effect.; disabled by default; when enabled, all three entry nodes—China Telecom, China Unicom, and China Mobile—are added to the `国内入口解析` proxy group, where users can manually select the entry node to use, and apply the selected entry to the final node resolution DNS. There is no automatic script-based priority among the three; their order in the configuration does not imply automatic switching or priority selection. This feature introduces domestic public nodes with time-sensitive validity, which is an experimental capability intended for testing purposes only.
   - The first line of the script is the Bettbox compatibility declaration (`Compatible_With_Bettbox`): the Bettbox client expects to recognize this declaration at the beginning of the script (rather than reading the entire file). The script must follow this convention, and the declaration must remain at the top, otherwise the "Custom Rule Switch" entry will not be displayed.
The standard template embedded in the script is synchronized with the repository [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) (if discrepancies arise, the JS takes precedence).

## Node Domain & DNS Linkage Model

[<kbd>Read Online: Node Domains, Hosts & Private DNS Linkage Model</kbd>](https://XVSVTsama.github.io/mihomo-config-self/proxy-infrastructure-domain-protection-model.html)

> This document breaks down the respective responsibilities of fake/real `hosts` mappings, private DoH resolution, DNS policy, and the fake-IP filter in the configuration, as well as how the four cooperate within the same node resolution chain. It is aimed at those who want to write or understand node resolution override scripts and contains no real nodes, passwords, UUIDs, or subscription credentials. (This section, along with its description of the effects of `dns.use-hosts`, was written by AI.)

## Recommended Learning References, Subscription Conversion Projects, and Clients
   [Looking for truly learnable references?](https://t.me/xvsvts/152)

   It is strongly recommended to use a private subscription conversion backend and frontend to eliminate any public online internet converters, which will greatly reduce the leakage of sensitive node information:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥 Popular 🔥

   Is setting up the above conversions too troublesome? There is also local conversion 🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  Appified / Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢 Simple and easy to use 🟢 / 🔴 Non-Flclash project affiliate 🔴

   This configuration must be used on non-modified 🎭 clients with the native mihomo kernel; otherwise, unknown errors may occur. Recommended options include excellent downstream GUIs like [Bettbox](https://github.com/appshubcc/Bettbox/releases).

<a id="core-features"></a>

## ✨ Essential Highlights (Why Configure It This Way?)

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-level traffic splitting strategies, entirely born to meet my personal network environment and pain points:

* **Rule-based TUN**: Enables `tun` mode by default using the `gvisor` stack, achieving full device/protocol takeover and resolving issues where certain software ignores system proxies.
* **Aggressive DNS Resolution Experience**: Adopts the `fake-ip` enhanced mode. Built-in intelligent DNS policy based on domestic direct connection and mixed DoH/DoT to precisely prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), [reddishJade](https://github.com/reddishJade/private_proxy), etc.), stripping away local rules for automatic, seamless updates.
* **OCD-Level Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent traffic splitting groups with **hardcoded** regular expression filtering, forcing the exclusive use of nodes marked with "United States|Residential" to prevent account bans or risk controls.
    * **🎮 Gaming**: Independent UDP proxy pass-through and mainstream gaming platform routing.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / voice / real-time communication (3478-3479, 5349-5350, 19302-19309) to prevent them from bypassing traffic splitting strategies.
    * **SUB-RULE Process-Level Blocking**: Hardcoded deep ad-blocking and privacy tracking blocking rules targeted at specific overseas reading applications (such as Tomato Novel Overseas Edition `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>
## 🗂 Proxy Groups
| Proxy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched default overseas traffic | Optional manual, automatic, or load balancing |
| **🔄 Load Balance** | Uses `sticky-sessions` strategy | Ensures the IP remains unchanged for the same domain in a short period |
| **👉 Manual Select** | Manually select a specific node | / |
| **♻️ Auto Select** | `url-test` automatically tests and selects the node with the lowest latency | Tolerance set to 50ms |
| **📲 Telegram** | Routes through proxy by default when TGDC is disabled | Matches process names and specific IP ranges; renamed to `📲 Telegram(Fallback)` when TGDC is enabled |
| **📲 Telegram-DC1-DC3-Miami** | When TGDC is enabled, matches United States/Miami nodes | Matches first by Telegram DC IP rules; falls back to script-selected candidate nodes when no nodes match |
| **📲 Telegram-DC2-DC4-Amsterdam** | When TGDC is enabled, matches Netherlands/Amsterdam nodes | Matches first by Telegram DC IP rules; falls back to script-selected candidate nodes when no nodes match |
| **📲 Telegram-DC5-SG** | When TGDC is enabled, matches Singapore/Hong Kong nodes | DC5 experimental candidate group; falls back to script-selected candidate nodes when no nodes match |
| **🎮 Games-Global** | International gaming traffic | / |
| **✖️ Twitter** | Only matches nodes whose names contain **"US|Residential"** | 🚨 **Nodes with non-matching names will cause this proxy group to be empty!** |
| **🤖 AI Models** | Only matches nodes whose names contain **"US|Residential"** | 🚨 **Nodes with non-matching names will cause this proxy group to be empty!** |
| **🎵 TikTok** | Only matches nodes whose names contain **"US|Residential"** | 🚨 **Nodes with non-matching names will cause this proxy group to be empty!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: on = `DIRECT` only, off = `👉 Manual Select` only |

> Note: 🔄 Load Balance / 👉 Manual Select / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global have empty `proxies` in the template (commented as "Here are all single nodes"). When the override script is enabled, all subscription nodes will be automatically populated here; if not using the script, you must manually populate them.

<a id="before-use"></a>

## 🛠️ Must-Modify Before Use (Must-Read for Copying Setup)

Since this is a personal tailored configuration, `proxies: ~` is empty. You must complete the following steps yourself:
1. **Inject Nodes**: It is recommended to use the override script above directly—real nodes in your subscription will be automatically populated into `proxies` and placeholder proxy groups, and the `proxy-providers` that come with the subscription will also be preserved. If you do not use the script, you need to manually fill in the node list or `proxy-providers` into this configuration (`proxies: ~` defaults to empty).
2. **Modify Node Filters**: If the airport node names you purchased do not contain `US` or `Residential`, be sure to manually modify the `filter` field of the corresponding proxy groups in the configuration file, otherwise your AI, Twitter, and TikTok will not be able to connect to the internet at all.
3. **Prune Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️  Cosmic Disclaimer  ⚠️⚠️⚠️


1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository is solely for personal cloud backup and configuration reference. **We do not answer basic usage questions, do not accept non-bug-related Issues, and do not guarantee regular maintenance and updates.** If the configuration throws errors on your device, please consult the official Mihomo documentation to troubleshoot on your own.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must bear all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country and region. **The repository author is not responsible** for any cybersecurity issues, privacy leaks, data loss, or legal disputes caused by using, modifying, or distributing the contents of this repository.
4. **Functional Disruption Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) and Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images properly, log in, or produce network connectivity issues. In case of network anomalies, please prioritize troubleshooting the `rules` and `fake-ip-filter` in this configuration.
