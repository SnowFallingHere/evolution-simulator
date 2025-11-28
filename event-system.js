// 重构事件系统类 - 支持等级和地区过滤，增强紧迫感
class EventSystem extends CoreSystem {
    constructor() {
        super();
        this.events = [];
        this.activeEvents = new Map();
        
        // 基础事件概率
        this.baseEventProbabilities = {
            common: 0.06,    // 略微降低概率
            rare: 0.025,     // 保持稀有事件较低概率
            epic: 0.008      // 史诗事件概率很低
        };
        
        // 当前事件概率（可被临时修改）
        this.eventProbabilities = {...this.baseEventProbabilities};
        
        this.eventCooldown = 0;
        this.minCooldownBetweenEvents = 15; // 增加冷却时间
        
        // 当前选择的区域
        this.currentArea = "sea"; // 默认海洋区域
        
        // 概率增强状态
        this.probabilityBoostActive = false;
        this.probabilityBoostTimer = null;
        
        this.init();
    }
    
    init() {
        this.loadEvents();
        this.startEventUpdates();
    }
    
    // 加载事件数据 - 从三个文件合并
    loadEvents() {
        this.events = [];
        
        // 合并所有地区的事件数据
        if (typeof EVENT_DATA_SEA !== 'undefined') {
            this.events = this.events.concat(EVENT_DATA_SEA);
            console.log(`已加载 ${EVENT_DATA_SEA.length} 个海洋事件`);
        }
        
        if (typeof EVENT_DATA_LAND !== 'undefined') {
            this.events = this.events.concat(EVENT_DATA_LAND);
            console.log(`已加载 ${EVENT_DATA_LAND.length} 个陆地事件`);
        }
        
        if (typeof EVENT_DATA_SKY !== 'undefined') {
            this.events = this.events.concat(EVENT_DATA_SKY);
            console.log(`已加载 ${EVENT_DATA_SKY.length} 个天空事件`);
        }
        
        if (this.events.length === 0) {
            console.error('未找到任何事件数据，使用默认事件数据');
            this.loadDefaultEvents();
        } else {
            console.log(`总共加载 ${this.events.length} 个事件`);
        }
    }
    
    // 默认事件数据（后备方案）
    loadDefaultEvents() {
        this.events = [
            {
                area: "sea",
                level: 1,
                name: "基础威胁",
                hunger: 2,
                disease: 1,
                mentalHealth: -1,
                duration: 3,
                description: "遇到了基本的生存威胁",
                rarity: "common"
            }
        ];
    }
    
    startEventUpdates() {
        const timer = setInterval(() => {
            this.updateRandomEvents();
        }, 2000);
        this.timers.push(timer);
    }
    
    updateRandomEvents() {
        // 处理活跃事件
        this.updateActiveEvents();
        
        // 更新事件冷却
        if (this.eventCooldown > 0) {
            this.eventCooldown--;
        }
        
        // 随机触发新事件
        this.triggerRandomEvent();
    }
    
    updateActiveEvents() {
        // 更新所有活跃事件的持续时间
        for (let [eventName, eventData] of this.activeEvents) {
            if (eventData.duration > 0) {
                eventData.duration--;
                
                // 应用事件效果
                this.applyEventEffects(eventData);
                
                if (eventData.duration <= 0) {
                    // 事件结束
                    this.activeEvents.delete(eventName);
                    if (window.evolutionSystem) {
                        window.evolutionSystem.addDailyActivity(`${eventName}状态已结束`);
                    }
                }
            }
        }
    }
    
    applyEventEffects(eventData) {
        if (!window.stateSystem) return;
        
        const stateSystem = window.stateSystem;
        
        // 根据事件等级调整效果强度
        let effectMultiplier = 1;
        if (eventData.level === 2) effectMultiplier = 1.5;
        if (eventData.level === 3) effectMultiplier = 2;
        
        // 史诗级事件额外增强
        if (eventData.rarity === "epic") {
            effectMultiplier *= 1.5;
        }
        
        // 应用饥饿效果
        if (eventData.hunger !== 0) {
            const hungerEffect = eventData.hunger * effectMultiplier;
            stateSystem.hunger = Math.max(0, Math.min(100, stateSystem.hunger + hungerEffect));
        }
        
        // 应用疾病效果
        if (eventData.disease !== 0) {
            const diseaseEffect = eventData.disease * effectMultiplier;
            stateSystem.disease = Math.max(0, Math.min(100, stateSystem.disease + diseaseEffect));
        }
        
        // 应用心理健康效果（只在51级及以上且思考后有效）
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        const hasThought = window.evolutionRouteSystem ? window.evolutionRouteSystem.hasThought : false;
        
        if (eventData.mentalHealth !== 0 && evolutionLevel >= 51 && hasThought) {
            const mentalHealthEffect = eventData.mentalHealth * effectMultiplier;
            stateSystem.mentalHealth = Math.max(0, Math.min(100, stateSystem.mentalHealth + mentalHealthEffect));
        }
        
        stateSystem.updateUI();
    }
    
