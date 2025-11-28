// 状态系统类
class StateSystem extends CoreSystem {
    constructor(eventSystem) {
        super();
        this.eventSystem = eventSystem;
        
        // 存储版本控制 - 仅用于刷新恢复
        this.STORAGE_VERSION = "1.0";
        this.STORAGE_KEY = "evolution_simulator_cache";
        
        // 尝试从缓存加载数据（仅基础状态）
        const savedData = this.loadFromStorage();
        
        if (savedData) {
            // 使用保存的数据初始化
            this.loadSavedData(savedData);
        } else {
            // 使用默认值初始化
            this.initializeDefaultValues();
        }
        
        this.init();
    }
    
    // 初始化默认值
    initializeDefaultValues() {
        // 属性状态 - 设置合理的初始值
        this.strength = 1.0;
        this.speed = 1.0;
        this.intelligence = 1.0;
        this.maxAttribute = 180;
        
        // 健康状态 - 设置安全的初始值
        this.hunger = 0;           // 从0开始
        this.mentalHealth = 0;     // 初始没有心理健康值
        this.disease = 0;          // 无疾病
        
        // 食物储存 - 给予初始食物
        this.foodStorage = 20;     // 给予初始食物
        this.maxFoodStorage = this.calculateMaxFoodStorage(0);
        
        // 活动冷却时间和状态
        this.cooldowns = {
            hunt: 0,
            rest: 0,
            dormancy: 0,
            explore: 0,
            exercise: 0,
            think: 0,
            interact: 0,
            tool: 0,
            social: 0
        };
        
        this.maxCooldowns = {
            hunt: 10,
            rest: 5,
            dormancy: 8,
            explore: 7,
            exercise: 8,
            think: 12,
            interact: 15,
            tool: 20,
            social: 10
        };
        
        // 全局冷却状态
        this.globalCooldown = 0;
        this.globalCooldownDuration = 1;
        
        // 活动状态
        this.activityState = 'idle';
        
        // 时间暂停状态
        this.timePaused = false;
        
        // 游戏时间系统
        this.gameTime = {
            day: 1,
            hour: 0,
            minute: 0
        };
        
        // 死亡检查计数器
        this.deathCheckCounter = 0;
        this.lastDeathCheckLog = 0;
    }
    
