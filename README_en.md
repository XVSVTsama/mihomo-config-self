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
  English | <a href="README.md">中文</a>
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This repository provides a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) **closely tailored to personal usage habits**.
> It is **not** an out-of-the-box, universal, plug-and-play template. If you are unfamiliar with Mihomo's core mechanisms, TUN mode, Fake-IP, and proxy group regular expressions (`filter`), please **proceed with caution**. Be sure to read the instructions below before copying!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create Private Config Repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After copying the repository, a bilingual repository will be generated: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js`, and `assets/avatar.png` will be retained; full instructions will be saved as `README_full.md` and `README_full_en.md`, generating a simplified Chinese `README.md` and a simplified English `README_en.md`. Your permanent configuration link will be `https://raw.githubusercontent.com/<Your-Username>/<Your-Repo-Name>/main/<FileName>`.

   Default remote override script URLs:

Chinese Comments: [https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js)

English Comments: [https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js)

   Attach this script to your subscription in Bettbox / FlClash family clients:
   - Real nodes from the subscription are automatically populated into `proxies` and various "single-node" placeholder proxy groups (👉 Manual, ♻️ URL Test, 🔄 Load Balance, 📲 Telegram, 🎮 Games-Global);
   - The `proxy-providers` native to the subscription will be preserved as-is;
   - Dynamically merges DNS `proxy-server-nameserver-policy` (based on the script; the template does not preset this key);
   - Proxy groups can be independently disabled via the `ruleOptionsEnable` switch at the top of the script, with related references automatically cleaned up.
   - `FCM Direct` feature switch: Enabled by default, hiding the FCM group to contain only `DIRECT`; when disabled, only `👉 Manual` is retained (the switch only modifies nodes within the FCM group without removing the group).
   - The first line of the script is the Bettbox compatibility declaration (`Compatible_With_Bettbox`): The Bettbox client is designed to recognize this declaration at the beginning of the script (rather than full reading). The script must comply with this convention, and the declaration must remain at the top, otherwise the "Custom Rule Switch" entry will not appear.

   The standard template embedded within the script remains synchronized with the repository's [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml).