    // 检查玩家是否符合事件等级要求
    canTriggerEvent(event) {
        if (!window.stateSystem || !window.evolutionSystem) return false;
        
        const evolutionLevel = window.evolutionSystem.getEvolutionLevel();
        const strength = window.stateSystem.strength;
        const speed = window.stateSystem.speed;
        const intelligence = window.stateSystem.intelligence;
        
        switch(event.level) {
            case 1:
                // 等级1：所有玩家都可以遇到
                return true;
                
            case 2:
                // 等级2：进化等级21以上
                return evolutionLevel >= 21;
                
            case 3:
                // 等级3：进化等级51以上，且力量速度≥15
                return evolutionLevel >= 51 && strength >= 15 && speed >= 15;
                
            default:
                return false;
        }
    }
    
    triggerRandomEvent() {
        // 检查冷却时间
        if (this.eventCooldown > 0) {
            return;
        }
        
        if (!window.stateSystem || this.activeEvents.size >= 2) {
            return;
        }
        
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        
        // 根据进化等级调整事件触发概率
        let triggerChance = this.eventProbabilities.common;
        if (evolutionLevel < 10) {
            triggerChance *= 0.4; // 前10级事件概率大幅降低
        } else if (evolutionLevel < 30) {
            triggerChance *= 0.7; // 10-30级事件概率适度降低
        } else if (evolutionLevel > 50) {
            triggerChance *= 0.9; // 高等级时事件触发概率略微降低
        }
        
        if (Math.random() < triggerChance) {
            // 过滤可用事件：不在活跃中且符合等级要求
            const availableEvents = this.events.filter(event => 
                !this.activeEvents.has(event.name) && this.canTriggerEvent(event) && event.area === this.currentArea
            );
            
            if (availableEvents.length > 0) {
                // 根据稀有度选择事件
                const selectedEvent = this.selectEventByRarity(availableEvents);
                this.activateEvent(selectedEvent);
                
                // 设置事件冷却时间
                this.eventCooldown = this.minCooldownBetweenEvents;
            }
        }
    }
    
    selectEventByRarity(availableEvents) {
        const rand = Math.random();
        
        // 根据概率选择事件稀有度
        if (rand < this.eventProbabilities.epic) {
            const epicEvents = availableEvents.filter(event => event.rarity === "epic");
            if (epicEvents.length > 0) {
                return epicEvents[Math.floor(Math.random() * epicEvents.length)];
            }
        }
        
        if (rand < this.eventProbabilities.rare) {
            const rareEvents = availableEvents.filter(event => event.rarity === "rare");
            if (rareEvents.length > 0) {
                return rareEvents[Math.floor(Math.random() * rareEvents.length)];
            }
        }
        
        // 默认返回常见事件
        const commonEvents = availableEvents.filter(event => event.rarity === "common");
        if (commonEvents.length > 0) {
            return commonEvents[Math.floor(Math.random() * commonEvents.length)];
        }
        
        // 如果没有符合条件的事件，随机返回一个
        return availableEvents[Math.floor(Math.random() * availableEvents.length)];
    }
    
    activateEvent(event) {
        // 使用事件自带的持续时间，如果没有则使用默认值
        const duration = event.duration || (3 + Math.floor(Math.random() * 4));
        const eventData = {
            ...event,
            duration: duration,
            startTime: Date.now()
        };
        
        this.activeEvents.set(event.name, eventData);
        
        // 史诗级事件额外效果：减少食物库存
        if (event.rarity === "epic" && window.stateSystem) {
            const foodLost = 20 + Math.floor(Math.random() * 15); // 损失20-35点食物
            window.stateSystem.foodStorage = Math.max(0, window.stateSystem.foodStorage - foodLost);
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent(`⚠️ 史诗级灾害摧毁了部分食物储备！损失了${foodLost}点食物`);
            }
        }
        
        // 立即应用一次效果
        this.applyEventEffects(eventData);
        
