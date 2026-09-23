// Bettbox Compatibility Statement: The expected behavior of Bettbox clients is to recognize this statement at the beginning of the script (not read it in full),
// The script must follow this convention: the statement must be at the top. Deleting or moving it down will cause the "Custom Rule Switch" entrance not to be displayed.
const Compatible_With_Bettbox = {
  ruleOptionsEnable: true
};
/**
 * ============================================================================
 * Bettbox (FlClash system kernel / mihomo downstream client) JS overwriting script
 * ============================================================================
 *
 * Source:
 *JS script:
 *    https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/script_override.js
 * Template:
 *    https://raw.githubusercontent.com/XVSVTsama/mihomo-config-self/refs/heads/main/mihomo.yaml
 *    storehouse:
 *    https://github.com/XVSVTsama/mihomo-config-self
 *    author:
 *    https://github.com/XVSVTsama
 * Latest content (GitHub commit):
 *    https://github.com/XVSVTsama/mihomo-config-self/commits/main/script_override.js
 * Usage: This script can be loaded directly as a remote overwrite script for Bettbox / FlClash client
 * (The first line of the file is the Bettbox compatibility statement, please do not delete it).
 *
 *Use:
 * Merge the current subscription (original configuration) and the "standard template" (mihomo.yaml) maintained by this warehouse into the final effective configuration.
 *
 *Merge rules:
 * 1. Except for the parts specially stated in Articles 2, 3, and 4 below, the final configuration uses TEMPLATE
 * (corresponding to the mihomo.yaml template) shall prevail, that is, the fields already written in the template will replace the original subscription configuration.
 * Fields with the same name (such as dns details, rules, rule-providers, sniffers,
 * The grouping structure of tun, proxy-groups, etc.). Top-level fields that are not defined by the template in the original subscription configuration will not be retained.
 * (such as allow-lan and bind-address that come with some subscriptions), the only exception is proxy-providers:
 * If the subscription comes with proxy-providers, the final configuration will be retained and injected as it is.
 *
 * 2. proxies: Use the real node list in the original subscription configuration (this item in the template is originally empty,
 *Just a placeholder).
 *
 * 3. In proxy-groups, "proxies: " is explicitly written in the template (the value is empty/null, that is,
 * The groups of "all single nodes here" in the template comments: 👉 manual switching, ♻️ automatic selection,
 * 🔄 Load balancing, 📲 Telegram, 🎮 Games-Global) will automatically fill in all nodes in the subscription
 * name; if the subscription also contains proxy-providers, these groups will be written to use references at the same time
 * provider. The remaining groups remain as they are in the template and will not be overwritten or supplemented by subscription nodes.
 *
 * 4.【Special handling】DNS and hosts:
 * - hosts only if dns.use-hosts=true and dns.listen is related to the DNS endpoint actually participating in node resolution
 * Rewrite the node server when forming a closed loop; the original domain name is only used to identify and migrate private DNS policies,
 * The final result only retains the node domain name policy that still needs DNS resolution after rewriting;
 * - Node DNS priority: proxy-server-nameserver-policy > proxy-server-nameserver
 * (private only) > nameserver-policy > nameserver (private only);
 * - Public DNS is only used to identify private DNS to prevent public DNS from entering node resolution;
 * - Template global proxy-server-nameserver is always retained as a final fallback;
 * When the same key conflicts, NAMESERVER_POLICY_PREFER_ORIGINAL determines the priority.
 *
 * How to use (common to Bettbox / FlClash client):
 * Configuration → "..." in the upper right corner of the corresponding subscription → Edit override script (or "Open script") → Create a new script,
 * Paste the entire content of this file and save it, then enable this script on the subscription.
 * ============================================================================
 */


