// 进化系统类
class EvolutionSystem extends CoreSystem {
    constructor(stateSystem, eventSystem) {
        super();
        this.stateSystem = stateSystem;
        this.eventSystem = eventSystem;
        
        this.evolutionLevel = 0;
        this.evolutionPoints = 0;
        this.requiredPoints = this.calculateRequiredPoints(1);
        
        this.hasShownEvolutionEvent = false;
        this.evolveButton = null; // 保存按钮引用避免重复创建
        this.evolutionButtonContainer = null; // 保存容器引用
        
        this.init();
    }
    
    init() {
        this.startNaturalGrowth();
        this.setupEventListeners();
        this.updateRequirementsList();
        
        // 预获取容器引用
        this.evolutionButtonContainer = document.getElementById('evolution-button-container');
    }
    
    calculateRequiredPoints(N) {
        if (N === 0) return 0;
        
        const base = 100 * Math.pow(1.5, N-1);
        const attributes = this.stateSystem.getAttributes();
        const attributeBonus = 1 + (attributes.strength + attributes.speed + attributes.intelligence) * 0.1;
        
        return base * attributeBonus;
    }
    
    getGrowthMultiplier() {
        const level = this.evolutionLevel;
        if (level <= 10) return 1.0;
        if (level <= 30) return 0.8;
        if (level <= 60) return 0.6;
        if (level <= 80) return 0.4;
        return 0.2;
    }
    
    calculateNaturalGrowth() {
        // 如果时间暂停，不增长
        if (this.stateSystem.timePaused) return 0;
        
        // 修复0级增长问题
        if (this.evolutionLevel === 0) {
            return 0.1 * this.stateSystem.getHealthMultiplier();
        }
        
        const baseGrowth = Math.pow(this.evolutionLevel, 1.2) * 0.1;
        const healthBonus = this.stateSystem.getHealthMultiplier();
        const balanceMultiplier = this.getGrowthMultiplier();
        
        return baseGrowth * healthBonus * balanceMultiplier;
    }
    
    calculateClickGrowth() {
        // 修复0级点击增长问题
        if (this.evolutionLevel === 0) {
            return 1.0 * this.stateSystem.getHealthMultiplier();
        }
        
        return this.calculateNaturalGrowth() * 15;
    }
    
    startNaturalGrowth() {
        const timer = setInterval(() => {
            const growth = this.calculateNaturalGrowth();
            this.addEvolutionPoints(growth);
        }, 100);
        this.timers.push(timer);
    }
    
    addEvolutionPoints(points) {
        this.evolutionPoints += points;
        this.requiredPoints = this.calculateRequiredPoints(this.evolutionLevel + 1);
        this.updateUI();
        this.checkEvolution();
        this.updateRequirementsList();
    }
    
    setEvolutionPoints(points) {
        this.evolutionPoints = points;
        this.requiredPoints = this.calculateRequiredPoints(this.evolutionLevel + 1);
        this.updateUI();
        this.checkEvolution();
        this.updateRequirementsList();
    }
    
    setEvolutionLevel(level) {
        if (level >= 0 && level <= 100) {
            this.evolutionLevel = level;
            this.evolutionPoints = 0;
            this.requiredPoints = this.calculateRequiredPoints(this.evolutionLevel + 1);
            this.stateSystem.updateMaxFoodStorage(this.evolutionLevel);
            
            this.addKeyEvent(`通过控制台设定进化等级为 ${this.evolutionLevel}`);
            
            this.updateUI();
            this.updateRequirementsList();
            
            // 通知进化路线系统更新
            if (window.evolutionRouteSystem) {
                window.evolutionRouteSystem.onEvolution();
            }
        }
    }
    
    clickEvolutionPoints() {
        const points = this.calculateClickGrowth();
        this.addEvolutionPoints(points);
        this.addDailyActivity(`通过点击获得了 ${this.formatNumber(points)} 进化点数`);
    }
    
