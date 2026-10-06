// Bettbox compatibility declaration: The expected behavior of the Bettbox client is to identify this declaration at the beginning of the script (rather than reading it fully).
// The script must follow this convention: the declaration must be at the top; deleting or moving it down will cause the "Custom Rule Switch" entry not to be displayed.
const Compatible_With_Bettbox = {
  ruleOptionsEnable: true,
  // Declares switch names belonging to proxy groups, which must exactly match the keys of ruleOptionsEnable
  policyGroupOptions: [
    '🌍 PROXY',
    '🔄 负载均衡',
    '👉 手动切换',
    '♻️ 自动选择',
    '📲 Telegram',
    '🎮 Games-Global',
    '✖️ Twitter',
    '🤖 AI大模型',
    '🎵 TikTok',
  ]
};
/**
 * ============================================================================
 *  Bettbox (FlClash Series Kernel / Mihomo Downstream Client) JS Override Script
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
 *    Latest Updates (GitHub Commits):
 *    https://github.com/XVSVTsama/mihomo-config-self/commits/main/script_override.js
 *    Usage: This script can be loaded directly as a remote override script for Bettbox / FlClash series clients
 *         (the first line of the file is the Bettbox compatibility declaration, please do not delete).
 *
 *  Purpose:
 *    Merges the current subscription (original configuration) with the "standard template" (mihomo.yaml) maintained in this repository into the final effective configuration.
 *
 *  Merger Rules:
 *    1. Except for the special notes in items 2, 3, and 4 below, the final configuration is based on TEMPLATE
 *       (corresponding to the mihomo.yaml template), meaning fields already written in the template will replace fields with the same name in the subscription's original configuration (such as various dns details, rules, rule-providers, sniffer, tun, proxy-groups grouping structures, etc.). Top-level fields not defined in the template within the subscription's original configuration will not be retained (such as allow-lan and bind-address bundled with some subscriptions), with the sole exception of proxy-providers: if the subscription comes with proxy-providers, they will be retained as-is and injected into the final configuration.
 *
 *    2. proxies: Uses the real node list from the subscription's original configuration (this item in the template is empty by default, serving only as a placeholder).
 *
 *    3. In proxy-groups, groups where the template explicitly writes "proxies: " (values are empty/null, i.e., the groups marked as "Here are all single nodes" in the template comments: 👉 Manual Select, ♻️ Auto Select, 🔄 Load Balance, 📲 Telegram, 🎮 Games-Global) will automatically be populated with the names of all nodes in the subscription; if the subscription also comes with proxy-providers, these groups will simultaneously have use references written for all providers. All other groups remain as they are in the template and will not be overwritten or supplemented by subscription nodes.
 *
 *    4. [Special Handling] DNS and Hosts:
 *       - hosts rewrites node servers only when dns.use-hosts=true and dns.listen forms a closed loop with the DNS endpoints actually participating in node resolution; both the pre- and post-mapping domains participate in node DNS policy matching, allowing private DNS policies to follow the hosts domain chain;
 *       - Node DNS Priority: proxy-server-nameserver-policy > proxy-server-nameserver
 *         (private only) > nameserver-policy > nameserver (private only);
 *       - Public DNS is used solely to identify private DNS, preventing public DNS from entering node resolution;
 *       - The template's global proxy-server-nameserver is always retained as the final fallback;
 *       Conflicts with the same key are resolved according to NAMESERVER_POLICY_PREFER_ORIGINAL to determine priority.
 *
 *  Usage Method (General for Bettbox / FlClash Series Clients):
 *    Configuration -> "..." in the upper right corner of the corresponding subscription -> Edit override script (or "Open Script") -> Create a new script,
 *    paste the entire contents of this file and save, then enable this script on that subscription.
 * ============================================================================
 */
const ruleOptionsEnable = {

  /**
 * Custom Configuration Options
 * Define individual switches for each proxy group (policy group) in the template:
 * true  = Enable this policy group
 * false = Disable this policy group (automatically removed from proxy-groups, and references in other groups are cleaned up)
 * Other functional switches (such as FCM Direct): adjust nodes within the group only, without starting/stopping the policy group.
 */

  // --- Proxy Group (Policy Group) Individual Control Switches ---
  '🌍 PROXY': true,        // Main proxy policy group
  '🔄 负载均衡': true,     // Load balancing policy group
  '👉 手动切换': true,    // Manual selection policy group
  '♻️ 自动选择': true,     // Auto-select by latency policy group
  '📲 Telegram': true,     // Telegram communication software policy group
  '🎮 Games-Global': true, // Gaming policy group
  '✖️ Twitter': true,      // Twitter social platform policy group
  '🤖 AI大模型': true,     // AI large model policy group
  '🎵 TikTok': true,       // TikTok video platform policy group

  // --- Node & Network Feature Switches ---
  '强制证书验证': false,   // When enabled, uniformly sets subscription nodes skip-cert-verify to false (enforces certificate verification); when disabled, leaves it untouched, preserving the original node settings. Treats all nodes equally
  '启用 Reality 增强': true, // Whether to enable support-x25519mlkem768 (X25519MLKEM768 post-quantum key agreement) for Reality nodes with non-empty public-key/short-id
  'IPv6优先': false,         // When enabled, prefers IPv6 based on node ip-version
  'FCM直连': true,          // Enabled by default: hides the FCM group containing DIRECT only; when disabled, retains only 👉 Manual Select (does not remove the FCM group). Switch icon is taken from the FCM proxy group's icon field.
  'TGDC实验分流': false,     // Enables the Telegram DC/regional experiment; when disabled, the original Telegram rules, policy groups, and rule providers are left unchanged.
  '入口解析': false,         // Master switch: when enabled, only the first enabled operator in Telecom > Unicom > Mobile order takes effect.
};

