// Bettbox 兼容声明：Bettbox 客户端的预期行为是在脚本开头识别该声明（并非全量读取），
// 脚本需遵循此约定：声明必须置顶，删除或下移会导致"自定义规则开关"入口不显示。
const Compatible_With_Bettbox = {
  ruleOptionsEnable: true
};
/**
 * ============================================================================
 *  Bettbox（FlClash 系内核 / mihomo 下游客户端）JS 覆写脚本
 * ============================================================================
 *
 *  来源：
 *    JS 脚本：
 *    https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
 *    模板：
 *    https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml
 *    仓库：
 *    https://github.com/XVSVTsama/mihomo-config-self
 *    作者：
 *    https://github.com/XVSVTsama
 *    最新内容（GitHub 提交）：
 *    https://github.com/XVSVTsama/mihomo-config-self/commits/main/script_override.js
 *    用法：本脚本可直接作为 Bettbox / FlClash 系客户端的远程覆写脚本加载
 *         （文件首行为 Bettbox 兼容声明，请勿删除）。
 *
 *  用途：
 *    把当前订阅（原始配置）与本仓库维护的"标准模板"（mihomo.yaml）合并成最终生效配置。
 *
 *  合并规则：
 *    1. 除下面第 2、3、4 条特别说明的部分外，最终配置以 TEMPLATE
 *       （对应 mihomo.yaml 模板）为准，即模板中已经写好的字段会替换掉订阅原始配置里
 *       的同名字段（例如 dns 的各项细节、rules、rule-providers、sniffer、
 *       tun、proxy-groups 的分组结构等）。订阅原始配置里模板未定义的顶层字段不会被保留
 *       （比如某些订阅自带的 allow-lan、bind-address），唯一的例外是 proxy-providers：
 *       若订阅自带 proxy-providers，会原样保留并注入最终配置。
 *
 *    2. proxies：使用订阅原始配置里的真实节点列表（模板里这一项本来就是空的，
 *       只是占位）。
 *
 *    3. proxy-groups 里，模板中显式写了 "proxies: " （值为空/null，也就是
 *       模板注释里"此处为所有单节点"的那几个分组：👉 手动切换、♻️ 自动选择、
 *       🔄 负载均衡、📲 Telegram、🎮 Games-Global）会自动填入订阅里全部节点
 *       的名字；若订阅还带 proxy-providers，这些分组会同时写入 use 引用全部
 *       provider。其余分组保持模板里原样，不会被订阅节点覆盖或补充。
 *
 *    4.【特别处理】DNS 与 hosts：
 *       - hosts 仅在 dns.use-hosts=true 且 dns.listen 与真正参与节点解析的 DNS 端点
 *         构成闭环时改写节点 server，与 policy 匹配无关；
 *       - 节点 DNS 优先级：proxy-server-nameserver-policy > proxy-server-nameserver
 *         （仅私有） > nameserver-policy > nameserver（仅私有）；
 *       - 公共 DNS 只用于识别私有 DNS，避免公共 DNS 进入节点解析；
 *       - 模板全局 proxy-server-nameserver 始终保留，作为最终兜底；
 *       相同 key 冲突时按 NAMESERVER_POLICY_PREFER_ORIGINAL 决定优先级。
 *
 *  使用方法（Bettbox / FlClash 系客户端通用）：
 *    配置 → 对应订阅右上角"..." → 编辑覆写脚本（或"打开脚本"）→ 新建脚本，
 *    把本文件全部内容粘贴进去保存，然后在该订阅上启用这个脚本即可。
 * ============================================================================
 */


const ruleOptionsEnable = {

  /**
 * 自定义配置选项
 * 为模板里的每个代理组（策略组）单独定义开关：
 * true  = 启用该策略组
 * false = 禁用该策略组（会自动从 proxy-groups 中移除，并清理其他组中的引用）
 * 另有功能开关（如 FCM直连）：只调整组内节点，不涉及策略组启停。
 */

  // --- 代理组（策略组）单独控制开关 ---
  '🌍 PROXY': true,        // 主代理策略组
  '🔄 负载均衡': true,     // 负载均衡策略组
  '👉 手动切换': true,    // 手动选择策略组
  '♻️ 自动选择': true,     // 延迟自动选择策略组
  '📲 Telegram': true,     // Telegram 通讯软件策略组
  '🎮 Games-Global': true, // 游戏策略组
  '✖️ Twitter': true,      // Twitter 社交平台策略组
  '🤖 AI大模型': true,     // AI 大模型策略组
  '🎵 TikTok': true,       // TikTok 视频平台策略组

  // --- 节点与网络功能开关 ---
  '强制证书验证': false,   // 开启时统一把订阅节点 skip-cert-verify 置为 false（强制校验证书）；关闭时不干预，保留订阅节点原有设置。对全部节点一视同仁
  '启用 Reality 增强': true, // 是否为带非空 public-key/short-id 的 Reality 节点启用 support-x25519mlkem768（X25519MLKEM768 后量子密钥协商）
  'FCM直连': true,          // 默认打开：隐藏组 FCM 仅含 DIRECT；关闭后仅保留 👉 手动切换（不移除 FCM 组）。开关图标取自 FCM 代理组的 icon 字段。
};

// 出现同一个域名规则 key 时，订阅原始配置(true) 还是模板(false) 优先（模板目前未配置
// proxy-server-nameserver-policy，因此该开关当前实际只影响订阅来源之间的合并）
const NAMESERVER_POLICY_PREFER_ORIGINAL = true;

