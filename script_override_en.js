// Bettbox Compatibility Declaration: The expected behavior of the Bettbox client is to recognize this declaration at the beginning of the script (rather than a full read),
// and the script must follow this convention: the declaration must be at the very top, and deleting or moving it down will cause the "Custom Rule Switch" entry to not display.
const Compatible_With_Bettbox = {
  ruleOptionsEnable: true
};
/**
 * ============================================================================
 *  Bettbox (FlClash-based Kernel / Mihomo Downstream Client) JS Override Script
 * ============================================================================
 *
 *  Source:
 *    JS Script:
 *    https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
 *    Template:
 *    https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml
 *    Repository:
 *    https://github.com/XVSVTsama/mihomo-config-self
 *    Author:
 *    https://github.com/XVSVTsama
 *    Latest Content (GitHub Commit):
 *    https://github.com/XVSVTsama/mihomo-config-self/commits/main/script_override.js
 *    Usage: This script can be loaded directly as a remote override script for Bettbox / FlClash-based clients
 *         (The first line of the file is the Bettbox compatibility declaration, please do not delete it).
 *
 *  Purpose:
 *    Merges the current subscription (original configuration) with the "Standard Template" (mihomo.yaml) maintained in this repository into the final effective configuration.
 *
 *  Merge Rules:
 *    1. Except for the special notes in items 2, 3, and 4 below, the final configuration is based on the TEMPLATE
 *       (corresponding to the mihomo.yaml template). That is, fields already written in the template will replace fields with the same name in the subscription's original configuration
 *       (such as DNS details, rules, rule-providers, sniffer,
 *       TUN, proxy-groups grouping structure, etc.). Top-level fields undefined in the template within the subscription's original configuration will not be retained
 *       (such as allow-lan or bind-address that come with certain subscriptions). The only exception is proxy-providers:
 *       If the subscription comes with proxy-providers, they will be retained as-is and injected into the final configuration.
 *
 *    2. proxies: Uses the real node list from the subscription's original configuration (this item is empty in the template by default,
 *       serving only as a placeholder).
 *
 *    3. In proxy-groups, "proxies: " explicitly written in the template (with a value of empty/null, which are
 *       the groups described in the template comments as "all single nodes here": 👉 Manual Select, ♻️ Auto Select,
 *       🔄 Load Balance, 📲 Telegram, 🎮 Games-Global) will automatically be filled with the names of all nodes in the subscription;
 *       if the subscription also includes proxy-providers, these groups will simultaneously reference all providers via use. The remaining groups will remain exactly as they are in the template and will not be overwritten or supplemented by subscription nodes.
 *
 *    4. [Special Handling] DNS and Hosts:
 *       - hosts rewrites node servers only when dns.use-hosts=true and dns.listen forms a closed loop with the DNS endpoints actually participating in node resolution; the original domain is used only to identify and migrate a private DNS policy, while the final output retains policy entries only for node domains that still require DNS resolution after rewriting;
 *       - Node DNS priority: proxy-server-nameserver-policy > proxy-server-nameserver
 *         (private only) > nameserver-policy > nameserver (private only);
 *       - Public DNS is only used to identify private DNS and prevent public DNS from entering node resolution;
 *       - The template's global proxy-server-nameserver is always retained as the final fallback;
 *       Conflicts with the same key are resolved according to NAMESERVER_POLICY_PREFER_ORIGINAL to determine priority.
 *
 *  Usage Method (General for Bettbox / FlClash-based clients):
 *    Config → "..." in the upper right corner of the corresponding subscription → Edit override script (or "Open script") → Create a new script,
 *    paste the entire content of this file into it and save, then enable this script on that subscription.
 * ============================================================================
 */


