# 图标资源

此目录集中保存 Mihomo 代理组与 Bettbox 覆写脚本使用的图标。命名约定：`self-` 表示本仓库自用/自绘素材；`upstream-<组织>-<仓库>-` 表示从相应上游项目收录的素材。配置统一通过 jsDelivr 引用本仓库中的文件。

## 本仓库素材

- `self-Microsoft.svg`：本仓库绘制的 Microsoft 四色窗口图标。
- `self-Netherlands.png`：本仓库绘制的荷兰国旗图标。

## 上游素材与来源

- `upstream-DustinWin-ruleset_geodata-*.png`：`proxy`、`select`、`auto`、`telegram`、`games-cn`、`ai`、`tiktok`。来源：[DustinWin/ruleset_geodata 图标 Release](https://github.com/DustinWin/ruleset_geodata/releases/tag/icons)。上游声明 GPL-3.0，许可证副本见 [`licenses/DustinWin-ruleset_geodata-LICENSE.txt`](licenses/DustinWin-ruleset_geodata-LICENSE.txt)。
- `upstream-clash-verge-rev-balance.svg`、`upstream-clash-verge-rev-twitter.svg`。来源：[Clash Verge 网站图标目录](https://www.clashverge.dev/assets/icons/)。上游项目声明 GPL-3.0，许可证副本见 [`licenses/clash-verge-rev-LICENSE.txt`](licenses/clash-verge-rev-LICENSE.txt)。
- `upstream-AIsouler-MyClash-Apple.svg`、`upstream-AIsouler-MyClash-Microsoft.svg`、`upstream-AIsouler-MyClash-Steam.svg`。来源：[AIsouler/MyClash](https://github.com/AIsouler/MyClash/tree/main/Icons/svg)。上游声明 MIT，许可证副本见 [`licenses/AIsouler-MyClash-LICENSE.txt`](licenses/AIsouler-MyClash-LICENSE.txt)。
- `upstream-Koolson-Qure-*.png`：`China`、`China_Map`、`Server`、`United_States`、`Singapore`、`Global`、`Telegram`、`Domestic`。来源：[Koolson/Qure 图标集](https://github.com/Koolson/Qure/tree/master/IconSet/Color)。
- `upstream-MiToverG422-Qure-*.png`：`fcm`、`SSL`、`Spark`。来源：[MiToverG422/Qure 图标集](https://github.com/MiToverG422/Qure/tree/master/IconSet/Color)。

两个 Qure 仓库没有 GitHub 识别到的 SPDX 许可证文件。其 README 要求转载注明出处，并说明资源用于分享与学习参考、不得用于商业用途，且相关图标的版权仍归原作者或网站所有。因此本仓库保留明确来源标记；如需商业使用，请先向相应权利人确认授权。

## URL 格式

```text
https://fastly.jsdelivr.net/gh/XVSVTsama/mihomo-config-self@main/assets/icons/<文件名>
```

新增或替换图标时，请同步更新对应配置引用和本说明中的来源记录。上游素材更新不会自动覆盖本目录副本。