// ============================================================================
// 标准模板配置（与仓库 mihomo.yaml 保持同步，等价于该 yaml 文件的 JSON 表示）
// ============================================================================
const TEMPLATE = {
  "dns": {
    "default-nameserver": [
      "tls://223.5.5.5#DIRECT",
      "tls://223.6.6.6#DIRECT"
    ],
    "direct-nameserver": [
      "https://dns.alidns.com/dns-query#DIRECT",
      "https://doh.pub/dns-query#DIRECT"
    ],
    "direct-nameserver-follow-policy": true,
    "enable": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-filter": [
      "rule-set:fakeip-filter_domain",
      "rule-set:private",
      "rule-set:direct",
      "rule-set:cn",
      "rule-set:echs_cn",
      "rule-set:echs_direct",
      "rule-set:applications",
      "rule-set:pixiv",
      "pixshaft.com"
    ],
    "fake-ip-filter-mode": "blacklist",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-range6": "fdfe:dcba:9876::1/64",
    "ipv6": true,
    "listen": "0.0.0.0:1053",
    "nameserver": [
      "https://cloudflare-dns.com/dns-query#👉 手动切换"
    ],
    "nameserver-policy": {
      "rule-set:private,direct,proxy@direct,cn,echs_cn,echs_direct": "https://dns.alidns.com/dns-query#DIRECT"
    },
    "prefer-h3": false,
    "proxy-server-nameserver": [
      "https://hrbgyitz34.cloudflare-gateway.com/dns-query#DIRECT"
    ],
    "respect-rules": false,
    "use-hosts": true,
    "use-system-hosts": false
  },
  "etag-support": true,
  "external-controller": "127.0.0.1:9090",
  "external-ui": "dashboard",
  "global-ua": "clash.meta",
  "hosts": {
    "*.pangolin-sdk-toutiao": "0.0.0.0",
    "*.pangolin-sdk-toutiao.*": "0.0.0.0",
    "*.pglstatp-toutiao.com": "0.0.0.0",
    "*.pglstatp-toutiao.com.*": "0.0.0.0",
    "*.pstatp.com": "0.0.0.0",
    "*.pstatp.com.*": "0.0.0.0",
    "*default.ixigua.com": "0.0.0.0",
    "+.clash.dev": [
      "127.0.0.1"
    ],
    "+.mcdn.bilivideo.cn": [
      "0.0.0.0"
    ],
    "+.mcdn.bilivideo.com": [
      "0.0.0.0"
    ],
    "dns.msftncsi.com": [
      "131.107.255.255",
      "fd3e:4f5a:5b81::1"
    ],
    "gurd.snssdk.com": "0.0.0.0",
    "gurd.snssdk.com.*": "0.0.0.0",
    "mtalk.google.com": [
      "142.250.107.188",
      "108.177.125.188"
    ],
    "services.googleapis.cn": [
      "services.googleapis.com"
    ]
  },
  "ipv6": true,
  "keep-alive-idle": 600,
  "keep-alive-interval": 15,
  "log-level": "info",
  "mixed-port": 7254,
  "mode": "rule",
  "ntp": {
    "enable": true,
    "port": 123,
    "server": "time.apple.com",
    "write-to-system": false
  },
  "port": 7249,
  "proxies": null,
  "proxy-groups": [
    {
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/proxy.png",
      "name": "🌍 PROXY",
      "proxies": [
        "👉 手动切换",
        "♻️ 自动选择",
        "🔄 负载均衡",
        "DIRECT"
      ],
      "type": "select"
    },
    {
      "icon": "https://www.clashverge.dev/assets/icons/balance.svg",
      "interval": 300,
      "lazy": true,
      "name": "🔄 负载均衡",
      "proxies": null,
      "strategy": "sticky-sessions",
      "type": "load-balance",
      "url": "https://www.gstatic.com/generate_204"
    },
    {
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/select.png",
      "name": "👉 手动切换",
      "proxies": null,
      "type": "select"
    },
    {
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/auto.png",
      "interval": 300,
      "name": "♻️ 自动选择",
      "proxies": null,
      "tolerance": 50,
      "type": "url-test",
      "url": "https://www.gstatic.com/generate_204"
    },
    {
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/telegram.png",
      "name": "📲 Telegram",
      "proxies": null,
      "type": "select"
    },
    {
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/games-cn.png",
      "name": "🎮 Games-Global",
      "proxies": null,
      "type": "select"
    },
    {
      "filter": "美国|住宅",
      "icon": "https://www.clashverge.dev/assets/icons/twitter.svg",
      "include-all-proxies": true,
      "name": "✖️ Twitter",
      "type": "select"
    },
    {
      "filter": "美国|住宅",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/ai.png",
      "include-all-proxies": true,
      "name": "🤖 AI大模型",
      "type": "select"
    },
    {
      "filter": "美国|住宅",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/tiktok.png",
      "include-all-proxies": true,
      "name": "🎵 TikTok",
      "type": "select"
    },
    {
      "hidden": true,
      "icon": "https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/fcm.png",
      "name": "FCM",
      "proxies": [
        "👉 手动切换",
        "DIRECT"
      ],
      "type": "select"
    }
  ],
  "rule-providers": {
    "Gemini_Domain": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/Gemini_Domain.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@master/Gemini/Gemini_Domain.yaml"
    },
    "Grok_Domain": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/Grok_Domain.yaml",
      "type": "http",
      "url": "https://raw.githubusercontent.com/Accademia/Additional_Rule_For_Clash/refs/heads/main/Grok/Grok_Domain.yaml"
    },
    "HijackingPlus": {
      "behavior": "classical",
      "interval": 86400,
      "path": "./ruleset/HijackingPlus.yaml",
      "type": "http",
      "url": "https://raw.githubusercontent.com/Accademia/Additional_Rule_For_Clash/refs/heads/main/HijackingPlus/HijackingPlus_No_Resolve.yaml"
    },
    "TikTok": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/tiktok.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/tiktok.mrs"
    },
    "ai-1": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/ai-1.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/ai.mrs"
    },
    "ai-2": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/ai-2.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ai-!cn.mrs"
    },
    "apple": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/apple.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt"
    },
    "applications": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/applications.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt"
    },
    "cn": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/cn.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/cn.mrs"
    },
    "cncidr": {
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/cncidr.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/cnip.mrs"
    },
    "direct": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/direct.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt"
    },
    "echs_cn": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/echs_cn.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/domain/cn.mrs"
    },
    "echs_cn_ip": {
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/echs_cn_ip.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/ip/cn.mrs"
    },
    "echs_direct": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/echs_direct.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/domain/direct.mrs"
    },
    "echs_direct_ip": {
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/echs_direct_ip.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/ip/direct.mrs"
    },
    "fakeip-filter_domain": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/fakeip-filter_domain.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/fakeip-filter.mrs"
    },
    "games": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/games.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/games.mrs"
    },
    "games-cn": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/games-cn.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/games-cn.mrs"
    },
    "gfw": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/gfw.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/gfw.mrs"
    },
    "google": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/google.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt"
    },
    "google-cn": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/google-cn.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/google-cn.mrs"
    },
    "googlefcm": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/googlefcm.mrs",
      "type": "http",
      "url": "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/googlefcm.mrs"
    },
    "icloud": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/icloud.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt"
    },
    "lancidr": {
      "behavior": "ipcidr",
      "interval": 86400,
      "path": "./ruleset/lancidr.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt"
    },
    "pixiv": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/pixiv.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/pixiv.mrs"
    },
    "private": {
      "behavior": "domain",
      "interval": 86400,
      "path": "./ruleset/private.yaml",
      "type": "http",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt"
    },
    "proxy": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/proxy.mrs",
      "type": "http",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/proxy.mrs"
    },
    "proxy@direct": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./rules/proxy@direct.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/domain/proxy@direct.mrs"
    },
    "telegram_domain": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./rules/telegram_domain.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs"
    },
    "telegramcidr": {
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/telegramcidr.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/reddishJade/private_proxy/main/Mihomo/Provider/telegram%40ip.mrs"
    },
    "twitter-x-blackmatrix7-No_Resolve": {
      "behavior": "classical",
      "format": "yaml",
      "interval": 86400,
      "path": "./ruleset/twitter-x-blackmartix7-noreslove.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Twitter/Twitter_No_Resolve.yaml"
    },
    "twitter-x-domain": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/twitter/x-domain.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs"
    },
    "twitter-x-ip": {
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "path": "./ruleset/twitter/x-ip.mrs",
      "type": "http",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/twitter.mrs"
    }
  },
  "rules": [
    "AND,((NETWORK,UDP),(DST-PORT,3478-3479/5349-5350/19302-19309),(NOT,((RULE-SET,direct))),(NOT,((RULE-SET,cncidr))),(NOT,((RULE-SET,cn))),(NOT,((RULE-SET,applications))),(NOT,((RULE-SET,games))),(NOT,((RULE-SET,games-cn)))),REJECT",
    "RULE-SET,HijackingPlus,REJECT",
    "SUB-RULE,(PROCESS-NAME,com.dragon.read.oversea.gp),fanqie",
    "RULE-SET,applications,DIRECT",
    "RULE-SET,echs_cn,DIRECT",
    "RULE-SET,echs_cn_ip,DIRECT,no-resolve",
    "RULE-SET,echs_direct,DIRECT",
    "RULE-SET,echs_direct_ip,DIRECT,no-resolve",
    "RULE-SET,cn,DIRECT",
    "RULE-SET,cncidr,DIRECT,no-resolve",
    "RULE-SET,googlefcm,FCM",
    "DOMAIN,clash.razord.top,DIRECT",
    "DOMAIN,yacd.haishan.me,DIRECT",
    "PROCESS-NAME,svchost.exe,DIRECT",
    "RULE-SET,proxy@direct,🌍 PROXY",
    "RULE-SET,private,DIRECT,no-resolve",
    "RULE-SET,lancidr,DIRECT,no-resolve",
    "DOMAIN-WILDCARD,*.deepseek.com,DIRECT",
    "DOMAIN-WILDCARD,*.portal101.cn,DIRECT",
    "DOMAIN-SUFFIX,cdnhwcqwg14.com,DIRECT",
    "DOMAIN-SUFFIX,cdnhwcxcy07.com,DIRECT",
    "DOMAIN-SUFFIX,cdngslb.com,DIRECT",
    "DOMAIN-SUFFIX,edgekey.net,DIRECT",
    "DOMAIN-SUFFIX,cloudfront.net,DIRECT",
    "PROCESS-NAME-REGEX,.*nagram.*,📲 Telegram",
    "PROCESS-NAME-REGEX,.*telegram.*,📲 Telegram",
    "RULE-SET,telegramcidr,📲 Telegram,no-resolve",
    "RULE-SET,telegram_domain,📲 Telegram",
    "DOMAIN-SUFFIX,sentry.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,statsigapi.net,🤖 AI大模型",
    "DOMAIN,browser-intake-us5-datadoghq.com,🤖 AI大模型",
    "DOMAIN-KEYWORD,datadog,🤖 AI大模型",
    "DOMAIN,cdn.usefathom.com,🤖 AI大模型",
    "RULE-SET,Gemini_Domain,🤖 AI大模型",
    "RULE-SET,Grok_Domain,🤖 AI大模型",
    "IP-CIDR,17.253.4.0/23,🤖 AI大模型,no-resolve",
    "DOMAIN,anthropic.com.cdn.cloudflare.net,🤖 AI大模型",
    "DOMAIN,anthropic-com.ghost.io,🤖 AI大模型",
    "DOMAIN-KEYWORD,sift,🤖 AI大模型",
    "IP-CIDR,160.79.104.0/21,🤖 AI大模型,no-resolve",
    "IP-CIDR6,2607:6bc0::/32,🤖 AI大模型,no-resolve",
    "RULE-SET,ai-1,🤖 AI大模型",
    "RULE-SET,ai-2,🤖 AI大模型",
    "RULE-SET,google,🌍 PROXY",
    "RULE-SET,google-cn,🌍 PROXY",
    "RULE-SET,direct,DIRECT",
    "PROCESS-NAME-REGEX,.*twitter.*,✖️ Twitter",
    "RULE-SET,twitter-x-domain,✖️ Twitter",
    "RULE-SET,twitter-x-ip,✖️ Twitter,no-resolve",
    "RULE-SET,twitter-x-blackmatrix7-No_Resolve,✖️ Twitter",
    "RULE-SET,icloud,DIRECT",
    "RULE-SET,apple,DIRECT",
    "RULE-SET,games-cn,DIRECT",
    "PROCESS-NAME,bf6.exe,🎮 Games-Global",
    "RULE-SET,games,🎮 Games-Global",
    "RULE-SET,TikTok,🎵 TikTok",
    "RULE-SET,proxy,🌍 PROXY",
    "RULE-SET,gfw,🌍 PROXY",
    "MATCH,🌍 PROXY"
  ],
  "sniffer": {
    "enable": true,
    "force-dns-mapping": true,
    "force-domain": [
      "+.v2ex.com"
    ],
    "override-destination": true,
    "parse-pure-ip": true,
    "skip-domain": [
      "Mijia Cloud",
      "dlg.io.mi.com",
      "+.apple.com",
      "+.icloud.com",
      "+.wechat.com",
      "+.qpic.cn",
      "+.qq.com",
      "+.wechatapp.com",
      "+.vivox.com",
      "+.oray.com",
      "+.sunlogin.net"
    ],
    "skip-dst-address": [
      "rule-set:telegramcidr",
      "rule-set:twitter-x-ip",
      "rule-set:lancidr",
      "rule-set:cncidr",
  // --- 1. Google Public DNS ---
      "8.8.8.8/32",
      "8.8.4.4/32",
      "2001:4860:4860::8888/128",
      "2001:4860:4860::8844/128",

  // --- 2. Cloudflare Public DNS ---
      "1.1.1.1/32",
      "1.0.0.1/32",
      "2606:4700:4700::1111/128",
      "2606:4700:4700::1001/128",

  // --- 3. Quad9 Public DNS (安全过滤) ---
      "9.9.9.9/32",
      "149.112.112.112/32",
      "2620:fe::fe/128",

  // --- 4. OpenDNS (Cisco) ---
      "208.67.222.222/32",
      "208.67.220.220/32",
      "2620:119:35::35/128",

  // --- 5. AdGuard DNS (去广告) ---
      "94.140.14.14/32",
      "94.140.15.15/32",
      "2a10:50c0::ad1:ff/128",
      "2a10:50c0::ad2:ff/128",

  // --- 6. CleanBrowsing (安全/成人内容拦截) ---
      "185.228.168.9/32",
      "185.228.169.9/32",

  // --- 7. Verisign Public DNS ---
      "64.6.64.6/32",
      "64.6.65.6/32",

  // --- 8. Yandex DNS ---
      "77.88.8.8/32",
      "77.88.8.1/32",

  // --- 9. DNS.SB ---
      "185.222.222.222/32",
      "45.11.45.11/32",

  // --- 10. 阿里 DNS (AliDNS) ---
      "223.5.5.5/32",
      "223.6.6.6/32",
      "2400:3200::1/128",
      "2400:3200:baba::1/128",
    
  // --- 11. 腾讯 DNS (DNSPod) ---
      "119.29.29.29/32",
      "182.254.116.116/32",

  // --- 12. 百度 DNS ---
      "180.76.76.76/32",

  // --- 13. 114DNS (常规与安全版) ---
      "114.114.114.114/32",
      "114.114.115.115/32",
      "114.114.114.119/32",
      "114.114.115.119/32",

  // --- 14. CNNIC SDNS ---
      "1.2.4.8/32",
      "210.2.4.8/32",

  // --- 15. 360 安全 DNS (DNS派) ---
       "101.226.4.6/32",
      "218.30.118.6/32"
    ],
    "sniff": {
      "HTTP": {
        "ports": [
          80,
          "8080-8880"
        ]
      },
      "QUIC": {
        "ports": [
          443,
          8443
        ]
      },
      "TLS": {
        "ports": [
          443,
          8443
        ]
      }
    }
  },
  "socks-port": 7346,
  "store-fake-ip": true,
  "store-selected": true,
  "sub-rules": {
    "fanqie": [
      "DOMAIN,p6-ad-sign.byteimg.com,REJECT",
      "DOMAIN,p9-ad-sign.byteimg.com,REJECT",
      "DOMAIN,i.snssdk.com,REJECT",
      "DOMAIN,i-lq.snssdk.com,REJECT",
      "DOMAIN,dig.bdurl.net,REJECT",
      "DOMAIN-KEYWORD,zijieapi,REJECT",
      "DOMAIN,activity-ag.awemeughun.com,REJECT",
      "DOMAIN,mcs.snssdk.com,REJECT",
      "DOMAIN,tnc3-alisc1.snssdk.com,REJECT",
      "DOMAIN,security-lq.snssdk.com,REJECT",
      "DOMAIN,tnc3-aliec2.snssdk.com,REJECT",
      "DOMAIN,is.snssdk.com,REJECT",
      "DOMAIN,v6-novelapp.ixigua.com,REJECT",
      "DOMAIN-WILDCARD,*novelapp.ixigua.com,REJECT",
      "DOMAIN-WILDCARD,*default.ixigua.com,REJECT",
      "DOMAIN,msync-im1-vip6-std.easemob.com,REJECT",
      "DOMAIN,apd-pcdnwxlogin.teg.tencent-cloud.net,REJECT",
      "DOMAIN,api.iegadp.qq.com,REJECT",
      "DOMAIN,sf3-ttcdn-tos.pstatp.com,REJECT",
      "DOMAIN-SUFFIX,pglstatp-toutiao.com,REJECT",
      "DOMAIN-SUFFIX,byteorge.com,REJECT",
      "DOMAIN-SUFFIX,bytegoofy.com,REJECT",
      "DOMAIN-SUFFIX,bytedance.com,REJECT",
      "IP-CIDR,49.71.37.101/32,REJECT,no-resolve",
      "IP-CIDR,117.71.105.23/32,REJECT,no-resolve",
      "IP-CIDR,218.94.207.205/32,REJECT,no-resolve",
      "IP-CIDR,117.92.229.188/32,REJECT,no-resolve",
      "IP-CIDR,101.36.166.16/32,REJECT,no-resolve",
      "IP-CIDR,180.96.2.114/32,REJECT,no-resolve",
      "DOMAIN-WILDCARD,*.pangolin-sdk-toutiao.com,REJECT",
      "DOMAIN-WILDCARD,*.pglstatp-toutiao.com,REJECT",
      "DOMAIN-WILDCARD,*.pstatp.com,REJECT",
      "DOMAIN,gurd.snssdk.com,REJECT",
      "DOMAIN-WILDCARD,*.byteimg.com,REJECT",
      "DOMAIN-WILDCARD,*.snssdk.com,REJECT",
      "DOMAIN-WILDCARD,*.pangolin-sdk-toutiao,REJECT",
      "DOMAIN-WILDCARD,*.pangolin-sdk-toutiao.*,REJECT",
      "DOMAIN-WILDCARD,*.pstatp.com.*,REJECT",
      "DOMAIN-WILDCARD,*.pglstatp-toutiao.com.*,REJECT",
      "DOMAIN-WILDCARD,gurd.snssdk.com.*,REJECT",
      "MATCH,DIRECT"
    ]
  },
  "tcp-concurrent": true,
  "tun": {
    "auto-detect-interface": true,
    "auto-redirect": true,
    "auto-route": true,
    "device": "XVSVT",
    "dns-hijack": [
      "any:53",
      "udp://any:53",
      "tcp://any:53"
    ],
    "enable": true,
    "route-address": [
      "198.51.100.0/30",
      "1.0.0.0/8",
      "2.0.0.0/7",
      "4.0.0.0/6",
      "8.0.0.0/7",
      "11.0.0.0/8",
      "12.0.0.0/6",
      "16.0.0.0/4",
      "32.0.0.0/3",
      "64.0.0.0/3",
      "96.0.0.0/4",
      "112.0.0.0/5",
      "120.0.0.0/6",
      "124.0.0.0/7",
      "126.0.0.0/8",
      "128.0.0.0/3",
      "160.0.0.0/5",
      "168.0.0.0/8",
      "169.0.0.0/9",
      "169.128.0.0/10",
      "169.192.0.0/11",
      "169.224.0.0/12",
      "169.240.0.0/13",
      "169.248.0.0/14",
      "169.252.0.0/15",
      "169.255.0.0/16",
      "170.0.0.0/7",
      "172.0.0.0/12",
      "172.32.0.0/11",
      "172.64.0.0/10",
      "172.128.0.0/9",
      "173.0.0.0/8",
      "174.0.0.0/7",
      "176.0.0.0/4",
      "192.0.0.0/9",
      "192.128.0.0/11",
      "192.160.0.0/13",
      "192.169.0.0/16",
      "192.170.0.0/15",
      "192.172.0.0/14",
      "192.176.0.0/12",
      "192.192.0.0/10",
      "193.0.0.0/8",
      "194.0.0.0/7",
      "196.0.0.0/6",
      "200.0.0.0/5",
      "208.0.0.0/4"
    ],
    "stack": "gvisor",
    "strict-route": true
  },
  "unified-delay": true
};

