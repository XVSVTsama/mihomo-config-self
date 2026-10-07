<p align="center">
  <img src="assets/avatar.png" alt="XVSVTsama" width="120" />
</p>

<h1 align="center">Mihomo (Clash Meta) Configuration Template </h1>

<p align="center">
  <strong>Extreme Personal Tailored Edition</strong> · Routing configuration · Remote override script
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
  English | <a href="README.md">中文</a>
</p>

---

> ⚠️ **Pitfall Guide & Core Disclaimer**
> This warehouse provides a copy of**Highly adaptable to personal usage habits**Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml)。
> it**no**A universal fool-proof template that works right out of the box. If you are not familiar with Mihomo's core mechanism, TUN mode, Fake-IP, and policy group regular expressions (filters), please**Copy with caution**. Before copying the assignment, please be sure to read the instructions below!

<a id="remote-override"></a>

## Remote Override JS

[<kbd>Create a private configuration repository</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> After copying the warehouse, a bilingual warehouse will be generated:`mihomo.yaml`、`mihomo_en.yaml`、`script_override.js`、`script_override_en.js` and `assets/avatar.png` will be retained; the full description will be saved as `README_full.md` and `README_full_en.md`, and generate simplified Chinese `README.md` with simplified English `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<你的用户名>/<你的仓库名>/main/<文件名>`。

   Default remote overwrite script address (you can copy it directly in the upper right corner of the code block):

Chinese note:

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
```

English annotation (maybe lagging behind the former):

```text
https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override_en.js
```

   Just attach this script to the subscription in the Bettbox / FlClash client:
   - The real nodes in the subscription are automatically filled in `proxies` Compared with the pure single-node placeholder group (👉 manual switching, ♻️ automatic selection, 🔄 load balancing, 📲 Telegram, 🎮 Games-Global); 🍎 overseas Apple, 🌐 overseas Microsoft, 🎮 Steam platform (non-download/CDN) retains fixed policy items and additionally subscribes to a single node;
   - Subscription comes with `proxy-providers` will be preserved as is;
   - Dynamically merge DNS `proxy-server-nameserver-policy`(Subject to the script, the template does not preset this key);
   - This can be accessed via the top of the script `ruleOptionsEnable` The switch disables policy groups individually and automatically cleans up related references.
   - 🍎 Overseas Apple / 🌐 Overseas Microsoft: Domestic Apple and Microsoft rules are mandatory `DIRECT`; Overseas domain names/IPs are entered into independent groups respectively, and manual switching, automatic selection, load balancing, etc. are provided within the group.`DIRECT` and all subscribe to a single node.
   - 🎮Steam platform (non-download/CDN): Steam domain name/IP rules enter the independent group, selected by default `DIRECT`；`games-cn` Still connected directly,`games` Still entering 🎮 Games-Global.
   - `FCM直连` Function switch: enabled by default, hidden group FCM only contains `DIRECT`; Prioritize use after closing `👉 手动切换`, if the policy group is closed, fall back to `🌍 PROXY`, if the group has also been closed, fall back to `DIRECT`(The FCM group is not removed).
   - `TGDC实验分流` Function switch: off by default. Once enabled, the script will prioritize Telegram traffic according to IP rules. `📲 Telegram-DC1-DC3-Miami`、`📲 Telegram-DC2-DC4-Amsterdam` and `📲 Telegram-DC5-SG` Three experimental groups; among them, the DC5 group matches nodes in Singapore and Hong Kong at the same time, because both places can serve as interconnection candidates for the DC. Three experimental groups used `include-all-proxies` Add name filtering to match node names such as the United States/Miami, Netherlands/Amsterdam, Singapore/Hong Kong, etc. If there are no matching regional nodes in an experimental group, the script will explicitly include all qualified nodes in the subscription (only exceptions, built-in/rejection/rematching and prompt information nodes are excluded; free, low-magnification, and high-magnification nodes are no longer excluded) for manual selection.`empty-fallback` for `COMPATIBLE`. After opening, the original `📲 Telegram` Group renamed `📲 Telegram(兜底)`, the original Telegram process, domain name and CIDR rules are uniformly pointed to this group, and the experimental DC/region IP rules are inserted first. When closed, no experimental groups, rule sets or rules are injected, and the original Telegram configuration remains unchanged.
   - `入口解析` Function switch: off by default; when turned on, all three entry nodes of China Telecom, China Unicom, and China Mobile will be added `国内入口解析` 
   - The first line of the script is the Bettbox compatibility statement (`Compatible_With_Bettbox`): The Bettbox client agrees to identify the statement at the beginning of the script (not to read it in full). The script must follow this convention and the statement must remain on top, otherwise the "custom rule switch" entry will not be displayed.
   - `policyGroupOptions`：`Compatible_With_Bettbox` The fields in the statement declare the 12 policy groups classified into the Bettbox policy group switch classification (🌍 PROXY, 🔄 Load balancing, 👉 Manual switching, ♻️ Automatic selection, 📲 Telegram, 🎮 Games-Global, 🍎 Overseas Apple, 🌐 Overseas Microsoft, 🎮 Steam platform (non-download/CDN), ✖️ Twitter, 🤖 AI large model, 🎵 TikTok).

   Standard templates and repositories embedded in scripts [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) Keep in sync (in case of discrepancies, js shall prevail).

   Only actual comments and README instructions are translated into Chinese and English simultaneously. The policy group name and its references, switch keys, string values, URLs, node filtering rules and other functional contents retain the original values ​​in the Chinese source; the synchronization check will reject changes in these contents, including functional values ​​containing Chinese. Comment symbols in strings, regexes, template strings, and YAML block scalars are not treated as translatable comments.

## Node domain name and DNS linkage model

[<kbd>Read online: Node domain name, Hosts and private DNS linkage model</kbd>](https://XVSVTsama.github.io/mihomo-config-self/proxy-infrastructure-domain-protection-model.html)

> This document disassembles the configuration `hosts` The respective responsibilities of true and false mapping, private DoH resolution, DNS policy and fake-IP filter, and how the four work together in the same node resolution link. It is intended for people who want to write or understand node resolution override scripts and does not contain any real nodes, passwords, UUIDs or subscription credentials. (This section and its related `dns.use-hosts` The description of the effective effect is written by AI. )

## Recommended learning reference, subscription conversion project and client
   [Looking for a truly studyable reference?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion front-end and back-end to prevent any public online conversion on the Internet, which will greatly reduce the leakage of sensitive node information:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  Tested and available🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥Popular🔥

   Is the above conversion setup too troublesome? There is also local conversion🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  Appization/Sub-Store support🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢Easy to use🟢/🔴non-Flclash project
Attached 🔴

   This configuration must be used on the non-modified 🎭 client of the native mihomo kernel, otherwise unknown errors may occur. Recommendations are as follows:
   [Bettbox](https://github.com/appshubcc/Bettbox/releases)Excellent downstream GUI

<a id="core-features"></a>

## ✨ Core Features (Why is it so matched?)

This configuration integrates modular remote rules (Rule Providers) and refined application-level offloading strategies, which are completely designed to meet my personal network environment and usage pain points:

* **Use the rule TUN**: enabled by default `tun` mode, adopt `mips` The protocol stack realizes full device/full protocol takeover and solves the problem of some software not using the system agent.
* **Radical DNS resolution experience**:use `fake-ip` Enhanced mode. Built-in smart DNS policy based on domestic direct connection and DoH/DoT hybrid to accurately prevent DNS pollution.
* **Modular rule sets (Rule Providers)**: full embrace `mrs` formatted remote ruleset (thanks [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases)、[MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta)、[echs-top](https://github.com/echs-top/proxy)、[reddishJade](https://github.com/reddishJade/private_proxy) and other maintainers), strip away local rules and achieve automatic and non-intrusive updates.
* **Obsessive-compulsive disorder level scene diversion**：
    * **🤖 AI Large Models / ✖️ Twitter / 🎵 TikTok**: Independent traffic group, using functional regularity to match residential/US nodes (residential/home broadband/residential/home broadband/🇺🇸/USA/USA/U.S. and other naming variants), and exclude Hong Kong/Singapore related nodes (🇭🇰/香港/Hong Kong/HK/🇸🇬/ Singapore/Singapore/SG); the English configuration retains the same filter expression.
    * **🍎 Overseas Apple / 🌐 Overseas Microsoft**: Domestic rules force direct connection, and overseas domain names and IP rules are diverted to their respective manual policy groups.
    * **🎮 Games / Steam**:reserve `games-cn` Directly connected to `games` International game agent; Steam platform has another default setting `DIRECT` "Non-download/CDN" policy group.
* **Advanced ad/privacy blocking**：
    * Block UDP ports (3478-3479, 5349-5350, 19302-19309) commonly used for WebRTC/voice/real-time communication to prevent them from bypassing the offloading policy.
    * **SUB-RULE process-level interception**: For specific overseas reading applications (such as Tomato novel overseas version `com.dragon.read.oversea.gp`) has written in-depth advertising and privacy tracking blocking rules.

<a id="proxy-groups"></a>

## 🗂 Proxy Groups

| Policy group name | Default behavior/trigger conditions | Things to note |
| :--- | :--- | :--- |
| **🌍 PROXY** | All default overseas traffic that misses | Optional manual, automatic or load balancing |
| **🔄 Load balancing** | use `sticky-sessions` (sticky session) strategy | Ensure that the IP of the same domain name remains unchanged within a short period of time |
| **👉 Manual Select** | Manually select specific nodes | / |
| **♻️ Automatic selection** | `url-test` Automatically test and select the node with the lowest latency | Tolerance set to 50ms |
| **🍎 Overseas Apple** | Overseas Apple domain name/IP rules | Domestic Apple rules enforcement `DIRECT`; Optional manual, automatic, load balancing,`DIRECT` and all nodes |
| **🌐 Overseas Microsoft** | Overseas Microsoft domain name/IP rules | Domestic Microsoft rules enforcement `DIRECT`; Optional manual, automatic, load balancing,`DIRECT` and all nodes |
| **🎮 Steam Platform (Non-Download/CDN)** | Steam Domain/IP Rules | Default selection `DIRECT`；`games-cn` Still connected directly,`games` Still Go Games-Global |
| **📲 Telegram** | When TGDC is closed, it will use the proxy by default to prevent disconnection. | Match the process name with a specific IP range; change the name after turning on TGDC `📲 Telegram(兜底)` |
| **📲 Telegram-DC1-DC3-Miami** | When TGDC is enabled, match the US/Miami nodes | Prioritize hits according to Telegram DC IP rules; if there is no region matching, all qualified nodes will be listed for manual selection. |
| **📲 Telegram-DC2-DC4-Amsterdam** | When TGDC is enabled, matches Netherlands/Amsterdam nodes | Prioritize hits according to Telegram DC IP rules; if there is no region matching, all qualified nodes will be listed for manual selection. |
| **📲 Telegram-DC5-SG** | When TGDC is turned on, match Singapore/Hong Kong nodes | DC5 experimental candidate group; when there is no region matching, all qualified nodes are listed for manual selection |
| **🎮 Games-Global** | International server game traffic | / |
| **✖️ Twitter** | Match residential/American named nodes, exclude Hong Kong/Singapore nodes | 🚨 **Inconsistent node naming will cause this policy group to be empty!** |
| **🤖 AI** | Match residential/American named nodes, exclude Hong Kong/Singapore nodes | 🚨 **Inconsistent node naming will cause this policy group to be empty!** |
| **🎵 TikTok** | Match residential/American named nodes, exclude Hong Kong/Singapore nodes | 🚨 **Inconsistent node naming will cause this policy group to be empty!** |
| **FCM** | Google FCM related domain names (`hidden` hidden group) | Depend on `FCM直连` Switch control: On =`DIRECT`;Off=manual group, fallback to when manual group is disabled `🌍 PROXY` or `DIRECT` |

> Note: 🔄 Load balancing / 👉 Manual switching / ♻️ Automatic selection / 📲 Telegram / 🎮 Games-Global is a pure node placeholder group; 🍎 Overseas Apple / 🌐 Overseas Microsoft / 🎮 Steam platform (non-download/CDN) will first retain fixed policy items, and then the overwrite script will additionally subscribe to all single nodes. Nodes need to be populated manually when not using scripts.

<a id="before-use"></a>

## 🛠️ Must be modified before use (must read when copying homework)

Since this is a self-configuration,`proxies: ~` Everywhere is empty. You must do the following yourself:
1. **Inject node**: It is recommended to use the above override script directly - the real nodes in the subscription will be automatically filled in `proxies`, pure node placeholder group and overseas Apple/Microsoft/Steam group (retain fixed policy items and then add nodes), subscribe to the included `proxy-providers` will also be retained; if no script is used, you need to manually add the node list or `proxy-providers` Fill in this configuration (`proxies: ~` is left blank by default).
2. **Modify node filtering rules (Filter)**: Chinese and English configurations use long regular expressions by default: match residential/US named nodes (residential/home broadband/🇺🇸/USA/USA/U.S. and other naming variants), and exclude Hong Kong/Singapore related nodes (🇭🇰/香港/Hong Kong/HK/🇸🇬/ Singapore/Singapore/SG). If the subscription node name does not contain any of the above residential or US identifiers, or the node name contains the words Hong Kong/Singapore, please modify the corresponding policy group in the Chinese source file. `filter` field, and then synchronize it to the English configuration.
3. **Delete rules as needed**: If you don’t need to block ads for the overseas version of Tomato Novels, it is recommended to delete them. `sub-rules` middle `fanqie` Related rules to save performance.

---

## ⚠️⚠️⚠️ Universe Disclaimer ⚠️⚠️⚠️


1. **This is purely personal and does not provide any technical support.**: This warehouse code is only used as a reference for personal cloud backup and configuration.**It does not answer basic usage questions, does not accept non-BUG issues, and does not guarantee regular maintenance and updates.** If the configuration reports an error on your device, please consult the official Mihomo documentation to troubleshoot.
2. **No network services are provided**: This configuration is purely for local routing rule distribution.**Absolutely not included, provided, or sold**Any form of scientific internet node, VPN service or server subscription.
3. **Compliance and Legal Responsibilities**:Users are solely responsible for using this configuration at their own risk. Please strictly abide by the local laws and regulations of your country and region. For any network security issues, privacy leaks, data loss or legal disputes arising from the use, modification or dissemination of the contents of this repository,**The repository author is not responsible**。
4. **Function damage warning**: The configuration contains aggressive ad removal (such as blocking specific domain names and IPs) and Fake-IP settings, which is very likely to cause some domestic APPs to be unable to load images, log in normally, or cause network connectivity problems. If you encounter network anomalies, please prioritize the troubleshooting in this configuration. `rules` and `fake-ip-filter`。
