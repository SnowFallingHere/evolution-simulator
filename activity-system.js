// 活动系统类
class ActivitySystem extends CoreSystem {
    constructor(stateSystem, eventSystem) {
        super();
        this.stateSystem = stateSystem;
        this.eventSystem = eventSystem;
    }
    
    hunt() {
        if (!this.stateSystem.canStartActivity('hunt')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法捕猎，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        this.stateSystem.cooldowns.hunt = this.stateSystem.maxCooldowns.hunt;
        this.stateSystem.activityState = 'hunting';
        
        // 捕猎后设置全局冷却
        this.stateSystem.globalCooldown = this.stateSystem.globalCooldownDuration;
        
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        
        // 调整捕猎失败率 - 前期更难
        const baseFailChance = 0.6 - (evolutionLevel * 0.01);
        const attributeBonus = (this.stateSystem.strength + this.stateSystem.speed + this.stateSystem.intelligence) * 0.005;
        let failChance = Math.max(0.2, baseFailChance - attributeBonus);
        
        // 保底机制：当饥饿值>=85时，大幅增加获得食物的概率
        if (this.stateSystem.hunger >= 85) {
            const hungerBonus = (this.stateSystem.hunger - 85) * 0.03; // 每超过85点饥饿值，减少3%失败率
            failChance = Math.max(0.05, failChance - hungerBonus); // 最低保持5%的失败率
        }
        
        if (Math.random() < failChance) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity("捕猎失败！没有获得食物");
            }
            
            // 降低受伤和中毒概率
            if (Math.random() < 0.2 && this.eventSystem) { // 从0.4降低到0.2
                this.eventSystem.triggerInjury(0.3 + Math.random()); // 降低伤害严重程度
            }
            if (Math.random() < 0.15 && this.eventSystem) { // 从0.3降低到0.15
                this.eventSystem.triggerPoison(0.2 + Math.random()); // 降低中毒严重程度
            }
            
            this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 5);
            this.stateSystem.mentalHealth = Math.max(0, this.stateSystem.mentalHealth - 5);
            
        } else {
            // 调整食物获取量 - 前期更少
            const baseFood = 5 + Math.random() * 5;
            const levelBonus = evolutionLevel * 0.5;
            const attributeBonus = (this.stateSystem.strength + this.stateSystem.speed) * 0.1;
            let foodGained = baseFood + levelBonus + attributeBonus;
            
            // 保底机制：当饥饿值>=85时，额外获得食物
            if (this.stateSystem.hunger >= 85) {
                const hungerBonus = (this.stateSystem.hunger - 85) * 0.5; // 每超过85点饥饿值，额外获得0.5食物
                foodGained += hungerBonus;
            }
            
            this.stateSystem.foodStorage += foodGained;
            
            // 属性增长也更少
            const strGain = 0.02 + Math.random() * 0.03;
            const spdGain = 0.02 + Math.random() * 0.03;
            const intGain = 0.01 + Math.random() * 0.02;
            
            this.stateSystem.strength = Math.min(this.stateSystem.maxAttribute, this.stateSystem.strength + strGain);
            this.stateSystem.speed = Math.min(this.stateSystem.maxAttribute, this.stateSystem.speed + spdGain);
            this.stateSystem.intelligence = Math.min(this.stateSystem.maxAttribute, this.stateSystem.intelligence + intGain);
            
            // 捕猎成功时增加心理健康值 - 固定增加
            this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + 8);
            
            if (Math.random() < 0.2) {
                this.stateSystem.disease = Math.min(100, this.stateSystem.disease + 2);
            }
            
            if (window.evolutionSystem) {
                const formattedFood = this.formatNumber(foodGained);
                window.evolutionSystem.addDailyActivity(`捕猎成功！获得${formattedFood}点食物，力量+${strGain.toFixed(2)}，速度+${spdGain.toFixed(2)}，智慧+${intGain.toFixed(2)}，心理健康提升`);
            }
        }
        
        // 捕猎完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }
    
    rest() {
        if (!this.stateSystem.canStartActivity('rest')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法休息，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        this.stateSystem.cooldowns.rest = this.stateSystem.maxCooldowns.rest;
        this.stateSystem.activityState = 'resting';
        
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 2);
        
        if (Math.random() < 0.2) {
            this.stateSystem.strength = Math.max(0.1, this.stateSystem.strength - 0.02);
        }
        if (Math.random() < 0.2) {
            this.stateSystem.speed = Math.max(0.1, this.stateSystem.speed - 0.02);
        }
        
        this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + 5 + Math.random() * 5);
        
        if (Math.random() < 0.5) {
            this.stateSystem.disease = Math.max(0, this.stateSystem.disease - 3);
        }
        
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity("休息了一段时间，心理健康值提升，疾病值可能减少");
        }
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }
    
    dormancy() {
        if (!this.stateSystem.canStartActivity('dormancy')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法蛰伏，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        this.stateSystem.cooldowns.dormancy = this.stateSystem.maxCooldowns.dormancy;
        this.stateSystem.activityState = 'dormant';
        
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 1);
        
        if (Math.random() < 0.3) {
            this.stateSystem.strength = Math.max(0.1, this.stateSystem.strength - 0.05);
        }
        if (Math.random() < 0.3) {
            this.stateSystem.speed = Math.max(0.1, this.stateSystem.speed - 0.05);
        }
        
        if (Math.random() < 0.6) {
            this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + 8);
        } else {
            this.stateSystem.mentalHealth = Math.max(0, this.stateSystem.mentalHealth - 3);
        }
        
        if (Math.random() < 0.7) {
            this.stateSystem.disease = Math.max(0, this.stateSystem.disease - 5);
        }
        
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity("进行了蛰伏，疾病值显著减少，但属性可能下降");
        }
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }
    
    explore() {
        if (!this.stateSystem.canStartActivity('explore')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法探索，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        this.stateSystem.cooldowns.explore = this.stateSystem.maxCooldowns.explore;
        this.stateSystem.activityState = 'exploring';
        
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 8);
        
        // 探索发现食物的基础概率
        let foodFindChance = 0.4;
        
        // 保底机制：当饥饿值>=85时，大幅增加发现食物的概率
        if (this.stateSystem.hunger >= 85) {
            const hungerBonus = (this.stateSystem.hunger - 85) * 0.02; // 每超过85点饥饿值，增加2%发现食物概率
            foodFindChance = Math.min(0.9, foodFindChance + hungerBonus); // 最高90%概率发现食物
        }
        
        if (Math.random() < foodFindChance) {
            // 调整探索发现食物的数量 - 前期更少
            const baseFood = 3 + Math.random() * 4;
            const levelBonus = evolutionLevel * 0.3;
            let foodFound = baseFood + levelBonus;
            
            // 保底机制：当饥饿值>=85时，额外获得食物
            if (this.stateSystem.hunger >= 85) {
                const hungerBonus = (this.stateSystem.hunger - 85) * 0.3; // 每超过85点饥饿值，额外获得0.3食物
                foodFound += hungerBonus;
            }
            
            this.stateSystem.foodStorage += foodFound;
            
            // 探索发现食物时增加心理健康值
            this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + 5);
            
            if (window.evolutionSystem) {
                const formattedFood = this.formatNumber(foodFound);
                window.evolutionSystem.addDailyActivity(`探索时发现了食物！获得${formattedFood}点食物，心理健康提升`);
            }
        }
        
        if (Math.random() < 0.5) {
            this.stateSystem.strength = Math.min(this.stateSystem.maxAttribute, this.stateSystem.strength + 0.03);
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity("探索增强了力量");
            }
        }
        if (Math.random() < 0.5) {
            this.stateSystem.speed = Math.min(this.stateSystem.maxAttribute, this.stateSystem.speed + 0.03);
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity("探索提升了速度");
            }
        }
        if (Math.random() < 0.3) {
            this.stateSystem.intelligence = Math.min(this.stateSystem.maxAttribute, this.stateSystem.intelligence + 0.03);
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity("探索增加了智慧");
            }
        }
        
        // 降低探索中受伤和中毒的概率
        if (Math.random() < 0.08 && this.eventSystem) { // 从0.15降低到0.08
            this.eventSystem.triggerInjury(0.2 + Math.random()); // 降低伤害严重程度
        }
        if (Math.random() < 0.04 && this.eventSystem) { // 从0.08降低到0.04
            this.eventSystem.triggerPoison(0.1 + Math.random()); // 降低中毒严重程度
        }
        
        // 探索完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }

    // 锻炼活动
    exercise() {
        if (!this.stateSystem.canStartActivity('exercise')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法锻炼，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        // 设置锻炼冷却
        this.stateSystem.cooldowns.exercise = 8;
        this.stateSystem.activityState = 'exercising';
        
        // 设置全局冷却
        this.stateSystem.globalCooldown = this.stateSystem.globalCooldownDuration;
        
        // 消耗饥饿值
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 10);
        
        // 有几率增加力量和速度（收益不高）
        let strengthGain = 0;
        let speedGain = 0;
        
        if (Math.random() < 0.7) { // 70%几率增加力量
            strengthGain = 0.01 + Math.random() * 0.02; // 很小的增益
            this.stateSystem.strength = Math.min(this.stateSystem.maxAttribute, this.stateSystem.strength + strengthGain);
        }
        
        if (Math.random() < 0.6) { // 60%几率增加速度
            speedGain = 0.01 + Math.random() * 0.02; // 很小的增益
            this.stateSystem.speed = Math.min(this.stateSystem.maxAttribute, this.stateSystem.speed + speedGain);
        }
        
        // 记录活动
        if (window.evolutionSystem) {
            let message = "进行了锻炼";
            if (strengthGain > 0 || speedGain > 0) {
                message += "，";
                if (strengthGain > 0) message += `力量+${strengthGain.toFixed(3)}`;
                if (strengthGain > 0 && speedGain > 0) message += "，";
                if (speedGain > 0) message += `速度+${speedGain.toFixed(3)}`;
            }
            window.evolutionSystem.addDailyActivity(message);
        }
        
        // 锻炼完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }

    // 思考活动
    think() {
        if (!this.stateSystem.canStartActivity('think')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法思考，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        // 设置思考冷却
        this.stateSystem.cooldowns.think = 12;
        this.stateSystem.activityState = 'thinking';
        
        // 消耗饥饿值
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 5);
        
        // 增加智慧
        const intelligenceGain = 0.05 + Math.random() * 0.05;
        this.stateSystem.intelligence = Math.min(this.stateSystem.maxAttribute, this.stateSystem.intelligence + intelligenceGain);
        
        // 记录活动
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity(`进行了思考，智慧+${intelligenceGain.toFixed(3)}`);
        }
        
        // 如果是第一次思考，解锁心理健康值和高级互动
        if (window.evolutionRouteSystem && !window.evolutionRouteSystem.hasThought) {
            window.evolutionRouteSystem.onThink();
        }
        
        // 思考完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }

    // 与其他物种互动
    interact() {
        if (!this.stateSystem.canStartActivity('interact')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法互动，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        // 设置互动冷却
        this.stateSystem.cooldowns.interact = 15;
        this.stateSystem.activityState = 'interacting';
        
        // 消耗饥饿值
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 8);
        
        // 三种可能的互动结果
        const result = Math.random();
        let message = "";
        
        if (result < 0.4) { // 40%几率合作
            message = "与其他物种进行了合作";
            // 合作可能带来食物或智慧增长
            if (Math.random() < 0.6) {
                const foodGained = 3 + Math.random() * 5;
                this.stateSystem.foodStorage += foodGained;
                message += `，获得了${this.formatNumber(foodGained)}点食物`;
            } else {
                const intelligenceGain = 0.02 + Math.random() * 0.03;
                this.stateSystem.intelligence = Math.min(this.stateSystem.maxAttribute, this.stateSystem.intelligence + intelligenceGain);
                message += `，智慧+${intelligenceGain.toFixed(3)}`;
            }
            // 增加心理健康值
            this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + 5);
            
        } else if (result < 0.7) { // 30%几率竞争
            message = "与其他物种发生了竞争";
            // 竞争可能带来属性增长但消耗更多
            this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 5);
            if (Math.random() < 0.5) {
                const strengthGain = 0.02 + Math.random() * 0.03;
                this.stateSystem.strength = Math.min(this.stateSystem.maxAttribute, this.stateSystem.strength + strengthGain);
                message += `，力量+${strengthGain.toFixed(3)}`;
            } else {
                const speedGain = 0.02 + Math.random() * 0.03;
                this.stateSystem.speed = Math.min(this.stateSystem.maxAttribute, this.stateSystem.speed + speedGain);
                message += `，速度+${speedGain.toFixed(3)}`;
            }
            // 轻微减少心理健康值
            this.stateSystem.mentalHealth = Math.max(0, this.stateSystem.mentalHealth - 3);
            
        } else { // 30%几率杀戮
            message = "与其他物种发生了杀戮";
            // 杀戮可能带来大量食物但减少心理健康
            const foodGained = 8 + Math.random() * 10;
            this.stateSystem.foodStorage += foodGained;
            message += `，获得了${this.formatNumber(foodGained)}点食物`;
            // 大幅减少心理健康值
            this.stateSystem.mentalHealth = Math.max(0, this.stateSystem.mentalHealth - 10);
            
            // 小几率受伤
            if (Math.random() < 0.3 && this.eventSystem) {
                this.eventSystem.triggerInjury(0.5 + Math.random());
                message += "，但受伤了";
            }
        }
        
        // 记录活动
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity(message);
            window.evolutionSystem.addKeyEvent(`物种互动: ${message}`);
        }
        
        // 互动完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }

    // 尝试制作工具
    makeTool() {
        if (!this.stateSystem.canStartActivity('tool')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法制作工具，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        // 设置制作工具冷却
        this.stateSystem.cooldowns.tool = 20;
        this.stateSystem.activityState = 'making_tool';
        
        // 消耗饥饿值
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 12);
        
        // 制作工具需要智慧和力量
        const successChance = (this.stateSystem.intelligence * 0.01) + (this.stateSystem.strength * 0.005);
        
        if (Math.random() < successChance) {
            // 制作成功
            const intelligenceGain = 0.03 + Math.random() * 0.04;
            this.stateSystem.intelligence = Math.min(this.stateSystem.maxAttribute, this.stateSystem.intelligence + intelligenceGain);
            
            // 增加心理健康值
            this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + 8);
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`成功制作了工具，智慧+${intelligenceGain.toFixed(3)}，心理健康提升`);
                window.evolutionSystem.addKeyEvent("成功制作了第一个工具！");
            }
        } else {
            // 制作失败
            this.stateSystem.mentalHealth = Math.max(0, this.stateSystem.mentalHealth - 5);
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity("尝试制作工具但失败了");
            }
        }
        
        // 制作工具完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }

    // 尝试交友
    socialize() {
        if (!this.stateSystem.canStartActivity('social')) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity(`无法交友，当前状态: ${this.stateSystem.activityState}`);
            }
            return;
        }
        
        // 设置交友冷却
        this.stateSystem.cooldowns.social = 10;
        this.stateSystem.activityState = 'socializing';
        
        // 消耗饥饿值
        this.stateSystem.hunger = Math.min(100, this.stateSystem.hunger + 6);
        
        // 交友需要智慧和心理健康
        const successChance = (this.stateSystem.intelligence * 0.008) + (this.stateSystem.mentalHealth * 0.005);
        
        if (Math.random() < successChance) {
            // 交友成功
            const mentalHealthGain = 5 + Math.random() * 10;
            this.stateSystem.mentalHealth = Math.min(100, this.stateSystem.mentalHealth + mentalHealthGain);
            
            // 小几率获得食物
            if (Math.random() < 0.4) {
                const foodGained = 2 + Math.random() * 4;
                this.stateSystem.foodStorage += foodGained;
                
                if (window.evolutionSystem) {
                    window.evolutionSystem.addDailyActivity(`成功交友，心理健康+${mentalHealthGain.toFixed(1)}，获得了${this.formatNumber(foodGained)}点食物`);
                }
            } else {
                if (window.evolutionSystem) {
                    window.evolutionSystem.addDailyActivity(`成功交友，心理健康+${mentalHealthGain.toFixed(1)}`);
                }
            }
            
            window.evolutionSystem.addKeyEvent("成功建立了第一个社交关系！");
        } else {
            // 交友失败
            this.stateSystem.mentalHealth = Math.max(0, this.stateSystem.mentalHealth - 8);
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addDailyActivity("尝试交友但被拒绝了");
            }
        }
        
        // 交友完成后回到空闲状态
        setTimeout(() => {
            this.stateSystem.activityState = 'idle';
            this.stateSystem.setButtonStates();
        }, 100);
        
        this.stateSystem.updateUI();
        this.stateSystem.setButtonStates();
    }
}