// Bettbox 的可视化开关图标：客户端会读取全局 serviceConfigs（name 对应 ruleOptionsEnable 的 key，
// icon 为该开关行显示的图标）。上面只覆盖代理组；功能开关的图标来源：
// FCM直连 从 FCM 代理组的 icon 字段派生（改代理组 icon 一处即可同步）；
// 其余功能开关（强制证书验证、启用 Reality 增强）在此直接指定固定图标。
const serviceConfigs = TEMPLATE['proxy-groups']
  .filter(
    (group) =>
      group &&
      typeof group.name === 'string' &&
      Object.prototype.hasOwnProperty.call(ruleOptionsEnable, group.name)
  )
  .map((group) => ({
    name: group.name,
    icon: group.icon
  }))
  .concat([
    {
      name: 'FCM直连',
      icon: (TEMPLATE['proxy-groups'].find((group) => group && group.name === 'FCM') || {}).icon
    },
    {
      name: '强制证书验证',
      icon: 'https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/SSL.png'
    },
    {
      name: '启用 Reality 增强',
      icon: 'https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/Spark.png'
    }
  ]);

  
// ============================================================================
// 工具函数
// ============================================================================

// 深拷贝：避免多次调用 main() 时互相污染同一份 TEMPLATE
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// 判断是否是模板里"此处为所有单节点"的占位分组：
// 显式写了 proxies 字段、且取值为 null，例如：
//   - name: 👉 手动切换
//     proxies:
//     type: select
function isAllNodesPlaceholder(group) {
  return !!group && ('proxies' in group) && group.proxies === null;
}