    checkEvolution() {
        // 确保容器存在
        if (!this.evolutionButtonContainer) {
            this.evolutionButtonContainer = document.getElementById('evolution-button-container');
            if (!this.evolutionButtonContainer) return;
        }
        
        if (this.evolutionPoints >= this.requiredPoints && this.evolutionLevel < 100) {
            // 只创建一次按钮
            if (!this.evolveButton) {
                this.evolveButton = document.createElement('button');
                this.evolveButton.className = 'evolve-btn';
                this.evolveButton.addEventListener('click', () => {
                    this.evolve();
                });
                this.evolutionButtonContainer.appendChild(this.evolveButton);
            }
            
            // 更新按钮文本和显示状态
            this.evolveButton.textContent = `进化到等级 ${this.evolutionLevel + 1}`;
            this.evolveButton.style.display = 'block';
            this.evolveButton.disabled = false;
            
            if (!this.hasShownEvolutionEvent) {
                this.addKeyEvent(`已达到进化条件，可以进化到等级 ${this.evolutionLevel + 1}`);
                this.hasShownEvolutionEvent = true;
            }
        } else {
            this.hasShownEvolutionEvent = false;
            // 隐藏按钮而不是删除，避免重复创建
            if (this.evolveButton) {
                this.evolveButton.style.display = 'none';
            }
        }
    }
    
    evolve() {
        if (this.evolutionLevel < 100 && this.evolutionPoints >= this.requiredPoints) {
            this.evolutionLevel++;
            this.evolutionPoints -= this.requiredPoints;
            this.requiredPoints = this.calculateRequiredPoints(this.evolutionLevel + 1);
            this.stateSystem.updateMaxFoodStorage(this.evolutionLevel);
            
            // 进化时增加属性
            this.stateSystem.addAttributesOnEvolution();
            
            this.addKeyEvent(`成功进化到等级 ${this.evolutionLevel}`);
            
            this.updateUI();
            this.updateRequirementsList();
            
            // 通知进化路线系统更新
            if (window.evolutionRouteSystem) {
                window.evolutionRouteSystem.onEvolution();
            }
            
            if (this.evolutionLevel === 100) {
                this.addKeyEvent("已达到最高进化等级！");
            }
            
            // 进化后重新检查按钮状态
            this.checkEvolution();
        }
    }
    
    addDailyActivity(activity) {
        this.addEvent('daily-activities', activity, 10);
    }
    
    addKeyEvent(event) {
        this.addEvent('key-events-list', event, 10);
    }
    
    updateUI() {
        document.getElementById('evolution-level').textContent = this.evolutionLevel;
        
        let progressPercent;
        if (this.evolutionLevel >= 100) {
            progressPercent = 100;
        } else {
            progressPercent = Math.min(100, (this.evolutionPoints / this.requiredPoints) * 100);
        }
        
        document.getElementById('evolution-points-filled').style.width = `${progressPercent}%`;
        
        let remainingPoints;
        if (this.evolutionLevel >= 100) {
            remainingPoints = "已满";
        } else {
            remainingPoints = this.formatNumber(this.requiredPoints - this.evolutionPoints);
        }
        document.getElementById('remaining-points').textContent = remainingPoints;
        
        document.getElementById('current-points').textContent = this.formatNumber(this.evolutionPoints);
    }
    
    getAllLevelRequirements() {
        const requirements = [];
        for (let level = 1; level <= 100; level++) {
            requirements.push({
                level: level,
                points: this.calculateRequiredPoints(level)
            });
        }
        return requirements;
    }
    
    updateRequirementsList() {
        const requirementsList = document.getElementById('requirements-list');
        const requirements = this.getAllLevelRequirements();
        
        let html = '<table class="requirements-table">';
        html += '<tr><th>等级</th><th>所需点数</th></tr>';
        
        const displayLevels = new Set();
        
        for (let i = 1; i <= Math.min(20, requirements.length); i++) {
            displayLevels.add(i);
        }
        
        for (let i = Math.max(91, 1); i <= requirements.length; i++) {
            displayLevels.add(i);
        }
        
        const currentLevel = this.evolutionLevel;
        for (let i = Math.max(1, currentLevel - 2); i <= Math.min(requirements.length, currentLevel + 3); i++) {
            displayLevels.add(i);
        }
        
        const sortedLevels = Array.from(displayLevels).sort((a, b) => a - b);
        
        sortedLevels.forEach(level => {
            const req = requirements[level-1];
            const isCurrentLevel = req.level === this.evolutionLevel + 1;
            const rowClass = isCurrentLevel ? 'current-level' : '';
            html += `<tr class="${rowClass}">
                <td>${req.level}</td>
                <td>${this.formatNumber(req.points)}</td>
            </tr>`;
        });
        
        html += '</table>';
        requirementsList.innerHTML = html;
    }
    
    setupEventListeners() {
        document.getElementById('get-evolution-points').addEventListener('click', () => {
            this.clickEvolutionPoints();
        });
    }
    
    getEvolutionLevel() {
        return this.evolutionLevel;
    }
}
