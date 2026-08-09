<p align="center">
  <img src="assets/avatar.png" alt="XVSVTsama" width="120" />
</p>

<h1 align="center">Mihomo (Clash Meta) Configuration Template </h1>

<p align="center">
  <strong>Extreme Personal Tailored Edition</strong> · Routing Configuration · Remote Override Script
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
  <a href="mihomo.yaml"><img src="https://img.shields.io/badge/YAML-Configuration_File-yellow?style=flat-square&logo=yaml&logoColor=white" alt="YAML"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/yaml-syntax.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/yaml-syntax.yml?style=flat-square&label=YAML%20Syntax&color=informational" alt="YAML Syntax"></a>
  <a href="script_override.js"><img src="https://img.shields.io/badge/JavaScript-Override_Script-yellow?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/js-syntax.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/js-syntax.yml?style=flat-square&label=JS%20Syntax&color=informational" alt="JavaScript Syntax"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/template-sync.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/template-sync.yml?style=flat-square&label=Template%20Sync&color=informational" alt="Template Sync"></a>
  <a href="https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/mihomo-check.yml"><img src="https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/mihomo-check.yml?style=flat-square&label=Mihomo%20Real%20Core&color=informational" alt="Mihomo Real Core"></a>
</p>

<p align="center">
  <a href="#remote-override">Remote Override JS</a> ·
  <a href="#core-features">Essential Highlights</a> ·
  <a href="#proxy-groups">Proxy Group Structure</a> ·
  <a href="#before-use">Must-Read Before Use</a>
</p>

<p align="center">
  English | [中文](README.md)
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) **closely tailored to personal usage habits**.
> It is **not** an out-of-the-box, universal template for beginners. If you are unfamiliar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (filters), please **proceed with caution**. Be sure to read the instructions below before copying!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> Copying the repository will automatically clean up: `mihomo.yaml` and `script_override.js` will be retained, comprehensive instructions will be copied as `README_full.md`, and a source-annotated `README.md` will be generated with a button to view the full instructions. Your permanent configuration link is `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<Filename>`.

   Default remote override script address (click the top-right corner of the code block to copy directly):

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

   Attach this script to your subscription in Bettbox / FlClash family clients:
   - Real nodes in the subscription are automatically populated into `proxies` and various "single-node" placeholder policy groups (`👉 手动切换`, `♻️ 自动选择`, `🔄 负载均衡`, `📲 Telegram`, `🎮 Games-Global`);
   - `proxy-providers` bundled with the subscription will be preserved as-is;
   - Dynamically merges DNS `proxy-server-nameserver-policy` (based on the script; the template does not pre-set this key);
   - Policy groups can be individually disabled via the `ruleOptionsEnable` switch at the top of the script, with related references automatically cleaned up.
   - `FCM Direct` feature switch: Enabled by default, hiding the FCM group to contain only `DIRECT`. When disabled, only `👉 手动切换` is retained (the switch only modifies nodes within the FCM group without removing the group itself).
   - The first line of the script contains the Bettbox compatibility declaration (`Compatible_With_Bettbox`): Bettbox clients are designed to recognize this declaration at the beginning of the script (rather than reading it fully). The script must comply with this convention, and the declaration must remain at the top, otherwise the "Custom Rules Switch" entry will not appear.

   The standard template embedded within the script stays synchronized with the repository's [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml).

