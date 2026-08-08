# 🚀 Mihomo (Clash Meta) 配置模板(高度定制自用版)

[![GPL-3.0 License](https://img.shields.io/github/license/XVSVTsama/mihomo-config-self?style=flat-square&label=License&color=informational)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/XVSVTsama/mihomo-config-self?style=flat-square&label=Last%20Commit&color=informational)](https://github.com/XVSVTsama/mihomo-config-self/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/XVSVTsama/mihomo-config-self?style=flat-square&label=Repo%20Size&color=informational)](https://github.com/XVSVTsama/mihomo-config-self)
[![Stars](https://img.shields.io/github/stars/XVSVTsama/mihomo-config-self?style=flat-square&label=Stars&color=informational)](https://github.com/XVSVTsama/mihomo-config-self/stargazers)
[![XVSVTsama](https://img.shields.io/badge/XVSVTsama-Homepage-informational?style=flat-square)](https://github.com/XVSVTsama)

[![Mihomo](https://img.shields.io/badge/Mihomo-ProxyCore%20Client/Server-000000?style=flat-square)](https://github.com/MetaCubeX/mihomo)

[![Bettbox](https://img.shields.io/badge/Bettbox-Mihomo/Clash%20Meta%20Client/GUI-000000?style=flat-square)](https://github.com/appshubcc/Bettbox)
[![FlClash](https://img.shields.io/badge/FlClash-Mihomo/Clash%20Meta%20Client/GUI-000000?style=flat-square)](https://github.com/chen08209/FlClash)

[![YAML](https://img.shields.io/badge/YAML-%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6-yellow?style=flat-square&logo=yaml&logoColor=white)](mihomo.yaml)
[![YAML Syntax](https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/yaml-syntax.yml?style=flat-square&label=YAML%20Syntax&color=informational)](https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/yaml-syntax.yml)
[![JavaScript](https://img.shields.io/badge/JavaScript-%E8%A6%86%E5%86%99%E8%84%9A%E6%9C%AC-yellow?style=flat-square&logo=javascript&logoColor=black)](script_override.js)
[![JavaScript Syntax](https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/js-syntax.yml?style=flat-square&label=JS%20Syntax&color=informational)](https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/js-syntax.yml)
[![Template Sync](https://img.shields.io/github/actions/workflow/status/XVSVTsama/mihomo-config-self/template-sync.yml?style=flat-square&label=Template%20Sync&color=informational)](https://github.com/XVSVTsama/mihomo-config-self/actions/workflows/template-sync.yml)

> ⚠️ **避坑指南 & 核心声明**
> 本仓库提供的是一份**高度贴合个人使用习惯**的 Mihomo (原 Clash Meta) [路由配置文件](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml)。
> 它**不是**一份开箱即用的通用傻瓜式模板。如果您不熟悉 Mihomo 的核心机制、TUN 模式、Fake-IP 以及策略组正则表达式（filter），请**谨慎照搬**。抄作业前，请务必阅读下方说明！

## 远程覆写js

[<kbd>Use this template</kbd>](https://github.com/new?template_name=mihomo-config-self&template_owner=XVSVTsama)

> 复制仓库后会自动清理，最终只保留 `mihomo.yaml` 与 `script_override.js`。你的永久配置链接为 `https://raw.githubusercontent.com/<你的用户名>/<你的仓库名>/main/<文件名>`。

   [远程覆写脚本](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js)

   在 Bettbox / FlClash 系客户端中给订阅挂上该脚本即可：
   - 订阅里的真实节点自动填入 `proxies` 与各"单节点"占位策略组（👉 手动切换、♻️ 自动选择、🔄 负载均衡、📲 Telegram、🎮 Games-Global）；
   - 订阅自带的 `proxy-providers` 会被原样保留；
   - 动态合并 DNS 的 `proxy-server-nameserver-policy`（以脚本为准，模板不预置该键）；
   - 可通过脚本顶部 `ruleOptionsEnable` 开关单独禁用策略组，并自动清理相关引用。
   - `FCM直连` 功能开关：默认开启，隐藏组 FCM 仅含 `DIRECT`；关闭后仅保留 `👉 手动切换`（开关只改 FCM 组内节点，不会移除该组）。
   - 脚本首行为 Bettbox 兼容声明（`Compatible_With_Bettbox`）：Bettbox 客户端约定在脚本开头识别该声明（并非全量读取），脚本需遵循此约定，声明必须保持置顶，否则"自定义规则开关"入口不显示。

   脚本内嵌的标准模板与仓库 [mihomo.yaml](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml) 保持同步。

## 推荐学习参考，订阅转换项目与客户端
   [寻找真正可学习的参考?](https://t.me/xvsvts/152)

   强烈建议使用私人订阅转换前后端，杜绝任何互联网公用在线转换，将极大的降低敏感的节点信息泄漏：
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  已测试可用🦜
   
   [Sub-Store](https://github.com/sub-store-org/Sub-Store)  🔥热门🔥

   上述转换搭建太麻烦？还有本地转换🎁
   
   [SubCase](https://github.com/sionnx/SubCase)  app化/Sub-Store支持🍃
   
   [flclash-converter](https://github.com/JINXPIL/flclash-converter)  🟢简单易用🟢/🔴非Flclash项目
附属🔴

   该配置必须使用在原生mihomo内核的非魔改🎭客户端上，否则可以出现未知错误，推荐如
   [Bettbox](https://github.com/appshubcc/Bettbox/releases)的优秀下游GUI

## ✨ 核心特性 (为什么这么配？)

本配置集成了模块化远程规则（Rule Providers）以及精细化的应用层级分流策略，完全为满足我个人的网络环境与使用痛点而生：

* **使用规则TUN**：默认开启 `tun` 模式，采用 `gvisor` 协议栈，实现全设备/全协议接管，解决部分软件不走系统代理的问题。
* **激进的 DNS 解析体验**：采用 `fake-ip` 增强模式。内置基于国内直连与 DoH/DoT 混合的智能 DNS 策略，精准防止 DNS 污染。
* **模块化规则集 (Rule Providers)**：全面拥抱 `mrs` 格式的远程规则集（感谢 [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases)、[MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta)、[echs-top](https://github.com/echs-top/proxy)、[reddishJade](https://github.com/reddishJade/private_proxy) 等维护者），剥离本地规则，实现自动无感更新。
* **强迫症级场景分流**：
    * **🤖 AI 大模型 / ✖️ Twitter / 🎵 TikTok**：独立分流组，并且**硬编码**了正则表达式过滤，强制只使用带有 "美国|住宅" 标识的节点，防止封号或风控。
    * **🎮 游戏**：独立 UDP 代理放行与主流游戏平台路由。
* **高级广告/隐私拦截**：
    * 拦截 WebRTC / 语音 / 实时通信常用的 UDP 端口（3478-3479、5349-5350、19302-19309），防止其绕过分流策略。
    * **SUB-RULE 进程级拦截**：针对特定海外阅读应用（如番茄小说海外版 `com.dragon.read.oversea.gp`）写死了深度的去广告与隐私追踪拦截规则。

## 🗂 分流组结构 (Proxy Groups)

| 策略组名称 | 默认行为 / 触发条件 | 注意事项 |
| :--- | :--- | :--- |
| **🌍 PROXY** | 未命中的所有默认海外流量 | 可选手动、自动或负载均衡 |
| **🔄 负载均衡** | 采用 `sticky-sessions` (粘性会话) 策略 | 保证同一域名短时间内 IP 不变 |
| **👉 手动切换** | 手动选择特定节点 | / |
| **♻️ 自动选择** | `url-test` 自动测试并选择延迟最低的节点 | 容差设置为 50ms |
| **📲 Telegram** | 默认走代理，防止断联 | 匹配进程名与特定 IP 段 |
| **🎮 Games-Global** | 国际服游戏流量 | / |
| **✖️ Twitter** | 仅匹配名称包含 **"美国\|住宅"** 的节点 | 🚨 **节点命名不符将导致此策略组为空！** |
| **🤖 AI大模型** | 仅匹配名称包含 **"美国\|住宅"** 的节点 | 🚨 **节点命名不符将导致此策略组为空！** |
| **🎵 TikTok** | 仅匹配名称包含 **"美国\|住宅"** 的节点 | 🚨 **节点命名不符将导致此策略组为空！** |
| **FCM** | Google FCM 相关域名（`hidden` 隐藏组） | 由 `FCM直连` 开关控制：开启=仅 `DIRECT`，关闭=仅 `👉 手动切换` |

> 注：🔄 负载均衡 / 👉 手动切换 / ♻️ 自动选择 / 📲 Telegram / 🎮 Games-Global 在模板中 `proxies` 为空（注释"此处为所有单节点"），启用覆写脚本后会自动填入订阅的全部节点；不使用脚本时需手动填充。

## 🛠️ 使用前必改 (抄作业必看)

由于这是自用配置，`proxies: ~` 处为空。你必须自己完成以下操作：
1. **注入节点**：推荐直接使用上面的覆写脚本——订阅里的真实节点会自动填入 `proxies` 与各占位策略组，订阅自带的 `proxy-providers` 也会被保留；如果不用脚本，则需要手动把节点列表或 `proxy-providers` 填入本配置（`proxies: ~` 处默认留空）。
2. **修改节点过滤规则 (Filter)**：如果你购买的机场节点名称中没有包含 `美国` 或 `住宅` 的字眼，请务必手动修改配置文件中对应策略组的 `filter` 字段，否则你的 AI、推特和 TikTok 将完全无法联网。
3. **按需删减规则**：如果你不需要屏蔽番茄小说海外版的广告，建议删除 `sub-rules` 中 `fanqie` 相关的规则，以节省性能。

---

## ⚠️⚠️⚠️  宇宙免责声明  ⚠️⚠️⚠️


1. **纯属个人折腾，不提供任何技术支持**：本仓库代码仅作为个人云端备份与配置参考。**不解答基础使用问题，不接受非 BUG 类的 Issue，不保证定期维护与更新。** 如果配置在您的设备上报错，请自行查阅 Mihomo 官方文档排查。
2. **不提供任何网络服务**：本配置纯粹为本地路由规则分发，**绝对不包含、不提供、不售卖**任何形式的科学上网节点、VPN 服务或服务器订阅。
3. **合规与法律责任**：使用者须自行承担使用此配置的所有风险。请严格遵守您所在国家和地区的当地法律法规。对于因使用、修改或传播本仓库内容而导致的任何网络安全问题、隐私泄露、数据丢失或法律纠纷，**仓库作者概不负责**。
4. **功能破坏预警**：配置中包含激进的去广告（如拦截特定域名和 IP）以及 Fake-IP 设置，这极有可能导致部分国内 APP 无法正常加载图片、登录或产生网络连通性问题。如遇网络异常，请优先排查本配置中的 `rules` 与 `fake-ip-filter`。
