# AGENTS.md

## 项目概览

这是 `maamaa` / `まぁ麻` 麻辣烫网站与 Web予約前台。网站页面以日文为默认语言，并面向顾客支持英语、中文、韩语、越南语、尼泊尔语显示。

本项目是顾客侧前台。品牌、菜单、门店商品可售状态、预约开关、订单、会员、厨房/POS 联动、报表与支付记录由 Foundr1 OS 管理。

## 技术栈

- 框架：Next.js App Router
- UI：React / TypeScript
- 菜单构建器：`src/components/malatang-order-builder.tsx`
- 本地菜单种子：`src/data/malatang-menu.ts`
- 预约/订单代理：`src/app/api/orders/route.js`
- 多语言词典：`public/locales/*.json`

## 常用命令

```bash
npm run dev
npm run build
```

## 多语言与菜单翻译边界

- 本项目可以直接维护非菜单 UI 翻译，例如导航、页面标题、预约表单、按钮、校验提示、会员卡界面、结账说明、帮助文字和静态说明文案。
- 菜单/商品目录翻译不属于本项目的长期维护范围。汤底、药膳スパイス、辛さ、痺れ、味変、麺、トッピング、ドリンク、优惠/兑换券等有稳定 ID 的顾客侧菜单文案，应以 Foundr1 OS `/os/menus` 和公开菜单 API 返回的 `displayNames` 为准。
- `public/locales/*.json` 里可以暂时保留菜单翻译种子，供 Foundr1 OS 导入或本地 API 不可用时回退使用；但不要把它当成独立于 Foundr1 OS 的菜单翻译源。
- 如果页面 UI 文案需要新增语言，可以在本项目里直接补；如果菜单名称或选项翻译不对，应修正 Foundr1 OS 的菜单数据或菜单导入源，而不是只改本项目 UI 词典。

## Foundr1 OS 配合

- 菜单数据会被 Foundr1 OS 从 `src/data/malatang-menu.ts` 和 `public/locales/*.json` 导入。
- 前台应优先消费 Foundr1 OS 标准公开菜单 API，并保留结构化 item/option ID。
- 订单提交给 Foundr1 OS 时，应传递结构化选择，不要只传顾客可读的长文本 summary。
- 与 nanacha 网站共通的 Web予約、会员、支付完成、订单状态、取消/退款规则，应尽量保持一致。