// When the same domain rule key appears, whether subscription original config (true) or template (false) takes precedence (the template currently does not configure
// proxy-server-nameserver-policy, so this switch currently only affects merging between subscription sources)
const NAMESERVER_POLICY_PREFER_ORIGINAL = true;

// ============================================================================
// Domestic Entry Resolution Node Maintenance Area
// Only maintain type / server / port and other optional fields below.
// Do not put name here; ENTRY_RESOLUTION_OPTIONS fixes it as 国内入口解析-运营商.
// You may change, remove, or add any Mihomo node field.
// ============================================================================
const DOMESTIC_ENTRY_PROXIES = {
  // China Telecom
  telecom: {
    type: 'http',
    server: '36.111.33.167',
    port: 13128
  },

  // China Unicom
  unicom: {
    type: 'http',
    server: '119.188.131.55',
    port: 17981
  },

  // China Mobile
  mobile: {
    type: 'http',
    server: '116.196.150.180',
    port: 17981
  }
};

// All three entry nodes are added to the “国内入口解析” proxy group for manual user selection; this order does not represent automatic priority. Node names are fixed here and should not be changed.
const ENTRY_RESOLUTION_OPTIONS = [
  {
    key: '电信入口解析',
    proxyName: '国内入口解析-电信',
    proxy: DOMESTIC_ENTRY_PROXIES.telecom,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China.png'
  },
  {
    key: '联通入口解析',
    proxyName: '国内入口解析-联通',
    proxy: DOMESTIC_ENTRY_PROXIES.unicom,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China_Map.png'
  },
  {
    key: '移动入口解析',
    proxyName: '国内入口解析-移动',
    proxy: DOMESTIC_ENTRY_PROXIES.mobile,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Server.png'
  }
];
// ============================================================================
// Telegram DC/regional experiment split (injected only when ruleOptionsEnable['TGDC实验分流'] is true)
// DC1/DC3: Miami; DC2/DC4: Amsterdam; DC5: Singapore.
// Static CIDRs cannot reliably split co-located DCs, so proxy groups are named by DC pairs.
// ============================================================================
const TGDC_RULE_PROVIDERS = {
  telegram_dc1_dc3_miami: {
    type: 'inline',
    behavior: 'classical',
    payload: [
      // DC1 Pluto / DC3 Aurora — Miami, USA
      'IP-CIDR,91.108.12.0/22,no-resolve',
      'IP-CIDR,149.154.172.0/22,no-resolve',
      'IP-CIDR6,2001:b28:f23d::/48,no-resolve',
    ],
  },
  telegram_dc2_dc4_amsterdam: {
    type: 'inline',
    behavior: 'classical',
    payload: [
      // DC2 Venus / DC4 Vesta — Amsterdam, Netherlands
      'IP-CIDR,91.108.58.0/23,no-resolve',
      'IP-CIDR,91.108.4.0/22,no-resolve',
      'IP-CIDR,91.108.8.0/22,no-resolve',
      'IP-CIDR,149.154.160.0/21,no-resolve',
      'IP-CIDR,95.161.64.0/20,no-resolve',
      'IP-CIDR,91.105.192.0/23,no-resolve',
      'IP-CIDR,185.76.151.0/24,no-resolve',
      // Akiker / entire6548 / RClogs EU supplementary candidates.
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
      // DC5 Flora — Singapore
      'IP-CIDR,91.108.16.0/22,no-resolve',
      'IP-CIDR,91.108.56.0/23,no-resolve',
      'IP-CIDR,149.154.168.0/22,no-resolve',
      'IP-CIDR6,2001:b28:f23c::/48,no-resolve',
      'IP-CIDR6,2001:b28:f23f::/48,no-resolve',
    ],
  },
};

// When a regional group has no matching nodes, display all qualified nodes for manual selection in the subscription's original order.
// Exclude only anomalies, built-in/reject/re-match nodes, and prompt messages from nodes directly listed in the subscription; free, low-multiplier, and high-multiplier nodes are all allowed.
// If still no candidates, use COMPATIBLE; empty-fallback only accepts a single node name, not a proxy group or multiple nodes.
const TGDC_FALLBACK_EXCLUDE_FILTER =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b/iu;
function selectTelegramDcFallbackNodes(originalProxies) {
  const proxies = Array.isArray(originalProxies) ? originalProxies : [];
  return proxies.filter((proxy) => {
    if (!proxy || typeof proxy !== 'object' || typeof proxy.name !== 'string' || proxy.name.trim().length === 0) {
      return false;
    }
    const type = String(proxy.type || '').toLowerCase();
    if (type === 'direct' || type === 'reject' || type === 'rematch') {
      return false;
    }
    const name = proxy.name;
    if (TGDC_FALLBACK_EXCLUDE_FILTER.test(name)) return false;
    return true;
  }).map((proxy) => proxy.name);
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
    // Qure has no native Netherlands icon; this is a custom-drawn Netherlands flag in Qure style, hosted in the repository's assets/icons.
    icon: 'https://fastly.jsdelivr.net/gh/XVSVTsama/mihomo-config-self@main/assets/icons/Netherlands.png',
  },
  {
    name: '📲 Telegram-DC5-SG',
    // Based on actual peering conditions, the DC5 group includes both Hong Kong and Singapore nodes.
    filter: '(?i)🇸🇬|🇭🇰|新加坡|狮城|香港|singapore|hong\\s*kong|\\bSG\\b|\\bSGP\\b|\\bHK\\b|\\bHKG\\b',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png',
  },
];

