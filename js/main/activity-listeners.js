// 活动监听器模块
const ActivityListeners = {
    // 设置活动按钮事件监听器
    setupActivityListeners: function(activitySystem) {
        console.log("设置活动按钮事件监听器");
        
        // 延迟绑定，确保按钮存在
        setTimeout(() => {
            // 定义所有冷却按钮的配置
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
                console.log("冷却按钮组件初始化完成");
            } else {
                console.error("CoolingBtnRoll未加载，无法设置冷却按钮");
                this.setupFallbackListeners(activitySystem);
            }
            
        }, 1000);
    },
    
    // 设置降级监听器
    setupFallbackListeners: function(activitySystem) {
        console.log("设置降级活动监听器");
        
        const buttons = [
            { id: 'hunt-btn', action: () => activitySystem.hunt() },
            { id: 'rest-btn', action: () => activitySystem.rest() },
            { id: 'dormancy-btn', action: () => activitySystem.dormancy() },
            { id: 'explore-btn', action: () => activitySystem.explore() },
            { id: 'exercise-btn', action: () => activitySystem.exercise() },
            { id: 'think-btn', action: () => activitySystem.think() },
            { id: 'interact-btn', action: () => activitySystem.interact() },
            { id: 'tool-btn', action: () => activitySystem.makeTool() },
            { id: 'social-btn', action: () => activitySystem.socialize() }
        ];
        
        buttons.forEach(buttonConfig => {
            const button = document.getElementById(buttonConfig.id);
            if (button) {
                button.addEventListener('click', buttonConfig.action);
            }
        });
        
        console.log("降级活动监听器设置完成");
    },
    
    // 检查按钮状态
    checkButtonStates: function() {
        const buttons = [
            'hunt-btn', 'rest-btn', 'dormancy-btn', 'explore-btn',
            'exercise-btn', 'think-btn', 'interact-btn', 'tool-btn', 'social-btn'
        ];
        
        let found = 0;
        let missing = [];
        
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                found++;
            } else {
                missing.push(buttonId);
            }
        });
        
        console.log(`按钮检查: 找到 ${found}/${buttons.length} 个按钮`);
        if (missing.length > 0) {
            console.warn("缺失的按钮:", missing);
        }
        
        return { found, missing };
    },
    
    // 更新按钮显示状态
    updateButtonDisplay: function() {
        // 这个功能通常由进化路线系统处理
        if (window.evolutionRouteSystem) {
            window.evolutionRouteSystem.updateAvailableButtons();
        }
    }
};

// 导出到全局
window.ActivityListeners = ActivityListeners;
console.log("活动监听器模块加载完成");