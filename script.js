/**
 * ============================================================================
 *  Bettbox（FlClash 系内核 / mihomo 下游客户端）JS 覆写脚本
 * ============================================================================
 *
 *  用途：
 *    把当前订阅（原始配置）与本机维护的"标准模板"合并成最终生效配置。
 *
 *  合并规则：
 *    1. 除下面第 2、3、4 条特别说明的部分外，最终配置以 TEMPLATE
 *       （对应 模板.yaml）为准，即模板中已经写好的字段会替换掉订阅原始配置里
 *       的同名字段（例如 dns 的各项细节、rules、rule-providers、sniffer、
 *       tun、proxy-groups 的分组结构等）。订阅原始配置里模板未定义的顶层字段
 *       （比如某些订阅自带的 allow-lan、bind-address）不会被保留，如需保留
 *       请告知后再加逻辑。
 *
 *    2. proxies：使用订阅原始配置里的真实节点列表（模板里这一项本来就是空的，
 *       只是占位）。
 *
 *    3. proxy-groups 里，模板中显式写了 "proxies: " （值为空/null，也就是
 *       模板注释里"此处为所有单节点"的那几个分组，例如 👉 手动切换、
 *       ♻️ 自动选择、📲 Telegram、🎮 Games-Global）会自动填入订阅里全部节点
 *       的名字；其余分组（🌍 PROXY、🔄 负载均衡、✖️ Twitter、🤖 AI大模型、
 *       🎵 TikTok 等）保持模板里原样，不会被订阅节点覆盖或补充。
 *
 *    4.【特别处理】dns.proxy-server-nameserver-policy 采用"合并"而不是
 *       "覆盖"：把模板里的 proxy-server-nameserver-policy 和订阅原始配置里
 *       的 proxy-server-nameserver-policy 取并集。例如模板里是
 *         proxy-server-nameserver-policy:
 *             A: a
 *       订阅原始配置里是
 *         proxy-server-nameserver-policy:
 *             B: b
 *       合并后就是
 *         proxy-server-nameserver-policy:
 *             A: a
 *             B: b
 *       如果同一个 key（同一个域名匹配规则）在模板和订阅里都出现且取值不同，
 *       默认以订阅原始配置里的取值为准（因为这一项通常是"这条订阅自己的代理
 *       服务器域名要怎么解析"，订阅自己最清楚），可以通过下面的
 *       NAMESERVER_POLICY_PREFER_ORIGINAL 开关调整优先级。
 *
 *  使用方法（Bettbox / FlClash 系客户端通用）：
 *    配置 → 对应订阅右上角"..." → 编辑覆写脚本（或"打开脚本"）→ 新建脚本，
 *    把本文件全部内容粘贴进去保存，然后在该订阅上启用这个脚本即可。
 *
 *  如果以后要更新"标准模板"，把新的 模板.yaml 转成 JSON 后替换下面
 *  TEMPLATE 常量的内容即可，main() 里的逻辑不需要改动。
 * ============================================================================
 */

// 出现同一个域名规则 key 时，订阅原始配置(true) 还是模板(false) 优先
const NAMESERVER_POLICY_PREFER_ORIGINAL = true;