// =====================================================
// DNS 节点域名智能补充逻辑
// =====================================================

// 判断 server 是否为 IP
function isIPAddress(host) {
  if (!host || typeof host !== "string") {
    return true;
  }

  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return true;
  }

  // IPv6
  if (host.includes(":")) {
    return true;
  }

  return false;
}

function normalizeDomain(domain) {
  return typeof domain === "string"
    ? domain.trim().toLowerCase().replace(/\.+$/, "")
    : "";
}

// 通配符域名匹配
function matchWildcardDomain(rule, host) {
  rule = normalizeDomain(rule);
  host = normalizeDomain(host);

  if (!rule || !host) {
    return false;
  }

  // +.example.com
  if (rule.startsWith("+.")) {
    const suffix = rule.substring(2);
    return (
      host === suffix ||
      host.endsWith("." + suffix)
    );
  }

  // .example.com
  if (rule.startsWith(".")) {
    const suffix = rule.substring(1);
    return host.endsWith("." + suffix);
  }

  // * 通配符
  if (rule.includes("*")) {
    const ruleParts = rule.split(".");
    const hostParts = host.split(".");

    return (
      ruleParts.length === hostParts.length &&
      ruleParts.every((part, index) =>
        part === "*" || part === hostParts[index]
      )
    );
  }

  // 普通域名
  return host === rule;
}

