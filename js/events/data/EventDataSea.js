// 普通事件 (Common)
const EVENT_DATA_SEA = [
{
    area: "sea", level: 1, name: "浮游生物群", hunger: 3, disease: 0, mentalHealth: 0, duration: 3, 
    description: "你遇到了一片丰富的浮游生物群", rarity: "common"
},
{
    area: "sea", level: 1, name: "寒流袭击", hunger: -2, disease: 2, mentalHealth: -1, duration: 3, 
    description: "突如其来的寒流让你体温骤降，行动困难", rarity: "common"
},
{
    area: "sea", level: 1, name: "小型藻类爆发", hunger: 2, disease: 1, mentalHealth: 0, duration: 3, 
    description: "海水中藻类大量繁殖，提供了食物但也带来了不适", rarity: "common"
},
{
    area: "sea", level: 1, name: "缺氧水域", hunger: -1, disease: 1, mentalHealth: -2, duration: 4, 
    description: "进入了一片缺氧水域，呼吸困难", rarity: "common"
},
{
    area: "sea", level: 1, name: "海水温度变化", hunger: -1, disease: 1, mentalHealth: -1, duration: 3, 
    description: "海水温度突然变化，影响了你的状态", rarity: "common"
},
{
    area: "sea", level: 1, name: "微型甲壳类聚集", hunger: 3, disease: 0, mentalHealth: 0, duration: 3, 
    description: "大量微型甲壳类生物提供了丰富的食物", rarity: "common"
},

// 稀有事件 (Rare)
{
    area: "sea", level: 1, name: "发光浮游生物", hunger: 2, disease: -1, mentalHealth: 2, duration: 4, 
    description: "夜晚的发光浮游生物创造了梦幻般的景象", rarity: "rare"
},
{
    area: "sea", level: 1, name: "海底温泉", hunger: 1, disease: -2, mentalHealth: 1, duration: 5, 
    description: "海底温泉提供了舒适的环境和疗愈效果", rarity: "rare"
},
{
    area: "sea", level: 1, name: "毒素泄露", hunger: -3, disease: 3, mentalHealth: -2, duration: 4, 
    description: "海底植物释放毒素，让你中毒不适", rarity: "rare"
},
{
    area: "sea", level: 1, name: "海草森林", hunger: 3, disease: -1, mentalHealth: 1, duration: 5, 
    description: "茂密的海草森林提供了庇护所和食物", rarity: "rare"
},

// 史诗事件 (Epic)
{
    area: "sea", level: 1, name: "远古微生物化石", hunger: 2, disease: -2, mentalHealth: 3, duration: 6, 
    description: "发现了保存完好的远古微生物化石，获得了进化启示", rarity: "epic"
},
{
    area: "sea", level: 1, name: "深海热液喷发", hunger: -4, disease: 4, mentalHealth: -3, duration: 6, 
    description: "遭遇了剧烈的深海热液喷发，高温和有毒物质让你受伤", rarity: "epic"
},

// 等级2普通事件 (Common)
{
    area: "sea", level: 2, name: "鱼群迁徙", hunger: 5, disease: 0, mentalHealth: 1, duration: 4, 
    description: "大规模的鱼群迁徙经过，食物充足", rarity: "common"
},
{
    area: "sea", level: 2, name: "海葵共生", hunger: 3, disease: -2, mentalHealth: 2, duration: 5, 
    description: "与海葵建立了共生关系，获得保护和食物", rarity: "common"
},
{
    area: "sea", level: 2, name: "章鱼狩猎受伤", hunger: -3, disease: 2, mentalHealth: -2, duration: 4, 
    description: "在狩猎章鱼时被反击受伤", rarity: "common"
},
{
    area: "sea", level: 2, name: "剧毒水母群", hunger: -4, disease: 4, mentalHealth: -3, duration: 4, 
    description: "误入剧毒水母群，被严重蜇伤中毒", rarity: "common"
},
{
    area: "sea", level: 2, name: "珊瑚礁生态系统", hunger: 4, disease: -1, mentalHealth: 2, duration: 5, 
    description: "丰富的珊瑚礁生态系统提供了多样食物", rarity: "common"
},
{
    area: "sea", level: 2, name: "海底地震", hunger: -2, disease: 1, mentalHealth: -4, duration: 5, 
    description: "遭遇海底地震，环境剧烈变化让你受伤", rarity: "common"
},

// 等级2稀有事件 (Rare)
{
    area: "sea", level: 2, name: "深海发光鱼", hunger: 5, disease: -1, mentalHealth: 3, duration: 5, 
    description: "发现了罕见的深海发光鱼，营养价值和观赏性都很高", rarity: "rare"
},
{
    area: "sea", level: 2, name: "巨型蛤蜊珍珠", hunger: 3, disease: -2, mentalHealth: 4, duration: 6, 
    description: "在巨型蛤蜊中发现了珍珠，带来了好运", rarity: "rare"
},
{
    area: "sea", level: 2, name: "鲸鱼歌声", hunger: 2, disease: -2, mentalHealth: 4, duration: 6, 
    description: "听到了鲸鱼的悠扬歌声，心灵得到抚慰", rarity: "rare"
},

// 等级2史诗事件 (Epic)
{
    area: "sea", level: 2, name: "远古巨鲨化石", hunger: 4, disease: -3, mentalHealth: 6, duration: 8, 
    description: "发现了完整的远古巨鲨化石，获得了重要的进化知识", rarity: "epic"
},
{
    area: "sea", level: 2, name: "海底火山爆发", hunger: -5, disease: 5, mentalHealth: -6, duration: 10, 
    description: "遭遇了剧烈的海底火山爆发，高温和冲击波造成了严重伤害", rarity: "epic"
},

// 等级3普通事件 (Common)
{
    area: "sea", level: 3, name: "深海巨兽踪迹", hunger: 3, disease: -2, mentalHealth: 6, duration: 6, 
    description: "发现了深海巨兽的活动踪迹，获得了生存经验", rarity: "common"
},
{
    area: "sea", level: 3, name: "海底矿物富集区", hunger: 4, disease: 1, mentalHealth: 3, duration: 5, 
    description: "发现了海底矿物富集区，但采集过程有风险", rarity: "common"
},
{
    area: "sea", level: 3, name: "深海窒息区", hunger: -3, disease: 2, mentalHealth: -5, duration: 6, 
    description: "进入了极度缺氧的深海区域，几乎窒息", rarity: "common"
},
{
    area: "sea", level: 3, name: "深海沟壑探索", hunger: 3, disease: 0, mentalHealth: 4, duration: 5, 
    description: "探索了神秘的深海沟壑，开阔了眼界", rarity: "common"
},
{
    area: "sea", level: 3, name: "剧毒热液喷口", hunger: -4, disease: 4, mentalHealth: -4, duration: 7, 
    description: "靠近了剧毒的热液喷口，中毒严重", rarity: "common"
},

// 等级3稀有事件 (Rare)
{
    area: "sea", level: 3, name: "深海神秘现象", hunger: 4, disease: -2, mentalHealth: 7, duration: 8, 
    description: "遇到了深海中的神秘自然现象，获得了启发", rarity: "rare"
},
{
    area: "sea", level: 3, name: "深海巨兽集会", hunger: 3, disease: -3, mentalHealth: 8, duration: 10, 
    description: "偶然遇到了深海巨兽的自然聚集，感受到了原始的力量", rarity: "rare"
},
{
    area: "sea", level: 3, name: "海底大裂谷地震", hunger: -5, disease: 3, mentalHealth: -7, duration: 8, 
    description: "海底大裂谷发生强震，环境剧烈动荡", rarity: "rare"
},

// 等级3史诗事件 (Epic)
{
    area: "sea", level: 3, name: "深海之心", hunger: 5, disease: -4, mentalHealth: 12, duration: 15, 
    description: "发现了深海中的神秘能量源，获得了自然的祝福", rarity: "epic"
},
{
    area: "sea", level: 3, name: "超深渊带生存挑战", hunger: -8, disease: 6, mentalHealth: -10, duration: 20, 
    description: "在超深渊带遭遇极端环境，高压、低温和缺氧让你濒临死亡", rarity: "epic"
},
{
        area: "sea", level: 3, name: "海洋本源觉醒", hunger: 6, disease: -5, mentalHealth: 15, duration: 20, 
        description: "触发了海洋本源的神秘力量，获得了深海的传承", rarity: "epic"
    }
]; 
