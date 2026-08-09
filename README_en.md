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
  <a href="#before-use">Must-Read Before Use</a>
</p>

<p align="center">
  English | [中文](README.md)
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) **closely tailored to personal usage habits**.
> It is **not** a general plug-and-play template for beginners. If you are unfamiliar with Mihomo's core mechanisms, TUN mode, Fake-IP, and policy group regular expressions (filters), please **proceed with caution**. Be sure to read the instructions below before copying this setup!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Configuration Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After duplicating the repository, a bilingual repository will be generated: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; complete instructions will be saved as `README_full.md` and `README_full_en.md`, generating simplified Chinese `README.md` and simplified English `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<Your Username>/<Your Repo Name>/main/<Filename>`.

   Default remote override script URLs (you can copy them directly from the top-right corner of the code blocks):

Chinese Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

English Comments:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js
```

   Attach this script to your subscription in Bettbox / FlClash series clients:
   - Real nodes in the subscription are automatically populated into `proxies` and individual "single-node" placeholder policy groups (👉 Manual, ♻️ Auto Select, 🔄 Load Balance, 📲 Telegram, 🎮 Games-Global);
   - The `proxy-providers` bundled with the subscription will be preserved as-is;
   - Dynamically merges DNS `proxy-server-nameserver-policy` (based on the script; the template does not preset this key);
   - Policy groups can be individually disabled via the `ruleOptionsEnable` switch at the top of the script, which automatically cleans up related references.
   - `FCM Direct` feature toggle: Enabled by default, hiding the FCM group to contain only `DIRECT`. When disabled, only `👉 Manual` is retained (the switch only modifies nodes within the FCM group and will not remove the group itself).
   - The first line of the script contains the Bettbox compatibility declaration (`Compatible_With_Bettbox`): Bettbox clients are configured to recognize this declaration at the beginning of the script (rather than reading the entire file). The script must follow this convention, and the declaration must remain at the very top, otherwise the "Custom Rule Switch" entry will not appear.

   The standard template embedded in the script stays synchronized with the repository [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml).

## Recommended Learning References, Subscription Conversion Projects, and Clients
   [Looking for truly educational references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends, and to avoid any public online converters on the internet, which will significantly reduce the risk of sensitive node information leakage:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro) Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store) 🔥 Popular 🔥

   Building the above converters is too much trouble? There is also local conversion 🎁
   
   [SubCase](https://github.com/sionnx/SubCase) App version / Sub-Store support 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter) 🟢 Simple and easy to use 🟢 / 🔴 Not a Flclash project (Subsidiary 🔴)

   This configuration must be used on non-modded 🎭 clients running the native mihomo core; otherwise, unknown errors may occur. Recommended options include excellent downstream GUIs such as
   [Bettbox](https://github.com/appshubcc/Bettbox/releases)

<a id="core-features"></a>

## ✨ Essential Highlights (Why Configure It This Way?)

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-layer traffic splitting strategies, built entirely to address my personal network environment and pain points:

* **Rule-based TUN**: Enables `tun` mode by default, adopting the `gvisor` stack to achieve full-device/full-protocol handling, solving the issue where certain software bypasses the system proxy.
* **Aggressive DNS Resolution Experience**: Adopts `fake-ip` enhanced mode. Built with an intelligent DNS strategy combining domestic direct connections and hybrid DoH/DoT to precisely prevent DNS poisoning.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), and [reddishJade](https://github.com/reddishJade/private_proxy)), stripping away local rules for automatic and seamless updates.
* **Obsessive-Compulsive Scenario Traffic Splitting**:
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent traffic splitting groups with **hardcoded** regular expression filters, forcing the use of nodes marked with "United States|Residential" to prevent account suspension or risk control flags.
    * **🎮 Games**: Independent UDP proxy allowances and mainstream gaming platform routing.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / voice / real-time communications (3478-3479, 5349-5350, 19302-19309) to prevent them from bypassing splitting strategies.
    * **SUB-RULE Process-level Blocking**: Hardcodes deep ad-blocking and privacy tracking blocking rules targeting specific overseas reading applications (such as the overseas version of Fanqie Novel `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>

## 🗂 Proxy Group Structure

| Policy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All unmatched default overseas traffic | Optional manual, automatic, or load balance |
| **🔄 Load Balance** | Adopts `sticky-sessions` strategy | Ensures the IP remains unchanged for the same domain in a short period |
| **👉 Manual** | Manually select specific nodes | / |
| **♻️ Auto Select** | `url-test` automatically tests and selects the lowest latency node | Tolerance set to 50ms |
| **📲 Telegram** | Routes through proxy by default to prevent disconnection | Matches process names and specific IP ranges |
| **🎮 Games-Global** | International gaming traffic | / |
| **✖️ Twitter** | Matches only nodes whose names contain **"United States\|Residential"** | 🚨 **Mismatched node naming will leave this policy group empty!** |
| **🤖 AI Models** | Matches only nodes whose names contain **"United States\|Residential"** | 🚨 **Mismatched node naming will leave this policy group empty!** |
| **🎵 TikTok** | Matches only nodes whose names contain **"United States\|Residential"** | 🚨 **Mismatched node naming will leave this policy group empty!** |
| **FCM** | Google FCM-related domains (`hidden` group) | Controlled by the `FCM Direct` switch: Enabled = `DIRECT` only, Disabled = `👉 Manual` only |

> Note: 🔄 Load Balance / 👉 Manual / ♻️ Auto Select / 📲 Telegram / 🎮 Games-Global have empty `proxies` fields in the template (annotated as "all single nodes here"). Enabling the override script will automatically populate all subscription nodes; when not using the script, you must populate them manually.

<a id="before-use"></a>

## 🛠️ Must-Read Before Use (Essential for Copying Setups)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following steps yourself:
1. **Inject Nodes**: It is recommended to use the override script above—real nodes in your subscription will be automatically populated into `proxies` and placeholder policy groups, and subscription-bundled `proxy-providers` will also be retained. If you do not use the script, you must manually fill in your node list or `proxy-providers` into this configuration (left empty by default at `proxies: ~`).
2. **Modify Node Filters**: If your airport node names do not contain words like `United States` or `Residential`, be sure to manually modify the `filter` field of the corresponding policy groups in the configuration file; otherwise, your AI, Twitter, and TikTok will not be able to connect to the network at all.
3. **Prune Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Universal Disclaimer ⚠️⚠️⚠️

1. **Purely Personal Tweaks, No Technical Support Provided**: The code in this repository serves solely as a personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug-related issues will not be accepted, and regular maintenance and updates are not guaranteed.** If the configuration throws errors on your device, please consult the official Mihomo documentation for troubleshooting.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must assume all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country or region. The repository author shall not be held liable for any cybersecurity issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or distribution of the contents of this repository.
4. **Function Disruption Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) as well as Fake-IP settings, which are highly likely to cause certain domestic apps to fail to load images normally, log in, or experience network connectivity issues. In case of network anomalies, please troubleshoot the `rules` and `fake-ip-filter` in this configuration first.