function asNameserverList(nameservers) {
  if (Array.isArray(nameservers)) {
    return nameservers.filter(value => typeof value === "string");
  }

  return typeof nameservers === "string" ? [nameservers] : [];
} 
// 比较两个 nameserver 列表是否等价（忽略顺序与重复，按集合比较）
function sameNameserverSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && Array.from(sa).every((value) => sb.has(value));
}

// 公共 DNS 识别表：用于区分“公共可直连 DNS”和“机场/用户的私有 DNS”。
// 数据参考本地 MyClash 仓库里的公共 DNS 列表，但这里只借用识别表，不照搬其处理逻辑。
const publicDnsList = [
  // 国内
  '223.5.5.5', '223.6.6.6', '119.29.29.29', '1.12.12.12',
  '120.53.53.53', '114.114.114.114', '180.76.76.76', '1.2.4.8',
  '116.116.116.116', '101.226.4.6', '123.125.81.6', '180.184.1.1',
  '180.184.2.2',
  // 国外
  '1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4', '9.9.9.9',
  '149.112.112.112', '208.67.222.222', '208.67.220.220',
  '94.140.14.14', '94.140.15.15', '76.76.2.0', '76.76.10.0',
  '185.228.168.9', '185.228.169.9', '77.88.8.8', '77.88.8.1',
  '156.154.70.1', '156.154.71.1', '127.0.0.1',
  // 域名关键词
  'alidns', 'doh.pub', 'dot.pub', 'dns.pub', 'dnspod', 'dns.baidu',
  'dns.google', 'cloudflare', 'quad9', 'opendns', 'nextdns', 'adguard',
  'system'
];