    // 加载保存的数据
    loadSavedData(savedData) {
        console.log("从缓存加载基础游戏状态");
        
        // 属性状态
        this.strength = savedData.strength || 1.0;
        this.speed = savedData.speed || 1.0;
        this.intelligence = savedData.intelligence || 1.0;
        this.maxAttribute = savedData.maxAttribute || 180;
        
        // 健康状态
        this.hunger = savedData.hunger || 0;
        this.mentalHealth = savedData.mentalHealth || 0;
        this.disease = savedData.disease || 0;
        
        // 食物储存
        this.foodStorage = savedData.foodStorage || 20;
        this.maxFoodStorage = savedData.maxFoodStorage || this.calculateMaxFoodStorage(0);
        
        // 活动冷却时间和状态
        this.cooldowns = savedData.cooldowns || {
            hunt: 0, rest: 0, dormancy: 0, explore: 0, exercise: 0,
            think: 0, interact: 0, tool: 0, social: 0
        };
        
        this.maxCooldowns = savedData.maxCooldowns || {
            hunt: 10, rest: 5, dormancy: 8, explore: 7, exercise: 8,
            think: 12, interact: 15, tool: 20, social: 10
        };
        
        // 全局冷却状态
        this.globalCooldown = savedData.globalCooldown || 0;
        this.globalCooldownDuration = savedData.globalCooldownDuration || 1;
        
        // 活动状态
        this.activityState = savedData.activityState || 'idle';
        
        // 时间暂停状态
        this.timePaused = savedData.timePaused || false;
        
        // 游戏时间系统
        this.gameTime = savedData.gameTime || { day: 1, hour: 0, minute: 0 };
        
        // 死亡检查计数器
        this.deathCheckCounter = savedData.deathCheckCounter || 0;
        this.lastDeathCheckLog = savedData.lastDeathCheckLog || 0;
        
        // 添加加载提示
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("基础游戏状态已从缓存恢复");
        }
    }
    
    // 从本地存储加载数据（仅基础状态）
    loadFromStorage() {
        try {
            const storedData = localStorage.getItem(this.STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                
                // 检查版本兼容性
                if (parsedData.version === this.STORAGE_VERSION) {
                    return parsedData.stateData;
                } else {
                    console.warn("缓存版本不匹配，使用默认值");
                    return null;
                }
            }
        } catch (error) {
            console.error("加载缓存数据失败:", error);
        }
        return null;
    }
    
    // 保存基础状态到本地存储（仅用于刷新恢复）
    saveToStorage() {
        try {
            const stateData = this.getStateData();
            const storageData = {
                version: this.STORAGE_VERSION,
                stateData: stateData,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
        } catch (error) {
            console.error("保存到缓存失败:", error);
        }
    }
    
    // 获取当前基础状态数据
    getStateData() {
        return {
            // 属性状态
            strength: this.strength,
            speed: this.speed,
            intelligence: this.intelligence,
            maxAttribute: this.maxAttribute,
            
            // 健康状态
            hunger: this.hunger,
            mentalHealth: this.mentalHealth,
            disease: this.disease,
            
            // 食物储存
            foodStorage: this.foodStorage,
            maxFoodStorage: this.maxFoodStorage,
            
            // 活动冷却时间和状态
            cooldowns: {...this.cooldowns},
            maxCooldowns: {...this.maxCooldowns},
            
            // 全局冷却状态
            globalCooldown: this.globalCooldown,
            globalCooldownDuration: this.globalCooldownDuration,
            
            // 活动状态
            activityState: this.activityState,
            
            // 时间暂停状态
            timePaused: this.timePaused,
            
            // 游戏时间系统
            gameTime: {...this.gameTime},
            
            // 死亡检查计数器
            deathCheckCounter: this.deathCheckCounter,
            lastDeathCheckLog: this.lastDeathCheckLog
        };
    }
    
    // 清除缓存数据（死亡时调用）
    clearStorage() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log("游戏缓存已清除");
        } catch (error) {
            console.error("清除缓存失败:", error);
        }
    }
    
    init() {
        this.startStateChanges();
        this.startHungerCheck();
        this.startGameTime();
        this.updateUI();
        this.setButtonStates();
    }
    
    // 启动游戏时间系统
    startGameTime() {
        const timer = setInterval(() => {
            if (!this.timePaused) {
                this.updateGameTime();
            }
        }, 1000); // 每秒更新一次游戏时间
        this.timers.push(timer);
    }
    
    // 更新游戏时间 - 现实1分钟 = 游戏1天
    updateGameTime() {
        // 现实1秒 = 游戏24分钟 (24小时/60分钟 = 0.4小时/秒 = 24分钟/秒)
        this.gameTime.minute += 24;
        
        if (this.gameTime.minute >= 60) {
            this.gameTime.hour += Math.floor(this.gameTime.minute / 60);
            this.gameTime.minute = this.gameTime.minute % 60;
        }
        
        if (this.gameTime.hour >= 24) {
            this.gameTime.day += Math.floor(this.gameTime.hour / 24);
            this.gameTime.hour = this.gameTime.hour % 24;
        }
        
        // 更新UI中的时间显示
        this.updateTimeDisplay();
        
        // 时间变化时保存基础状态（仅用于刷新恢复）
        this.saveToStorage();
    }
    
    // 更新时间显示
    updateTimeDisplay() {
        const timeDisplay = document.getElementById('game-time-display');
        if (timeDisplay) {
            const formattedHour = this.gameTime.hour.toString().padStart(2, '0');
            const formattedMinute = this.gameTime.minute.toString().padStart(2, '0');
            timeDisplay.textContent = `第${this.gameTime.day}天 ${formattedHour}:${formattedMinute}`;
        }
        
        // 更新昼夜提示
        this.updateDayNightHint();
    }
    
    // 更新昼夜提示
    updateDayNightHint() {
        const dayNightHint = document.getElementById('day-night-hint');
        if (dayNightHint) {
            let timeOfDay = '';
            if (this.gameTime.hour >= 5 && this.gameTime.hour < 12) {
                timeOfDay = '早晨';
            } else if (this.gameTime.hour >= 12 && this.gameTime.hour < 18) {
                timeOfDay = '下午';
            } else if (this.gameTime.hour >= 18 && this.gameTime.hour < 22) {
                timeOfDay = '傍晚';
            } else {
                timeOfDay = '夜晚';
            }
            dayNightHint.textContent = timeOfDay;
        }
    }
    
    // 设置时间暂停状态
    setTimePaused(paused) {
        this.timePaused = paused;
        this.saveToStorage(); // 状态变化时保存基础状态
    }
    
    // 启动饥饿度快速检查
    startHungerCheck() {
        const timer = setInterval(() => {
            this.checkHunger();
        }, 100);
        this.timers.push(timer);
    }
    
    // 检查饥饿度
    checkHunger() {
        // 如果时间暂停，不进行任何状态变化
        if (this.timePaused) return;
        
        // 只有当食物为0时，饥饿度才会上升
        if (this.foodStorage <= 0) {
            let hungerIncrease = 0.1;
            
            // 根据活动状态调整饥饿增加速度
            if (this.activityState === 'resting') {
                hungerIncrease = 0.04; // 休息时饥饿增加更慢
            } else if (this.activityState === 'dormant') {
                hungerIncrease = 0.01; // 蛰伏时饥饿增加最慢
            }
            
            this.hunger = Math.min(100, this.hunger + hungerIncrease);
            this.updateUI();
            
            if (this.hunger >= 100) {
                this.triggerDeathByStarvation();
            }
        } else {
            // 有食物时，饥饿度保持为0
            if (this.hunger > 0) {
                this.hunger = Math.max(0, this.hunger - 0.5);
                this.updateUI();
            }
        }
    }
    
    // 因饥饿触发死亡
    triggerDeathByStarvation() {
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("因饥饿而死亡");
        }
        if (window.showPage) {
            window.showPage('death');
        }
        this.cleanup();
        this.clearStorage(); // 死亡时清除缓存
    }
    
    calculateMaxFoodStorage(level) {
        const baseStorage = 1000;
        const levelMultiplier = Math.pow(1.5, level);
        return baseStorage * levelMultiplier;
    }
    
    updateMaxFoodStorage(level) {
        this.maxFoodStorage = this.calculateMaxFoodStorage(level);
        this.saveToStorage(); // 状态变化时保存基础状态
    }
    
    formatFoodStorage() {
        return this.formatNumber(this.foodStorage);
    }
    
    getFoodStoragePercent() {
        return Math.min(100, (this.foodStorage / this.maxFoodStorage) * 100);
    }
    
    getHealthMultiplier() {
        const hungerPenalty = (100 - this.hunger) / 100;
        const healthMultiplier = hungerPenalty * 0.5 + 
                                (this.mentalHealth / 100) * 0.3 + 
                                (1 - this.disease / 100) * 0.2;
        return Math.max(0, healthMultiplier);
    }
    
    getAttributes() {
        return {
            strength: this.strength,
            speed: this.speed,
            intelligence: this.intelligence
        };
    }
    
    startStateChanges() {
        const timer = setInterval(() => {
            this.naturalStateChanges();
            this.updateCooldowns();
            this.checkDeath();
        }, 2000);
        this.timers.push(timer);
    }
    
    naturalStateChanges() {
        // 如果时间暂停，不进行任何状态变化
        if (this.timePaused) return;
        
        // 消耗食物 - 根据活动状态调整消耗速率
        if (this.foodStorage > 0) {
            let foodConsumed = 0.5 + (window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() * 0.1 : 0);
            
            // 根据活动状态调整食物消耗
            if (this.activityState === 'resting') {
                foodConsumed *= 0.5; // 休息时食物消耗减半
            } else if (this.activityState === 'dormant') {
                foodConsumed *= 0.2; // 蛰伏时食物消耗减少80%
            }
            
            this.foodStorage = Math.max(0, this.foodStorage - foodConsumed);
            
            // 有食物时，饥饿度保持为0或缓慢恢复
            if (this.hunger > 0) {
                this.hunger = Math.max(0, this.hunger - 1);
            }
        }
        
        // 心理健康值自然变化 - 只在思考后有效
        if (window.evolutionRouteSystem && window.evolutionRouteSystem.hasThought) {
            if (Math.random() < 0.3) {
                this.mentalHealth = Math.min(100, this.mentalHealth + 0.2);
            } else {
                this.mentalHealth = Math.max(0, this.mentalHealth - 0.1);
            }
        }
        
        // 疾病值自然变化
        if (this.disease > 0 && Math.random() < 0.1) {
            this.disease = Math.max(0, this.disease - 0.5);
        } else if (Math.random() < 0.05) {
            this.disease = Math.min(100, this.disease + 0.2);
        }
        
        this.updateUI();
        this.saveToStorage(); // 状态变化时保存基础状态
    }
    
    updateCooldowns() {
        // 如果时间暂停，不更新冷却时间
        if (this.timePaused) return;
        
        // 更新全局冷却
        if (this.globalCooldown > 0) {
            this.globalCooldown--;
        }
        
        // 更新活动冷却
        let anyCooldownActive = false;
        for (let activity in this.cooldowns) {
            if (this.cooldowns[activity] > 0) {
                this.cooldowns[activity]--;
                anyCooldownActive = true;
                
                // 更新冷却按钮的进度条
                const button = document.getElementById(`${activity}-btn`);
                if (button) {
                    const progressBar = button.querySelector('.cooldown-progress');
                    if (progressBar) {
                        const progressPercent = (1 - this.cooldowns[activity] / this.maxCooldowns[activity]) * 100;
                        progressBar.style.width = `${progressPercent}%`;
                        
                        if (this.cooldowns[activity] <= 0) {
                            // 冷却结束时，如果活动状态仍然是这个活动，则回到空闲状态
                            if ((activity === 'rest' && this.activityState === 'resting') ||
                                (activity === 'dormancy' && this.activityState === 'dormant')) {
                                this.activityState = 'idle';
                            }
                            
                            // 重置进度条
                            progressBar.style.width = '0%';
                            button.disabled = false;
                        } else {
                            button.disabled = true;
                        }
                    }
                }
            }
        }
        
        // 每次更新都重新设置按钮状态
        this.setButtonStates();
        
        // 如果没有冷却中的活动且不在活动中，确保活动状态为空闲
        if (!anyCooldownActive && 
            this.activityState !== 'hunting' && 
            this.activityState !== 'exploring' &&
            this.activityState !== 'exercising' &&
            this.activityState !== 'thinking' &&
            this.activityState !== 'interacting' &&
            this.activityState !== 'making_tool' &&
            this.activityState !== 'socializing') {
            this.activityState = 'idle';
        }
        
        this.saveToStorage(); // 状态变化时保存基础状态
    }
    
    // 检查活动是否可用
    canStartActivity(activity) {
        // 修复BUG：不能从休息状态立即转为蛰伏状态，除非处于紧急状态
        if (this.activityState !== 'idle') {
            // 只有在紧急状态（饥饿值>=65）且从休息转为蛰伏时才允许
            if (this.activityState === 'resting' && activity === 'dormancy' && this.hunger >= 65) {
                // 紧急状态允许转换
            } else {
                return false;
            }
        }
        
        if (this.cooldowns[activity] > 0) {
            return false;
        }
        
        if (this.globalCooldown > 0 && activity !== 'rest' && activity !== 'dormancy') {
            return false;
        }
        
        return true;
    }
    
    // 设置按钮可用状态
    setButtonStates() {
        const huntButton = document.getElementById('hunt-btn');
        const restButton = document.getElementById('rest-btn');
        const dormancyButton = document.getElementById('dormancy-btn');
        const exploreButton = document.getElementById('explore-btn');
        const exerciseButton = document.getElementById('exercise-btn');
        const thinkButton = document.getElementById('think-btn');
        const interactButton = document.getElementById('interact-btn');
        const toolButton = document.getElementById('tool-btn');
        const socialButton = document.getElementById('social-btn');
        
        // 根据活动状态和冷却时间设置按钮状态
        if (huntButton) huntButton.disabled = !this.canStartActivity('hunt');
        if (restButton) restButton.disabled = !this.canStartActivity('rest');
        if (dormancyButton) dormancyButton.disabled = !this.canStartActivity('dormancy');
        if (exploreButton) exploreButton.disabled = !this.canStartActivity('explore');
        if (exerciseButton) exerciseButton.disabled = !this.canStartActivity('exercise');
        if (thinkButton) thinkButton.disabled = !this.canStartActivity('think');
        if (interactButton) interactButton.disabled = !this.canStartActivity('interact');
        if (toolButton) toolButton.disabled = !this.canStartActivity('tool');
        if (socialButton) socialButton.disabled = !this.canStartActivity('social');
        
        // 特殊规则：紧急状态时，休息时可以进入蛰伏
        if (this.activityState === 'resting' && dormancyButton && this.hunger >= 65) {
            dormancyButton.disabled = this.cooldowns.dormancy > 0 || this.globalCooldown > 0;
        }
        
        // 修复BUG：确保按钮在可用时移除disabled属性
        const allButtons = [huntButton, restButton, dormancyButton, exploreButton, exerciseButton, thinkButton, interactButton, toolButton, socialButton];
        allButtons.forEach(button => {
            if (button) {
                if (!button.disabled && button.hasAttribute('disabled')) {
                    button.removeAttribute('disabled');
                } else if (button.disabled && !button.hasAttribute('disabled')) {
                    button.setAttribute('disabled', 'disabled');
                }
            }
        });
    }
    
    checkDeath() {
        // 修复BUG：如果时间暂停，不进行死亡检查
        if (this.timePaused) return false;
        
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        const hasThought = window.evolutionRouteSystem ? window.evolutionRouteSystem.hasThought : false;
        
        // 增加死亡检查计数器
        this.deathCheckCounter++;
        
        // 每10次死亡检查才输出一次调试信息
        if (this.deathCheckCounter % 10 === 0) {
            console.log(`死亡检查第${this.deathCheckCounter}次:`, {
                hunger: this.hunger,
                mentalHealth: this.mentalHealth,
                disease: this.disease,
                evolutionLevel: evolutionLevel,
                hasThought: hasThought
            });
            this.lastDeathCheckLog = this.deathCheckCounter;
        }
        
        // 1-50级：只检查饥饿和疾病，不检查心理健康
        if (evolutionLevel <= 50) {
            if (this.hunger >= 100 || this.disease >= 100) {
                console.log(`触发死亡条件（1-50级），累计检查次数: ${this.deathCheckCounter}`);
                if (window.evolutionSystem) {
                    window.evolutionSystem.addKeyEvent("因状态不佳而死亡");
                }
                if (window.showPage) {
                    window.showPage('death');
                }
                this.cleanup();
                this.clearStorage(); // 死亡时清除缓存
                return true;
            }
        } 
        // 51级及以上：检查所有条件，但只在思考后检查心理健康
        else {
            let shouldDie = this.disease >= 100 || this.hunger >= 100;
            
            // 只有在思考后才检查心理健康
            if (hasThought) {
                shouldDie = shouldDie || this.mentalHealth <= 0;
            }
            
            if (shouldDie) {
                console.log(`触发死亡条件（51级及以上），累计检查次数: ${this.deathCheckCounter}`);
                if (window.evolutionSystem) {
                    window.evolutionSystem.addKeyEvent("因状态不佳而死亡");
                }
                if (window.showPage) {
                    window.showPage('death');
                }
                this.cleanup();
                this.clearStorage(); // 死亡时清除缓存
                return true;
            }
        }
        return false;
    }
    
    updateUI() {
        document.getElementById('strength-value').textContent = this.strength.toFixed(1);
        document.getElementById('speed-value').textContent = this.speed.toFixed(1);
        document.getElementById('intelligence-value').textContent = this.intelligence.toFixed(1);
        
        document.getElementById('hunger-value').textContent = Math.max(0, this.hunger).toFixed(0);
        document.getElementById('mental-health-value').textContent = Math.max(0, this.mentalHealth).toFixed(0);
        document.getElementById('disease-value').textContent = Math.min(100, this.disease).toFixed(0);
        
        document.getElementById('food-storage-value').textContent = this.formatFoodStorage();
        
        this.updateHealthBars();
    }
    
    updateHealthBars() {
        // 修复进度条BUG - 使用更精确的选择器
        const hungerBar = document.querySelector('#hunger-value').closest('.sub-item').querySelector('.progress-filled');
        const mentalHealthBar = document.querySelector('#mental-health-value').closest('.sub-item').querySelector('.progress-filled');
        const diseaseBar = document.querySelector('#disease-value').closest('.sub-item').querySelector('.progress-filled');
        
        if (hungerBar) {
            hungerBar.style.width = `${Math.max(0, this.hunger)}%`;
        }
        
        if (mentalHealthBar) {
            mentalHealthBar.style.width = `${Math.max(0, this.mentalHealth)}%`;
        }
        
        if (diseaseBar) {
            diseaseBar.style.width = `${Math.min(100, this.disease)}%`;
        }
        
        // 属性进度条
        const strengthBar = document.querySelector('#strength-value').closest('.sub-item').querySelector('.progress-filled');
        const speedBar = document.querySelector('#speed-value').closest('.sub-item').querySelector('.progress-filled');
        const intelligenceBar = document.querySelector('#intelligence-value').closest('.sub-item').querySelector('.progress-filled');
        
        if (strengthBar) {
            strengthBar.style.width = `${(this.strength / this.maxAttribute) * 100}%`;
        }
        if (speedBar) {
            speedBar.style.width = `${(this.speed / this.maxAttribute) * 100}%`;
        }
        if (intelligenceBar) {
            intelligenceBar.style.width = `${(this.intelligence / this.maxAttribute) * 100}%`;
        }
        
        // 食物储存进度条
        const foodStorageBar = document.querySelector('#food-storage-value').closest('.status-item').querySelector('.progress-filled');
        if (foodStorageBar) {
            foodStorageBar.style.width = `${this.getFoodStoragePercent()}%`;
        }
    }
    
    // 在进化时增加属性
    addAttributesOnEvolution() {
        this.strength = Math.min(this.maxAttribute, this.strength + 0.1 + Math.random() * 0.2);
        this.speed = Math.min(this.maxAttribute, this.speed + 0.1 + Math.random() * 0.2);
        this.intelligence = Math.min(this.maxAttribute, this.intelligence + 0.1 + Math.random() * 0.2);
        this.saveToStorage(); // 状态变化时保存基础状态
    }
    
    // 新增：设置食物储存数量
    setFoodStorage(amount) {
        if (!isNaN(amount) && amount >= 0) {
            this.foodStorage = Math.min(amount, this.maxFoodStorage);
            this.updateUI();
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent(`通过控制台设定食物储存为 ${this.formatFoodStorage()}`);
            }
            
            this.saveToStorage(); // 状态变化时保存基础状态
        }
    }
}
