<p align="center">
  <img src="assets/avatar.png" alt="XVSVTsama" width="120" />
</p>

<h1 align="center">Mihomo (Clash Meta) Configuration Template</h1>

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
  <a href="#before-use">Must-Modify Before Use</a>
</p>

<p align="center">
  English | <a href="README.md">中文</a>
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) that is **highly tailored to personal usage habits**.
> It is **not** an out-of-the-box, generic beginner-friendly template. If you are not familiar with Mihomo's core mechanisms, TUN mode, Fake-IP, and proxy group regular expressions (`filter`), please **proceed with caution**. Be sure to read the instructions below before copying!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After copying the repository, a bilingual repository will be generated: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; complete instructions will be saved as `README_full.md` and `README_full_en.md`, generating simplified Chinese `README.md` and simplified English `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<FileName>`.

   Default remote override script URLs:

| Comments | Remote Override Script URL |
| --- | --- |
| Chinese Comments | [https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js) |
| English Comments | [https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js) |

   Attach this script to your subscription in Bettbox / FlClash family clients:
   - Real nodes in the subscription will be automatically populated into `proxies` and various "single-node" placeholder proxy groups (👉 Manual, ♻️ Auto Select, 🔄 Load Balance, 📲 Telegram, 🎮 Games-Global);
   - `proxy-providers` bundled with the subscription will be preserved as-is;
   - Dynamically merge DNS `proxy-server-nameserver-policy` (based on the script; the template does not pre-populate this key);
   - Proxy groups can be disabled individually via the `ruleOptionsEnable` switch at the top of the script, which automatically cleans up related references.
   - `FCM Direct` feature switch: Enabled by default, the hidden FCM group contains only `DIRECT`; when disabled, only `👉 Manual` is retained (the switch only modifies nodes within the FCM group without removing the group itself).
   - The first line of the script contains the Bettbox compatibility declaration (`Compatible_With_Bettbox`): Bettbox clients are configured to recognize this declaration at the beginning of the script (rather than reading it fully). The script must comply with this convention, and the declaration must remain at the top, otherwise the "Custom Rule Switch" entry will not appear.

   The standard template embedded within the script stays synchronized with [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) in the repository.

## Recommended Learning References, Subscription Conversion Projects, and Clients
   [Looking for a truly educational reference?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends to eliminate any public online conversion on the internet, which will greatly reduce the risk of leaking sensitive node information:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro) Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store) 🔥 Popular 🔥

   Finding the above conversion setups too troublesome? There is also local conversion 🎁
   
   [SubCase](https://github.com/sionnx/SubCase) App-based / Sub-Store support 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter) 🟢 Simple and easy to use 🟢 / 🔴 Not a Flclash project
Subsidiary 🔴

   This configuration must be used on non-modded 🎭 clients running the native mihomo core, otherwise unknown errors may occur. Recommended excellent downstream GUIs include:
   [Bettbox](https://github.com/appshubcc/Bettbox/releases)

<a id="core-features"></a>

## ✨ Essential Highlights (Why Configure It This Way?)

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-level traffic splitting strategies, tailored specifically to meet my personal network environment and usage pain points:

* **Rule-based TUN**: Enables `tun` mode by default, using the `gvisor` stack to achieve full-device/full-protocol takeover, resolving issues where certain software bypasses system proxies.
* **Aggressive DNS Resolution Experience**: Adopts `fake-ip` enhanced mode. Built-in smart DNS strategy based on domestic direct connection and mixed DoH/DoT to precisely prevent DNS poisoning.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), and [reddishJade](https://github.com/reddishJade/private_proxy)), stripping away local rules for automatic, seamless updates.
* **OCD-Level Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent split groups with **hardcoded** regular expression filters, forcing the use of nodes marked with "US|Residential" only, preventing account bans or risk controls.
    * **🎮 Gaming**: Independent UDP proxy forwarding and routing for mainstream gaming platforms.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used for WebRTC / Voice / Real-time communication (3478-3479, 5349-5350, 19302-19309) to prevent bypassing traffic splitting strategies.
    * **SUB-RULE Process-Level Blocking**: Hardcoded deep ad-blocking and privacy tracking blocking rules targeting specific overseas reading apps (such as the overseas version of Fanqie Novel `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>

## 🗂 Proxy Group Structure

| Proxy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched overseas traffic | Optional manual, auto, or load balance |
| **🔄 Load Balance** | Uses `sticky-sessions` strategy | Ensures IP remains unchanged for the same domain in the short term |
| **👉 Manual** | Manually select specific nodes | / |
| **♻️ Auto Select** | `url-test` automatically tests and selects the lowest latency node | Tolerance set to 50ms |
| **📲 Telegram** | Routes through proxy by default to prevent disconnections | Matches process name and specific IP segments |
| **🎮 Games-Global** | International server gaming traffic | / |
| **✖️ Twitter** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes not named accordingly will cause this proxy group to be empty!** |
| **🤖 AI Models** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes not named accordingly will cause this proxy group to be empty!** |
| **🎵 TikTok** | Matches only nodes whose names contain **"US\|Residential"** | 🚨 **Nodes not named accordingly will cause this proxy group to be empty!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: Enabled = `DIRECT` only, Disabled = `👉 Manual` only |

> Note: 🔄 Load Balance / 👉 Manual / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global have empty `proxies` in the template (commented as "all single nodes here"). Enabling the override script will automatically populate them with all nodes from your subscription; if not using a script, you must manually populate them.

<a id="before-use"></a>

## 🛠️ Must-Modify Before Use (Must Read for Copying)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following actions yourself:
1. **Inject Nodes**: It is recommended to use the override script above directly—real nodes from your subscription will be automatically populated into `proxies` and placeholder proxy groups, and `proxy-providers` bundled with the subscription will be preserved. If not using the script, you need to manually fill in your node list or `proxy-providers` into this configuration (`proxies: ~` is left blank by default).
2. **Modify Node Filter Rules**: If the airport node names you purchased do not contain terms like `US` or `Residential`, be sure to manually modify the `filter` field of the corresponding proxy groups in the configuration file, otherwise your AI, Twitter, and TikTok will not be able to connect to the internet at all.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Universal Disclaimer ⚠️⚠️⚠️

1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository serves solely as a personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug Issues will not be accepted, and regular maintenance and updates are not guaranteed.** If the configuration throws errors on your device, please consult the official Mihomo documentation to troubleshoot.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country and region. **The repository author assumes no responsibility** for any cybersecurity issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or dissemination of the contents of this repository.
4. **Function Disruption Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) and Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images properly, log in, or experience network connectivity issues. In case of network anomalies, please prioritize troubleshooting the `rules` and `fake-ip-filter` in this configuration.