## Recommended Study References, Subscription Conversion Projects, and Clients
   [Looking for truly educational references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends, and avoid any public online conversion on the internet, which will greatly reduce the risk of sensitive node information leakage:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥 Popular 🔥

   Finding the above conversion setup too troublesome? There is also local conversion 🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  Appified / Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢 Simple and easy to use 🟢 / 🔴 Not a Flclash project (Affiliated 🔴)

   This configuration must be used on non-modified clients based on the native mihomo core 🎭, otherwise unknown errors may occur. Excellent downstream GUIs like [Bettbox](https://github.com/appshubcc/Bettbox/releases) are recommended.

<a id="core-features"></a>

## ✨ Essential Highlights (Why Configure It This Way?)

This configuration integrates modular remote rule providers and fine-grained application-level traffic splitting strategies, born entirely to meet my personal network environment and usage pain points:

* **Rule-based TUN**: Enables `tun` mode by default, using the `gvisor` stack to achieve full-device/full-protocol takeover, solving the issue of certain software bypassing system proxies.
* **Aggressive DNS Resolution Experience**: Employs enhanced `fake-ip` mode. Built-in smart DNS strategies based on domestic direct connection and DoH/DoT hybrids accurately prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), and [reddishJade](https://github.com/reddishJade/private_proxy)), stripping away local rules for automatic, seamless updates.
* **OCD-Level Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent splitting groups with **hardcoded** regular expression filtering, strictly forcing the use of nodes marked with "美国|住宅" (US | Residential) to prevent account bans or risk control triggers.
    * **🎮 Games**: Independent UDP proxy bypass and routing for mainstream gaming platforms.
* **Advanced Ad/Privacy Blocking**:
    * Blocks UDP ports commonly used by WebRTC / voice / real-time communication (3478-3479, 5349-5350, 19302-19309) to prevent bypassing splitting policies.
    * **SUB-RULE Process-Level Blocking**: Hardcoded deep anti-ad and privacy tracking blocking rules targeting specific overseas reading apps (such as the overseas version of Fanqie Novel `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>

## 🗂 Proxy Group Structure

| Policy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched default overseas traffic | Manual, automatic, or load balancing optional |
| **🔄 负载均衡 (Load Balancing)** | Adopts `sticky-sessions` strategy | Ensures the IP remains unchanged for the same domain in a short period |
| **👉 手动切换 (Manual Switch)** | Manually select specific nodes | / |
| **♻️ 自动选择 (Auto Select)** | `url-test` automatically tests and selects the lowest latency node | Tolerance set to 50ms |
| **📲 Telegram** | Defaults to proxy to prevent disconnection | Matches process names and specific IP ranges |
| **🎮 Games-Global** | International server gaming traffic | / |
| **✖️ Twitter** | Matches only nodes whose names contain **"美国\|住宅" (US\|Residential)** | 🚨 **Nodes with non-matching names will leave this policy group empty!** |
| **🤖 AI大模型 (AI Models)** | Matches only nodes whose names contain **"美国\|住宅" (US\|Residential)** | 🚨 **Nodes with non-matching names will leave this policy group empty!** |
| **🎵 TikTok** | Matches only nodes whose names contain **"美国\|住宅" (US\|Residential)** | 🚨 **Nodes with non-matching names will leave this policy group empty!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: Enabled = `DIRECT` only, Disabled = `👉 手动切换` only |

> Note: 🔄 Load Balancing / 👉 Manual Switch / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global have empty `proxies` in the template (commented as "all single nodes here"). Enabling the override script will automatically populate all subscription nodes; when not using the script, they must be populated manually.

<a id="before-use"></a>

## 🛠️ Must-Read Before Use (Essential Reading for Copying)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following operations yourself:
1. **Inject Nodes**: It is recommended to use the override script above directly—real nodes in your subscription will be automatically filled into `proxies` and various placeholder policy groups, and `proxy-providers` bundled with the subscription will be preserved. If you do not use the script, you need to manually fill the node list or `proxy-providers` into this configuration (`proxies: ~` is left blank by default).
2. **Modify Node Filtering Rules (Filter)**: If your provider's node names do not contain the words `美国` (US) or `住宅` (Residential), make sure to manually modify the `filter` field of the corresponding policy groups in the configuration, otherwise your AI, Twitter, and TikTok will fail to connect entirely.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Universal Disclaimer ⚠️⚠️⚠️


1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository serves solely as a personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug-related issues will not be accepted, and regular maintenance and updates are not guaranteed.** If the configuration throws errors on your device, please consult the official Mihomo documentation to troubleshoot.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country and region. The repository author **shall not be held responsible** for any network security issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or distribution of the contents of this repository.
4. **Function Disruption Warning**: The configuration includes aggressive ad-blocking (such as blocking specific domains and IPs) and Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images properly, log in, or experience network connectivity issues. In case of network abnormalities, please prioritize troubleshooting the `rules` and `fake-ip-filter` in this configuration.