const ruleOptionsEnable = {

  /**
 * Custom configuration options
 * Define switches separately for each agent group (policy group) in the template:
 * true = enable this policy group
 * false = disable this policy group (will be automatically removed from proxy-groups and clear references in other groups)
 * There are also function switches (such as FCM direct connection): only the nodes in the group are adjusted, and the startup and shutdown of the policy group are not involved.
 */

  // --- Agent group (policy group) individual control switch ---
  '🌍 PROXY': true,        //Master agent policy group
  '🔄 负载均衡': true,     // Load balancing policy group
  '👉 手动切换': true,    // Manually select policy group
  '♻️ 自动选择': true,     // Delay automatic selection of policy group
  '📲 Telegram': true,     // Telegram communication software policy group
  '🎮 Games-Global': true, // Game strategy group
  '✖️ Twitter': true,      // Twitter Social Platform Strategy Group
  '🤖 AI大模型': true,     //AI large model strategy group
  '🎵 TikTok': true,       //TikTok Video Platform Strategy Group

  // --- Node and network function switch ---
  '强制证书验证': false,   // When it is turned on, set skip-cert-verify of the subscription node to false (forced certificate verification); when it is turned off, no intervention is performed, and the original settings of the subscription node are retained. Treat all nodes equally
  '启用 Reality 增强': true, // Whether to enable support-x25519mlkem768 (X25519MLKEM768 post-quantum key negotiation) for Reality nodes with non-empty public-key/short-id
  'IPv6优先': false,         // After turning it on, IPv6 will be used first according to the node ip-version.
  'FCM直连': true,          // Open by default: Hide group FCM only contains DIRECT; when closed, only keep 👉 Manual switch (without removing FCM group). The switch icon is taken from the icon field of the FCM agent group.
  'TGDC实验分流': false,     // Enable Telegram DC/regional experimental distribution; when closed, the original Telegram rules, policy groups and rule sets will not be changed.
  '入口解析': false,         // After opening, all three domestic entry nodes will join the same proxy group.
};

// When the same domain name rule key appears, whether to subscribe to the original configuration (true) or the template (false) takes precedence (the template is currently not configured
// proxy-server-nameserver-policy, so this switch currently only affects the merge between subscription sources)
const NAMESERVER_POLICY_PREFER_ORIGINAL = true;

// ============================================================================
//Domestic entrance analysis node maintenance area
// Only maintain the type / server / port and other optional fields below.
// name should not be written here, it is fixed by ENTRY_RESOLUTION_OPTIONS to the domestic entrance resolution-operator.
// Any Mihomo node field can be modified, deleted or added.
// ============================================================================
const DOMESTIC_ENTRY_PROXIES = {
  //China Telecom
  telecom: {
    type: 'http',
    server: '36.111.33.167',
    port: 13128
  },

  //China Unicom
  unicom: {
    type: 'http',
    server: '119.188.131.55',
    port: 17981
  },

  //China Mobile
  mobile: {
    type: 'http',
    server: '116.196.150.180',
    port: 17981
  }
};

// The three entry nodes will join the "domestic entry resolution" proxy group, which is manually selected by the user; the order here does not represent automatic priority. The node name is fixed here and should not be modified.
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
// Telegram DC/regional experimental distribution (only injected when ruleOptionsEnable['TGDC experimental distribution'] is true)
// DC1/DC3：Miami；DC2/DC4：Amsterdam；DC5：Singapore。
// Static CIDR cannot reliably split intra-city DCs, so policy groups are named using DC pairs.
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
      // EU supplementary candidate for Akiker/entire6548/RClogs.
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