function buildTelegramDcProxyGroups(originalProxies) {
  const proxies = Array.isArray(originalProxies) ? originalProxies : [];
  const fallbackNodeNames = selectTelegramDcFallbackNodes(proxies);
  return TGDC_PROXY_GROUP_DEFINITIONS.map((definition) => {
    const group = {
      name: definition.name,
      type: 'select',
      filter: definition.filter,
      'include-all-proxies': true,
      'empty-fallback': 'COMPATIBLE',
      icon: definition.icon,
    };
    // Reuse regional definitions and align with the kernel's Unicode word boundaries, whitespace, and lowercase matching to prevent false positives when Chinese characters are placed directly next to abbreviations.
const wordChars = '[\\p{L}\\p{Mn}\\p{Nd}\\p{Pc}\\u200C\\u200D]';
    const spaceChars = '[\\u0009-\\u000D\\u0020\\u0085\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]';
    const regionPattern = definition.filter.replace(/^\(\?i\)/, '').toLowerCase()
      .replace(/\\b([a-z]+)\\b/g, `(?<!${wordChars})$1(?!${wordChars})`)
      .replace(/\\s/g, spaceChars);
    const regionFilter = new RegExp(regionPattern, 'u');
    // The kernel lowers İ to a single-character i; replace it first to prevent JS from expanding it to i plus a combining dot.
    const hasRegionNode = proxies.some((proxy) =>
      proxy && typeof proxy.name === 'string' && regionFilter.test(proxy.name.replace(/\u0130/g, 'I').toLowerCase())
    );
    if (!hasRegionNode && fallbackNodeNames.length > 0) {
      // Relax only when there are no regional candidates; explicitly list all fallback nodes to avoid further regional filtering or mixing in other sources.
      delete group.filter;
      delete group['include-all-proxies'];
      group.proxies = fallbackNodeNames.slice();
    }
    return group;
  });
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

// ============================================================================
// Standard template configuration (kept in sync with the repository mihomo.yaml, equivalent to the JSON representation of that YAML file)
// ============================================================================

// YAML anchor template: TEMPLATE keeps the expanded structure, and anchor hints are attached when returning the final result.
// This neither breaks validation of JS template sync with YAML expanded values, nor prevents Bettbox / FlClash
// from restoring &name, *name, and <<: structures when re-serializing override results.
// inline_classical is used for the inline classical provider dynamically injected when the TGDC experiment split is enabled.
const YAML_ANCHOR_TEMPLATES = {
  domain_mrs: { type: 'http', interval: 86400, behavior: 'domain', format: 'mrs' },
  ipcidr_mrs: { type: 'http', interval: 86400, behavior: 'ipcidr', format: 'mrs' },
  domain_yaml: { type: 'http', interval: 86400, behavior: 'domain' },
  ipcidr_yaml: { type: 'http', interval: 86400, behavior: 'ipcidr' },
  classical_yaml: { type: 'http', interval: 86400, behavior: 'classical' },
  inline_classical: { type: 'inline', behavior: 'classical' }
};

const TEMPLATE = {
  "mode": "rule",
  "mixed-port": 7254,
  "port": 7249,
  "socks-port": 7346,
  "etag-support": true,
  "global-ua": "clash.meta",
  "ipv6": true,
  "log-level": "info",
  "external-controller": "127.0.0.1:9090",
  "external-ui": "dashboard",
  "unified-delay": true,
  "tcp-concurrent": true,
  "keep-alive-idle": 600,
  "keep-alive-interval": 15,
  "store-selected": true,
  "store-fake-ip": true,
  "tun": {
    "enable": true,
    "device": "XVSVT",
    "auto-detect-interface": true,
    "auto-route": true,
    "auto-redirect": true,
    "strict-route": true,
    "stack": "mips",
    "dns-hijack": [
      "any:53",
      "udp://any:53",
      "tcp://any:53"
    ],
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
    ]
  },
  "ntp": {
    "enable": true,
    "write-to-system": false,
    "server": "time.apple.com",
    "port": 123
  },
  "sniffer": {
    "enable": true,
    "parse-pure-ip": true,
    "override-destination": true,
    "sniff": {
      "HTTP": {
        "ports": [
          80,
          "8080-8880"
        ]
      },
      "TLS": {
        "ports": [
          443,
          8443
        ]
      },
      "QUIC": {
        "ports": [
          443,
          8443
        ]
      }
    },
    "force-domain": [
      "+.v2ex.com"
    ],
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
      "8.8.8.8/32",
      "8.8.4.4/32",
      "2001:4860:4860::8888/128",
      "2001:4860:4860::8844/128",
      "1.1.1.1/32",
      "1.0.0.1/32",
      "2606:4700:4700::1111/128",
      "2606:4700:4700::1001/128",
      "9.9.9.9/32",
      "149.112.112.112/32",
      "2620:fe::fe/128",
      "208.67.222.222/32",
      "208.67.220.220/32",
      "2620:119:35::35/128",
      "94.140.14.14/32",
      "94.140.15.15/32",
      "2a10:50c0::ad1:ff/128",
      "2a10:50c0::ad2:ff/128",
      "185.228.168.9/32",
      "185.228.169.9/32",
      "64.6.64.6/32",
      "64.6.65.6/32",
      "77.88.8.8/32",
      "77.88.8.1/32",
      "185.222.222.222/32",
      "45.11.45.11/32",
      "223.5.5.5/32",
      "223.6.6.6/32",
      "2400:3200::1/128",
      "2400:3200:baba::1/128",
      "119.29.29.29/32",
      "182.254.116.116/32",
      "180.76.76.76/32",
      "114.114.114.114/32",
      "114.114.115.115/32",
      "114.114.114.119/32",
      "114.114.115.119/32",
      "1.2.4.8/32",
      "210.2.4.8/32",
      "101.226.4.6/32",
      "218.30.118.6/32"
    ]
  },
  "dns": {
    "enable": true,
    "cache-algorithm": "arc",
    "ipv6": true,
    "listen": "0.0.0.0:1053",
    "use-hosts": true,
    "use-system-hosts": false,
    "default-nameserver": [
      "tls://223.5.5.5#DIRECT",
      "114.114.114.114#DIRECT",
      "https://1.12.12.12/dns-query#DIRECT"
    ],
    "proxy-server-nameserver": [
      "https://hrbgyitz34.cloudflare-gateway.com/dns-query#DIRECT"
    ],
    "direct-nameserver": [
      "https://dns.alidns.com/dns-query#DIRECT",
      "https://doh.pub/dns-query#DIRECT"
    ],
    "direct-nameserver-follow-policy": true,
    "nameserver": [
      "https://cloudflare-dns.com/dns-query#👉 手动切换"
    ],
    "nameserver-policy": {
      "rule-set:proxy@direct,cn,echs_cn,echs_direct": [
        "https://dns.alidns.com/dns-query#DIRECT"
      ],
      "rule-set:private": [
        "system"
      ],
      "rule-set:douyin": [
        "system",
        "180.184.1.1",
        "180.184.2.2"
      ]
    },
      "prefer-h3": false,
    "respect-rules": false,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-range6": "fdfe:dcba:9876::1/64",
    "fake-ip-filter-mode": "blacklist",
    "fake-ip-filter": [
      "rule-set:fakeip-filter_domain",
      "rule-set:private",
      "rule-set:cn",
      "rule-set:echs_cn",
      "rule-set:echs_direct",
      "rule-set:googlefcm",
      "rule-set:applications",
      "rule-set:pixiv",
      "pixshaft.com"
    ],
  },
  "hosts": {
    "+.clash.dev": [
      "127.0.0.1"
    ],
    "services.googleapis.cn": [
      "services.googleapis.com"
    ],
    "+.mcdn.bilivideo.com": [
      "0.0.0.0"
    ],
    "+.mcdn.bilivideo.cn": [
      "0.0.0.0"
    ],
    "mtalk.google.com": [
      "142.250.107.188",
      "108.177.125.188"
    ],
    "dns.msftncsi.com": [
      "131.107.255.255",
      "fd3e:4f5a:5b81::1"
    ],
    "*.pangolin-sdk-toutiao": "0.0.0.0",
    "*.pangolin-sdk-toutiao.*": "0.0.0.0",
    "*.pstatp.com": "0.0.0.0",
    "*.pstatp.com.*": "0.0.0.0",
    "*.pglstatp-toutiao.com": "0.0.0.0",
    "*.pglstatp-toutiao.com.*": "0.0.0.0",
    "gurd.snssdk.com": "0.0.0.0",
    "gurd.snssdk.com.*": "0.0.0.0",
    "*default.ixigua.com": "0.0.0.0"
  },
  "proxies": null,
  "proxy-groups": [
    {
      "name": "🌍 PROXY",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/proxy.png",
      "type": "select",
      "proxies": [
        "👉 手动切换",
        "♻️ 自动选择",
        "🔄 负载均衡",
        "DIRECT"
      ]
    },
    {
      "name": "🔄 负载均衡",
      "icon": "https://www.clashverge.dev/assets/icons/balance.svg",
      "type": "load-balance",
      "proxies": null,
      "url": "https://www.gstatic.com/generate_204",
      "interval": 300,
      "lazy": true,
      "strategy": "sticky-sessions"
    },
    {
      "name": "👉 手动切换",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/select.png",
      "type": "select",
      "proxies": null
    },
    {
      "name": "♻️ 自动选择",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/auto.png",
      "type": "url-test",
      "url": "https://www.gstatic.com/generate_204",
      "interval": 300,
      "tolerance": 50,
      "proxies": null
    },
    {
      "name": "📲 Telegram",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/telegram.png",
      "type": "select",
      "proxies": null
    },
    {
      "name": "🎮 Games-Global",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/games-cn.png",
      "type": "select",
      "proxies": null
    },
    {
      "name": "✖️ Twitter",
      "icon": "https://www.clashverge.dev/assets/icons/twitter.svg",
      "type": "select",
      "filter": "(?i)^(?!.*(?:🇭🇰|香港|Hong\\s*Kong|\\bHK\\b|🇸🇬|新加坡|Singapore|\\bSG\\b)).*(?:住宅|家宽|家寬|家庭宽带|家庭寬頻|原生住宅|住宅\\s*IP|residential|home\\s*broadband|home\\s*internet|🇺🇸|美国|美國|\\bUnited\\s+States\\b|\\bU\\.?S\\.?(?:A\\.?)?\\b).*$",
      "include-all-proxies": true
    },
    {
      "name": "🤖 AI大模型",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/ai.png",
      "type": "select",
      "filter": "(?i)^(?!.*(?:🇭🇰|香港|Hong\\s*Kong|\\bHK\\b|🇸🇬|新加坡|Singapore|\\bSG\\b)).*(?:住宅|家宽|家寬|家庭宽带|家庭寬頻|原生住宅|住宅\\s*IP|residential|home\\s*broadband|home\\s*internet|🇺🇸|美国|美國|\\bUnited\\s+States\\b|\\bU\\.?S\\.?(?:A\\.?)?\\b).*$",
      "include-all-proxies": true
    },
    {
      "name": "🎵 TikTok",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/tiktok.png",
      "type": "select",
      "filter": "(?i)^(?!.*(?:🇭🇰|香港|Hong\\s*Kong|\\bHK\\b|🇸🇬|新加坡|Singapore|\\bSG\\b)).*(?:住宅|家宽|家寬|家庭宽带|家庭寬頻|原生住宅|住宅\\s*IP|residential|home\\s*broadband|home\\s*internet|🇺🇸|美国|美國|\\bUnited\\s+States\\b|\\bU\\.?S\\.?(?:A\\.?)?\\b).*$",
      "include-all-proxies": true
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
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@master/Gemini/Gemini_Domain.yaml",
      "path": "./ruleset/Gemini_Domain.yaml"
    },
    "Grok_Domain": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "url": "https://raw.githubusercontent.com/Accademia/Additional_Rule_For_Clash/refs/heads/main/Grok/Grok_Domain.yaml",
      "path": "./ruleset/Grok_Domain.yaml"
    },
    "HijackingPlus": {
      "type": "http",
      "interval": 86400,
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/Accademia/Additional_Rule_For_Clash/refs/heads/main/HijackingPlus/HijackingPlus_No_Resolve.yaml",
      "path": "./ruleset/HijackingPlus.yaml"
    },
    "TikTok": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/tiktok.mrs",
      "path": "./ruleset/tiktok.mrs"
    },
    "ai-1": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/ai.mrs",
      "path": "./ruleset/ai-1.mrs"
    },
    "ai-2": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ai-!cn.mrs",
      "path": "./ruleset/ai-2.mrs"
    },
    "apple@cn": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/apple@cn.mrs",
      "path": "./ruleset/apple@cn.mrs"
    },
    "douyin": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/douyin.mrs",
      "path": "./ruleset/douyin.mrs"
    },
    "applications": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
      "path": "./ruleset/applications.yaml"
    },
    "cn": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/cn.mrs",
      "path": "./ruleset/cn.mrs"
    },
    "cncidr": {
      "type": "http",
      "interval": 86400,
      "behavior": "ipcidr",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/cnip.mrs",
      "path": "./ruleset/cncidr.mrs"
    },
    "echs_cn": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/domain/cn.mrs",
      "path": "./ruleset/echs_cn.mrs"
    },
    "echs_cn_ip": {
      "type": "http",
      "interval": 86400,
      "behavior": "ipcidr",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/ip/cn.mrs",
      "path": "./ruleset/echs_cn_ip.mrs"
    },
    "echs_direct": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/domain/direct.mrs",
      "path": "./ruleset/echs_direct.mrs"
    },
    "echs_direct_ip": {
      "type": "http",
      "interval": 86400,
      "behavior": "ipcidr",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/ip/direct.mrs",
      "path": "./ruleset/echs_direct_ip.mrs"
    },
    "fakeip-filter_domain": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/fakeip-filter.mrs",
      "path": "./ruleset/fakeip-filter_domain.mrs"
    },
    "games": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/games.mrs",
      "path": "./ruleset/games.mrs"
    },
    "games-cn": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/games-cn.mrs",
      "path": "./ruleset/games-cn.mrs"
    },
    "gfw": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/gfw.mrs",
      "path": "./ruleset/gfw.mrs"
    },
    "google": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
      "path": "./ruleset/google.yaml"
    },
    "google-cn": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/google-cn.mrs",
      "path": "./ruleset/google-cn.mrs"
    },
    "googlefcm": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/googlefcm.mrs",
      "path": "./ruleset/googlefcm.mrs"
    },
    "lancidr": {
      "type": "http",
      "interval": 86400,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
      "path": "./ruleset/lancidr.yaml"
    },
    "pixiv": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/pixiv.mrs",
      "path": "./ruleset/pixiv.mrs"
    },
    "private": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
      "path": "./ruleset/private.yaml"
    },
    "proxy": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/proxy.mrs",
      "path": "./ruleset/proxy.mrs"
    },
    "proxy@direct": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/echs-top/proxy/main/mrs/domain/proxy@direct.mrs",
      "path": "./rules/proxy@direct.mrs"
    },
    "telegram_domain": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs",
      "path": "./rules/telegram_domain.mrs"
    },
    "telegramcidr": {
      "type": "http",
      "interval": 86400,
      "behavior": "ipcidr",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/reddishJade/private_proxy/main/Mihomo/Provider/telegram%40ip.mrs",
      "path": "./ruleset/telegramcidr.mrs"
    },
    "twitter-x-blackmatrix7-No_Resolve": {
      "type": "http",
      "interval": 86400,
      "behavior": "classical",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Twitter/Twitter_No_Resolve.yaml",
      "path": "./ruleset/twitter-x-blackmartix7-noreslove.mrs"
    },
    "twitter-x-domain": {
      "type": "http",
      "interval": 86400,
      "behavior": "domain",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs",
      "path": "./ruleset/twitter/x-domain.mrs"
    },
    "twitter-x-ip": {
      "type": "http",
      "interval": 86400,
      "behavior": "ipcidr",
      "format": "mrs",
      "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/twitter.mrs",
      "path": "./ruleset/twitter/x-ip.mrs"
    }
  },
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
  "rules": [
    "AND,((NETWORK,UDP),(DST-PORT,3478-3479/5349-5350/19302-19309),(NOT,((RULE-SET,cncidr))),(NOT,((RULE-SET,cn))),(NOT,((RULE-SET,applications))),(NOT,((RULE-SET,games))),(NOT,((RULE-SET,games-cn)))),REJECT",
    "RULE-SET,HijackingPlus,REJECT",
    "SUB-RULE,(PROCESS-NAME,com.dragon.read.oversea.gp),fanqie",
    "DOMAIN-KEYWORD,ikuuu,🌍 PROXY",
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
    // Manus AI: Covers Manus Desktop, Manus Helper, and the Android client process
    "PROCESS-NAME-REGEX,(?i).*(manus|tech\\.butterfly\\.app).*,🤖 AI大模型",
    "PROCESS-NAME-REGEX,(?i).*claude.*,🤖 AI大模型",
    "PROCESS-NAME-REGEX,(?i).*anthropic.*,🤖 AI大模型",
    "DOMAIN,api.anthropic.com,🤖 AI大模型",
    "DOMAIN,console.anthropic.com,🤖 AI大模型",
    "DOMAIN,statsig.anthropic.com,🤖 AI大模型",
    "DOMAIN,status.anthropic.com,🤖 AI大模型",
    "DOMAIN,sentry.anthropic.com,🤖 AI大模型",
    "DOMAIN,support.anthropic.com,🤖 AI大模型",
    "DOMAIN,mcp-proxy.anthropic.com,🤖 AI大模型",
    "DOMAIN,platform.claude.com,🤖 AI大模型",
    "DOMAIN,code.claude.com,🤖 AI大模型",
    "DOMAIN,downloads.claude.ai,🤖 AI大模型",
    "DOMAIN,bridge.claudeusercontent.com,🤖 AI大模型",
    "DOMAIN,cdn.growthbook.io,🤖 AI大模型",
    "DOMAIN,cdn.usefathom.com,🤖 AI大模型",
    "DOMAIN,registry.npmjs.org,🤖 AI大模型",
    "DOMAIN,storage.googleapis.com,🤖 AI大模型",
    "DOMAIN,raw.githubusercontent.com,🤖 AI大模型",
    "DOMAIN,formulae.brew.sh,🤖 AI大模型",
    "DOMAIN,http-intake.logs.us5.datadoghq.com,🤖 AI大模型",
    "DOMAIN,browser-intake-us5-datadoghq.com,🤖 AI大模型",
    "DOMAIN,servd-anthropic-website.b-cdn.net,🤖 AI大模型",
    "DOMAIN,claudemcpclient.com,🤖 AI大模型",
    "DOMAIN,claudemcpcontent.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,anthropic.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,claude.ai,🤖 AI大模型",
    "DOMAIN-SUFFIX,claude.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,claudeusercontent.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,clau.de,🤖 AI大模型",
    "DOMAIN-SUFFIX,frame.claudeusercontent.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,modelcontextprotocol.io,🤖 AI大模型",
    "IP-CIDR,160.79.104.0/21,🤖 AI大模型,no-resolve",
    "IP-CIDR6,2607:6bc0::/48,🤖 AI大模型,no-resolve",
    "RULE-SET,Gemini_Domain,🤖 AI大模型",
    "RULE-SET,Grok_Domain,🤖 AI大模型",
    "IP-CIDR,17.253.4.0/23,🤖 AI大模型,no-resolve",
    "DOMAIN,anthropic.com.cdn.cloudflare.net,🤖 AI大模型",
    "DOMAIN,anthropic-com.ghost.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,sentry.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,statsigapi.net,🤖 AI大模型",
    "DOMAIN,browser-intake-us5-datadoghq.com,🤖 AI大模型",
    "DOMAIN-KEYWORD,datadog,🤖 AI大模型",
    "DOMAIN-KEYWORD,sift,🤖 AI大模型",
    "RULE-SET,ai-1,🤖 AI大模型",
    "RULE-SET,ai-2,🤖 AI大模型",
    "RULE-SET,google,🌍 PROXY",
    "RULE-SET,google-cn,🌍 PROXY",
    "PROCESS-NAME-REGEX,.*twitter.*,✖️ Twitter",
    "RULE-SET,twitter-x-domain,✖️ Twitter",
    "RULE-SET,twitter-x-ip,✖️ Twitter,no-resolve",
    "RULE-SET,twitter-x-blackmatrix7-No_Resolve,✖️ Twitter",
    "RULE-SET,apple@cn,DIRECT",
    "RULE-SET,games-cn,DIRECT",
    "PROCESS-NAME,bf6.exe,🎮 Games-Global",
    "RULE-SET,games,🎮 Games-Global",
    "RULE-SET,TikTok,🎵 TikTok",
    "RULE-SET,proxy,🌍 PROXY",
    "RULE-SET,gfw,🌍 PROXY",
    "MATCH,🌍 PROXY"
  ]
};
// Match the most specific anchor template based on the provider's actual fields, and place the YAML merge key first.
// This function must be called after TGDC dynamic provider injection so it can override Telegram DC rule sets.
function applyYamlAnchorHints(result) {
  result['.templates'] = deepClone(YAML_ANCHOR_TEMPLATES);
  const providers = result['rule-providers'];
  if (!providers || typeof providers !== 'object') {
    return;
  }

  const candidates = Object.entries(YAML_ANCHOR_TEMPLATES).sort(
    ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
  );

  Object.keys(providers).forEach((name) => {
    const provider = providers[name];
    if (!provider || typeof provider !== 'object') {
      return;
    }

    const match = candidates.find(([, definition]) =>
      Object.entries(definition).every(([key, value]) => provider[key] === value)
    );
    if (!match) {
      return;
    }

    const [anchorName] = match;
    providers[name] = {
      '<<': `*${anchorName}`,
      ...provider
    };
  });
}