function dnsServerAddress(value) {
  const str = String(value);
  const hashIndex = str.indexOf('#');
  return (hashIndex === -1 ? str : str.slice(0, hashIndex)).toLowerCase();
}

function isPublicDnsServer(value) {
  const address = dnsServerAddress(value);
  return publicDnsList.some((dns) => address.includes(dns.toLowerCase()));
}

function dnsServerEndpoint(value) {
  let endpoint = dnsServerAddress(value);
  const schemeIndex = endpoint.indexOf('://');
  if (schemeIndex !== -1) {
    endpoint = endpoint.slice(schemeIndex + 3);
  }
  const slashIndex = endpoint.indexOf('/');
  if (slashIndex !== -1) {
    endpoint = endpoint.slice(0, slashIndex);
  }
  return endpoint;
}

function hasDnsListenLoop(dns) {
  if (!dns || typeof dns !== "object") {
    return false;
  }
  const listen = dnsServerEndpoint(dns.listen);
  if (!listen) {
    return false;
  }

  const policyValues = (policy) => {
    if (!policy || typeof policy !== "object") {
      return [];
    }
    return Object.values(policy).flatMap((value) =>
      Array.isArray(value) ? value : [value]
    ).filter((value) => typeof value === "string");
  };

  const candidates = [
    policyValues(dns["proxy-server-nameserver-policy"]),
    asNameserverList(dns["proxy-server-nameserver"]),
    policyValues(dns["nameserver-policy"]),
    asNameserverList(dns.nameserver)
  ];

  // Check the actual participating source by priority:
  // proxy-server-nameserver-policy > proxy-server-nameserver > nameserver-policy > nameserver.
  for (const group of candidates) {
    if (group.length > 0) {
      return group.some((nameserver) => dnsServerEndpoint(nameserver) === listen);
    }
  }
  return false;
}

// 从原始配置中提取 DNS 合并来源。
function collectDnsRules(config) {
  const result = {
    nameservers: [],
    nameserverPolicy: {},
    proxyServerNameservers: [],
    proxyServerNameserverPolicy: {},
    hosts: {}
  };

  const dns = config && config.dns;

  if (!dns || typeof dns !== "object") {
    return result;
  }

  result.nameservers = asNameserverList(dns.nameserver);

  if (
    dns["nameserver-policy"] &&
    typeof dns["nameserver-policy"] === "object"
  ) {
    Object.assign(result.nameserverPolicy, dns["nameserver-policy"]);
  }

  result.proxyServerNameservers = asNameserverList(
    dns["proxy-server-nameserver"]
  );

  if (
    dns["proxy-server-nameserver-policy"] &&
    typeof dns["proxy-server-nameserver-policy"] === "object"
  ) {
    Object.assign(result.proxyServerNameserverPolicy, dns["proxy-server-nameserver-policy"]);
  }

  // hosts 只有在 use-hosts=true 且 DNS 监听形成闭环时才参与节点 server 改写
  if (
    dns["use-hosts"] === true &&
    hasDnsListenLoop(dns) &&
    config.hosts &&
    typeof config.hosts === "object"
  ) {
    Object.assign(result.hosts, config.hosts);
  }

  return result;
}