const ruleOptionsEnable = {

  /**
 * Custom Configuration Options
 * Define individual switches for each proxy group (policy group) in the template:
 * true  = Enable this policy group
 * false = Disable this policy group (automatically removed from proxy-groups, and references in other groups will be cleaned up)
 * There are also feature switches (such as FCM Direct): only adjusts nodes within the group, without involving the start/stop of policy groups.
 */

  // --- Individual Proxy Group (Policy Group) Control Switches ---
  '🌍 PROXY': true,        // Main proxy policy group
  '🔄 负载均衡': true,     // Load Balance policy group
  '👉 手动切换': true,    // Manual Select policy group
  '♻️ 自动选择': true,     // Delay Auto Select policy group
  '📲 Telegram': true,     // Telegram communication software policy group
  '🎮 Games-Global': true, // Gaming policy group
  '✖️ Twitter': true,      // Twitter social platform policy group
  '🤖 AI大模型': true,     // AI policy group
  '🎵 TikTok': true,       // TikTok video platform policy group

  // --- Node and Network Feature Switches ---
  '强制证书验证': false,   // When enabled, uniformly sets subscription nodes skip-cert-verify to false (forcing certificate verification); when disabled, does not interfere and retains the subscription nodes' original settings. Applies equally to all nodes
  '启用 Reality 增强': true, // Whether to enable support-x25519mlkem768 (X25519MLKEM768 post-quantum key agreement) for Reality nodes with non-empty public-key/short-id
  'FCM直连': true,          // Default ON: The hidden FCM group contains only DIRECT; when disabled, only 👉 Manual Select is retained (FCM group is not removed). The switch icon is taken from the icon field of the FCM proxy group.
  'TGDC实验分流': false,     // Enables the Telegram DC/regional experiment; when disabled, the original Telegram rules, policy groups, and rule providers are left unchanged.
  '入口解析': false,         // Master switch: when enabled, only the first enabled operator in Telecom > Unicom > Mobile order takes effect.
  '电信入口解析': false,     // When enabled, use the China Telecom domestic entry resolution node.
  '联通入口解析': false,     // When enabled, use the China Unicom domestic entry resolution node.
  '移动入口解析': false,     // When enabled, use the China Mobile domestic entry resolution node.
};

// ============================================================================
// Telegram DC/regional experiment (injected only when the switch is true).
// DC1/DC3: Miami; DC2/DC4: Amsterdam; DC5: Singapore.
// Static CIDRs cannot reliably split same-city DCs, so groups use DC pairs.
// ============================================================================
const TGDC_RULE_PROVIDERS = {
  telegram_dc1_dc3_miami: {
    type: 'inline',
    behavior: 'classical',
    payload: [
      'IP-CIDR,91.108.12.0/22,no-resolve',
      'IP-CIDR,149.154.172.0/22,no-resolve',
      'IP-CIDR6,2001:b28:f23d::/48,no-resolve',
    ],
  },
  telegram_dc2_dc4_amsterdam: {
    type: 'inline',
    behavior: 'classical',
    payload: [
      'IP-CIDR,91.108.58.0/23,no-resolve',
      'IP-CIDR,91.108.4.0/22,no-resolve',
      'IP-CIDR,91.108.8.0/22,no-resolve',
      'IP-CIDR,149.154.160.0/21,no-resolve',
      'IP-CIDR,95.161.64.0/20,no-resolve',
      'IP-CIDR,91.105.192.0/23,no-resolve',
      'IP-CIDR,185.76.151.0/24,no-resolve',
      'IP-CIDR,5.28.192.0/18,no-resolve',
      'IP-CIDR,109.239.140.0/24,no-resolve',
      'IP-CIDR6,2001:67c:4e8::/48,no-resolve',
      'IP-CIDR6,2a0a:f280:203::/48,no-resolve',
    ],
  },
  telegram_dc5_sg: {
    type: 'inline',
    behavior: 'classical',
    payload: [
      'IP-CIDR,91.108.16.0/22,no-resolve',
      'IP-CIDR,91.108.56.0/23,no-resolve',
      'IP-CIDR,149.154.168.0/22,no-resolve',
      'IP-CIDR6,2001:b28:f23c::/48,no-resolve',
      'IP-CIDR6,2001:b28:f23f::/48,no-resolve',
    ],
  },
};

// Fallback selection excludes built-ins, rejects, rematches, and non-real nodes;
// otherwise use the first usable subscription node.
const TGDC_FALLBACK_EXCLUDE_FILTER =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b/iu;
const TGDC_FALLBACK_LOW_RATE_FILTER =
  /^(?!.*(?:剩|期)).*(?:(?<!\d)0\.[0-5]|(?<=[ |｜丨∣┃\-‐–—−－﹣])0[*×✕✖⨯⨉x倍])|(?:(?<=[ |｜丨∣┃\-‐–—−－﹣])[*×✕✖⨯⨉x]0(?= |倍|$))|^(?!.*(?:客户端|软件)).*下载|低倍|免费|(?<![A-Za-z])free(?![A-Za-z])/i;