// Bettbox visual switch icons: the client reads global serviceConfigs (where name corresponds to the key in ruleOptionsEnable,
// and icon is the icon displayed on that switch row). Above, only proxy groups are overridden; icon sources for feature switches:
// FCM Direct is derived from the FCM proxy group's icon field (modifying the proxy group's icon once syncs it here);
// Other feature switches (Force Certificate Validation, Enable Reality Enhancement, IPv6 Preference) have their fixed icons specified directly here.
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
      name: 'IPv6优先',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png'
    },
    {
      name: 'TGDC实验分流',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png'
    },
    {
      name: '入口解析',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Domestic.png'
    }
  ]);
// ============================================================================
// Utility Functions
// ============================================================================

// Deep copy: prevents cross-contamination of the same TEMPLATE when main() is called multiple times
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Determines whether a group is the placeholder group corresponding to "Here are all single nodes" in the template:
// Has an explicit proxies field with a null value, for example:
//   - name: 👉 Manual Select
//     proxies:
//     type: select
function isAllNodesPlaceholder(group) {
  return !!group && ('proxies' in group) && group.proxies === null;
}

// =====================================================
// Intelligent DNS Node Domain Supplement Logic
// =====================================================

// Checks whether the server is an IP address
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

  // Normal domain
  return host === rule;
}