// empty-fallback must be the actual outbound node name, proxy-group cannot be filled in.
// fallback uses low_filter idea: exclude non-real nodes such as built-in/rejection/rematch/multiply/strategy group, etc.
// Then take the first node in the original order of the subscribed nodes after overwriting; if there is no result, use COMPATIBLE.
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
    // Use FlagCDN's national flag resource to replace the possibly invalid Qure Netherlands icon.
    icon: 'https://flagcdn.com/w160/nl.png',
  },
  {
    name: '📲 Telegram-DC5-SG',
    // According to the actual interconnection situation, the DC5 group includes both Hong Kong and Singapore nodes.
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

// ============================================================================
// Standard template configuration (synchronized with the warehouse mihomo.yaml, equivalent to the JSON representation of the yaml file)
// ============================================================================

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
    "stack": "gvisor",
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
    "nameserver": [
      "https://cloudflare-dns.com/dns-query#👉 手动切换"
    ],
    "nameserver-policy": {
      "rule-set:private,proxy@direct,cn,echs_cn,echs_direct": [
        "https://dns.alidns.com/dns-query#DIRECT"
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
      "filter": "美国|住宅",
      "include-all-proxies": true
    },
    {
      "name": "🤖 AI大模型",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/ai.png",
      "type": "select",
      "filter": "美国|住宅",
      "include-all-proxies": true
    },
    {
      "name": "🎵 TikTok",
      "icon": "https://github.com/DustinWin/ruleset_geodata/releases/download/icons/tiktok.png",
      "type": "select",
      "filter": "美国|住宅",
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
    // Manus AI: Covers Manus Desktop, Manus Helper and Android client processes
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

// Bettbox's visual switch icon: the client will read the global serviceConfigs (name corresponds to the key of ruleOptionsEnable,
// icon is the icon displayed for this switch row). The above only covers the agent group; the icon source of the function switch:
// FCM direct connection is derived from the icon field of the FCM agent group (change the agent group icon in one place to synchronize);
// The remaining function switches (force certificate verification, enable Reality enhancement, IPv6 priority) directly specify the fixed icon here.
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
// Utility function
// ============================================================================

// Deep copy: avoid contaminating the same TEMPLATE with each other when calling main() multiple times
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Determine whether it is a placeholder group for "all single nodes here" in the template:
// The proxies field is explicitly written and the value is null, for example:
// - name: 👉 Manual switch
//     proxies:
//     type: select
function isAllNodesPlaceholder(group) {
  return !!group && ('proxies' in group) && group.proxies === null;
}

// =====================================================
// DNS node domain name intelligent supplementary logic
// =====================================================

// Determine whether server is IP
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

// Wildcard domain name matching
function matchWildcardDomain(rule, host) {
  rule = normalizeDomain(rule);
  host = normalizeDomain(host);

  if (!rule || !host) {
    return false;
  }

  // Rules of the form +.example.com
  if (rule.startsWith("+.")) {
    const suffix = rule.substring(2);
    return (
      host === suffix ||
      host.endsWith("." + suffix)
    );
  }

  // Rules of the form .example.com
  if (rule.startsWith(".")) {
    const suffix = rule.substring(1);
    return host.endsWith("." + suffix);
  }

  // * wildcard
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

  // Ordinary domain name
  return host === rule;
}

function asNameserverList(nameservers) {
  if (Array.isArray(nameservers)) {
    return nameservers.filter(value => typeof value === "string");
  }

  return typeof nameservers === "string" ? [nameservers] : [];
}
// Compare two nameserver lists for equality (ignore order and duplication, compare by set)
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
// Public DNS identification table: Used to distinguish between "public directly connectable DNS" and "airport/user's private DNS".
//The data refers to the public DNS list in the local MyClash warehouse, but here we only borrow the identification table and do not copy its processing logic.
const publicDnsList = [
  // Domestic
  '223.5.5.5', '223.6.6.6', '119.29.29.29', '1.12.12.12',
  '120.53.53.53', '114.114.114.114', '180.76.76.76', '1.2.4.8',
  '116.116.116.116', '101.226.4.6', '123.125.81.6', '180.184.1.1',
  '180.184.2.2',
  // Abroad
  '1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4', '9.9.9.9',
  '149.112.112.112', '208.67.222.222', '208.67.220.220',
  '94.140.14.14', '94.140.15.15', '76.76.2.0', '76.76.10.0',
  '185.228.168.9', '185.228.169.9', '77.88.8.8', '77.88.8.1',
  '156.154.70.1', '156.154.71.1', '127.0.0.1',
  //Domain name keywords
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

  // Check the sources actually participating in parsing by priority:
  // proxy-server-nameserver-policy > proxy-server-nameserver > nameserver-policy > nameserver.
  for (const group of candidates) {
    if (group.length > 0) {
      return group.some((nameserver) => dnsServerEndpoint(nameserver) === listen);
    }
  }
  return false;
}

// Extract the DNS merge source from the original configuration.
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

  // hosts only participate in node server rewriting when use-hosts=true and DNS monitoring forms a closed loop.
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

//Resolve hosts multi-level mapping chain: when the target is still a domain name, follow it step by step until the end point is IP, no more mappings or a loop
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

// Supplement DNS based on node domain name
function smartMergeDnsNode(config, result) {
  const rules = collectDnsRules(config);
  const newPolicy = result.dns["proxy-server-nameserver-policy"] || {};
  const newHosts = result.hosts || {};
  const proxies = Array.isArray(config.proxies) ? config.proxies : [];

  // Keep the domain name before node mapping to identify and migrate the policy, and separately record the domain name that still requires DNS when actually connecting.
  // Nodes mapped to IP do not generate DNS policy; only the policy of the final domain name is retained when mapped to another domain name.
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

  // Process hosts first: override proxy.server before matching DNS policy.
  // The partially subscribed proxy-server-nameserver is udp://127.0.0.1:xxx, and cooperates with local mihomo DNS
  // hosts within the module; rewriting proxy.server from hosts can circumvent this dependency.
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

  // The original domain name is used to identify the migrationable subscription policy; the output policy only matches the actual connection domain name.
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

  // When a policy only hits the domain name before hosts is rewritten, but the final domain name is not covered by the policy,
  //Add a precise policy for the final domain name. The original domain name only serves as the migration source and is not written into the final result;
  // The original rule that has directly matched the final domain name remains intact and takes precedence.
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

  //Priority: proxy-server-nameserver-policy > proxy-server-nameserver (private only)
  // > nameserver-policy > nameserver (private only).
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

  // When proxy-server-nameserver-policy hits the original domain name, its priority also covers the final mapped domain name.
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

    // nameserver-policy can also be passed along with the domain name mapping link of hosts, but it must not override higher priority.
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

  // Remove the policy items that are the same as the global bottom line and deduplicate the values.
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
// TGDC experiment diversion: only modify result when the switch is true.
// ============================================================================
function applyTelegramDcExperiment(result, originalProxies) {
  if (ruleOptionsEnable['TGDC实验分流'] !== true) {
    return;
  }

  // Insert the Telegram rule set before the original Telegram rule set; keep the original order of other providers.
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

  //The original 📲 Telegram group is changed to the bottom group, and three DC/region groups are inserted after "♻️Automatic selection"; nodes are automatically filtered by filter. Empty groups are natively fallbacked by Mihomo.
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

  //Place specific DC/region rules before Telegram full rules; the original Telegram rules are changed to point to the bottom group.
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
// Entry function: Bettbox / FlClash client will call main(config) and use its return value
// ============================================================================
function main(config, profileName) {
  config = config || {};

  // ---- 1. Take out the dynamic data that will be overwritten by the template but needs to be retained/merged from the original subscription configuration ----
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];

  // 1.1 Reality enhanced switch processing
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

  // 1.2 Node TLS certificate verification switch processing: By default, the original skip-cert-verify of the subscribing node will not be interfered;
  // When "mandatory certificate verification" is turned on, set it to false (mandatory certificate verification) and treat all nodes equally.
  const forceCertVerify = ruleOptionsEnable['强制证书验证'] === true;

  for (const proxy of originalProxies) {
    if (!proxy || typeof proxy !== "object") {
      continue;
    }

    if (forceCertVerify) {
      proxy["skip-cert-verify"] = false;
    }
  }

  // 1.3 IPv6 priority switch: Modify the general ip-version field of the subscribing node only when turned on.
  // ipv6 is already IPv6 only and remains unchanged; ipv6-prefer is switched to ipv6; other values ​​(including missing ones) are set to ipv6-prefer.
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

  // ---- 2. Use the template as the main body and make a deep copy as the final result ----
  const result = deepClone(TEMPLATE);

  // ---- 2.5 TGDC experimental shunt (off by default; controlled by UI switch) ----
  applyTelegramDcExperiment(result, originalProxies);

  // ---- 3. Replace the node list with the real nodes in the subscription ----
  result.proxies = originalProxies;
  if (originalProxyProviders) {
    result['proxy-providers'] = originalProxyProviders;
  }

  // ---- 4. Dynamic filtering policy group: read the individual switch of ruleOptionsEnable ----
  //Identify all disabled policy group names
  const disabledGroupNames = new Set();
  const activeGroupNames = new Set();

  (result['proxy-groups'] || []).forEach(group => {
    if (group && group.name) {
      // After TGDC is turned on, 📲 Telegram still uses the original 📲 Telegram switch.
      const optionName = group.name === '📲 Telegram(兜底)' ? '📲 Telegram' : group.name;
      // By default, if this name is not written in the rule options, it will remain enabled.
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

  // Clear references to the "disabled policy group" in other enabled policy groups
  const fallbackTarget = activeGroupNames.has('🌍 PROXY') ? '🌍 PROXY' : 'DIRECT';

  result['proxy-groups'].forEach(group => {
    if (Array.isArray(group.proxies)) {
      group.proxies = group.proxies.filter(p => !disabledGroupNames.has(p));
      // If the list is empty after elimination, fill in the minimum strategy (first 🌍 PROXY, secondly DIRECT)
      if (group.proxies.length === 0) {
        group.proxies = [fallbackTarget];
      }
    }
  });

  // ---- 5. Fill in the group marked "Here are all single nodes" with the real node name of the subscription ----
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

  // ---- 5.5 FCM direct connection switch: When turned on by default, the FCM hidden group only contains DIRECT;
  // Only retain after closing 👉 Manual switch (this switch does not remove the FCM group, only rewrites the nodes in the group) ----
  const fcmDirectEnabled = ruleOptionsEnable['FCM直连'] === true;
  result['proxy-groups'].forEach((group) => {
    if (group && group.name === 'FCM') {
      group.proxies = fcmDirectEnabled ? ['DIRECT'] : ['👉 手动切换'];
    }
  });

  // ---- 6. Clean up the rules in rules that point to the disabled policy group and point to the guaranteed policy group ----
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

  // ---- 7. DNS node intelligence supplement ----
  smartMergeDnsNode(
    config,
    result
  );

  // ---- 8. Domestic entrance resolution: append operator policy to the final node DNS result. ----
  applyEntryResolution(result);

  return result;
}
