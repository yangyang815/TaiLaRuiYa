// 迷你拼音表：仅覆盖本项目数据里出现过的汉字（供模糊搜索用）
const K = '一万三下不与专世业丛丝个中主之乌也书买乱事云亚亡亮人仆仇从他仙代仪件任伊伐但位体作你佳使侏侠侵修僵儒光克入全八公兰关具典兹养兽冈再军农冰冲冷冻凝凤凰出击刀刃分划利到制刷刺剂前剑力务动化匙匠医十单南卜厄叉双反发召史叶号合吉后向吞命咒哥哨唤商啸喵器噬回围图圣地场坊块坛坠型堆墙墨士壳备复外夜大天太夫头套女好妖姆始子字孢学孩宇安完官宙宝家寒对导射小尔尘尸尼局属山岩工巨巫巾币布师带幸幻幽庆序庙开异式弓弩弱弹强彩影徒得御徽忌忍怒急性恐恶悠情惧愤戏成戒战戟房手打扭把抓折抛护拉拜拿挂指挖捏据捷掉掌排探控攒支收效教整斑斗料斧断斯新旅旋无日时明星是晚晨普晶暗暴曜曲最月有朋期木本术朵机材村杖杜束条来松板构析林果枪染树样根格械梳棘棱榴横正此步武死段毁每毒毕气水永汽沙治法泡波泰洛洞活派流浆测济浪浴海涌淋混渔渡游满漠漫激瀑火灭灯灵灾炉炮点烈烧热焰熔爆爵片牢物狗独狱狼猩猪玉王玛环玻珀珍球理琥瑞璃瓜瓶生用甲电界疗白的皇皮盔盖盗盘目盾看真眨眼着睡矛矢短石矿码砍破砸硬碎磁礼祝神祭禁福种秘程税穴空穿突章竿符第筑筒管箭篇粉粘精紫红纪纱纵线细终经续维绷绸绿缝网罗罩置翔翠翡翼耀老者耳职肉肯胃胞胡胶能脆脉脑脸腐膝色艺花苏苹荆草荒药莱获菇萝葬葵蒸蓝蔓薙藤蘑虫虹蚀蛋蛛蜂蜘蜜蜡蜥蜴蝙蝠蠕血袋袖裁装视觉角计讨诅话诞语豚账质贯贴赫走身躺车轻输达迅运近进远连迷送逊通速造邪都酒野量金钓钛钟钥钨钩钯钱钴钻铁铂铅铐铜银链锡锤锭键镐镖镜镰长门闪阀阔防阳阶阿附陨雪霍霜霰露面革靴鞍鞭顶顺顿领颤风飞食馆马骑骨骷髅高鬼魂魔鱼鲁鲨鳍鳞鸦鹿黄黑齐龙龟丑乃京傀儡元兵卫原吸宁守岗希怪母沼泽浮液滴漂灰爬狮科素绒美腊腹船芙荡莎蒂蚁蛇螃蟹行被褛褴足部重陆鱿鱼鸟鼠锋醉饥勇极陷阱挨饿烩猫狂钢弯宽喷辉恒夺杰圈喜雨剃矮迪朗锯提炼境改溶传沌桶荧棒音乐盒背牛快蒙贝脚镯鞋尖丘航上翱玫瑰项香囊虎腰趾袜攀爪钉巢包镣底慌深度雷秒表民状域落敏险肤鳃建猎隐形储耐温暖镇静心脏抵声呐箱蹼坦危感知群系涂恩赐毛古座过封镀饰扫帚驯铃铛虾苗基腾鹦鹉饼干和蚊奇同伴方簧可疑咧嘴甜幼罐服喀迈贼翅黏跳特警腥咕噜蛾别泥土淤烬坚固珊瑚绳索锁超级恢忆爱转换雏道威严骏坐兔总绘困模膀直砧由赠或冢掘岛堂启碟哀敌台匣随售难购珠操架互取需常惨各类低概率且未受伤害败牙间奖励次四层胸腿升源等羽塔洋意藏篷蝾螈稀龛洲然李铆锌浇杀产采集植坏织在边虚鲸只柱自锻砂淘洗拾烂内森傍处滩店陶缘坑梦魇摆放芽百瓢变椎多埃纸配周年念限针约叠荷鉴节割熟春撒旦队住持以炸品解绑找城数标救现口痛苦净密她研究绝实早访离遭遇摊吹非屠列蕉叫疯拳桩糖米权茜压勋兑九扣卡卷轴少宠娃潜帽扩狙臂裂英雄鳗饵弗里茨致渊私掠千兆枯萎滑德塞勒尼涡员预言扑观稻诡犬剧姜桃夹坎寡妇文袍核组伞喇叭候西选室纳站于结触降临相螺祸怕充华烘烤份含狩垂欢阴技鲶痴狐狸市蜃楼鳅半锦鲤鳟梭苔秃鹫亲族鲈鳕诺霓鲷鲑蜗杂油微臭蝴蝶蝎萤溜疾两厚猛窝尽定统芒保霉味残七优惠奥暮漩瑙鹰蹦投掷吮闹团鼹季错误园豪废墟透便络症傲娇版择搭推荐巧先路'

