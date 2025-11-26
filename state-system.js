// 状态系统类
class StateSystem extends CoreSystem {
    constructor(eventSystem) {
        super();
        this.eventSystem = eventSystem;
        
        // 属性状态
        this.strength = 1.0;
        this.speed = 1.0;
        this.intelligence = 1.0;
        this.maxAttribute = 180;
        
        // 健康状态 - 饥饿度从0开始
        this.hunger = 0;
        this.mentalHealth = 100;
        this.disease = 0;
        
        // 食物储存 - 初始为0
        this.foodStorage = 0;
        this.maxFoodStorage = this.calculateMaxFoodStorage(0);
        
        // 活动冷却时间和状态
        this.cooldowns = {
            hunt: 0,
            rest: 0,
            dormancy: 0,
            explore: 0
        };
        
        this.maxCooldowns = {
            hunt: 10,
            rest: 5,
            dormancy: 8,
            explore: 7
        };
        
        // 全局冷却状态
        this.globalCooldown = 0;
        this.globalCooldownDuration = 1;
        
        // 活动状态
        this.activityState = 'idle';
        
        this.init();
    }
    
    init() {
        this.startStateChanges();
        this.startHungerCheck();
        this.updateUI();
        this.setButtonStates();
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
        // 只有当食物为0时，饥饿度才会上升
        if (this.foodStorage <= 0) {
            let hungerIncrease = 0.1;
            
            if (this.activityState === 'resting' || this.activityState === 'dormant') {
                hungerIncrease = 0.02;
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
    }
    
    calculateMaxFoodStorage(level) {
        const baseStorage = 1000;
        const levelMultiplier = Math.pow(1.5, level);
        return baseStorage * levelMultiplier;
    }
    
    updateMaxFoodStorage(level) {
        this.maxFoodStorage = this.calculateMaxFoodStorage(level);
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
        // 消耗食物 - 只有当有食物时才消耗
        if (this.foodStorage > 0) {
            const foodConsumed = 0.5 + (window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() * 0.1 : 0);
            this.foodStorage = Math.max(0, this.foodStorage - foodConsumed);
            
            // 有食物时，饥饿度保持为0或缓慢恢复
            if (this.hunger > 0) {
                this.hunger = Math.max(0, this.hunger - 1);
            }
        }
        
        // 心理健康值自然变化
        if (Math.random() < 0.3) {
            this.mentalHealth = Math.min(100, this.mentalHealth + 0.2);
        } else {
            this.mentalHealth = Math.max(0, this.mentalHealth - 0.1);
        }
        
        // 疾病值自然变化
        if (this.disease > 0 && Math.random() < 0.1) {
            this.disease = Math.max(0, this.disease - 0.5);
        } else if (Math.random() < 0.05) {
            this.disease = Math.min(100, this.disease + 0.2);
        }
        
        this.updateUI();
    }
    
    updateCooldowns() {
        // 更新全局冷却
        if (this.globalCooldown > 0) {
            this.globalCooldown--;
        }
        
        // 更新活动冷却
        for (let activity in this.cooldowns) {
            if (this.cooldowns[activity] > 0) {
                this.cooldowns[activity]--;
                
                const button = document.getElementById(`${activity}-btn`);
                if (button) {
                    const progressBar = button.querySelector('.cooldown-progress');
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
                    }
                }
            }
        }
        
        // 每次更新都重新设置按钮状态
        this.setButtonStates();
    }
    
    // 检查活动是否可用
    canStartActivity(activity) {
        if (this.cooldowns[activity] > 0) {
            return false;
        }
        
        if (this.globalCooldown > 0 && activity !== 'rest' && activity !== 'dormancy') {
            return false;
        }
        
        switch(this.activityState) {
            case 'idle':
                return true;
            case 'resting':
                return activity === 'dormancy';
            case 'dormant':
                return false;
            case 'hunting':
            case 'exploring':
                return false;
            default:
                return false;
        }
    }
    
    // 设置按钮可用状态
    setButtonStates() {
        const huntButton = document.getElementById('hunt-btn');
        const restButton = document.getElementById('rest-btn');
        const dormancyButton = document.getElementById('dormancy-btn');
        const exploreButton = document.getElementById('explore-btn');
        
        // 重置所有按钮状态（除了冷却中的）
        huntButton.disabled = this.cooldowns.hunt > 0 || this.globalCooldown > 0;
        restButton.disabled = this.cooldowns.rest > 0 || this.globalCooldown > 0;
        dormancyButton.disabled = this.cooldowns.dormancy > 0 || this.globalCooldown > 0;
        exploreButton.disabled = this.cooldowns.explore > 0 || this.globalCooldown > 0;
        
        // 根据活动状态进一步限制
        switch(this.activityState) {
            case 'hunting':
                restButton.disabled = true;
                dormancyButton.disabled = true;
                exploreButton.disabled = true;
                break;
            case 'resting':
                huntButton.disabled = true;
                exploreButton.disabled = true;
                break;
            case 'dormant':
                huntButton.disabled = true;
                restButton.disabled = true;
                exploreButton.disabled = true;
                break;
            case 'exploring':
                huntButton.disabled = true;
                restButton.disabled = true;
                dormancyButton.disabled = true;
                break;
        }
        
        // 特殊规则：休息时可以进入蛰伏
        if (this.activityState === 'resting') {
            dormancyButton.disabled = this.cooldowns.dormancy > 0 || this.globalCooldown > 0;
        }
        
        // 修复BUG：确保按钮在可用时移除disabled属性
        [huntButton, restButton, dormancyButton, exploreButton].forEach(button => {
            if (!button.disabled && button.hasAttribute('disabled')) {
                button.removeAttribute('disabled');
            }
        });
    }
    
    checkDeath() {
        if (this.mentalHealth <= 0 || this.disease >= 100) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("因状态不佳而死亡");
            }
            if (window.showPage) {
                window.showPage('death');
            }
            this.cleanup();
            return true;
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
    }
}