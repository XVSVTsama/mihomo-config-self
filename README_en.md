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
  <a href="#before-use">Must-Read Before Use</a>
</p>

<p align="center">
  English | [中文](README.md)
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) that is **highly tailored to personal usage habits**.
> It is **not** a plug-and-play, general-purpose beginner template. If you are unfamiliar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (filters), please **proceed with caution**. Be sure to read the instructions below before copying configurations!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Configuration Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After copying the repository, it will automatically clean up: `mihomo.yaml` and `script_override.js` will be retained, comprehensive instructions will be copied as `README_full.md`, and a source-annotated `README.md` will be generated with a button to view the full instructions. Your permanent configuration link will be `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<File-Name>`.

   Default remote override script address (you can copy it directly from the top-right corner of the code block):

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

   Attach this script to your subscription in Bettbox / FlClash series clients:
   - Real nodes in the subscription are automatically filled into `proxies` and various "single-node" placeholder policy groups (`👉 手动切换`, `♻️ 自动选择`, `🔄 负载均衡`, `📲 Telegram`, `🎮 Games-Global`);
   - The `proxy-providers` bundled within the subscription will be preserved as-is;
   - Dynamically merges DNS `proxy-server-nameserver-policy` (based on the script; the template does not preset this key);
   - Policy groups can be individually disabled via the `ruleOptionsEnable` switch at the top of the script, which automatically cleans up related references.
   - `FCM Direct` feature switch: Enabled by default, hiding the FCM group so it only contains `DIRECT`; when disabled, only `👉 手动切换` is retained (the switch only modifies nodes within the FCM group without removing the group itself).
   - The first line of the script contains the Bettbox compatibility declaration (`Compatible_With_Bettbox`): Bettbox clients are designed to recognize this declaration at the beginning of the script (rather than reading it fully). The script must adhere to this convention, and the declaration must remain at the very top, otherwise the "Custom Rule Switch" entry will not appear.

   The standard template embedded within the script remains synchronized with the repository's [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml).

## Recommended Study References, Subscription Conversion Projects, and Clients
   [Looking for truly educational references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends, and to avoid any public online converters on the internet, which will significantly reduce the risk of sensitive node information leakage:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥 Popular 🔥

   Finding the above conversion setups too troublesome? Local conversion is also available 🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  Appified / Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢 Simple and easy to use 🟢 / 🔴 Non-Flclash project
Sub-item 🔴

   This configuration must be used on non-modded 🎭 clients running the native mihomo core, otherwise unknown errors may occur. Excellent downstream GUIs like 
   [Bettbox](https://github.com/appshubcc/Bettbox/releases) are recommended.

<a id="core-features"></a>

## ✨ Essential Highlights (Why configure it this way?)

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-level traffic splitting strategies, born entirely to meet my personal network environment and usage pain points:

* **Rule-based TUN**: `tun` mode is enabled by default, utilizing the `gvisor` stack to achieve full-device/full-protocol takeover, solving the issue where certain software bypasses system proxies.
* **Aggressive DNS Resolution Experience**: Adopts `fake-ip` enhanced mode. Built-in smart DNS strategy based on domestic direct connection and DoH/DoT hybrid to precisely prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), [reddishJade](https://github.com/reddishJade/private_proxy)), stripping away local rules for automatic, seamless updates.
* **OCD-Level Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent routing groups with **hardcoded** regular expression filtering to strictly enforce the use of nodes containing "US|Residential" identifiers, preventing account bans or risk controls.
    * **🎮 Games**: Independent UDP proxy forwarding and routing for mainstream gaming platforms.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / voice / real-time communication (3478-3479, 5349-5350, 19302-19309) to prevent them from bypassing the traffic routing strategy.
    * **SUB-RULE Process-Level Blocking**: Hardcoded deep anti-ad and privacy-tracking blocking rules targeting specific overseas reading applications (such as the overseas version of Fanqie Novel `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>

## 🗂 Proxy Group Structure

| Policy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched default overseas traffic | Supports manual, automatic, or load balancing |
| **🔄 负载均衡** | Adopts `sticky-sessions` strategy | Ensures the IP remains unchanged for the same domain in a short period |
| **👉 手动切换** | Manually select specific nodes | / |
| **♻️ 自动选择** | `url-test` automatically tests and selects the lowest-latency node | Tolerance set to 50ms |
| **📲 Telegram** | Defaults to proxy to prevent disconnection | Matches process names and specific IP ranges |
| **🎮 Games-Global** | International gaming traffic | / |
| **✖️ Twitter** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes not matching this naming convention will leave this policy group empty!** |
| **🤖 AI大模型** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes not matching this naming convention will leave this policy group empty!** |
| **🎵 TikTok** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes not matching this naming convention will leave this policy group empty!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: Enabled = `DIRECT` only, Disabled = `👉 手动切换` only |

> Note: 🔄 Load Balancing / 👉 Manual Switch / ♻️ Automatic Selection / 📲 Telegram / 🎮 Games-Global have empty `proxies` fields in the template (commented as "all single nodes here"). Once the override script is enabled, all nodes from the subscription will be automatically populated; if not using the script, they must be populated manually.

<a id="before-use"></a>

## 🛠️ Must-Read Before Use (Essential Checklist)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following steps yourself:
1. **Inject Nodes**: It is recommended to use the override script above—real nodes in your subscription will automatically fill `proxies` and the various placeholder policy groups, while the subscription's own `proxy-providers` will be preserved; if you choose not to use the script, you must manually fill in your node list or `proxy-providers` (the `proxies: ~` field is left blank by default).
2. **Modify Node Filters**: If the node names provided by your airport do not contain terms like `US` or `Residential`, be sure to manually modify the `filter` field of the corresponding policy groups in the configuration file, otherwise your AI, Twitter, and TikTok will fail to connect entirely.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Universal Disclaimer ⚠️⚠️⚠️


1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository serves solely as a personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug Issues will not be accepted, and regular maintenance or updates are not guaranteed.** If the configuration throws errors on your device, please consult the official Mihomo documentation to troubleshoot.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country or region. **The repository author disclaims all liability** for any cybersecurity issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or distribution of the contents of this repository.
4. **Function Disruption Warning**: The configuration contains aggressive ad blocking (such as blocking specific domains and IPs) as well as Fake-IP settings, which are highly likely to cause certain domestic apps to fail to load images normally, log in, or experience network connectivity issues. In case of network abnormalities, please prioritize troubleshooting the `rules` and `fake-ip-filter` sections in this configuration.