## Recommended Learning References, Subscription Conversion Projects, and Clients
   [Looking for truly educational references?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion backends and frontends to eliminate any public online conversion over the internet, significantly reducing the leakage of sensitive node information:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro) Tested and working 🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store) 🔥 Popular 🔥

   Finding self-hosting conversion too troublesome? Local conversion is also available 🎁
   
   [SubCase](https://github.com/sionnx/SubCase) Appized / Sub-Store supported 🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter) 🟢 Simple and easy to use 🟢 / 🔴 Not a Flclash project
   Affiliate 🔴

   This configuration must be used on non-modded 🎭 clients running the native Mihomo core; otherwise, unknown errors may occur. Recommended options include excellent downstream GUIs like
   [Bettbox](https://github.com/appshubcc/Bettbox/releases).

<a id="core-features"></a>

## ✨ Essential Highlights (Why this configuration?)

This configuration integrates modular remote rules (Rule Providers) and fine-grained application-level routing strategies, born entirely to meet my personal network environment and usage pain points:

* **Rule-based TUN**: `tun` mode is enabled by default using the `gvisor` stack, achieving full-device/full-protocol handling and resolving issues where certain software bypasses system proxies.
* **Aggressive DNS Resolution Experience**: Adopts `fake-ip` enhanced mode. Built-in smart DNS strategy based on domestic direct connection and hybrid DoH/DoT to precisely prevent DNS poisoning.
* **Modular Rule Sets (Rule Providers)**: Fully embraces remote rule sets in `mrs` format (thanks to maintainers like [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), and [reddishJade](https://github.com/reddishJade/private_proxy)), stripping away local rules for automatic, seamless updates.
* **Obsessive-Compulsive Scenario Routing**:
    * **🤖 AI Models / ✖️ Twitter / 🎵 TikTok**: Independent routing groups with **hardcoded** regular expression filtering, forcing the use of nodes tagged with "US|Residential" (美国|住宅) to prevent bans or risk controls.
    * **🎮 Games**: Independent UDP proxy allowances and mainstream gaming platform routing.
* **Advanced Ad/Privacy Blocking**:
    * Blocks common UDP ports used by WebRTC / Voice / Real-time communication (3478-3479, 5349-5350, 19302-19309) to prevent them from bypassing routing policies.
    * **SUB-RULE Process-Level Blocking**: Hardcoded deep anti-ad and privacy-tracking blocking rules targeting specific overseas reading apps (such as the overseas version of Fanqie Novel `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>

## 🗂 Proxy Group Structure

| Proxy Group Name | Default Behavior / Trigger Condition | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All default unmatched overseas traffic | Manual, automatic, or load balancing selectable |
| **🔄 Load Balance** | Uses `sticky-sessions` strategy | Ensures the IP for the same domain remains unchanged in the short term |
| **👉 Manual** | Manually select specific nodes | / |
| **♻️ URL Test** | `url-test` automatically tests and selects nodes with the lowest latency | Tolerance set to 50ms |
| **📲 Telegram** | Defaults to proxy to prevent connection loss | Matches process names and specific IP segments |
| **🎮 Games-Global** | International server gaming traffic | / |
| **✖️ Twitter** | Only matches nodes with names containing **"US\|Residential"** (美国\|住宅) | 🚨 **Mismatched node naming will result in an empty proxy group!** |
| **🤖 AI Models** | Only matches nodes with names containing **"US\|Residential"** (美国\|住宅) | 🚨 **Mismatched node naming will result in an empty proxy group!** |
| **🎵 TikTok** | Only matches nodes with names containing **"US\|Residential"** (美国\|住宅) | 🚨 **Mismatched node naming will result in an empty proxy group!** |
| **FCM** | Google FCM related domains (`hidden` group) | Controlled by the `FCM Direct` switch: Enabled = `DIRECT` only, Disabled = `👉 Manual` only |

> Note: 🔄 Load Balance / 👉 Manual / ♻️ URL Test / 📲 Telegram / 🎮 Games-Global have empty `proxies` fields in the template (commented as "All single nodes here"). Enabling the override script will automatically populate all subscription nodes; when not using the script, they must be filled in manually.

<a id="before-use"></a>

## 🛠️ Must-Read Before Use (Essential for Copying)

Since this is a personal configuration, `proxies: ~` is empty. You must complete the following operations yourself:
1. **Inject Nodes**: It is recommended to use the override script above—real nodes from your subscription will be automatically populated into `proxies` and placeholder proxy groups, while the subscription's native `proxy-providers` will also be retained. If you do not use the script, you need to manually fill in your node list or `proxy-providers` into this configuration (`proxies: ~` is left blank by default).
2. **Modify Node Filtering Rules (Filter)**: If the airport node names you purchased do not contain terms like `US` (美国) or `Residential` (住宅), be sure to manually modify the `filter` field of the corresponding proxy groups in the configuration file; otherwise, your AI, Twitter, and TikTok will completely fail to connect to the network.
3. **Trim Rules as Needed**: If you do not need to block ads for the overseas version of Fanqie Novel, it is recommended to delete the `fanqie`-related rules in `sub-rules` to save performance.

---

## ⚠️⚠️⚠️ Cosmic Disclaimer ⚠️⚠️⚠️


1. **Purely Personal Tinkering, No Technical Support Provided**: The code in this repository is merely for personal cloud backup and configuration reference. **Basic usage questions will not be answered, non-bug-related issues will not be accepted, and regular maintenance and updates are not guaranteed.** If the configuration throws errors on your device, please consult the official Mihomo documentation to troubleshoot.
2. **No Network Services Provided**: This configuration is purely for local routing rule distribution and **absolutely does not contain, provide, or sell** any form of proxy nodes, VPN services, or server subscriptions.
3. **Compliance and Legal Liability**: Users must bear all risks associated with using this configuration. Please strictly comply with the local laws and regulations of your country or region. The repository author **shall not be held responsible** for any cybersecurity issues, privacy leaks, data loss, or legal disputes resulting from the use, modification, or dissemination of the contents of this repository.
4. **Function Disruption Warning**: The configuration includes aggressive ad-blocking (such as intercepting specific domains and IPs) as well as Fake-IP settings, which are highly likely to cause some domestic apps to fail to load images normally, log in, or experience network connectivity issues. In case of network abnormalities, please prioritize troubleshooting the `rules` and `fake-ip-filter` in this configuration.