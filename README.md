# 🚀 Mihomo (Clash Meta) 配置模板(高度定制自用版)

> ⚠️ **避坑指南 & 核心声明**
> 本仓库提供的是一份**高度贴合个人使用习惯**的 Mihomo (原 Clash Meta) [路由配置文件](https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml)。
> 它**不是**一份开箱即用的通用傻瓜式模板。如果您不熟悉 Mihomo 的核心机制、TUN 模式、Fake-IP 以及策略组正则表达式（filter），请**谨慎照搬**。抄作业前，请务必阅读下方说明！

## 推荐学习参考，订阅转换项目与客户端
   [寻找真正可学习的参考?](https://t.me/xvsvts/152)

   强烈建议使用私人订阅转换前后端，杜绝任何互联网公用在线转换，将极大的降低敏感的节点信息泄漏：
   
   [sublinkpro](https://github.com/ZeroDeng01/sublinkPro)  自用🦜
   
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
* **模块化规则集 (Rule Providers)**：全面拥抱 `mrs` 格式的远程规则集（感谢 [DustinWin](https://github.com/DustinWin/ruleset_geodata/releases)、[MetaCubeX](https://github.com/MetaCubeX/meta-rules-dat/tree/meta) 等维护者），剥离本地规则，实现自动无感更新。
* **强迫症级场景分流**：
    * **🤖 AI 大模型 / ✖️ Twitter / 🎵 TikTok**：独立分流组，并且**硬编码**了正则表达式过滤，强制只使用带有 "美国|住宅" 标识的节点，防止封号或风控。
    * **🎮 游戏**：独立 UDP 代理放行与主流游戏平台路由。
* **高级广告/隐私拦截**：
    * 拦截 UDP 443/3478 等端口，强制 QUIC 流量回退至 TCP。
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

## 🛠️ 使用前必改 (抄作业必看)

由于这是自用配置，`proxies: ~` 处为空。你必须自己完成以下操作：
1. **注入节点**：通过你的客户端（如 Clash Verge Rev 等）将订阅节点通过 `proxy-providers` 注入到本配置中。
2. **修改节点过滤规则 (Filter)**：如果你购买的机场节点名称中没有包含 `美国` 或 `住宅` 的字眼，请务必手动修改配置文件中对应策略组的 `filter` 字段，否则你的 AI、推特和 TikTok 将完全无法联网。
3. **按需删减规则**：如果你不需要屏蔽番茄小说海外版的广告，建议删除 `sub-rules` 中 `fanqie` 相关的规则，以节省性能。

---

## ⚠️⚠️⚠️  宇宙免责声明  ⚠️⚠️⚠️


1. **纯属个人折腾，不提供任何技术支持**：本仓库代码仅作为个人云端备份与配置参考。**不解答基础使用问题，不接受非 BUG 类的 Issue，不保证定期维护与更新。** 如果配置在您的设备上报错，请自行查阅 Mihomo 官方文档排查。
2. **不提供任何网络服务**：本配置纯粹为本地路由规则分发，**绝对不包含、不提供、不售卖**任何形式的科学上网节点、VPN 服务或服务器订阅。
3. **合规与法律责任**：使用者须自行承担使用此配置的所有风险。请严格遵守您所在国家和地区的当地法律法规。对于因使用、修改或传播本仓库内容而导致的任何网络安全问题、隐私泄露、数据丢失或法律纠纷，**仓库作者概不负责**。
4. **功能破坏预警**：配置中包含激进的去广告（如拦截特定域名和 IP）以及 Fake-IP 设置，这极有可能导致部分国内 APP 无法正常加载图片、登录或产生网络连通性问题。如遇网络异常，请优先排查本配置中的 `rules` 与 `fake-ip-filter`。