// 解析 hosts 多级映射链：目标仍是域名时逐级跟随，直到终点为 IP、无更多映射或成环
function resolveHostsChain(startDomain, hosts) {
  const chain = [];
  const visited = new Set();
  let current = normalizeDomain(startDomain);

  while (current && !visited.has(current)) {
    visited.add(current);

    let rule = null;
    let value = "";
    for (const candidate in hosts) {
      if (matchWildcardDomain(candidate, current)) {
        const mapped = hosts[candidate];
        const first = Array.isArray(mapped) ? mapped[0] : mapped;
        value = typeof first === "string" ? first.trim() : "";
        rule = candidate;
        break;
      }
    }

    if (!rule) {
      return { target: current, chain, type: "domain" };
    }

    chain.push(rule);

    if (!value || isIPAddress(value)) {
      return { target: value, chain, type: "ip" };
    }

    current = value;
  }

  return { target: "", chain, type: "cycle" };
}

// 根据节点域名补充 DNS
function smartMergeDnsNode(config, result) {
  const rules = collectDnsRules(config);
  const newPolicy = result.dns["proxy-server-nameserver-policy"] || {};
  const newHosts = result.hosts || {};
  const proxies = Array.isArray(config.proxies) ? config.proxies : [];

  const originalDomains = new Set();
  for (const proxy of proxies) {
    if (!proxy || typeof proxy !== "object") {
      continue;
    }
    const server = proxy.server;
    if (typeof server !== "string" || isIPAddress(server)) {
      continue;
    }
    const domain = normalizeDomain(server);
    if (domain) {
      originalDomains.add(domain);
    }
  }

  // hosts first: rewrite proxy.server before matching DNS policy.
  // Some subscriptions use proxy-server-nameserver: udp://127.0.0.1:xxx with hosts
  // inside a local mihomo DNS module; rewriting proxy.server from hosts avoids it.
  for (const proxy of proxies) {
    if (!proxy || typeof proxy !== "object") {
      continue;
    }
    const server = proxy.server;
    if (typeof server !== "string" || isIPAddress(server)) {
      continue;
    }
    const domain = normalizeDomain(server);
    if (!domain) {
      continue;
    }

    for (const rule in rules.hosts) {
      if (!matchWildcardDomain(rule, domain)) {
        continue;
      }
      const mapped = rules.hosts[rule];
      const value = Array.isArray(mapped) ? mapped[0] : mapped;
      const target = typeof value === "string" ? value.trim() : "";

      if (!target) {
        newHosts[rule] = rules.hosts[rule];
        continue;
      }

      if (isIPAddress(target)) {
        proxy.server = target;
        break;
      }

      const resolved = resolveHostsChain(target, rules.hosts);
      if (!resolved || resolved.type === "cycle") {
        continue;
      }

      proxy.server = resolved.target;
      break;
    }
  }

  // hosts rewrite is independent from policy matching: policy keys are matched
  // against the subscription's original node domains only.
  const matchesAnyNodeDomain = (rule) => {
    for (const domain of originalDomains) {
      if (matchWildcardDomain(rule, domain)) {
        return true;
      }
    }
    return false;
  };

  const setPolicy = (rule, value) => {
    if (
      NAMESERVER_POLICY_PREFER_ORIGINAL ||
      !Object.prototype.hasOwnProperty.call(newPolicy, rule)
    ) {
      newPolicy[rule] = value;
    }
  };

  const domainCovered = (domain) => {
    for (const rule of Object.keys(newPolicy)) {
      if (matchWildcardDomain(rule, domain)) {
        return true;
      }
    }
    return false;
  };

  // Priority: proxy-server-nameserver-policy > proxy-server-nameserver (private)
  //           > nameserver-policy > nameserver (private).
  const matchedProxyPolicyKeys = new Set();
  for (const rule in rules.proxyServerNameserverPolicy) {
    if (matchesAnyNodeDomain(rule)) {
      setPolicy(rule, rules.proxyServerNameserverPolicy[rule]);
      matchedProxyPolicyKeys.add(rule);
    }
  }
  const proxyCoveredDomains = new Set();
  for (const rule of matchedProxyPolicyKeys) {
    for (const domain of originalDomains) {
      if (matchWildcardDomain(rule, domain)) {
        proxyCoveredDomains.add(domain);
      }
    }
  }

  const privateProxyServerNameservers = rules.proxyServerNameservers.filter(
    (nameserver) => !isPublicDnsServer(nameserver)
  );
  const privateNameservers = rules.nameservers.filter(
    (nameserver) => !isPublicDnsServer(nameserver)
  );

  if (privateProxyServerNameservers.length > 0) {
    for (const domain of originalDomains) {
      if (!domainCovered(domain)) {
        setPolicy(domain, privateProxyServerNameservers.slice());
      }
    }
  } else {
    for (const rule in rules.nameserverPolicy) {
      if (matchedProxyPolicyKeys.has(rule)) {
        continue;
      }
      if (!matchesAnyNodeDomain(rule)) {
        continue;
      }
      let overlapsProxy = false;
      for (const domain of originalDomains) {
        if (matchWildcardDomain(rule, domain) && proxyCoveredDomains.has(domain)) {
          overlapsProxy = true;
          break;
        }
      }
      if (overlapsProxy) {
        continue;
      }
      setPolicy(rule, rules.nameserverPolicy[rule]);
    }
    if (privateNameservers.length > 0) {
      for (const domain of originalDomains) {
        if (!domainCovered(domain)) {
          setPolicy(domain, privateNameservers.slice());
        }
      }
    }
  }

  // Remove policy entries identical to the global fallback and dedupe values.
  const globalProxyServerNameservers = asNameserverList(
    result.dns["proxy-server-nameserver"]
  );
  if (globalProxyServerNameservers.length > 0) {
    for (const rule of Object.keys(newPolicy)) {
      if (
        sameNameserverSet(
          asNameserverList(newPolicy[rule]),
          globalProxyServerNameservers
        )
      ) {
        delete newPolicy[rule];
      }
    }
  }
  for (const rule of Object.keys(newPolicy)) {
    const value = asNameserverList(newPolicy[rule]);
    const deduped = Array.from(new Set(value));
    if (deduped.length !== value.length) {
      newPolicy[rule] = deduped;
    }
  }

  result.dns["proxy-server-nameserver-policy"] = newPolicy;

  if (Object.keys(newHosts).length) {
    result.hosts = newHosts;
  }
}

