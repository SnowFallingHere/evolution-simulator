// 系统初始化模块
const GameInitializer = {
    // 初始化所有游戏系统
    initializeAllSystems: function() {
        console.log("开始初始化所有游戏系统");
        
        try {
            // 初始化事件系统
            const eventSystem = new EventSystem();
            window.eventSystem = eventSystem;
            
            // 初始化状态系统
            const stateSystem = new StateSystem(eventSystem);
            window.stateSystem = stateSystem;
            
            // 初始化活动系统
            const activitySystem = new ActivitySystem(stateSystem, eventSystem);
            window.activitySystem = activitySystem;
            
            // 初始化进化系统
            const evolutionSystem = new EvolutionSystem(stateSystem, eventSystem);
            window.evolutionSystem = evolutionSystem;
            
            // 初始化进化路线系统
            const evolutionRouteSystem = new EvolutionRouteSystem(stateSystem, eventSystem, evolutionSystem);
            window.evolutionRouteSystem = evolutionRouteSystem;
            
            console.log("所有游戏系统初始化完成");
            return true;
            
        } catch (error) {
            console.error("游戏系统初始化失败:", error);
            return false;
        }
    },
    
    // 设置基础事件监听器
    setupBaseEventListeners: function(activitySystem) {
        console.log("设置基础事件监听器");
        
        if (!activitySystem) {
            console.error("活动系统未初始化");
            return false;
        }
        
        try {
            // 设置活动按钮事件监听器
            if (typeof ActivityListeners !== 'undefined') {
                ActivityListeners.setupActivityListeners(activitySystem);
            } else {
                console.warn("ActivityListeners模块未加载，使用降级方案");
                this.setupFallbackActivityListeners(activitySystem);
            }
            
            return true;
            
        } catch (error) {
            console.error("设置事件监听器失败:", error);
            return false;
        }
    },
    
    // 降级活动监听器设置
    setupFallbackActivityListeners: function(activitySystem) {
        console.log("使用降级活动监听器");
        
        // 延迟绑定，确保按钮存在
        setTimeout(() => {
            const coolingButtonConfigs = [
                {
                    buttonId: 'hunt-btn',
                    cooldownKey: 'hunt',
                    maxCooldown: 10,
                    onClickCallback: () => activitySystem.hunt()
                },
                {
                    buttonId: 'rest-btn',
                    cooldownKey: 'rest',
                    maxCooldown: 5,
                    onClickCallback: () => activitySystem.rest()
                },
                {
                    buttonId: 'dormancy-btn',
                    cooldownKey: 'dormancy',
                    maxCooldown: 8,
                    onClickCallback: () => activitySystem.dormancy()
                },
                {
                    buttonId: 'explore-btn',
                    cooldownKey: 'explore',
                    maxCooldown: 7,
                    onClickCallback: () => activitySystem.explore()
                },
                {
                    buttonId: 'exercise-btn',
                    cooldownKey: 'exercise',
                    maxCooldown: 8,
                    onClickCallback: () => activitySystem.exercise()
                },
                {
                    buttonId: 'think-btn',
                    cooldownKey: 'think',
                    maxCooldown: 12,
                    onClickCallback: () => activitySystem.think()
                },
                {
                    buttonId: 'interact-btn',
                    cooldownKey: 'interact',
                    maxCooldown: 15,
                    onClickCallback: () => activitySystem.interact()
                },
                {
                    buttonId: 'tool-btn',
                    cooldownKey: 'tool',
                    maxCooldown: 20,
                    onClickCallback: () => activitySystem.makeTool()
                },
                {
                    buttonId: 'social-btn',
                    cooldownKey: 'social',
                    maxCooldown: 10,
                    onClickCallback: () => activitySystem.socialize()
                }
            ];
            
            // 批量创建冷却按钮
            if (typeof CoolingBtnRoll !== 'undefined') {
                CoolingBtnRoll.createCoolingButtons(coolingButtonConfigs);
                console.log("降级冷却按钮组件初始化完成");
            } else {
                console.error("CoolingBtnRoll未加载，无法设置冷却按钮");
            }
        }, 1000);
    },
    
    // 初始化页面系统
    initializePageSystem: function(evolutionSystem, stateSystem, eventSystem) {
        console.log("初始化页面系统");
        
        try {
            if (typeof PageConsole !== 'undefined') {
                PageConsole.initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
                return true;
            } else {
                console.warn("PageConsole模块未加载，使用基础页面功能");
                return this.setupBasicPageFunctions();
            }
        } catch (error) {
            console.error("页面系统初始化失败:", error);
            return false;
        }
    },
    
    // 基础页面功能设置
    setupBasicPageFunctions: function() {
        console.log("设置基础页面功能");
        
        // 设置全局showPage函数
        if (typeof window.showPage === 'undefined') {
            window.showPage = function(pageId) {
                console.log("基础showPage被调用:", pageId);
                const pages = document.querySelectorAll('.page');
                pages.forEach(page => {
                    page.style.display = 'none';
                });
                
                const targetPage = document.getElementById(pageId);
                if (targetPage) {
                    targetPage.style.display = 'flex';
                    console.log("成功显示页面:", pageId);
                }
            };
        }
        
        return true;
    },
    
    // 验证系统状态
    validateSystemState: function() {
        console.log("验证系统状态");
        
        const requiredSystems = [
            'eventSystem',
            'stateSystem', 
            'activitySystem',
            'evolutionSystem',
            'evolutionRouteSystem'
        ];
        
        const missingSystems = [];
        
        requiredSystems.forEach(system => {
            if (!window[system]) {
                missingSystems.push(system);
            }
        });
        
        if (missingSystems.length > 0) {
            console.error("以下系统未正确初始化:", missingSystems);
            return false;
        }
        
        console.log("所有系统状态验证通过");
        return true;
    },
    
    // 启动游戏
    startGame: function() {
        console.log("启动游戏流程");
        
        if (!this.validateSystemState()) {
            console.error("系统状态验证失败，无法启动游戏");
            return false;
        }
        
        try {
            // 显示开始页面
            if (typeof window.showPage === 'function') {
                window.showPage('start');
            } else {
                // 降级处理
                const startPage = document.getElementById('start');
                const ongoingPage = document.getElementById('ongoing');
                if (startPage) startPage.style.display = 'flex';
                if (ongoingPage) ongoingPage.style.display = 'none';
            }
            
            console.log("游戏启动完成");
            return true;
            
        } catch (error) {
            console.error("启动游戏失败:", error);
            return false;
        }
    },
    
    // 重启游戏（用于缓存恢复后）
    restartGame: function() {
        console.log("重启游戏");
        
        if (!this.validateSystemState()) {
            console.error("系统状态验证失败，无法重启游戏");
            return false;
        }
        
        try {
            // 直接显示进行中页面
            if (typeof window.showPage === 'function') {
                window.showPage('ongoing');
            } else {
                // 降级处理
                const startPage = document.getElementById('start');
                const ongoingPage = document.getElementById('ongoing');
                if (startPage) startPage.style.display = 'none';
                if (ongoingPage) ongoingPage.style.display = 'flex';
            }
            
            // 标记游戏已开始
            if (window.evolutionRouteSystem) {
                window.evolutionRouteSystem.gameStarted = true;
                // 更新可用按钮
                window.evolutionRouteSystem.updateAvailableButtons();
            }
            
            // 添加加载提示
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("从缓存恢复游戏进度");
            }
            
            console.log("游戏重启完成");
            return true;
            
        } catch (error) {
            console.error("重启游戏失败:", error);
            return false;
        }
    }
};

// 导出到全局
window.GameInitializer = GameInitializer;
console.log("系统初始化模块加载完成");