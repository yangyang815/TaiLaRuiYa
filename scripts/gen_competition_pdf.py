# -*- coding: utf-8 -*-
"""「向导之书」微信小程序大赛说明文档 PDF 生成"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as canvas_mod
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, HRFlowable, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

pdfmetrics.registerFont(TTFont('MSYH', 'C:/Windows/Fonts/msyh.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('MSYH-B', 'C:/Windows/Fonts/msyhbd.ttc', subfontIndex=0))

OUT = r'D:\小程序库\泰拉瑞亚\向导之书-微信小程序大赛说明文档.pdf'

PRIMARY = colors.HexColor('#1F3A5F')   # 深蓝
ACCENT = colors.HexColor('#C8922E')    # 金
LIGHT = colors.HexColor('#EEF2F7')
GREY = colors.HexColor('#555555')

st_title = ParagraphStyle('t', fontName='MSYH-B', fontSize=15, leading=24, textColor=PRIMARY, spaceBefore=14, spaceAfter=6)
st_h2 = ParagraphStyle('h2', fontName='MSYH-B', fontSize=12, leading=19, textColor=PRIMARY, spaceBefore=10, spaceAfter=4)
st_body = ParagraphStyle('b', fontName='MSYH', fontSize=10.5, leading=18, textColor=colors.HexColor('#222222'), firstLineIndent=21, spaceAfter=5)
st_body0 = ParagraphStyle('b0', parent=st_body, firstLineIndent=0)
st_li = ParagraphStyle('li', parent=st_body, firstLineIndent=0, leftIndent=18, spaceAfter=3)
st_cover_t = ParagraphStyle('ct', fontName='MSYH-B', fontSize=30, leading=44, textColor=colors.white, alignment=TA_CENTER)
st_cover_s = ParagraphStyle('cs', fontName='MSYH', fontSize=14, leading=24, textColor=colors.HexColor('#D8E2EE'), alignment=TA_CENTER)
st_cover_i = ParagraphStyle('ci', fontName='MSYH', fontSize=11, leading=20, textColor=colors.white, alignment=TA_CENTER)
st_tbl = ParagraphStyle('tb', fontName='MSYH', fontSize=9.5, leading=14.5, textColor=colors.HexColor('#222222'))
st_note = ParagraphStyle('note', fontName='MSYH', fontSize=9, leading=14, textColor=GREY, firstLineIndent=0)


def cover_bg(cv, doc):
    cv.saveState()
    cv.setFillColor(PRIMARY)
    cv.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    cv.setFillColor(ACCENT)
    cv.rect(0, A4[1] - 18 * mm, A4[0], 4 * mm, stroke=0, fill=1)
    cv.rect(0, 14 * mm, A4[0], 4 * mm, stroke=0, fill=1)
    cv.setFillColor(colors.HexColor('#2C4A73'))
    cv.circle(A4[0] - 18 * mm, 40 * mm, 42 * mm, stroke=0, fill=1)
    cv.circle(22 * mm, A4[1] - 55 * mm, 30 * mm, stroke=0, fill=1)
    cv.restoreState()


def page_bg(cv, doc):
    cv.saveState()
    cv.setFillColor(colors.HexColor('#888888'))
    cv.setFont('MSYH', 8)
    cv.drawString(18 * mm, 10 * mm, '「向导之书」微信小程序大赛作品说明文档')
    cv.drawRightString(A4[0] - 18 * mm, 10 * mm, '第 %d 页' % doc.page)
    cv.setStrokeColor(colors.HexColor('#CCCCCC'))
    cv.setLineWidth(0.5)
    cv.line(18 * mm, 13.5 * mm, A4[0] - 18 * mm, 13.5 * mm)
    cv.restoreState()


def tbl(data, widths):
    rows = []
    for r in data:
        rows.append([Paragraph(c, st_tbl) for c in r])
    t = Table(rows, colWidths=widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#B9C4D0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


story = []

# ================= 封面 =================
story.append(Spacer(1, 52 * mm))
story.append(Paragraph('向导之书', st_cover_t))
story.append(Paragraph('—— 泰拉瑞亚中文一站式掌上图鉴 ——', st_cover_s))
story.append(Spacer(1, 14 * mm))
story.append(Paragraph('微信小程序大赛 · 作品说明文档', st_cover_s))
story.append(Spacer(1, 26 * mm))
story.append(Paragraph('作 品：向导之书（泰拉瑞亚游戏辅助图鉴小程序）', st_cover_i))
story.append(Paragraph('开发团队：杨浩志（独立开发者）', st_cover_i))
story.append(Paragraph('完成日期：2026 年 10 月', st_cover_i))
story.append(PageBreak())

# ================= 一、作品概述 =================
story.append(Paragraph('一、作品概述', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph(
    '「向导之书」是一款面向《泰拉瑞亚》（Terraria）玩家的中文一站式游戏辅助图鉴微信小程序。'
    '《泰拉瑞亚》是一款拥有五千余种物品、内容体量极为庞大的经典 2D 沙盒游戏，玩家从开荒到毕业的全过程都伴随着高强度的资料查询需求。'
    '本作品将分散在网页 Wiki 各处的中文资料进行结构化整合，装进微信小程序"即用即走"的形态里，让玩家在游戏中随手双开、秒级查到答案。', st_body))
story.append(Paragraph(
    '作品收录 <b>3,973 个物品图鉴条目</b>、<b>140 种敌怪</b>、<b>30 个 Boss</b>、<b>46 种特殊世界种子</b>与<b>22 类生物群系</b>的中文资料，'
    '共 <b>40 个页面</b>、<b>6 个功能分包</b>，内置 <b>7,300 余张</b>游戏贴图与 <b>597 幅</b>自绘像素图标，'
    '累计迭代 <b>228 次</b>版本提交、沉淀 <b>167 个</b>工程化脚本。', st_body))

stat_data = [
    ['指标', '数量', '指标', '数量'],
    ['物品图鉴条目', '3,973 条', '页面总数', '40 页（主包 16 + 分包 24）'],
    ['敌怪 / Boss 图鉴', '140 / 30 种', '功能分包', '6 个'],
    ['内置游戏贴图', '7,300+ 张', '自绘像素图标', '597 幅'],
    ['合成配方数据', '3,462 条', '获取方式结构化数据', '391 条'],
    ['特殊世界种子 / 生物群系', '46 / 22 篇', '版本提交 / 工程脚本', '228 次 / 167 个'],
]
story.append(tbl(stat_data, [40 * mm, 42 * mm, 46 * mm, 52 * mm]))
story.append(Spacer(1, 4))
story.append(Paragraph('注：以上数据统计自作品当前版本源码。', st_note))

# ================= 二、创作背景 =================
story.append(Paragraph('二、创作背景', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph('玩家的资料查询几乎贯穿《泰拉瑞亚》从开荒到毕业的全过程：打 Boss 前要查装备准备，刷材料时要查掉落来源，合成装备时要查配方树。'
                       '但长期以来，中文玩家的查询体验存在三大痛点：', st_body))
story.append(Paragraph('1. <b>网页 Wiki 体验割裂。</b>官方 Wiki 为网页形态，手机浏览器加载慢、排版不适配、广告干扰多，"边玩边查"时来回切换十分低效；', st_li))
story.append(Paragraph('2. <b>信息碎片化。</b>资料散落在物品页、敌怪页、指南页等大量独立页面，查清"这个敌怪掉什么、掉的材料能合成什么、怎么合成"需要反复跳转、自行拼凑；', st_li))
story.append(Paragraph('3. <b>关键信息难获取。</b>配方材料数量、掉落概率、版本差异（如 1.4.4/1.4.5 的机制变更）等玩家最关心的信息，在现有渠道中常常缺失或过时。', st_li))
story.append(Paragraph(
    '微信小程序"即用即走、游戏内随手双开"的形态天然契合这一高频查询场景。作为一名多年的泰拉瑞亚玩家和开发者，'
    '我希望做一个"最全、最准、最快"的中文掌上图鉴，把玩家从繁琐的资料检索中解放出来，于是有了「向导之书」。', st_body))

# ================= 三、创作思路 =================
story.append(Paragraph('三、创作思路', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph('围绕玩家真实的查询动线，作品确立了三条设计主线：', st_body))
story.append(Paragraph('<b>1. 数据为王。</b>攻略工具的核心竞争力是数据的完整与准确。因此把"全量收录 + 准确性工程"放在最高优先级，'
                       '先构建覆盖全部物品、敌怪、配方、获取方式的结构化数据库，再谈界面与功能。', st_li))
story.append(Paragraph('<b>2. 动线优先。</b>玩家最高频的路径是"打怪 → 看掉落 → 查物品 → 看怎么获得 → 看怎么合成"。'
                       '所有页面按这条动线互相联动，让信息"处处可点、点必有效"，把玩家查一件事的跳转次数从多次压缩到一两次。', st_li))
story.append(Paragraph('<b>3. 轻量即用。</b>微信对主包有 2MB 体积限制，而全量图鉴数据体量巨大。'
                       '必须用架构手段让"内容无限"与"启动飞快"两者兼得，而不是牺牲任何一方。', st_li))

# ================= 四、功能简介 =================
story.append(Paragraph('四、功能简介', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph('作品共九大功能模块：', st_body))
func_data = [
    ['功能模块', '功能说明'],
    ['全物品图鉴', '3,973 个条目、18 个分类页签（武器/工具/防具/饰品/弹药/药水增益/材料/召唤物/坐骑/时装染料/食物消耗/掉落战利品等），每条目含贴图、稀有度、属性面板、获取方式与用途说明'],
    ['智能搜索', '支持中文名、英文名、别名与"类别词"模糊召回（如搜"法杖"命中全部 Staff 系武器），主包即时响应，分包结果渐进补充'],
    ['敌怪与 Boss 图鉴', '140 种敌怪、30 个 Boss 的属性、攻击方式与战利品表；掉落物点击直达对应物品弹窗，并可继续下钻至获取方式'],
    ['合成向导', '3,462 条配方，配方树可逐级展开追溯，材料带数量标注与替代材料提示'],
    ['获取方式速查', '391 个条目的结构化"怎么获得"页，按宝箱、钓鱼、敌怪掉落、NPC 出售、合成五类组织，均标注概率与条件'],
    ['NPC 晶塔规划器', '基于官方好感度系数计算晶塔摆放位置与 NPC 居住搭配，生成最优布局建议'],
    ['种子与群系百科', '46 种特殊世界种子（醉酒世界、空岛、终极世界等）与 22 类生物群系的机制详解，含 1.4.4/1.4.5 版本差异说明'],
    ['新手流程攻略', '从创建世界、首夜生存到击败月亮领主的分阶段流程指南'],
    ['消息中心与主题皮肤', '云端版本公告推送；8 款全局主题皮肤（经典深/浅色 + 6 款群系主题，激励视频解锁）；收藏与最近浏览'],
]
story.append(tbl(func_data, [32 * mm, 148 * mm]))

# ================= 五、应用场景 =================
story.append(Paragraph('五、应用场景', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph('<b>1. 游戏中双开速查。</b>战斗间隙切出小程序，秒级查到"这个材料哪里来、这件装备怎么合成"，无需退出游戏打开浏览器；', st_li))
story.append(Paragraph('<b>2. 开荒与毕业规划。</b>新手按流程攻略分阶段推进；进阶玩家用种子百科选择世界类型（如醉酒世界、空岛世界），用晶塔规划器布置 NPC 城镇；', st_li))
story.append(Paragraph('<b>3. 收集与图鉴完成度。</b>按 18 类分类页签系统性浏览收集，收藏功能记录目标物品；', st_li))
story.append(Paragraph('<b>4. 内容创作参考。</b>攻略作者与社区玩家查询结构化的掉率、配方、版本差异数据。', st_li))

# ================= 六、解决的实际问题 =================
story.append(Paragraph('六、解决的实际问题', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
prob_data = [
    ['实际问题', '解决方案与效果'],
    ['移动端查询体验差：网页 Wiki 加载慢、广告多', '原生小程序 + 本地数据 + 多级缓存，查询响应毫秒级，无网页广告干扰，流量消耗极低'],
    ['信息碎片化，查一件事要跳多个页面', '物品—敌怪—配方—获取方式四类数据全链接，掉落物点击直达物品弹窗，弹窗内可继续下钻'],
    ['中文搜索召回不全（搜"法杖"搜不到英文名武器）', '自研"中文类别词→英文词干"映射层，一次搜索同时命中中文名与英文名条目'],
    ['网络攻略数据陈旧、错漏、互相矛盾', '建立数据准确性工程，逐条对照官方 Wiki 修正 500 余处错误与占位文案（详见技术方案）'],
    ['内容量巨大与小程序包体限制的矛盾', '跨分包"数据卷"架构 + 本地缓存，主包保持极小体积的同时收录近 4,000 条目'],
    ['版本更新难以触达用户', '云数据库消息中心推送版本公告，配合未读红点引导'],
]
story.append(tbl(prob_data, [62 * mm, 118 * mm]))

# ================= 七、技术开发方案 =================
story.append(Paragraph('七、技术开发方案', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))

story.append(Paragraph('7.1 总体架构', st_h2))
story.append(Paragraph(
    '采用微信原生小程序框架（未引入第三方跨端框架），主包承载核心交互与主数据，6 个功能分包按需加载：'
    '三个图鉴数据卷（pkg-cat-1/2/3）、合成向导（pkg-recipe）、新手指南（pkgB-guide）、工具集（pkgA-tool）。'
    '逻辑层沉淀十余个自研服务模块：条目索引（dex）、跨卷搜索（catalog-search）、分类映射（cat-groups）、'
    '收藏与最近浏览（store）、主题引擎（theme）、广告频控（ads）、云消息（remote-msg）、配方树（wiki-craft）、像素画工厂（pixelart）等。', st_body))

story.append(Paragraph('7.2 三层"数据卷"数据架构', st_h2))
story.append(Paragraph(
    '受微信主包 2MB 体积限制，自研三层结构：主包索引层（941 条核心条目随主包秒开）；'
    '分包数据卷层（3,973 条图鉴条目分装三卷，经分包异步化按需加载，落地本地存储缓存，二次访问零网络消耗）；'
    '结构化源表层（获取方式 391 条、配方 3,462 条独立成表，驱动速查页与合成向导）。'
    '搜索采用"主包即时命中 + 分包卷渐进补充"的渐进式策略，使首屏体验与数据规模完全解耦。', st_body))

story.append(Paragraph('7.3 查询动线引擎', st_h2))
story.append(Paragraph(
    '自研掉落物解析链：主包 ID 索引 → 名字清洗（剥离"×2~5"数量与形态后缀）与别名映射 → 分包图鉴精确匹配 → 图鉴弹窗展示，'
    '四级回退保证全站 531 个敌怪掉落物"处处可点、点必有效"，未收录条目给出友好提示而非空白页。', st_body))

story.append(Paragraph('7.4 性能工程', st_h2))
story.append(Paragraph(
    '分包预下载策略使高频页面切换零等待；远程消息通道采用 30 分钟节流 + 3 秒超时 + 三级回退（云端 → 本地缓存 → 内置兜底），'
    '兼顾时效与稳定性；组件按需渲染消除无效挂载；配合云数据库降序索引，通过微信官方性能体检逐项优化至达标。', st_body))

story.append(Paragraph('7.5 数据准确性工程（本作品特色）', st_h2))
story.append(Paragraph(
    '内容型工具的价值建立在数据可信之上。为此建立了完整的准确性工程：', st_body))
story.append(Paragraph('1. <b>自动校验：</b>自研 verify-data.js 对全量数据执行 23 项自动校验（条目引用完整性、贴图映射三链路、分类有效性、语法合法性等），任何改动先过校验；', st_li))
story.append(Paragraph('2. <b>幂等补丁流水线：</b>167 个工程化脚本管理数据迭代，全部支持重复执行、可复跑、可回溯，杜绝手工编辑引入的语法损坏；', st_li))
story.append(Paragraph('3. <b>官方源核对：</b>条目内容逐条对照官方中文 Wiki，分 30 余个批次覆盖全部分类，累计修正 500 余处错误来源、缺失概率、过时配方与译名错位。', st_li))

story.append(Paragraph('7.6 商业化与运营', st_h2))
story.append(Paragraph(
    '接入微信广告三类组件并自研频控引擎：插屏广告（冷启动保护、频次与间隔控制，避免打断查询）、'
    '激励视频（解锁群系主题皮肤）、原生模板信息流（列表页底部）；配合云端消息中心形成"功能更新 → 公告触达 → 活跃留存"的运营闭环。', st_body))

# ================= 八、创新点 =================
story.append(Paragraph('八、创新点', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph('<b>1. 跨分包"数据卷"架构。</b>在微信主包 2MB 限制下实现近 4,000 条目、7,300 余张贴图的全量收录，'
                       '配合同步缓存与渐进式搜索，兼顾内容规模与启动速度，为"大内容型"小程序提供了可复用的架构范式。', st_li))
story.append(Paragraph('<b>2. 中文类别词→英文词干搜索映射。</b>针对游戏词汇中英混排的特点设计映射层，'
                       '"法杖 / 弓 / 枪 / 盔甲 / 翅膀"等 20 余个类别词可同时命中中文名与英文名条目，显著提升中文搜索召回率。', st_li))
story.append(Paragraph('<b>3. 全链路可点查询动线。</b>敌怪掉落物、合成材料、获取方式之间四级联动直达，'
                       '配合名字解析与别名机制，将玩家"查一件事"的操作成本压缩到一两次点击。', st_li))
story.append(Paragraph('<b>4. 游戏工具的数据准确性工程。</b>将软件工程方法（自动校验、幂等补丁流水线、官方源逐条核对）引入内容型小程序的数据治理，'
                       '这在同类游戏工具中较为少见，保证了条目的长期可信。', st_li))
story.append(Paragraph('<b>5. AI 结对的独立开发范式。</b>策划、数据、编码、测试、运营由独立开发者与 AI 助手协作完成，'
                       '形成"需求 → 实现 → 校验 → 修复"的高效闭环，是个人开发者产能的一次实践探索。', st_li))
story.append(Paragraph('<b>6. 轻商业化体验闭环。</b>自研广告频控引擎保障查询体验，激励视频解锁主题皮肤形成"内容付费感"的替代方案，实现可持续运营。', st_li))

# ================= 九、实践过程 =================
story.append(Paragraph('九、实践过程', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
stage_data = [
    ['阶段', '主要工作'],
    ['阶段一\n数据基建', '构建 3,973 条图鉴数据卷与 7,300 余张贴图资源库，建立三层数据架构、本地缓存体系与 23 项自动校验'],
    ['阶段二\n功能框架', '完成图鉴、搜索、合成向导、敌怪图鉴、详情页等核心页面，跑通全链路查询动线'],
    ['阶段三\n准确性专项', '以官方 Wiki 为基准，分 30 余个批次对饰品、武器、防具、药水、材料、掉落物、召唤物等全部分类逐条核对，累计修正 500 余处错误与占位文案'],
    ['阶段四\n体验打磨', '统一弹窗交互体系、修复跨页面跳转链路、完成搜索增强与性能体检整改，各项性能指标全部达标'],
    ['阶段五\n商业化与运营', '接入三类广告组件并调优频控策略，上线主题皮肤系统与云端消息中心，保持高频迭代'],
]
story.append(tbl(stage_data, [30 * mm, 150 * mm]))
story.append(Spacer(1, 4))
story.append(Paragraph(
    '整个实践过程累计产生 228 次版本提交、167 个工程化脚本。数据核对阶段的一个典型工作流为：'
    '扫描占位与可疑文案 → 逐条访问官方 Wiki 核对 → 编写幂等补丁脚本批量修正 → 自动校验 → 模拟运行验证跳转与展示 → 版本提交。'
    '该流程保证了数百处修改零事故落地。', st_body))

# ================= 十、团队情况 =================
story.append(Paragraph('十、团队情况', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph(
    '本作品由独立开发者杨浩志完成，采用"独立开发者 + AI 结对"的开发范式：本人负责产品定位、数据标准制定、'
    '内容逐条核对、体验决策与日常运营；AI 助手承担代码实现、数据批量处理与自动化脚本编写，'
    '所有产出均经本人逐项验证与把关。这一范式使一名开发者得以同时胜任策划、前端、数据工程、测试与运营五个角色，'
    '在业余时间完成本作品的全部开发与持续迭代。', st_body))
story.append(Paragraph(
    '后续如获得支持，计划引入社区协作者共同维护数据时效性（版本更新跟进修订），并扩展更多游戏工具矩阵。', st_body))

# ================= 十一、第三方成果引用说明 =================
story.append(Paragraph('十一、第三方成果引用与知识产权说明', st_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT, spaceAfter=8))
story.append(Paragraph(
    '1. 本作品的界面设计、程序代码、数据结构与工程脚本均为团队原创，未使用任何非团队成员的开源框架、代码库或组件，'
    '全部基于微信官方原生技术栈与微信云开发能力实现。', st_body))
story.append(Paragraph(
    '2. 作品中展示的《泰拉瑞亚》游戏贴图素材（物品、敌怪、Boss 图像等）版权归 Re-Logic 公司所有。'
    '本项目作为面向玩家的非独家社区参考工具进行引用展示，不包含对游戏本体的任何修改、破解或分发；'
    '如遇版权异议，将第一时间沟通处理。', st_body))
story.append(Paragraph(
    '3. 图鉴条目的文字数据参考了泰拉瑞亚官方中文 Wiki（terraria.wiki.gg/zh，页面内容采用 CC BY-NC-SA 3.0 授权协议），'
    '本项目在其授权范围内引用并在此注明出处；且所有引用数据均经过结构化整理、逐条校对与二次加工（概率标注、版本差异标注、错误修正），'
    '并非简单复制。', st_body))
story.append(Paragraph(
    '4. 云开发、广告组件、登录能力等均为微信官方平台提供的服务接口。', st_body))
story.append(Paragraph(
    '5. 作品中的 597 幅像素风图标、全部界面视觉与交互设计均为原创产出。', st_body))

# ================= 构建 =================
doc = BaseDocTemplate(OUT, pagesize=A4,
                      leftMargin=18 * mm, rightMargin=18 * mm, topMargin=18 * mm, bottomMargin=18 * mm,
                      title='向导之书-微信小程序大赛说明文档', author='杨浩志')
frame_cover = Frame(0, 0, A4[0], A4[1], id='cover')
frame_body = Frame(18 * mm, 18 * mm, A4[0] - 36 * mm, A4[1] - 36 * mm, id='body')
doc.addPageTemplates([
    PageTemplate(id='cover', frames=[frame_cover], onPage=cover_bg),
    PageTemplate(id='body', frames=[frame_body], onPage=page_bg),
])
story.insert(0, __import__('reportlab').platypus.NextPageTemplate('body'))
story.insert(1, PageBreak())
doc.build(story)
print('PDF 生成完成:', OUT)
import os
print('文件大小: %.1f KB' % (os.path.getsize(OUT) / 1024))
