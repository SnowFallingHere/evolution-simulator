// 全局存档管理器
class SaveManager extends CoreSystem {
    constructor() {
        super();
        
        // 存档版本控制
        this.SAVE_VERSION = "1.0.0";
        this.STORAGE_KEY = "evolution_simulator_save";
        
        // 初始化
        this.init();
    }
    
    init() {
        console.log("存档管理器初始化");
        this.createSaveButtons();
        this.setupEventListeners();
        
        // 检查是否有自动保存的存档
        this.checkAutoSave();
        
        // 启动自动保存
        this.startAutoSave();
    }
    
    // 创建存档按钮
    createSaveButtons() {
        // 获取时间显示元素
        const timeDisplay = document.getElementById('game-time-display');
        if (!timeDisplay) {
            console.warn("时间显示元素未找到，延迟创建存档按钮");
            setTimeout(() => this.createSaveButtons(), 1000);
            return;
        }
        
        // 创建按钮容器 - 使用提供的位置参数
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'save-buttons-container';
        buttonContainer.style.cssText = `
            position: absolute;
            right: 70px; /* 放在时间显示的左侧 */
            top: 2.5%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
            z-index: 10;
        `;
        
        // 导入存档按钮
        const importButton = document.createElement('button');
        importButton.id = 'import-save';
        importButton.className = 'save-button';
        importButton.innerHTML = '📁';
        importButton.title = '导入存档';
        importButton.style.cssText = `
            background: var(--button-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text-color);
            transition: all 0.2s;
            width: 32px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 导出存档按钮
        const exportButton = document.createElement('button');
        exportButton.id = 'export-save';
        exportButton.className = 'save-button';
        exportButton.innerHTML = '💾';
        exportButton.title = '导出存档';
        exportButton.style.cssText = `
            background: var(--button-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text-color);
            transition: all 0.2s;
            width: 32px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 隐藏的文件输入元素
        const fileInput = document.createElement('input');
        fileInput.id = 'save-file-input';
        fileInput.type = 'file';
        fileInput.accept = '.json,.txt';
        fileInput.style.cssText = `
            display: none;
        `;
        
        // 添加悬停效果
        const buttons = [exportButton, importButton];
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = 'var(--button-hover)';
                button.style.transform = 'scale(1.1)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = 'var(--button-bg)';
                button.style.transform = 'scale(1)';
            });
            
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.95)';
            });
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });
        });
        
        // 添加到页面
        buttonContainer.appendChild(importButton);
        buttonContainer.appendChild(exportButton);
        timeDisplay.parentNode.appendChild(buttonContainer);
        document.body.appendChild(fileInput);
        
        console.log("存档按钮创建完成");
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 延迟绑定，确保按钮已创建
        setTimeout(() => {
            const exportButton = document.getElementById('export-save');
            const importButton = document.getElementById('import-save');
            const fileInput = document.getElementById('save-file-input');
            
            if (exportButton) {
                exportButton.addEventListener('click', () => {
                    this.exportSave();
                });
            }
            
            if (importButton && fileInput) {
                importButton.addEventListener('click', () => {
                    fileInput.click();
                });
                
                fileInput.addEventListener('change', (event) => {
                    this.importSave(event);
                });
            }
        }, 1000);
    }
    
    // 收集所有游戏数据
    collectGameData() {
        const gameData = {
            version: this.SAVE_VERSION,
            timestamp: Date.now(),
            stateData: null,
            evolutionData: null,
            eventData: null,
            routeData: null
        };
        
        // 收集状态系统数据
        if (window.stateSystem) {
            gameData.stateData = {
                strength: window.stateSystem.strength,
                speed: window.stateSystem.speed,
                intelligence: window.stateSystem.intelligence,
                maxAttribute: window.stateSystem.maxAttribute,
                hunger: window.stateSystem.hunger,
                mentalHealth: window.stateSystem.mentalHealth,
                disease: window.stateSystem.disease,
                foodStorage: window.stateSystem.foodStorage,
                maxFoodStorage: window.stateSystem.maxFoodStorage,
                cooldowns: {...window.stateSystem.cooldowns},
                maxCooldowns: {...window.stateSystem.maxCooldowns},
                globalCooldown: window.stateSystem.globalCooldown,
                activityState: window.stateSystem.activityState,
                timePaused: window.stateSystem.timePaused,
                gameTime: {...window.stateSystem.gameTime}
            };
        }
        
        // 收集进化系统数据
        if (window.evolutionSystem) {
            gameData.evolutionData = {
                evolutionLevel: window.evolutionSystem.evolutionLevel,
                evolutionPoints: window.evolutionSystem.evolutionPoints,
                requiredPoints: window.evolutionSystem.requiredPoints
            };
        }
        
        // 收集事件系统数据
        if (window.eventSystem) {
            gameData.eventData = {
                currentArea: window.eventSystem.currentArea,
                activeEvents: Array.from(window.eventSystem.activeEvents.values())
            };
        }
        
        // 收集进化路线数据
        if (window.evolutionRouteSystem) {
            gameData.routeData = {
                gameStarted: window.evolutionRouteSystem.gameStarted,
                hasThought: window.evolutionRouteSystem.hasThought
            };
        }
        
        return gameData;
    }
    
    // 导出存档
    exportSave() {
        try {
            const gameData = this.collectGameData();
            const jsonData = JSON.stringify(gameData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // 生成文件名
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
            a.download = `evolution_simulator_save_${timestamp}.json`;
            
            // 触发下载
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // 在关键事件中记录
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("💾 游戏存档已导出");
            }
            
            console.log("存档导出成功");
            
        } catch (error) {
            console.error("存档导出失败:", error);
            this.showMessage('存档导出失败！', 'error');
        }
    }
    
    // 导入存档
    importSave(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                this.loadGameData(gameData);
                
                // 重置文件输入
                event.target.value = '';
                
            } catch (error) {
                console.error("存档导入失败:", error);
                this.showMessage('存档文件格式错误！', 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    // 加载游戏数据
    loadGameData(gameData) {
        try {
            // 验证存档版本
            if (!gameData.version || gameData.version !== this.SAVE_VERSION) {
                if (!confirm(`存档版本不匹配（${gameData.version} → ${this.SAVE_VERSION}）。是否继续加载？`)) {
                    return;
                }
            }
            
            // 加载状态系统数据
            if (gameData.stateData && window.stateSystem) {
                window.stateSystem.strength = gameData.stateData.strength || 1.0;
                window.stateSystem.speed = gameData.stateData.speed || 1.0;
                window.stateSystem.intelligence = gameData.stateData.intelligence || 1.0;
                window.stateSystem.hunger = gameData.stateData.hunger || 0;
                window.stateSystem.mentalHealth = gameData.stateData.mentalHealth || 0;
                window.stateSystem.disease = gameData.stateData.disease || 0;
                window.stateSystem.foodStorage = gameData.stateData.foodStorage || 20;
                
                if (gameData.stateData.cooldowns) {
                    Object.assign(window.stateSystem.cooldowns, gameData.stateData.cooldowns);
                }
                
                if (gameData.stateData.gameTime) {
                    Object.assign(window.stateSystem.gameTime, gameData.stateData.gameTime);
                }
                
                window.stateSystem.timePaused = gameData.stateData.timePaused || false;
                window.stateSystem.activityState = gameData.stateData.activityState || 'idle';
                
                window.stateSystem.updateUI();
                window.stateSystem.setButtonStates();
                window.stateSystem.updateTimeDisplay();
            }
            
            // 加载进化系统数据
            if (gameData.evolutionData && window.evolutionSystem) {
                window.evolutionSystem.evolutionLevel = gameData.evolutionData.evolutionLevel || 0;
                window.evolutionSystem.evolutionPoints = gameData.evolutionData.evolutionPoints || 0;
                window.evolutionSystem.requiredPoints = gameData.evolutionData.requiredPoints || window.evolutionSystem.calculateRequiredPoints(1);
                
                window.evolutionSystem.updateUI();
                window.evolutionSystem.updateRequirementsList();
                window.evolutionSystem.checkEvolution();
            }
            
            // 加载事件系统数据
            if (gameData.eventData && window.eventSystem) {
                window.eventSystem.currentArea = gameData.eventData.currentArea || 'sea';
                if (gameData.eventData.activeEvents) {
                    window.eventSystem.activeEvents.clear();
                    gameData.eventData.activeEvents.forEach(event => {
                        window.eventSystem.activeEvents.set(event.name, event);
                    });
                }
            }
            
            // 加载进化路线数据
            if (gameData.routeData && window.evolutionRouteSystem) {
                window.evolutionRouteSystem.gameStarted = gameData.routeData.gameStarted || false;
                window.evolutionRouteSystem.hasThought = gameData.routeData.hasThought || false;
                
                // 更新按钮显示状态
                window.evolutionRouteSystem.updateAvailableButtons();
                window.evolutionRouteSystem.updateAttributeDisplay(window.evolutionSystem.evolutionLevel);
            }
            
            // 在关键事件中记录
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("📁 游戏存档已导入");
            }
            
            console.log("存档导入成功");
            
        } catch (error) {
            console.error("加载游戏数据失败:", error);
            this.showMessage('存档加载失败！', 'error');
        }
    }
    
    // 自动保存
    autoSave() {
        try {
            const gameData = this.collectGameData();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameData));
            console.log("自动保存完成");
        } catch (error) {
            console.error("自动保存失败:", error);
        }
    }
    
    // 检查自动保存
    checkAutoSave() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (savedData) {
                const gameData = JSON.parse(savedData);
                
                // 检查存档时间（24小时内）
                const saveTime = gameData.timestamp;
                const currentTime = Date.now();
                const hoursDiff = (currentTime - saveTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    if (confirm("发现自动保存的存档（24小时内）。是否加载？")) {
                        this.loadGameData(gameData);
                    }
                } else {
                    // 删除过期的自动保存
                    localStorage.removeItem(this.STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error("检查自动保存失败:", error);
        }
    }
    
    // 显示消息（仅用于错误提示）
    showMessage(message, type = 'error') {
        // 只在错误时显示弹窗
        if (type !== 'error') return;
        
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            font-weight: bold;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            background-color: #f44336;
            color: white;
        `;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
    
    // 启动自动保存定时器
    startAutoSave() {
        const timer = setInterval(() => {
            this.autoSave();
        }, 300000); // 每5分钟自动保存一次
        this.timers.push(timer);
    }
    
    // 清理
    cleanup() {
        super.cleanup();
    }
}

// 初始化存档管理器
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保其他系统已加载
    setTimeout(() => {
        if (!window.saveManager) {
            window.saveManager = new SaveManager();
            console.log("存档管理器初始化完成");
        }
    }, 3000);
});