function asNameserverList(nameservers) {
  if (Array.isArray(nameservers)) {
    return nameservers.filter(value => typeof value === "string");
  }
return typeof nameservers === "string" ? [nameservers] : [];
}
// Compare whether two nameserver lists are equivalent (ignoring order and duplicates, compared by set)
function sameNameserverSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && Array.from(sa).every((value) => sb.has(value));
}

function selectedEntryResolutionOptions() {
  return ruleOptionsEnable['入口解析'] === true
    ? ENTRY_RESOLUTION_OPTIONS
    : [];
}

function withDnsPolicySuffix(value, suffix) {
  const str = String(value);
  const hashIndex = str.indexOf('#');
  return (hashIndex === -1 ? str : str.slice(0, hashIndex)) + suffix;
}

function applyEntryResolution(result) {
  const options = selectedEntryResolutionOptions();
  if (options.length === 0) {
    return;
  }

  const groupName = '国内入口解析';
  const proxyNames = options.map((option) => option.proxyName);

  if (Array.isArray(result.proxies)) {
    options.forEach((option) => {
      if (!result.proxies.some((proxy) => proxy && proxy.name === option.proxyName)) {
        const injectedProxy = deepClone(option.proxy);
        injectedProxy.name = option.proxyName;
        result.proxies.push(injectedProxy);
      }
    });
  }

  const displayGroup = {
    name: groupName,
    type: 'select',
    proxies: proxyNames,
    url: 'https://g.cn/generate_204',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Domestic.png'
  };
  const existingDisplayGroup = (result['proxy-groups'] || []).find(
    (group) => group && group.name === groupName
  );
  if (existingDisplayGroup) {
    existingDisplayGroup.type = displayGroup.type;
    existingDisplayGroup.proxies = displayGroup.proxies.slice();
    existingDisplayGroup.url = displayGroup.url;
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
const suffix = '#' + groupName;
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
// Public DNS recognition table: used to distinguish between "public directly connectable DNS" and "airport/user private DNS".
// Data references the public DNS list in the local MyClash repository, but only borrows the recognition table here without copying its processing logic.
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
  // Domain keywords
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

  // Check the sources actually participating in resolution by priority:
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

// Resolve multi-level hosts mapping chains: follow step-by-step when the target is still a domain, until it terminates at an IP, has no further mapping, or forms a cycle
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

// Supplement DNS based on node domains
function smartMergeDnsNode(config, result) {
  const rules = collectDnsRules(config);
  const newPolicy = result.dns["proxy-server-nameserver-policy"] || {};
  const newHosts = result.hosts || {};
  const proxies = Array.isArray(config.proxies) ? config.proxies : [];

  // Retain the domain before node mapping to identify and migrate policies, and separately record domains that still require DNS during actual connection.
  // Nodes mapped to IPs do not generate a DNS policy; when mapped to another domain, only the final domain's policy is retained.
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
  // Some subscribed proxy-server-nameservers are udp://127.0.0.1:xxx, working in conjunction with local mihomo DNS
  // module hosts; rewriting proxy.server from hosts can bypass this dependency.
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

  // The original domain is used to identify migratable subscription policies; the output policy matches only actual connection domains.
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

  // When a policy only matches the domain before hosts rewriting, but the final domain is not covered by that policy,
  // add an exact policy for the final domain. The original domain serves only as a migration source and is not written to the final output;
  // original rules that directly match the final domain remain as-is and take precedence.
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

  // When proxy-server-nameserver-policy matches the original domain, its priority also covers the mapped final domain.
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
// nameserver-policy 同样可随 hosts 的域名映射链路传递，但不得覆盖更高优先级。
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

  // 移除与全局兜底相同的策略项，并对取值去重。
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
// TGDC experiment split: modify result only when the switch is true.
// ============================================================================
function applyTelegramDcExperiment(result, originalProxies) {
  if (ruleOptionsEnable['TGDC实验分流'] !== true) {
    return;
  }

  // 将 Telegram 规则集插入原 Telegram 规则集之前；保持其他 provider 的原顺序。
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
// The original 📲 Telegram group is changed to a fallback group, and the three DC/regional groups are inserted after "♻️ 自动选择"; filtering is maintained when regional nodes are present, and all qualified fallback nodes are displayed when they are absent.
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
    ...deepClone(buildTelegramDcProxyGroups(originalProxies))
  );
  result['proxy-groups'] = proxyGroups;

  // Place specific DC/regional rules before the full Telegram rules; the original Telegram rules are redirected to point to the fallback group.
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
// Entry function: Bettbox / FlClash clients call main(config) and use its return value
// ============================================================================
function main(config, profileName) {
  config = config || {};

  // ---- 1. Extract dynamic data from the subscription's raw configuration that would be overwritten by the template but needs to be preserved/merged ----
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];
// 1.1 Reality enhancement switch processing
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

  // 1.2 Node TLS certificate verification switch handling: by default, do not interfere with the subscription node's original skip-cert-verify;
  //     When "Force Certificate Verification" is enabled, uniformly set it to false (force certificate validation), treating all nodes equally.
  const forceCertVerify = ruleOptionsEnable['强制证书验证'] === true;

  for (const proxy of originalProxies) {
    if (!proxy || typeof proxy !== "object") {
      continue;
    }

    if (forceCertVerify) {
      proxy["skip-cert-verify"] = false;
    }
  }

  // 1.3 IPv6 Preference switch: modifies the general ip-version field of subscription nodes only when enabled.
  // If ipv6 is already ipv6-only, leave it unchanged; ipv6-prefer switches to ipv6; other values (including missing) are set to ipv6-prefer.
  const preferIPv6 = ruleOptionsEnable['IPv6优先'] === true;

  if (preferIPv6) {
    for (const proxy of originalProxies) {
      if (!proxy || typeof proxy !== 'object') {
        continue;
      }

      if (proxy['ip-version'] === 'ipv6') {
        continue;
      }
      proxy['ip-version'] = proxy['ip-version'] === 'ipv6-prefer' ? 'ipv6' : 'ipv6-prefer';
    }
  }

  const originalProxyProviders =
    config['proxy-providers'] && typeof config['proxy-providers'] === 'object'
      ? config['proxy-providers']
      : null;

  // ---- 2. Use the template as the base and deep clone it as the final result ----
  const result = deepClone(TEMPLATE);

  // ---- 2.5 TGDC Experiment Split (disabled by default; controlled by UI switch) ----
  applyTelegramDcExperiment(result, originalProxies);
  applyYamlAnchorHints(result);

  // ---- 3. Replace the node list with the real nodes from the subscription ----
  result.proxies = originalProxies;
  if (originalProxyProviders) {
    result['proxy-providers'] = originalProxyProviders;
  }
// ---- 4. Dynamic filtering policy groups: read the separate switch for ruleOptionsEnable ----
  // Identify all disabled policy group names
  const disabledGroupNames = new Set();
  const activeGroupNames = new Set();
(result['proxy-groups'] || []).forEach(group => {
    if (group && group.name) {
      // When TGDC is enabled, 📲 Telegram(Fallback) still uses the original 📲 Telegram switch.
      const optionName = group.name === '📲 Telegram(兜底)' ? '📲 Telegram' : group.name;
      // By default, keep enabled if this name is not specified in rule options
      if (ruleOptionsEnable[optionName] === false) {
        disabledGroupNames.add(group.name);
      } else {
        activeGroupNames.add(group.name);
      }
    }
  });

  // Filter out disabled proxy groups
  result['proxy-groups'] = (result['proxy-groups'] || []).filter(
    group => group && group.name && !disabledGroupNames.has(group.name)
  );

  // Clean up references to "disabled proxy groups" in other enabled proxy groups
  const fallbackTarget = activeGroupNames.has('🌍 PROXY') ? '🌍 PROXY' : 'DIRECT';

  result['proxy-groups'].forEach(group => {
    if (Array.isArray(group.proxies)) {
      group.proxies = group.proxies.filter(p => !disabledGroupNames.has(p));
      // If the list is empty after removal, fill in the fallback strategy (🌍 PROXY first, then DIRECT)
      if (group.proxies.length === 0) {
        group.proxies = [fallbackTarget];
      }
    }
  });

  // ---- 5. Populate groups marked as "Here are all single nodes" with real subscription node names ----
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

  // ---- 5.5 FCM Direct switch: When enabled by default, the FCM hidden group contains only DIRECT;
  //      when disabled, only 👉 Manual Select is kept (this switch does not remove the FCM group, only rewrites the nodes within the group) ----
  const fcmDirectEnabled = ruleOptionsEnable['FCM直连'] === true;
  result['proxy-groups'].forEach((group) => {
    if (group && group.name === 'FCM') {
      group.proxies = fcmDirectEnabled ? ['DIRECT'] : ['👉 手动切换'];
    }
  });

  // ---- 6. Clean up rules in rules that point to disabled proxy groups, redirecting them to the fallback proxy group ----
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
// ---- 7. Intelligent Supplement for DNS Nodes ----
  smartMergeDnsNode(
    config,
    result
  );

  // ---- 8. Domestic Entry Resolution: Appends operator policies onto the final node DNS results. ----
  applyEntryResolution(result);

  return result;
}
