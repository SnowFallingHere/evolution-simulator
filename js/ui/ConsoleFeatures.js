// 控制台功能模块
const ConsoleFeatures = {
    // 初始化事件选择界面
    initEventSelection: function(eventSystem) {
        console.log("初始化事件选择界面");
        
        if (!eventSystem) {
            console.warn("事件系统未初始化，跳过事件选择界面");
            return;
        }
        
        // 延迟执行，确保事件系统已加载
        setTimeout(() => {
            this.updateEventButtonsByArea('sea');
            
            console.log("事件选择界面初始化完成");
            
            // 设置选项卡切换
            this.setupEventTabs();
            this.setupAreaTabs();
            
        }, 2000);
    },
    
    // 按区域更新事件按钮
    updateEventButtonsByArea: function(area) {
        if (!window.eventSystem) {
            console.warn("事件系统未初始化，无法更新事件按钮");
            return;
        }
        
        const events = window.eventSystem.getEventsByArea(area);
        
        // 按稀有度分类事件
        const commonEvents = events.filter(event => event.rarity === "common");
        const rareEvents = events.filter(event => event.rarity === "rare");
        const epicEvents = events.filter(event => event.rarity === "epic");
        
        // 清空现有事件按钮
        const commonContainer = document.getElementById('common-events');
        const rareContainer = document.getElementById('rare-events');
        const epicContainer = document.getElementById('epic-events');
        
        if (commonContainer) commonContainer.innerHTML = '';
        if (rareContainer) rareContainer.innerHTML = '';
        if (epicContainer) epicContainer.innerHTML = '';
        
        // 填充普通事件选项卡
        commonEvents.forEach(event => {
            const eventBtn = this.createEventButton(event);
            if (commonContainer) commonContainer.appendChild(eventBtn);
        });
        
        // 填充稀有事件选项卡
        rareEvents.forEach(event => {
            const eventBtn = this.createEventButton(event);
            if (rareContainer) rareContainer.appendChild(eventBtn);
        });
        
        // 填充史诗事件选项卡
        epicEvents.forEach(event => {
            const eventBtn = this.createEventButton(event);
            if (epicContainer) epicContainer.appendChild(eventBtn);
        });
        
        console.log(`更新${window.eventSystem.getAreaName(area)}事件: ${commonEvents.length}个普通, ${rareEvents.length}个稀有, ${epicEvents.length}个史诗`);
    },
    
    // 创建事件按钮
    createEventButton: function(event) {
        const button = document.createElement('button');
        button.className = `event-btn console-btn ${event.rarity}`;
        button.textContent = event.name;
        button.title = `${event.description} (等级${event.level})`;
        
        button.addEventListener('click', function() {
            if (window.eventSystem) {
                const success = window.eventSystem.triggerEventByName(event.name);
                if (success) {
                    console.log(`已触发事件: ${event.name}`);
                } else {
                    console.error(`无法触发事件: ${event.name}`);
                }
            }
        });
        
        return button;
    },
    
    // 设置事件选项卡切换
    setupEventTabs: function() {
        const tabButtons = document.querySelectorAll('.event-tab-btn');
        const tabPanes = document.querySelectorAll('.event-tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // 移除所有active类
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // 添加active类到当前选项卡
                this.classList.add('active');
                const targetPane = document.getElementById(`${targetTab}-events`);
                if (targetPane) targetPane.classList.add('active');
            });
        });
    },
    
    // 设置区域选项卡切换
    setupAreaTabs: function() {
        const areaButtons = document.querySelectorAll('.area-tab-btn');
        
        areaButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetArea = this.getAttribute('data-area');
                
                // 移除所有active类
                areaButtons.forEach(btn => btn.classList.remove('active'));
                
                // 添加active类到当前选项卡
                this.classList.add('active');
                
                // 更新事件系统当前区域
                if (window.eventSystem) {
                    window.eventSystem.setCurrentArea(targetArea);
                }
                
                // 更新事件按钮
                ConsoleFeatures.updateEventButtonsByArea(targetArea);
            });
        });
    },
    
    // 设置控制台输入功能
    setupConsoleInputs: function(evolutionSystem, stateSystem) {
        console.log("设置控制台输入功能");
        
        // 设置进化点数
        const setPointsBtn = document.getElementById('set-points');
        const setPointsInput = document.getElementById('set-points-input');
        if (setPointsBtn && setPointsInput) {
            setPointsBtn.addEventListener('click', function() {
                const points = parseFloat(setPointsInput.value);
                if (!isNaN(points) && points >= 0) {
                    evolutionSystem.setEvolutionPoints(points);
                    setPointsInput.value = '';
                }
            });
        }
        
        // 设置等级
        const setLevelBtn = document.getElementById('set-level');
        const setLevelInput = document.getElementById('set-level-input');
        if (setLevelBtn && setLevelInput) {
            setLevelBtn.addEventListener('click', function() {
                const level = parseInt(setLevelInput.value);
                if (!isNaN(level) && level >= 0 && level <= 100) {
                    evolutionSystem.setEvolutionLevel(level);
                    setLevelInput.value = '';
                }
            });
        }
        
        // 设置属性值
        this.setupAttributeControls(stateSystem);
        
        // 设置状态控制
        this.setupStatusControls(stateSystem);
        
        console.log("控制台输入功能设置完成");
    },
    
    // 设置属性控制
    setupAttributeControls: function(stateSystem) {
        // 力量
        const setStrengthBtn = document.getElementById('set-strength');
        const setStrengthInput = document.getElementById('set-strength-input');
        if (setStrengthBtn && setStrengthInput) {
            setStrengthBtn.addEventListener('click', function() {
                const value = parseFloat(setStrengthInput.value);
                if (!isNaN(value) && value >= 0 && value <= stateSystem.maxAttribute) {
                    stateSystem.strength = value;
                    stateSystem.updateUI();
                    setStrengthInput.value = '';
                }
            });
        }
        
        // 速度
        const setSpeedBtn = document.getElementById('set-speed');
        const setSpeedInput = document.getElementById('set-speed-input');
        if (setSpeedBtn && setSpeedInput) {
            setSpeedBtn.addEventListener('click', function() {
                const value = parseFloat(setSpeedInput.value);
                if (!isNaN(value) && value >= 0 && value <= stateSystem.maxAttribute) {
                    stateSystem.speed = value;
                    stateSystem.updateUI();
                    setSpeedInput.value = '';
                }
            });
        }
        
        // 智慧
        const setIntelligenceBtn = document.getElementById('set-intelligence');
        const setIntelligenceInput = document.getElementById('set-intelligence-input');
        if (setIntelligenceBtn && setIntelligenceInput) {
            setIntelligenceBtn.addEventListener('click', function() {
                const value = parseFloat(setIntelligenceInput.value);
                if (!isNaN(value) && value >= 0 && value <= stateSystem.maxAttribute) {
                    stateSystem.intelligence = value;
                    stateSystem.updateUI();
                    setIntelligenceInput.value = '';
                }
            });
        }
    },
    
    // 设置状态控制
    setupStatusControls: function(stateSystem) {
        // 饥饿值
        const setHungerBtn = document.getElementById('set-hunger');
        const setHungerInput = document.getElementById('set-hunger-input');
        if (setHungerBtn && setHungerInput) {
            setHungerBtn.addEventListener('click', function() {
                const value = parseFloat(setHungerInput.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                    stateSystem.hunger = value;
                    stateSystem.updateUI();
                    setHungerInput.value = '';
                }
            });
        }
        
        // 疾病值
        const setDiseaseBtn = document.getElementById('set-disease');
        const setDiseaseInput = document.getElementById('set-disease-input');
        if (setDiseaseBtn && setDiseaseInput) {
            setDiseaseBtn.addEventListener('click', function() {
                const value = parseFloat(setDiseaseInput.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                    stateSystem.disease = value;
                    stateSystem.updateUI();
                    setDiseaseInput.value = '';
                }
            });
        }
        
        // 心理健康值
        const setMentalHealthBtn = document.getElementById('set-mental-health');
        const setMentalHealthInput = document.getElementById('set-mental-health-input');
        if (setMentalHealthBtn && setMentalHealthInput) {
            setMentalHealthBtn.addEventListener('click', function() {
                const value = parseFloat(setMentalHealthInput.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                    stateSystem.mentalHealth = value;
                    stateSystem.updateUI();
                    setMentalHealthInput.value = '';
                }
            });
        }
        
        // 食物储存
        const setFoodStorageBtn = document.getElementById('set-food-storage');
        const setFoodStorageInput = document.getElementById('set-food-storage-input');
        if (setFoodStorageBtn && setFoodStorageInput) {
            setFoodStorageBtn.addEventListener('click', function() {
                const value = parseFloat(setFoodStorageInput.value);
                if (!isNaN(value) && value >= 0) {
                    stateSystem.setFoodStorage(value);
                    setFoodStorageInput.value = '';
                }
            });
        }
    },
    
    // 设置事件控制
    setupEventControls: function() {
        const clearEventsBtn = document.getElementById('clear-events');
        if (clearEventsBtn) {
            clearEventsBtn.addEventListener('click', function() {
                if (window.eventSystem) {
                    window.eventSystem.clearAllEvents();
                    console.log("已清除所有活跃事件");
                }
            });
        }
    }
};

// 导出到全局
window.ConsoleFeatures = ConsoleFeatures;
console.log("控制台功能模块加载完成");