const TGDC_FALLBACK_HIGH_RATE_FILTER =
  /(?<=[ |｜丨∣┃\-‐–—−－﹣])((?:[*×✕✖⨯⨉x]\s*(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?)|(?:(?<![\d.])(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?\s*(?:倍|[*×✕✖⨯⨉x])))/i;

function selectTelegramDcFallbackNode(originalProxies) {
  const proxies = Array.isArray(originalProxies) ? originalProxies : [];
  const fallbackProxy = proxies.find((proxy) => {
    if (!proxy || typeof proxy !== 'object' || typeof proxy.name !== 'string' || proxy.name.length === 0) {
      return false;
    }
    const type = String(proxy.type || '').toLowerCase();
    if (type === 'direct' || type === 'reject' || type === 'rematch') {
      return false;
    }
    const name = proxy.name;
    if (TGDC_FALLBACK_EXCLUDE_FILTER.test(name)) return false;
    if (TGDC_FALLBACK_LOW_RATE_FILTER.test(name)) return false;
    if (TGDC_FALLBACK_HIGH_RATE_FILTER.test(name)) return false;
    return true;
  });
  return fallbackProxy?.name || 'COMPATIBLE';
}

const TGDC_PROXY_GROUP_DEFINITIONS = [
  {
    name: '📲 Telegram-DC1-DC3-Miami',
    filter: '(?i)🇺🇸|美国|迈阿密|miami|\\bMIA\\b|\\bUSA\\b|united\\s*states',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png',
  },
  {
    name: '📲 Telegram-DC2-DC4-Amsterdam',
    filter: '(?i)🇳🇱|荷兰|阿姆斯特丹|amsterdam|\\bAMS\\b|\\bNL\\b|netherlands',
    icon: 'https://flagcdn.com/w160/nl.png',
  },
  {
    name: '📲 Telegram-DC5-SG',
    filter: '(?i)🇸🇬|🇭🇰|新加坡|狮城|香港|singapore|hong\\s*kong|\\bSG\\b|\\bSGP\\b|\\bHK\\b|\\bHKG\\b',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png',
  },
];

function buildTelegramDcProxyGroups(fallbackNodeName) {
  return TGDC_PROXY_GROUP_DEFINITIONS.map((definition) => ({
    name: definition.name,
    type: 'select',
    filter: definition.filter,
    'include-all-proxies': true,
    'empty-fallback': fallbackNodeName,
    icon: definition.icon,
  }));
}

const TGDC_RULES = [
  'RULE-SET,telegram_dc1_dc3_miami,📲 Telegram-DC1-DC3-Miami,no-resolve',
  'RULE-SET,telegram_dc2_dc4_amsterdam,📲 Telegram-DC2-DC4-Amsterdam,no-resolve',
  'RULE-SET,telegram_dc5_sg,📲 Telegram-DC5-SG,no-resolve',
  'PROCESS-NAME-REGEX,.*nagram.*,📲 Telegram(兜底)',
  'PROCESS-NAME-REGEX,.*telegram.*,📲 Telegram(兜底)',
  'RULE-SET,telegramcidr,📲 Telegram(兜底),no-resolve',
  'RULE-SET,telegram_domain,📲 Telegram(兜底)',
];

// When the same domain rule key appears, whether the subscription's original configuration (true) or template (false) takes priority (the template currently does not configure
// proxy-server-nameserver-policy, so this switch currently only affects merging between subscription sources)
const NAMESERVER_POLICY_PREFER_ORIGINAL = true;

// ============================================================================
// Domestic entry resolution: affects only the final node resolution chain
// proxy-server-nameserver and proxy-server-nameserver-policy. Nodes are DNS
// policy targets only and do not enter proxy groups.
// ============================================================================
const ENTRY_RESOLUTION_OPTIONS = [
  {
    key: '电信入口解析',
    proxyName: '国内入口解析-电信',
    proxy: {
      name: '国内入口解析-电信',
      type: 'http',
      server: '36.111.33.167',
      port: 13128
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China.png'
  },
  {
    key: '联通入口解析',
    proxyName: '国内入口解析-联通',
    proxy: {
      name: '国内入口解析-联通',
      type: 'http',
      server: '119.188.131.55',
      port: 17981
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China_Map.png'
  },
  {
    key: '移动入口解析',
    proxyName: '国内入口解析-移动',
    proxy: {
      name: '国内入口解析-移动',
      type: 'http',
      server: '116.196.150.180',
      port: 17981
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Server.png'
  }
];

// ============================================================================
// Standard Template Configuration (Kept in sync with the repository's mihomo.yaml, equivalent to the JSON representation of that YAML file)
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
      "filter": "US|Residential",
      "icon": "https://www.clashverge.dev/assets/icons/twitter.svg",
      "include-all-proxies": true,
      "name": "✖️ Twitter",
      "type": "select"
    },
    {
      "filter": "US|Residential",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/ai.png",
      "include-all-proxies": true,
      "name": "🤖 AI",
      "type": "select"
    },
    {
      "filter": "US|Residential",
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
    // Claude / Anthropic: process matches take precedence and cover Claude Desktop, Claude Code, etc.
    "PROCESS-NAME-REGEX,(?i).*claude.*,🤖 AI",
    "PROCESS-NAME-REGEX,(?i).*anthropic.*,🤖 AI",
    // Claude / Anthropic: official API, web login, OAuth, MCP, CLI updates, and plugin dependencies.
    "DOMAIN,api.anthropic.com,🤖 AI",
    "DOMAIN,console.anthropic.com,🤖 AI",
    "DOMAIN,statsig.anthropic.com,🤖 AI",
    "DOMAIN,status.anthropic.com,🤖 AI",
    "DOMAIN,sentry.anthropic.com,🤖 AI",
    "DOMAIN,support.anthropic.com,🤖 AI",
    "DOMAIN,mcp-proxy.anthropic.com,🤖 AI",
    "DOMAIN,platform.claude.com,🤖 AI",
    "DOMAIN,code.claude.com,🤖 AI",
    "DOMAIN,downloads.claude.ai,🤖 AI",
    "DOMAIN,bridge.claudeusercontent.com,🤖 AI",
    "DOMAIN,cdn.growthbook.io,🤖 AI",
    "DOMAIN,cdn.usefathom.com,🤖 AI",
    "DOMAIN,registry.npmjs.org,🤖 AI",
    "DOMAIN,storage.googleapis.com,🤖 AI",
    "DOMAIN,raw.githubusercontent.com,🤖 AI",
    "DOMAIN,formulae.brew.sh,🤖 AI",
    "DOMAIN,http-intake.logs.us5.datadoghq.com,🤖 AI",
    "DOMAIN,browser-intake-us5-datadoghq.com,🤖 AI",
    "DOMAIN,servd-anthropic-website.b-cdn.net,🤖 AI",
    "DOMAIN,claudemcpclient.com,🤖 AI",
    "DOMAIN,claudemcpcontent.com,🤖 AI",
    "DOMAIN-SUFFIX,anthropic.com,🤖 AI",
    "DOMAIN-SUFFIX,claude.ai,🤖 AI",
    "DOMAIN-SUFFIX,claude.com,🤖 AI",
    "DOMAIN-SUFFIX,claudeusercontent.com,🤖 AI",
    "DOMAIN-SUFFIX,clau.de,🤖 AI",
    "DOMAIN-SUFFIX,frame.claudeusercontent.com,🤖 AI",
    "DOMAIN-SUFFIX,modelcontextprotocol.io,🤖 AI",
    "IP-CIDR,160.79.104.0/21,🤖 AI,no-resolve",
    "IP-CIDR6,2607:6bc0::/48,🤖 AI,no-resolve",
    "RULE-SET,Gemini_Domain,🤖 AI",
    "RULE-SET,Grok_Domain,🤖 AI",
    "IP-CIDR,17.253.4.0/23,🤖 AI,no-resolve",
    "DOMAIN,anthropic.com.cdn.cloudflare.net,🤖 AI",
    "DOMAIN,anthropic-com.ghost.io,🤖 AI",
    "DOMAIN-SUFFIX,sentry.io,🤖 AI",
    "DOMAIN-SUFFIX,statsigapi.net,🤖 AI",
    "DOMAIN,browser-intake-us5-datadoghq.com,🤖 AI",
    "DOMAIN-KEYWORD,datadog,🤖 AI",
    "DOMAIN-KEYWORD,sift,🤖 AI",
    "RULE-SET,ai-1,🤖 AI",
    "RULE-SET,ai-2,🤖 AI",
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

  // --- 3. Quad9 Public DNS (Security Filtering) ---
      "9.9.9.9/32",
      "149.112.112.112/32",
      "2620:fe::fe/128",

  // --- 4. OpenDNS (Cisco) ---
      "208.67.222.222/32",
      "208.67.220.220/32",
      "2620:119:35::35/128",

  // --- 5. AdGuard DNS (Ad Blocking) ---
      "94.140.14.14/32",
      "94.140.15.15/32",
      "2a10:50c0::ad1:ff/128",
      "2a10:50c0::ad2:ff/128",

  // --- 6. CleanBrowsing (Security/Adult Content Blocking) ---
      "185.228.168.9/32",
      "185.228.169.9/32",

  // --- 7. Verisign Public DNS ---
      "64.6.64.6/32",
      "64.6.65.6/32",

  // --- 8. Yandex Public DNS ---
      "77.88.8.8/32",
      "77.88.8.1/32",

  // --- 9. DNS.SB Public DNS ---
      "185.222.222.222/32",
      "45.11.45.11/32",

  // --- 10. AliDNS ---
      "223.5.5.5/32",
      "223.6.6.6/32",
      "2400:3200::1/128",
      "2400:3200:baba::1/128",
    
  // --- 11. Tencent DNS (DNSPod) ---
      "119.29.29.29/32",
      "182.254.116.116/32",

  // --- 12. Baidu DNS ---
      "180.76.76.76/32",

  // --- 13. 114DNS (Standard and Security Editions) ---
      "114.114.114.114/32",
      "114.114.115.115/32",
      "114.114.114.119/32",
      "114.114.115.119/32",

  // --- 14. CNNIC Public DNS ---
      "1.2.4.8/32",
      "210.2.4.8/32",

  // --- 15. 360 Safe DNS (DNSPai) ---
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

// Bettbox visual switch icons: The client will read the global serviceConfigs (name corresponds to the key in ruleOptionsEnable,
// and icon is the icon displayed on that switch row). Only proxy groups are covered above; source of icons for feature switches:
// FCM Direct is derived from the icon field of the FCM proxy group (changing the proxy group icon in one place syncs it);
// other feature switches (Force Certificate Verification, Enable Reality Enhancement) specify fixed icons here directly.
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
    },
    {
      name: 'TGDC实验分流',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png'
    },
    {
      name: '入口解析',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Domestic.png'
    }
  ].concat(
    ENTRY_RESOLUTION_OPTIONS.map((option) => ({
      name: option.key,
      icon: option.icon
    }))
  ));

  
// ============================================================================
// Utility Functions
// ============================================================================

// Deep clone: avoids mutual contamination of the same TEMPLATE instance when main() is called multiple times
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Determines whether a group is the template's placeholder group for "all single nodes here":
// has the proxies field explicitly written and its value is null, for example:
//   - name: 👉 Manual Select
//     proxies:
//     type: select
function isAllNodesPlaceholder(group) {
  return !!group && ('proxies' in group) && group.proxies === null;
}

// =====================================================
// Intelligent DNS Node Domain Supplement Logic
// =====================================================

// Determines whether the server is an IP address
function isIPAddress(host) {
  if (!host || typeof host !== "string") {
    return true;
  }

  // IPv4 address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return true;
  }

  // IPv6 address
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

// Wildcard domain matching
function matchWildcardDomain(rule, host) {
  rule = normalizeDomain(rule);
  host = normalizeDomain(host);

  if (!rule || !host) {
    return false;
  }

  // Rules like +.example.com
  if (rule.startsWith("+.")) {
    const suffix = rule.substring(2);
    return (
      host === suffix ||
      host.endsWith("." + suffix)
    );
  }

  // Rules like .example.com
  if (rule.startsWith(".")) {
    const suffix = rule.substring(1);
    return host.endsWith("." + suffix);
  }

  // * Wildcard
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

  // Regular domain
  return host === rule;
}

function asNameserverList(nameservers) {
  if (Array.isArray(nameservers)) {
    return nameservers.filter(value => typeof value === "string");
  }

  return typeof nameservers === "string" ? [nameservers] : [];
} 
// Compares whether two nameserver lists are equivalent (ignoring order and duplicates, compared as sets)
function sameNameserverSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && Array.from(sa).every((value) => sb.has(value));
}

function selectedEntryResolutionOption() {
  if (ruleOptionsEnable['入口解析'] !== true) {
    return null;
  }

  return ENTRY_RESOLUTION_OPTIONS.find(
    (option) => ruleOptionsEnable[option.key] === true
  ) || null;
}

function withDnsPolicySuffix(value, suffix) {
  const str = String(value);
  const hashIndex = str.indexOf('#');
  return (hashIndex === -1 ? str : str.slice(0, hashIndex)) + suffix;
}

function applyEntryResolution(result) {
  const option = selectedEntryResolutionOption();
  if (!option) {
    return;
  }

  const suffix = '#' + option.proxyName;

  if (
    Array.isArray(result.proxies) &&
    !result.proxies.some((proxy) => proxy && proxy.name === option.proxyName)
  ) {
    result.proxies.push(deepClone(option.proxy));
  }

  const displayGroup = {
    name: '国内入口解析',
    type: 'select',
    proxies: [option.proxyName],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Domestic.png'
  };
  const existingDisplayGroup = (result['proxy-groups'] || []).find(
    (group) => group && group.name === displayGroup.name
  );
  if (existingDisplayGroup) {
    existingDisplayGroup.type = displayGroup.type;
    existingDisplayGroup.proxies = displayGroup.proxies.slice();
    existingDisplayGroup.icon = displayGroup.icon;
  } else {
    const autoSelectIndex = (result['proxy-groups'] || []).findIndex(
      (group) => group && group.name === '♻️ 自动选择'
    );
    if (autoSelectIndex >= 0) {
      result['proxy-groups'].splice(autoSelectIndex + 1, 0, displayGroup);
    } else {
      result['proxy-groups'].push(displayGroup);
    }
  }

  result.dns['proxy-server-nameserver'] = asNameserverList(
    result.dns['proxy-server-nameserver']
  ).map((value) => withDnsPolicySuffix(value, suffix));

  const policy = result.dns['proxy-server-nameserver-policy'];
  if (!policy || typeof policy !== 'object') {
    return;
  }

  for (const rule of Object.keys(policy)) {
    const value = policy[rule];
    if (Array.isArray(value)) {
      policy[rule] = value.map((item) => withDnsPolicySuffix(item, suffix));
    } else if (typeof value === 'string') {
      policy[rule] = withDnsPolicySuffix(value, suffix);
    }
  }
}

// Public DNS identification table: used to distinguish between "public directly connectable DNS" and "airport/user private DNS".
// Data refers to the public DNS list in the local MyClash repository, but only borrows the identification table here without copying its processing logic.
const publicDnsList = [
  // Domestic
  '223.5.5.5', '223.6.6.6', '119.29.29.29', '1.12.12.12',
  '120.53.53.53', '114.114.114.114', '180.76.76.76', '1.2.4.8',
  '116.116.116.116', '101.226.4.6', '123.125.81.6', '180.184.1.1',
  '180.184.2.2',
  // Overseas
  '1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4', '9.9.9.9',
  '149.112.112.112', '208.67.222.222', '208.67.220.220',
  '94.140.14.14', '94.140.15.15', '76.76.2.0', '76.76.10.0',
  '185.228.168.9', '185.228.169.9', '77.88.8.8', '77.88.8.1',
  '156.154.70.1', '156.154.71.1', '127.0.0.1',
  // Domain Keywords
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

  // Check sources actually participating in resolution by priority:
  // proxy-server-nameserver-policy > proxy-server-nameserver > nameserver-policy > nameserver.
  for (const group of candidates) {
    if (group.length > 0) {
      return group.some((nameserver) => dnsServerEndpoint(nameserver) === listen);
    }
  }
  return false;
}

// Extract DNS merge sources from the original configuration.
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

  // hosts participates in node server rewriting only when use-hosts=true and DNS listening forms a closed loop
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

// Resolve hosts multi-level mapping chain: follow step by step when the target is still a domain, until the end point is an IP, no further mappings exist, or a cycle is formed
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

// Intelligently supplement DNS based on node domains
function smartMergeDnsNode(config, result) {
  const rules = collectDnsRules(config);
  const newPolicy = result.dns["proxy-server-nameserver-policy"] || {};
  const newHosts = result.hosts || {};
  const proxies = Array.isArray(config.proxies) ? config.proxies : [];

  // Keep node domains before mapping to identify and migrate policies, and separately record domains that still require DNS for actual connections.
  // Nodes mapped to IPs produce no DNS policy; for nodes mapped to another domain, retain only the final-domain policy.
  const originalDomains = new Set();
  const originalDomainByProxy = new Map();
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
      originalDomainByProxy.set(proxy, domain);
    }
  }

  // Process hosts first: rewrite proxy.server before matching DNS policies.
  // Some subscriptions' proxy-server-nameserver is udp://127.0.0.1:xxx, combined with the local mihomo DNS
  // module's internal hosts; rewriting proxy.server from hosts can bypass this dependency.
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

  const nodeDomainPairs = [];
  const allNodeDomains = new Set(originalDomains);
  const effectiveNodeDomains = new Set();
  for (const [proxy, original] of originalDomainByProxy) {
    const server = proxy.server;
    const effective =
      typeof server === "string" && !isIPAddress(server)
        ? normalizeDomain(server)
        : "";
    nodeDomainPairs.push({ original, effective });
    if (effective) {
      allNodeDomains.add(effective);
      effectiveNodeDomains.add(effective);
    }
  }

  // Original domains identify migratable subscription policies; output policy entries match only actual connection domains.
  const matchesAnyNodeDomain = (rule) => {
    for (const domain of allNodeDomains) {
      if (matchWildcardDomain(rule, domain)) {
        return true;
      }
    }
    return false;
  };
  const matchesEffectiveNodeDomain = (rule) => {
    for (const domain of effectiveNodeDomains) {
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

  const policyMatchesDomain = (policy, domain) =>
    Object.keys(policy).some((rule) => matchWildcardDomain(rule, domain));

  // When a policy only matches the domain before hosts rewriting and the final domain is not covered,
  // add an exact policy for the final domain. The original domain is only the migration source and is not written to the final output;
  // an original rule that directly matches the final domain remains unchanged and takes priority.
  const copyResolvedDomainPolicy = (policy, shouldCopy) => {
    for (const { original, effective } of nodeDomainPairs) {
      if (
        !effective ||
        effective === original ||
        !shouldCopy({ original, effective }) ||
        policyMatchesDomain(policy, effective)
      ) {
        continue;
      }
      for (const rule of Object.keys(policy)) {
        if (matchWildcardDomain(rule, original)) {
          setPolicy(effective, policy[rule]);
        }
      }
    }
  };

  // Priority: proxy-server-nameserver-policy > proxy-server-nameserver (private only)
  //           > nameserver-policy > nameserver (private only).
  const matchedProxyPolicyKeys = new Set();
  for (const rule in rules.proxyServerNameserverPolicy) {
    if (!matchesAnyNodeDomain(rule)) {
      continue;
    }
    matchedProxyPolicyKeys.add(rule);
    if (matchesEffectiveNodeDomain(rule)) {
      setPolicy(rule, rules.proxyServerNameserverPolicy[rule]);
    }
  }

  // A proxy-server-nameserver-policy matching the original domain also covers the final mapped domain by priority.
  copyResolvedDomainPolicy(rules.proxyServerNameserverPolicy, () => true);

  const proxyCoveredDomains = new Set();
  for (const rule of matchedProxyPolicyKeys) {
    for (const { original, effective } of nodeDomainPairs) {
      if (
        matchWildcardDomain(rule, original) ||
        (effective && matchWildcardDomain(rule, effective))
      ) {
        proxyCoveredDomains.add(original);
        if (effective) {
          proxyCoveredDomains.add(effective);
        }
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
    for (const domain of effectiveNodeDomains) {
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
      for (const domain of allNodeDomains) {
        if (matchWildcardDomain(rule, domain) && proxyCoveredDomains.has(domain)) {
          overlapsProxy = true;
          break;
        }
      }
      if (overlapsProxy) {
        continue;
      }
      if (matchesEffectiveNodeDomain(rule)) {
        setPolicy(rule, rules.nameserverPolicy[rule]);
      }
    }

    // nameserver-policy can likewise follow a hosts domain chain, but must not override a higher-priority policy.
    copyResolvedDomainPolicy(
      rules.nameserverPolicy,
      ({ effective }) => !proxyCoveredDomains.has(effective)
    );

    if (privateNameservers.length > 0) {
      for (const domain of effectiveNodeDomains) {
        if (!domainCovered(domain)) {
          setPolicy(domain, privateNameservers.slice());
        }
      }
    }
  }

  // Remove policy items identical to the global fallback, and deduplicate values.
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
// Telegram DC experiment: only modifies result when the switch is enabled.
// ============================================================================
function applyTelegramDcExperiment(result, originalProxies) {
  if (ruleOptionsEnable['TGDC实验分流'] !== true) {
    return;
  }

  const originalProviders = result['rule-providers'] || {};
  const providersWithTelegramDc = {};
  let inserted = false;
  Object.keys(originalProviders).forEach((name) => {
    if (!inserted && name === 'telegram_domain') {
      Object.assign(providersWithTelegramDc, deepClone(TGDC_RULE_PROVIDERS));
      inserted = true;
    }
    providersWithTelegramDc[name] = originalProviders[name];
  });
  if (!inserted) {
    Object.assign(providersWithTelegramDc, deepClone(TGDC_RULE_PROVIDERS));
  }
  result['rule-providers'] = providersWithTelegramDc;

  const telegramFallback = (result['proxy-groups'] || []).find(
    (group) => group && group.name === '📲 Telegram'
  );
  if (telegramFallback) {
    telegramFallback.name = '📲 Telegram(兜底)';
  }

  const proxyGroups = result['proxy-groups'] || [];
  const autoSelectIndex = proxyGroups.findIndex(
    (group) => group && group.name === '♻️ 自动选择'
  );
  const fallbackIndex = proxyGroups.findIndex(
    (group) => group && group.name === '📲 Telegram(兜底)'
  );
  const insertIndex = autoSelectIndex >= 0
    ? autoSelectIndex + 1
    : (fallbackIndex >= 0 ? fallbackIndex : proxyGroups.length);
  proxyGroups.splice(
    insertIndex,
    0,
    ...deepClone(buildTelegramDcProxyGroups(selectTelegramDcFallbackNode(originalProxies)))
  );
  result['proxy-groups'] = proxyGroups;

  if (!Array.isArray(result.rules)) {
    result.rules = [];
  }
  const telegramRulePattern = (rule) =>
    typeof rule === 'string' &&
    (rule.includes(',📲 Telegram') || rule.includes('RULE-SET,telegramcidr') || rule.includes('RULE-SET,telegram_domain'));
  let firstTelegramRuleIndex = result.rules.findIndex(telegramRulePattern);
  const retainedRules = result.rules.filter((rule) => !telegramRulePattern(rule));
  if (firstTelegramRuleIndex < 0) {
    firstTelegramRuleIndex = retainedRules.length;
  } else {
    firstTelegramRuleIndex = Math.min(firstTelegramRuleIndex, retainedRules.length);
  }
  retainedRules.splice(firstTelegramRuleIndex, 0, ...TGDC_RULES);
  result.rules = retainedRules;
}

// ============================================================================
// Entry Function: Bettbox / FlClash-based clients will call main(config) and use its return value
// ============================================================================
function main(config, profileName) {
  config = config || {};

  // ---- 1. Extract dynamic data from the subscription's original configuration that will be overwritten by the template but needs to be retained/merged ----
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];

  // 1.1 Reality Enhancement Switch Handling
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

  // 1.2 Node TLS Certificate Verification Switch Handling: By default, does not interfere with subscription nodes' original skip-cert-verify;
  //     when "Force Certificate Verification" is enabled, uniformly sets them to false (forcing certificate verification), treating all nodes equally
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

  // ---- 2. Use the template as the main body, and deep clone a copy to act as the final result ----
  const result = deepClone(TEMPLATE);

  // ---- 2.5 Telegram DC experiment (default off; injects after being enabled) ----
  applyTelegramDcExperiment(result, originalProxies);

  // ---- 3. Replace the node list with the real nodes from the subscription ----
  result.proxies = originalProxies;
  if (originalProxyProviders) {
    result['proxy-providers'] = originalProxyProviders;
  }

  // ---- 4. Dynamically filter policy groups: read individual switches from ruleOptionsEnable ----
  // Identify all disabled policy group names
  const disabledGroupNames = new Set();
  const activeGroupNames = new Set();

  (result['proxy-groups'] || []).forEach(group => {
    if (group && group.name) {
      // After enabling TGDC, 📲 Telegram(兜底) continues to use the original 📲 Telegram switch.
      const optionName = group.name === '📲 Telegram(兜底)' ? '📲 Telegram' : group.name;
      // By default, keep enabled if this name is not written in rule options
      if (ruleOptionsEnable[optionName] === false) {
        disabledGroupNames.add(group.name);
      } else {
        activeGroupNames.add(group.name);
      }
    }
  });

  // Filter out enabled policy groups
  result['proxy-groups'] = (result['proxy-groups'] || []).filter(
    group => group && group.name && !disabledGroupNames.has(group.name)
  );

  // Clean up references to "disabled policy groups" in other enabled policy groups
  const fallbackTarget = activeGroupNames.has('🌍 PROXY') ? '🌍 PROXY' : 'DIRECT';

  result['proxy-groups'].forEach(group => {
    if (Array.isArray(group.proxies)) {
      group.proxies = group.proxies.filter(p => !disabledGroupNames.has(p));
      // If the list is empty after filtering, fill in the fallback policy (prefer 🌍 PROXY, then DIRECT)
      if (group.proxies.length === 0) {
        group.proxies = [fallbackTarget];
      }
    }
  });

  // ---- 5. Fill groups marked as "all single nodes here" with the subscription's real node names ----
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

  // ---- 5.5 FCM Direct Switch: When enabled by default, the hidden FCM group contains only DIRECT;
  //      when disabled, only 👉 Manual Select is retained (this switch does not remove the FCM group, only rewrites the nodes inside the group) ----
  const fcmDirectEnabled = ruleOptionsEnable['FCM直连'] === true;
  result['proxy-groups'].forEach((group) => {
    if (group && group.name === 'FCM') {
      group.proxies = fcmDirectEnabled ? ['DIRECT'] : ['👉 手动切换'];
    }
  });

  // ---- 6. Clean up rules pointing to disabled policy groups in rules, pointing them to the fallback policy group instead ----
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

  // ---- 7. Intelligent DNS Node Supplement ----
  smartMergeDnsNode(
    config,
    result
  );

  // ---- 8. Domestic entry resolution: append the operator policy to the final node DNS result. ----
  applyEntryResolution(result);

  return result;
}