const V = [
  'yi', 'wan', 'san', 'xia', 'bu', 'yu', 'zhuan', 'shi', 'ye', 'cong', 'si', 'ge', 'zhong', 'zhu', 'zhi', 'wu', 'ye', 'shu', 'mai', 'luan', 'shi', 'yun',
  'ya', 'wang', 'liang', 'ren', 'pu', 'chou', 'cong', 'ta', 'xian', 'dai', 'yi', 'jian', 'ren', 'yi', 'fa', 'dan', 'wei', 'ti', 'zuo', 'ni', 'jia', 'shi',
  'zhu', 'xia', 'qin', 'xiu', 'jiang', 'ru', 'guang', 'ke', 'ru', 'quan', 'ba', 'gong', 'lan', 'guan', 'ju', 'dian', 'zi', 'yang', 'shou', 'gang', 'zai', 'jun',
  'nong', 'bing', 'chong', 'leng', 'dong', 'ning', 'feng', 'huang', 'chu', 'ji', 'dao', 'ren', 'fen', 'hua', 'li', 'dao', 'zhi', 'shua', 'ci', 'ji', 'qian', 'jian',
  'li', 'wu', 'dong', 'hua', 'shi', 'jiang', 'yi', 'shi', 'dan', 'nan', 'bu', 'e', 'cha', 'shuang', 'fan', 'fa', 'zhao', 'shi', 'ye', 'hao', 'he', 'ji',
  'hou', 'xiang', 'tun', 'ming', 'zhou', 'ge', 'shao', 'huan', 'shang', 'xiao', 'miao', 'qi', 'shi', 'hui', 'wei', 'tu', 'sheng', 'di', 'chang', 'fang', 'kuai', 'tan',
  'zhui', 'xing', 'dui', 'qiang', 'mo', 'shi', 'ke', 'bei', 'fu', 'wai', 'ye', 'da', 'tian', 'tai', 'fu', 'tou', 'tao', 'nv', 'hao', 'yao', 'mu', 'shi',
  'zi', 'zi', 'bao', 'xue', 'hai', 'yu', 'an', 'wan', 'guan', 'zhou', 'bao', 'jia', 'han', 'dui', 'dao', 'she', 'xiao', 'er', 'chen', 'shi', 'ni', 'ju',
  'shu', 'shan', 'yan', 'gong', 'ju', 'wu', 'jin', 'bi', 'bu', 'shi', 'dai', 'xing', 'huan', 'you', 'qing', 'xu', 'miao', 'kai', 'yi', 'shi', 'gong', 'nu',
  'ruo', 'dan', 'qiang', 'cai', 'ying', 'tu', 'de', 'yu', 'hui', 'ji', 'ren', 'nu', 'ji', 'xing', 'kong', 'e', 'you', 'qing', 'ju', 'fen', 'xi', 'cheng',
  'jie', 'zhan', 'ji', 'fang', 'shou', 'da', 'niu', 'ba', 'zhua', 'zhe', 'pao', 'hu', 'la', 'bai', 'na', 'gua', 'zhi', 'wa', 'nie', 'ju', 'jie', 'diao',
  'zhang', 'pai', 'tan', 'kong', 'zan', 'zhi', 'shou', 'xiao', 'jiao', 'zheng', 'ban', 'dou', 'liao', 'fu', 'duan', 'si', 'xin', 'lv', 'xuan', 'wu', 'ri', 'shi',
  'ming', 'xing', 'shi', 'wan', 'chen', 'pu', 'jing', 'an', 'bao', 'yao', 'qu', 'zui', 'yue', 'you', 'peng', 'qi', 'mu', 'ben', 'shu', 'duo', 'ji', 'cai',
  'cun', 'zhang', 'du', 'shu', 'tiao', 'lai', 'song', 'ban', 'gou', 'xi', 'lin', 'guo', 'qiang', 'ran', 'shu', 'yang', 'gen', 'ge', 'xie', 'shu', 'ji', 'leng',
  'liu', 'heng', 'zheng', 'ci', 'bu', 'wu', 'si', 'duan', 'hui', 'mei', 'du', 'bi', 'qi', 'shui', 'yong', 'qi', 'sha', 'zhi', 'fa', 'pao', 'bo', 'tai',
  'luo', 'dong', 'huo', 'pai', 'liu', 'jiang', 'ce', 'ji', 'lang', 'yu', 'hai', 'yong', 'lin', 'hun', 'yu', 'du', 'you', 'man', 'mo', 'man', 'ji', 'pu',
  'huo', 'mie', 'deng', 'ling', 'zai', 'lu', 'pao', 'dian', 'lie', 'shao', 're', 'yan', 'rong', 'bao', 'jue', 'pian', 'lao', 'wu', 'gou', 'du', 'yu', 'lang',
  'xing', 'zhu', 'yu', 'wang', 'ma', 'huan', 'bo', 'po', 'zhen', 'qiu', 'li', 'hu', 'rui', 'li', 'gua', 'ping', 'sheng', 'yong', 'jia', 'dian', 'jie', 'liao',
  'bai', 'de', 'huang', 'pi', 'kui', 'gai', 'dao', 'pan', 'mu', 'dun', 'kan', 'zhen', 'zha', 'yan', 'zhao', 'shui', 'mao', 'shi', 'duan', 'shi', 'kuang', 'ma',
  'kan', 'po', 'za', 'ying', 'sui', 'ci', 'li', 'zhu', 'shen', 'ji', 'jin', 'fu', 'zhong', 'mi', 'cheng', 'shui', 'xue', 'kong', 'chuan', 'tu', 'zhang', 'gan',
  'fu', 'di', 'zhu', 'tong', 'guan', 'jian', 'pian', 'fen', 'zhan', 'jing', 'zi', 'hong', 'ji', 'sha', 'zong', 'xian', 'xi', 'zhong', 'jing', 'xu', 'wei', 'beng',
  'chou', 'lv', 'feng', 'wang', 'luo', 'zhao', 'zhi', 'xiang', 'cui', 'fei', 'yi', 'yao', 'lao', 'zhe', 'er', 'zhi', 'rou', 'ken', 'wei', 'bao', 'hu', 'jiao',
  'neng', 'cui', 'mai', 'nao', 'lian', 'fu', 'xi', 'se', 'yi', 'hua', 'su', 'ping', 'jing', 'cao', 'huang', 'yao', 'lai', 'huo', 'gu', 'luo', 'zang', 'kui',
  'zheng', 'lan', 'man', 'ti', 'teng', 'mo', 'chong', 'hong', 'shi', 'dan', 'zhu', 'feng', 'zhi', 'mi', 'la', 'xi', 'yi', 'bian', 'fu', 'ru', 'xue', 'dai',
  'xiu', 'cai', 'zhuang', 'shi', 'jue', 'jiao', 'ji', 'tao', 'zu', 'hua', 'dan', 'yu', 'tun', 'zhang', 'zhi', 'guan', 'tie', 'he', 'zou', 'shen', 'tang', 'che',
  'qing', 'shu', 'da', 'xun', 'yun', 'jin', 'jin', 'yuan', 'lian', 'mi', 'song', 'xun', 'tong', 'su', 'zao', 'xie', 'dou', 'jiu', 'ye', 'liang', 'jin', 'diao',
  'tai', 'zhong', 'yao', 'wu', 'gou', 'ba', 'qian', 'gu', 'zuan', 'tie', 'bo', 'qian', 'kao', 'tong', 'yin', 'lian', 'xi', 'chui', 'ding', 'jian', 'gao', 'biao',
  'jing', 'lian', 'chang', 'men', 'shan', 'fa', 'kuo', 'fang', 'yang', 'jie', 'a', 'fu', 'yun', 'xue', 'huo', 'shuang', 'xian', 'lu', 'mian', 'ge', 'xue', 'an',
  'bian', 'ding', 'shun', 'dun', 'ling', 'chan', 'feng', 'fei', 'shi', 'guan', 'ma', 'qi', 'gu', 'ku', 'lou', 'gao', 'gui', 'hun', 'mo', 'yu', 'lu', 'sha',
  'qi', 'lin', 'ya', 'lu', 'huang', 'hei', 'qi', 'long', 'gui',
  'chou', 'nai', 'jing', 'kui', 'lei', 'yuan', 'bing', 'wei', 'yuan', 'xi', 'ning', 'shou', 'gang', 'xi', 'guai', 'mu',
  'zhao', 'ze', 'fu', 'ye', 'di', 'piao', 'hui', 'pa', 'shi', 'ke', 'su', 'rong', 'mei', 'la', 'fu', 'chuan', 'fu',
  'dang', 'sha', 'di', 'yi', 'she', 'pang', 'xie', 'xing', 'bei', 'lv', 'lan', 'zu', 'bu', 'zhong', 'lu', 'you', 'yu', 'niao', 'shu', 'feng',
  'zui', 'ji', 'yong', 'ji', 'xian', 'jing', 'ai', 'e', 'hui',
  'mao', 'kuang', 'gang', 'wan', 'kuan', 'pen', 'hui', 'heng', 'duo', 'jie', 'quan', 'xi', 'yu', 'ti', 'ai', 'di', 'lang', 'ju', 'ti', 'lian', 'jing', 'gai', 'rong', 'chuan', 'dun', 'tong', 'ying', 'bang', 'yin', 'yue', 'he', 'bei', 'niu', 'kuai', 'meng', 'bei', 'jiao', 'zhuo', 'xie', 'jian', 'qiu', 'hang', 'shang', 'ao', 'mei', 'gui', 'xiang', 'xiang', 'nang', 'hu', 'yao', 'zhi', 'wa', 'pan', 'zhua', 'ding', 'chao', 'bao', 'liao', 'di', 'huang', 'shen', 'du', 'lei', 'miao', 'biao', 'min', 'zhuang', 'yu', 'luo', 'min', 'xian', 'fu', 'sai', 'jian', 'lie', 'yin', 'xing', 'chu', 'nai', 'wen', 'nuan', 'zhen', 'jing', 'xin', 'zang', 'di', 'sheng', 'na', 'xiang', 'pu', 'tan', 'wei', 'gan', 'zhi', 'qun', 'xi', 'tu', 'en', 'ci', 'mao', 'gu', 'zuo', 'guo', 'feng', 'du', 'shi', 'sao', 'zhou', 'xun', 'ling', 'dang', 'xia', 'miao', 'ji', 'teng', 'ying', 'wu', 'bing', 'gan', 'he', 'wen', 'qi', 'tong', 'ban', 'fang', 'huang', 'ke', 'yi', 'lie', 'zui', 'tian', 'you', 'guan', 'fu', 'ka', 'mai', 'zei', 'chi', 'nian', 'tiao', 'te', 'jing', 'xing', 'gu', 'lu', 'e', 'bie',
  'ni', 'tu', 'yu', 'jin', 'jian', 'gu', 'shan', 'hu', 'sheng', 'suo', 'suo', 'chao', 'ji', 'hui', 'yi', 'ai', 'zhuan', 'huan',
  'chu',
  'dao', 'wei', 'yan', 'jun', 'zuo', 'tu', 'zong', 'hui',
  'kun', 'mo', 'bang', 'zhi',
  // 内容补全（事件Boss/敌怪/物品 + 描述文本）
  'zhen', 'you', 'zeng', 'huo', 'zhong', 'jue', 'dao', 'tang', 'qi', 'die', 'ai', 'di', 'tai', 'xia', 'sui', 'shou', 'nan', 'gou',
  'zhu', 'cao', 'jia', 'hu', 'qu', 'xu', 'chang', 'can', 'ge', 'lei', 'di', 'gai', 'lv', 'qie', 'wei', 'shou', 'shang', 'hai',
  'bai', 'ya', 'jian', 'jiang', 'li', 'ci', 'si', 'ceng', 'xiong', 'tui', 'sheng', 'yuan', 'deng', 'yu', 'ta', 'yang', 'yi',
  'cang', 'peng', 'rong', 'yuan', 'xi', 'kan', 'zhou', 'ran', 'li', 'mao', 'xin', 'jiao', 'sha', 'chan', 'cai', 'ji', 'zhi',
  'huai', 'zhi', 'zai', 'bian', 'xu', 'jing', 'zhi', 'zhu', 'zi', 'duan', 'sha', 'tao', 'xi', 'shi', 'lan', 'nei', 'sen',
  'bang', 'chu', 'tan', 'dian', 'tao', 'yuan', 'keng', 'meng', 'yan', 'bai', 'fang', 'ya', 'bai', 'piao', 'bian', 'zhui',
  'duo', 'ai', 'zhi', 'pei', 'zhou', 'nian', 'nian', 'xian', 'zhen', 'yue', 'die', 'he', 'jian', 'jie', 'ge', 'shu', 'chun',
  'sa', 'dan', 'dui', 'zhu', 'chi', 'yi', 'zha', 'pin', 'jie', 'bang', 'zhao', 'cheng', 'shu', 'biao', 'jiu', 'xian', 'kou',
  'tong', 'ku', 'jing', 'mi', 'ta', 'yan', 'jiu', 'jue', 'shi', 'zao', 'fang', 'li', 'zao', 'yu', 'tan', 'chui', 'fei',
  'tu', 'lie', 'jiao', 'jiao', 'feng', 'quan', 'zhuang', 'tang', 'mi', 'quan', 'xi', 'ya', 'xun', 'dui', 'jiu', 'kou', 'ka',
  'juan', 'zhou', 'shao', 'chong', 'wa', 'qian', 'mao', 'kuo', 'ju', 'bi', 'lie', 'ying', 'xiong', 'man', 'er', 'fu', 'li',
  'ci', 'zhi', 'yuan', 'si', 'lve', 'qian', 'zhao', 'ku', 'wei', 'hua', 'de', 'sai', 'le', 'ni', 'wo', 'yuan', 'yu', 'yan',
  'pu', 'guan', 'dao', 'gui', 'quan', 'ju', 'jiang', 'tao', 'jia', 'kan', 'gua', 'fu', 'wen', 'pao', 'he', 'zu', 'san',
  'la', 'ba', 'hou', 'xi', 'xuan', 'shi', 'na', 'zhan', 'yu', 'jie', 'chu', 'jiang', 'lin', 'xiang', 'luo', 'huo', 'pa',
  'chong', 'hua', 'hong', 'kao', 'fen', 'han', 'shou', 'chui', 'huan', 'yin', 'ji',
  // 钓鱼图鉴补录
  'nian', 'chi', 'hu', 'li', 'shi', 'shen', 'lou', 'qiu', 'ban', 'jin', 'li', 'zun', 'suo', 'tai', 'tu', 'jiu',
  'qin', 'zu', 'lu', 'xue', 'nuo', 'ni', 'diao', 'gui', 'wo', 'za', 'you', 'wei', 'chou', 'hu', 'die', 'xie', 'ying'
, 'liu', 'ji', 'liang', 'hou', 'meng', 'wo', 'jin', 'ding', 'tong', 'mang', 'bao', 'mei', 'wei', 'can', 'qi', 'you', 'hui', 'ao', 'mu', 'xuan', 'nao', 'ying', 'beng', 'tou', 'zhi', 'shun', 'nao', 'tuan', 'yan', 'ji', 'cuo', 'wu', 'yuan', 'hao', 'fei', 'xu', 'tou', 'bian', 'luo', 'zheng', 'ao', 'jiao', 'ban', 'ze', 'da', 'tui', 'jian', 'qiao', 'xian', 'lu']

if (K.length !== V.length) {
  throw new Error('pinyin-mini: K/V length mismatch ' + K.length + '/' + V.length)
}
const M = {}
for (let i = 0; i < K.length; i++) M[K[i]] = V[i]

// 汉字串 → { full: 全拼, init: 首字母 }，非汉字原样保留
function py (s) {
  let full = ''
  let init = ''
  for (const ch of s || '') {
    const p = M[ch]
    if (p) { full += p; init += p[0] } else { full += ch.toLowerCase(); init += ch.toLowerCase() }
  }
  return { full, init }
}

module.exports = { py }