        // 记录事件
        if (window.evolutionSystem) {
            const effectText = this.getEffectText(event);
            window.evolutionSystem.addDailyActivity(`${event.description} ${effectText}，将持续${duration}个周期`);
            
            // 根据事件等级和稀有度显示不同重要性的提示
            let importancePrefix = "";
            if (event.rarity === "epic") {
                importancePrefix = "⚠️ 史诗级灾害: ";
            } else if (event.level === 3) {
                importancePrefix = "🔶 高级事件: ";
            } else if (event.rarity === "rare") {
                importancePrefix = "🔸 稀有事件: ";
            }
            
            window.evolutionSystem.addKeyEvent(`${importancePrefix}${event.name} - ${effectText}`);
        }
    }
    
    getEffectText(event) {
        // 根据事件等级调整效果显示
        let effectMultiplier = 1;
        if (event.level === 2) effectMultiplier = 1.5;
        if (event.level === 3) effectMultiplier = 2;
        if (event.rarity === "epic") effectMultiplier *= 1.5;
        
        const effects = [];
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        const hasThought = window.evolutionRouteSystem ? window.evolutionRouteSystem.hasThought : false;
        
        if (event.hunger > 0) effects.push(`饥饿+${(event.hunger * effectMultiplier).toFixed(1)}`);
        if (event.hunger < 0) effects.push(`饥饿${(event.hunger * effectMultiplier).toFixed(1)}`);
        
        if (event.disease > 0) effects.push(`疾病+${(event.disease * effectMultiplier).toFixed(1)}`);
        if (event.disease < 0) effects.push(`疾病${(event.disease * effectMultiplier).toFixed(1)}`);
        
        // 只有在51级及以上且思考后才显示心理健康效果
        if (evolutionLevel >= 51 && hasThought) {
            if (event.mentalHealth > 0) effects.push(`心理健康+${(event.mentalHealth * effectMultiplier).toFixed(1)}`);
            if (event.mentalHealth < 0) effects.push(`心理健康${(event.mentalHealth * effectMultiplier).toFixed(1)}`);
        }
        
        return effects.length > 0 ? `(${effects.join('，')})` : '';
    }
    
    // 手动触发特定事件（用于测试）
    triggerEventByName(eventName) {
        const event = this.events.find(e => e.name === eventName);
        if (event && this.canTriggerEvent(event)) {
            this.activateEvent(event);
            return true;
        }
        return false;
    }
    
    // 获取符合当前玩家等级的所有事件
    getAvailableEvents() {
        return this.events.filter(event => this.canTriggerEvent(event));
    }
    
    // 按等级获取事件
    getEventsByLevel(level) {
        return this.events.filter(event => event.level === level && this.canTriggerEvent(event));
    }
    
    // 按区域获取事件
    getEventsByArea(area) {
        return this.events.filter(event => event.area === area && this.canTriggerEvent(event));
    }
    
    // 获取所有事件列表
    getAllEvents() {
        return this.events;
    }
    
    // 获取活跃事件
    getActiveEvents() {
        return Array.from(this.activeEvents.values());
    }
    
    // 设置当前区域
    setCurrentArea(area) {
        if (['sea', 'land', 'sky'].includes(area)) {
            this.currentArea = area;
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent(`已切换到${this.getAreaName(area)}环境`);
            }
            return true;
        }
        return false;
    }
    
    // 获取区域名称
    getAreaName(area) {
        const areaNames = {
            'sea': '海洋',
            'land': '陆地', 
            'sky': '天空'
        };
        return areaNames[area] || area;
    }
    
    // 获取当前区域
    getCurrentArea() {
        return this.currentArea;
    }
    
    // 增加事件触发概率
    increaseEventProbability() {
        // 如果已经有概率增强在生效，先清除之前的定时器
        if (this.probabilityBoostTimer) {
            clearTimeout(this.probabilityBoostTimer);
            this.probabilityBoostTimer = null;
        }
        
        // 标记概率增强状态
        this.probabilityBoostActive = true;
        
        // 增加概率：普通事件增加50%，稀有和史诗事件增加25%
        this.eventProbabilities.common = Math.min(0.15, this.baseEventProbabilities.common * 1.5);
        this.eventProbabilities.rare = Math.min(0.04, this.baseEventProbabilities.rare * 1.25);
        this.eventProbabilities.epic = Math.min(0.015, this.baseEventProbabilities.epic * 1.25);
        
        console.log(`事件概率增强激活: 普通=${this.eventProbabilities.common}, 稀有=${this.eventProbabilities.rare}, 史诗=${this.eventProbabilities.epic}`);
        
        // 5秒后恢复基础概率
        this.probabilityBoostTimer = setTimeout(() => {
            this.resetEventProbability();
        }, 5000);
    }
    
    // 重置事件概率到基础值
    resetEventProbability() {
        this.eventProbabilities.common = this.baseEventProbabilities.common;
        this.eventProbabilities.rare = this.baseEventProbabilities.rare;
        this.eventProbabilities.epic = this.baseEventProbabilities.epic;
        this.probabilityBoostActive = false;
        this.probabilityBoostTimer = null;
        
        console.log("事件概率已重置为基础值");
    }
    
    // 获取当前概率增强状态
    isProbabilityBoostActive() {
        return this.probabilityBoostActive;
    }
    
    // 结束所有活跃事件
    clearAllEvents() {
        this.activeEvents.clear();
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity("所有事件状态已清除");
        }
    }
}