// ============================================================================
// 入口函数：Bettbox / FlClash 系客户端会调用 main(config) 并使用其返回值
// ============================================================================
function main(config, profileName) {
  config = config || {};

  // ---- 1. 从订阅原始配置里取出会被模板覆盖、但需要保留/合并的动态数据 ----
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];

  // 1.1 Reality 增强开关处理
  const enableRealityEnhance = ruleOptionsEnable['启用 Reality 增强'] === true;

  if (enableRealityEnhance) {
    for (const proxy of originalProxies) {
      const reality = proxy?.["reality-opts"];

      if (!reality || typeof reality !== "object") {
        continue;
      }

      if (
        typeof reality["public-key"] !== "string" ||
        reality["public-key"].length === 0 ||
        typeof reality["short-id"] !== "string" ||
        reality["short-id"].length === 0
      ) {
        continue;
      }

      if (reality["support-x25519mlkem768"] === true) {
        continue;
      }

      reality["support-x25519mlkem768"] = true;
    }
  }

  // 1.2 节点 TLS 证书验证开关处理：默认不干预订阅节点原有 skip-cert-verify；
  //     开启「强制证书验证」时统一置为 false（强制校验证书），对全部节点一视同仁
  const forceCertVerify = ruleOptionsEnable['强制证书验证'] === true;

  for (const proxy of originalProxies) {
    if (!proxy || typeof proxy !== "object") {
      continue;
    }

    if (forceCertVerify) {
      proxy["skip-cert-verify"] = false;
    }
  }

  const originalProxyProviders =
    config['proxy-providers'] && typeof config['proxy-providers'] === 'object'
      ? config['proxy-providers']
      : null;

  // ---- 2. 以模板为主体，深拷贝一份出来当作最终结果 ----
  const result = deepClone(TEMPLATE);

  // ---- 3. 节点列表换成订阅里的真实节点 ----
  result.proxies = originalProxies;
  if (originalProxyProviders) {
    result['proxy-providers'] = originalProxyProviders;
  }

  // ---- 4. 动态过滤策略组：读取 ruleOptionsEnable 的单独开关 ----
  // 识别所有被禁用的策略组名字
  const disabledGroupNames = new Set();
  const activeGroupNames = new Set();

  (result['proxy-groups'] || []).forEach(group => {
    if (group && group.name) {
      // 默认如果规则选项里没写这个名字，就保持启用状态
      if (ruleOptionsEnable[group.name] === false) {
        disabledGroupNames.add(group.name);
      } else {
        activeGroupNames.add(group.name);
      }
    }
  });

  // 过滤出启用的策略组
  result['proxy-groups'] = (result['proxy-groups'] || []).filter(
    group => group && group.name && !disabledGroupNames.has(group.name)
  );

  // 清理其他启用的策略组中，对“已被禁用策略组”的引用
  const fallbackTarget = activeGroupNames.has('🌍 PROXY') ? '🌍 PROXY' : 'DIRECT';

  result['proxy-groups'].forEach(group => {
    if (Array.isArray(group.proxies)) {
      group.proxies = group.proxies.filter(p => !disabledGroupNames.has(p));
      // 如果剔除后列表空了，填入保底策略（优先 🌍 PROXY，其次 DIRECT）
      if (group.proxies.length === 0) {
        group.proxies = [fallbackTarget];
      }
    }
  });

  // ---- 5. 把标记为"此处为所有单节点"的分组，填入订阅的真实节点名 ----
  const allNodeNames = originalProxies
    .map((p) => p && p.name)
    .filter((name) => typeof name === 'string' && name.length > 0);

  result['proxy-groups'].forEach((group) => {
    if (isAllNodesPlaceholder(group)) {
      group.proxies = allNodeNames.slice();
      if (originalProxyProviders) {
        group.use = Object.keys(originalProxyProviders);
      }
    }
  });

  // ---- 5.5 FCM 直连开关：默认打开时 FCM 隐藏组仅含 DIRECT；
  //      关闭后仅保留 👉 手动切换（该开关不移除 FCM 组，仅改写组内节点） ----
  const fcmDirectEnabled = ruleOptionsEnable['FCM直连'] === true;
  result['proxy-groups'].forEach((group) => {
    if (group && group.name === 'FCM') {
      group.proxies = fcmDirectEnabled ? ['DIRECT'] : ['👉 手动切换'];
    }
  });

  // ---- 6. 清理 rules 中指向已禁用策略组的规则，指向保底策略组 ----
  if (Array.isArray(result.rules)) {
    result.rules = result.rules.map(rule => {
      let updatedRule = rule;
      disabledGroupNames.forEach(disabledName => {
        if (updatedRule.includes(`,${disabledName}`)) {
          updatedRule = updatedRule.replace(`,${disabledName}`, `,${fallbackTarget}`);
        }
      });
      return updatedRule;
    });
  }

  // ---- 7. DNS 节点智能补充 ----
  smartMergeDnsNode(
    config,
    result
  );

  return result;
}
