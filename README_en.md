<p align="center">
  <img src="assets/avatar.png" alt="XVSVTsama" width="120" />
</p>

<h1 align="center">Mihomo (Clash Meta) configuration template </h1>

<p align="center">
  <strong>Highly customized version</strong> · Routing configuration · Remote overwriting of scripts
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
  <a href="#remote-override">Remote override js</a> ·
  <a href="#core-features">Core Features</a> ·
  <a href="#proxy-groups">Split group structure</a> ·
  <a href="#before-use">Change before use</a>
</p>

<p align="center">
  English | <a href="README.md">中文</a>
</p>

---

> ⚠️ **Pitfall Avoidance Guide & Core Statement**
> What this warehouse provides is a Mihomo (formerly Clash Meta) [routing configuration file](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) that is highly suitable for personal usage habits.
> It is **not** a generic fool-proof template that works out of the box. If you are not familiar with Mihomo's core mechanism, TUN mode, Fake-IP, and policy group regular expressions (filters), please copy with caution**. Before copying the assignment, please be sure to read the instructions below!

<a id="remote-override"></a>

## Remote overwrite js

[<kbd>Create a private configuration warehouse</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> A bilingual warehouse will be generated after copying the warehouse: `mihomo.yaml`, `mihomo_en.yaml`, `script_override.js`, `script_override_en.js` and `assets/avatar.png` will be retained; the full description will be saved as `README_full.md` and `README_full_en.md`, and simplified Chinese `README.md` and simplified English will be generated `README_en.md`. Your permanent configuration link is `https://raw.githubusercontent.com/<你的用户名>/<你的仓库名>/main/<文件名>`.

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
   - The real nodes in the subscription are automatically filled in `proxies` and each "single node" placeholder strategy group (👉 manual switching, ♻️ automatic selection, 🔄 load balancing, 📲 Telegram, 🎮 Games-Global);
   - The `proxy-providers` that comes with the subscription will be retained as is;
   - Dynamically merge the `proxy-server-nameserver-policy` of DNS (subject to the script, the template does not preset this key);
   - Policy groups can be individually disabled through the `ruleOptionsEnable` switch at the top of the script and related references will be automatically cleaned up.
   - `FCM直连` function switch: enabled by default, the hidden group FCM only contains `DIRECT`; after it is closed, only `👉 手动切换` will be retained (the switch only changes the nodes in the FCM group, and does not remove the group).
   - `TGDC实验分流` function switch: turned off by default. After being enabled, the script will prioritize Telegram traffic into three experimental groups: `📲 Telegram-DC1-DC3-Miami`, `📲 Telegram-DC2-DC4-Amsterdam` and `📲 Telegram-DC5-SG` according to IP rules; among them, the DC5 group matches both Singapore and Hong Kong nodes, because both places can be interconnected candidates for the DC. The three experimental groups used `include-all-proxies` plus name filtering to match node names such as the United States/Miami, the Netherlands/Amsterdam, and Singapore/Hong Kong respectively. If an experimental group has no region-matching node, the script explicitly lists every eligible node from the subscription in that group for manual selection (only abnormal, built-in/reject/re-match and information nodes are excluded; free, low-multiplier and high-multiplier nodes are no longer excluded), and `empty-fallback` is set to `COMPATIBLE`. After being turned on, the original `📲 Telegram` group is renamed `📲 Telegram(兜底)`. The original Telegram process, domain name and CIDR rules are uniformly pointed to this group, and experimental DC/regional IP rules are inserted first. When closed, no experimental groups, rule sets or rules are injected, and the original Telegram configuration remains unchanged.
   - `入口解析` function switch: off by default; when turned on, all three entry nodes of China Telecom, China Unicom, and China Mobile will be added to the `国内入口解析` proxy group. The user can manually select the actual entry node in this group and resolve the selected entry for the final node DNS application. There is no automatic script priority among the three; the order in the configuration does not mean automatic switching or priority. This function will introduce time-sensitive domestic public nodes and is an experimental capability for testing purposes only.
   - The first line of the script is the Bettbox compatibility statement (`Compatible_With_Bettbox`): Bettbox client agrees to identify this statement at the beginning of the script (not to read it in full). The script must follow this convention, and the statement must remain on top, otherwise the "custom rule switch" entrance will not be displayed.
   - `policyGroupOptions`: a field of the `Compatible_With_Bettbox` statement, declaring the 9 policy groups classified under the Bettbox policy group switch category (🌍 PROXY, 🔄 负载均衡, 👉 手动切换, ♻️ 自动选择, 📲 Telegram, 🎮 Games-Global, ✖️ Twitter, 🤖 AI大模型, 🎵 TikTok).

   The standard template embedded in the script is synchronized with the warehouse [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) (in case of differences, js shall prevail).

   English synchronization translates actual comments and README prose only. Proxy group names and references, option keys, string values, URLs, node filters, and other functional content retain their original values from the Chinese source. Changes to functional values are rejected even when they contain Chinese. Comment markers inside strings, regular expressions, template literals, and YAML block scalars are not treated as translatable comments.

## Node domain name and DNS linkage model

[<kbd>Read online: Node domain name, Hosts and private DNS linkage model</kbd>](https://XVSVTsama.github.io/mihomo-config-self/proxy-infrastructure-domain-protection-model.html)

> This document breaks down the respective responsibilities of `hosts` true and false mapping, private DoH resolution, DNS policy and fake-IP filter in the configuration, and how the four work together in the same node resolution link. It is intended for people who want to write or understand node resolution override scripts and does not contain any real nodes, passwords, UUIDs or subscription credentials. (This section and its description of the effects of `dns.use-hosts` were written by AI.)

## Recommended learning reference, subscription conversion project and client
   [Looking for a truly learnable reference?](https://t.me/xvsvts/152)

   It is strongly recommended to use private subscription conversion front-end and back-end to prevent any public online conversion on the Internet, which will greatly reduce the leakage of sensitive node information:
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro) Tested and available🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store) 🔥Popular🔥

   Is the above conversion setup too troublesome? There is also local conversion🎁
   
   [SubCase](https://github.com/sionnx/SubCase) app-based/Sub-Store support🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter) 🟢Simple and easy to use🟢/🔴Non-Flclash project
Attached 🔴

   This configuration must be used on the non-modified 🎭 client of the native mihomo kernel, otherwise unknown errors may occur. Recommendations are as follows:
   Excellent downstream GUI for [Bettbox](https://github.com/appshubcc/Bettbox/releases)

<a id="core-features"></a>

## ✨ Core Features (Why is it so matched?)

This configuration integrates modular remote rules (Rule Providers) and refined application-level offloading strategies, which are completely designed to meet my personal network environment and usage pain points:

* **Usage rules TUN**: The `tun` mode is enabled by default, and the `mips` protocol stack is used to realize full device/full protocol takeover and solve the problem of some software not using the system agent.
* **Radical DNS resolution experience**: Use `fake-ip` enhanced mode. Built-in intelligent DNS policy based on domestic direct connection and DoH/DoT hybrid to accurately prevent DNS pollution.
* **Modular Rule Sets (Rule Providers)**: Fully embrace the `mrs` format of remote rulesets (thanks [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases), [MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta), [echs-top](https://github.com/echs-top/proxy), [reddishJade](https://github.com/reddishJade/private_proxy) and other maintainers), strip off local rules and achieve automatic and non-intrusive updates.
* **Obsessive-compulsive disorder level scene diversion**:
    * **🤖 AI大模型 / ✖️ Twitter / 🎵 TikTok**: independent routing groups that use a functional regular expression matching residential/US-style nodes (residential, home broadband, home internet, family broadband, native residential, residential IP, 🇺🇸, 美国, 美國, U.S. and other naming variants) and excluding Hong Kong/Singapore related nodes (🇭🇰, 香港, Hong Kong, HK, 🇸🇬, 新加坡, Singapore, SG); the English configuration keeps the same filter expression.
    * **🎮 Gaming**: Independent UDP proxy release and mainstream gaming platform routing.
* **Advanced Ad/Privacy Blocking**:
    * Block UDP ports (3478-3479, 5349-5350, 19302-19309) commonly used for WebRTC/voice/real-time communication to prevent them from bypassing the diversion policy.
    * **SUB-RULE process-level interception**: In-depth advertising and privacy tracking interception rules are written for specific overseas reading applications (such as Tomato Novel Overseas Edition `com.dragon.read.oversea.gp`).

<a id="proxy-groups"></a>
## 🗂 Distribution group structure (Proxy Groups)

| Policy group name | Default behavior/trigger conditions | Notes |
| :--- | :--- | :--- |
| **🌍 PROXY** | All default overseas traffic that misses | Optional manual, automatic or load balancing |
| **🔄 负载均衡** | Adopt `sticky-sessions` (sticky sessions) strategy | Ensure that the IP of the same domain name remains unchanged within a short period of time |
| **👉 手动切换** | Manually select a specific node | / |
| **♻️ 自动选择** | `url-test` automatically tests and selects the node with the lowest latency | Tolerance set to 50ms |
| **📲 Telegram** | When TGDC is closed, it will use the proxy by default to prevent disconnection | Match the process name with a specific IP segment; after opening TGDC, it will be renamed `📲 Telegram(兜底)` |
| **📲 Telegram-DC1-DC3-Miami** | When TGDC is turned on, match the US/Miami nodes | Hit first according to Telegram DC IP rules; when no region matches, list every eligible node for manual selection |
| **📲 Telegram-DC2-DC4-Amsterdam** | When TGDC is turned on, match the Netherlands/Amsterdam node | Hit first according to Telegram DC IP rules; when no region matches, list every eligible node for manual selection |
| **📲 Telegram-DC5-SG** | When TGDC is turned on, match Singapore/Hong Kong nodes | DC5 experimental candidate group; when no region matches, list every eligible node for manual selection |
| **🎮 Games-Global** | International server game traffic | / |
| **✖️ Twitter** | Node names matching residential/US-style naming, excluding Hong Kong/Singapore nodes | 🚨 **Inconsistent node naming will cause this policy group to be empty! ** |
| **🤖 AI大模型** | Node names matching residential/US-style naming, excluding Hong Kong/Singapore nodes | 🚨 **Inconsistent node naming will cause this policy group to be empty! ** |
| **🎵 TikTok** | Node names matching residential/US-style naming, excluding Hong Kong/Singapore nodes | 🚨 **Inconsistent node naming will cause this policy group to be empty! ** |
| **FCM** | Google FCM related domain names (`hidden` hidden group) | Controlled by `FCM直连` switch: on = only `DIRECT`, off = only `👉 手动切换` |

> Note: 🔄 Load balancing / 👉 Manual switching / ♻️ Automatic selection / 📲 Telegram / 🎮 Games-Global `proxies` in the template is empty (note "All single nodes here"). After the overwrite script is enabled, all nodes of the subscription will be automatically filled in; when the script is not used, it needs to be filled in manually.

<a id="before-use"></a>

## 🛠️ Must be modified before use (must read when copying homework)

Since this is a self-configuration, `proxies: ~` is empty. You must do the following yourself:
1. **Inject nodes**: It is recommended to use the above override script directly - the real nodes in the subscription will automatically fill in `proxies` and each placeholder policy group, and the `proxy-providers` that comes with the subscription will also be retained; if no script is used, you need to manually fill in the node list or `proxy-providers` into this configuration (`proxies: ~` is left blank by default).
2. **Modify node filtering rules (Filter)**: Both languages default to the long regular expression: it matches residential/US-style node names (residential, home broadband, home internet, family broadband, native residential, residential IP, 🇺🇸, 美国, 美國, U.S. and other naming variants) and excludes Hong Kong/Singapore related nodes (🇭🇰, 香港, Hong Kong, HK, 🇸🇬, 新加坡, Singapore, SG). If your subscription node names contain none of the residential or US markers above, or a node name contains Hong Kong/Singapore wording, adjust the corresponding `filter` in the Chinese source and synchronize it to the English configuration.
3. **Delete rules on demand**: If you don’t need to block ads for the overseas version of Tomato Novel, it is recommended to delete the relevant rules in `sub-rules` under `fanqie` to save performance.

---

## ⚠️⚠️⚠️ Universe Disclaimer ⚠️⚠️⚠️


1. **Purely personal effort, no technical support provided**: This warehouse code is only used as a reference for personal cloud backup and configuration. **Does not answer basic usage questions, does not accept non-BUG issues, and does not guarantee regular maintenance and updates. ** If the configuration reports an error on your device, please consult the official Mihomo documentation to troubleshoot.
2. **Does not provide any network services**: This configuration is purely for the distribution of local routing rules and **absolutely does not include, provide or sell** any form of scientific Internet nodes, VPN services or server subscriptions.
3. **Compliance and Legal Responsibility**: Users must bear all risks of using this configuration. Please strictly abide by the local laws and regulations of your country and region. The **repository author is not responsible** for any network security issues, privacy leaks, data loss or legal disputes resulting from the use, modification or dissemination of the contents of this repository.
4. **Function damage warning**: The configuration contains aggressive ad removal (such as blocking specific domain names and IPs) and Fake-IP settings, which is very likely to cause some domestic APPs to be unable to load images, log in normally, or cause network connectivity problems. If you encounter network abnormalities, please prioritize `rules` and `fake-ip-filter` in this configuration.