// ============================================================================
// 标准模板配置（由 模板.yaml 原样转换而来，等价于该 yaml 文件的 JSON 表示）
// ============================================================================
const TEMPLATE = {
  ".templates": {
    "classical_yaml": {
      "behavior": "classical",
      "interval": 86400,
      "type": "http"
    },
    "domain_mrs": {
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "type": "http"
    },
    "domain_yaml": {
      "behavior": "domain",
      "interval": 86400,
      "type": "http"
    },
    "ipcidr_mrs": {
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "type": "http"
    },
    "ipcidr_yaml": {
      "behavior": "ipcidr",
      "interval": 86400,
      "type": "http"
    }
  },
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
  "interface-name": "XVSVT",
  "ipv6": true,
  "keep-alive-idle": 600,
  "keep-alive-interval": 15,
  "log-level": "info",
  "mixed-port": 7254,
  "mode": "rule",
  "ntp": {
    "benchmark-timeout": "5s",
    "benchmark-url": "https://www.apple.com/library/test/success.html",
    "enable": true,
    "port": 123,
    "server": "time.apple.com",
    "server-list": [
      "time.windows.com"
    ],
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
        "📲 Telegram",
        "🤖 AI大模型",
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
      "behavior": "classical",
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
    "RULE-SET,direct,DIRECT",
    "RULE-SET,applications,DIRECT",
    "RULE-SET,echs_cn,DIRECT",
    "RULE-SET,echs_cn_ip,DIRECT,no-resolve",
    "RULE-SET,echs_direct,DIRECT",
    "RULE-SET,echs_direct_ip,DIRECT,no-resolve",
    "RULE-SET,cn,DIRECT",
    "RULE-SET,cncidr,DIRECT,no-resolve",
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
    "DOMAIN-SUFFIX,intercom.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,intercomcdn.com,🤖 AI大模型",
    "DOMAIN,cdn.usefathom.com,🤖 AI大模型",
    "RULE-SET,Gemini_Domain,🤖 AI大模型",
    "RULE-SET,Grok_Domain,🤖 AI大模型",
    "IP-CIDR,17.253.4.0/23,🤖 AI大模型,no-resolve",
    "DOMAIN-SUFFIX,anthropic.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,claude.ai,🤖 AI大模型",
    "DOMAIN-SUFFIX,claude.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,clau.de,🤖 AI大模型",
    "DOMAIN-SUFFIX,claudemcpclient.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,claudemcpcontent.com,🤖 AI大模型",
    "DOMAIN-SUFFIX,claudeusercontent.com,🤖 AI大模型",
    "DOMAIN,servd-anthropic-website.b-cdn.net,🤖 AI大模型",
    "DOMAIN,anthropic.com.cdn.cloudflare.net,🤖 AI大模型",
    "DOMAIN,anthropic.auth0.com,🤖 AI大模型",
    "DOMAIN,anthropic-com.ghost.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,sentry.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,statsigapi.net,🤖 AI大模型",
    "DOMAIN,browser-intake-us5-datadoghq.com,🤖 AI大模型",
    "DOMAIN-KEYWORD,datadog,🤖 AI大模型",
    "DOMAIN-KEYWORD,sift,🤖 AI大模型",
    "DOMAIN-SUFFIX,intercom.io,🤖 AI大模型",
    "DOMAIN-SUFFIX,intercomcdn.com,🤖 AI大模型",
    "DOMAIN,cdn.usefathom.com,🤖 AI大模型",
    "IP-CIDR,160.79.104.0/21,🤖 AI大模型,no-resolve",
    "IP-CIDR6,2607:6bc0::/32,🤖 AI大模型,no-resolve",
    "IP-ASN,399358,🤖 AI大模型,no-resolve",
    "RULE-SET,ai-1,🤖 AI大模型",
    "RULE-SET,ai-2,🤖 AI大模型",
    "RULE-SET,google,🌍 PROXY",
    "RULE-SET,google-cn,🌍 PROXY",
    "PROCESS-NAME-REGEX,. *twitter.*,✖️ Twitter",
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
      "rule-set:lancidr",
      "rule-set:cncidr"
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
      "DOMAIN-WILDCARD,*.pstatp.com,REJECT",
      "DOMAIN-WILDCARD,*.pstatp.com.*,REJECT",
      "DOMAIN-WILDCARD,*.pglstatp-toutiao.com,REJECT",
      "DOMAIN-WILDCARD,*.pglstatp-toutiao.com.*,REJECT",
      "DOMAIN,gurd.snssdk.com,REJECT",
      "DOMAIN-WILDCARD,gurd.snssdk.com.*,REJECT",
      "DOMAIN-WILDCARD,*default.ixigua.com,REJECT",
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
// 注意：✖️ Twitter / 🤖 AI大模型 / 🎵 TikTok 这类完全没有 proxies 字段、
// 靠 include-all-proxies + filter 工作的分组不会被这个判断命中，
// 会保持模板原样。
function isAllNodesPlaceholder(group) {
  return !!group && ('proxies' in group) && group.proxies === null;
}

// 合并 proxy-server-nameserver-policy：模板与订阅原始配置取并集
function mergeNameserverPolicy(templatePolicy, originalPolicy) {
  const base = templatePolicy && typeof templatePolicy === 'object' ? templatePolicy : {};
  const extra = originalPolicy && typeof originalPolicy === 'object' ? originalPolicy : {};
  return NAMESERVER_POLICY_PREFER_ORIGINAL
    ? Object.assign({}, base, extra)   // key 冲突时 extra（订阅原始配置）优先
    : Object.assign({}, extra, base);  // key 冲突时 base（模板）优先
}

// ============================================================================
// 入口函数：Bettbox / FlClash 系客户端会调用 main(config) 并使用其返回值
// ============================================================================
function main(config, profileName) {
  config = config || {};

  // ---- 1. 从订阅原始配置里取出会被模板覆盖、但需要保留/合并的动态数据 ----
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];
  const originalProxyProviders =
    config['proxy-providers'] && typeof config['proxy-providers'] === 'object'
      ? config['proxy-providers']
      : null;
  const originalDns = config.dns && typeof config.dns === 'object' ? config.dns : {};
  const originalNameserverPolicy =
    originalDns['proxy-server-nameserver-policy'] &&
    typeof originalDns['proxy-server-nameserver-policy'] === 'object'
      ? originalDns['proxy-server-nameserver-policy']
      : {};

  // ---- 2. 以模板为主体，深拷贝一份出来当作最终结果 ----
  const result = deepClone(TEMPLATE);

  // ---- 3. 节点列表换成订阅里的真实节点 ----
  result.proxies = originalProxies;
  if (originalProxyProviders) {
    result['proxy-providers'] = originalProxyProviders;
  }

  // ---- 4. 把标记为"此处为所有单节点"的分组，填入订阅的真实节点名 ----
  const allNodeNames = originalProxies
    .map((p) => p && p.name)
    .filter((name) => typeof name === 'string' && name.length > 0);

  (result['proxy-groups'] || []).forEach((group) => {
    if (isAllNodesPlaceholder(group)) {
      group.proxies = allNodeNames.slice();
      if (originalProxyProviders) {
        group.use = Object.keys(originalProxyProviders);
      }
    }
  });

  // ---- 5.【特别处理】合并 dns.proxy-server-nameserver-policy ----
  const templateNameserverPolicy =
    (result.dns && result.dns['proxy-server-nameserver-policy']) || {};
  const mergedPolicy = mergeNameserverPolicy(templateNameserverPolicy, originalNameserverPolicy);
  if (Object.keys(mergedPolicy).length > 0) {
    result.dns = result.dns || {};
    result.dns['proxy-server-nameserver-policy'] = mergedPolicy;
  }

  return result;
}
