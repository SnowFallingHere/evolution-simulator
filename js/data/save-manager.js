// 全局存档管理器
class SaveManager extends CoreSystem {
    constructor() {
        super();
        
        // 存档版本控制
        this.SAVE_VERSION = "1.0.0";
        this.STORAGE_KEY = "evolution_simulator_save";
        this.AUTO_SAVE_KEY = "evolution_simulator_auto_save";
        
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
        // 获取时间显示元素（桌面端用）
        const timeDisplay = document.getElementById('game-time-display');
        if (!timeDisplay) {
            console.warn("时间显示元素未找到，延迟创建存档按钮");
            setTimeout(() => this.createSaveButtons(), 1000);
            return;
        }
        
        // 创建按钮容器 - 基础样式（桌面端）+ 响应式适配（移动端）
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'save-buttons-container';
        buttonContainer.style.cssText = `
            /* 桌面端样式：保持原有定位 */
            position: absolute;
            right: 70px;
            top: 2.5%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
            z-index: 999; /* 提高层级，确保在抬头区域上方 */
            
            /* 基础flex属性 */
            flex-wrap: nowrap;
            align-items: center;
            justify-content: center;
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
        
        // 按钮交互效果
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
        const importButton = document.getElementById('import-save');
        const exportButton = document.getElementById('export-save');
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
    }
    
    // 收集游戏数据
    collectGameData() {
        if (!window.stateSystem || !window.evolutionSystem) {
            console.error("游戏系统未初始化");
            return null;
        }
        
        const saveData = {
            // 元数据
            version: this.SAVE_VERSION,
            timestamp: Date.now(),
            gameTime: window.stateSystem.gameTime,
            
            // 状态系统数据
            stateData: window.stateSystem.getStateData(),
            
            // 进化系统数据
            evolutionData: {
                evolutionLevel: window.evolutionSystem.evolutionLevel,
                evolutionPoints: window.evolutionSystem.evolutionPoints,
                requiredPoints: window.evolutionSystem.requiredPoints
            },
            
            // 事件系统数据
            eventData: window.eventSystem ? {
                currentArea: window.eventSystem.currentArea,
                activeEvents: Array.from(window.eventSystem.activeEvents.values())
            } : null,
            
            // 进化路线系统数据
            routeData: window.evolutionRouteSystem ? {
                gameStarted: window.evolutionRouteSystem.gameStarted,
                hasThought: window.evolutionRouteSystem.hasThought
            } : null
        };
        
        return saveData;
    }
    
    // 导出存档
    exportSave() {
        const saveData = this.collectGameData();
        if (!saveData) {
            alert("无法导出存档：游戏数据未初始化");
            return;
        }
        
        try {
            const dataStr = JSON.stringify(saveData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `evolution_simulator_save_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log("存档导出成功");
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("游戏存档已导出");
            }
            
        } catch (error) {
            console.error("导出存档失败:", error);
            alert("导出存档失败，请查看控制台了解详情");
        }
    }
    
    // 导入存档
    importSave(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saveData = JSON.parse(e.target.result);
                this.applySaveData(saveData);
                
                // 重置文件输入
                event.target.value = '';
                
            } catch (error) {
                console.error("导入存档失败:", error);
                alert("导入存档失败：文件格式不正确");
            }
        };
        
        reader.readAsText(file);
    }
    
    // 应用存档数据
    applySaveData(saveData) {
        if (!saveData.version || saveData.version !== this.SAVE_VERSION) {
            alert(`存档版本不兼容。当前版本：${this.SAVE_VERSION}，存档版本：${saveData.version || '未知'}`);
            return;
        }
        
        if (!window.stateSystem || !window.evolutionSystem) {
            alert("游戏系统未初始化，无法导入存档");
            return;
        }
        
        try {
            // 应用状态系统数据
            if (saveData.stateData) {
                window.stateSystem.loadSavedData(saveData.stateData);
            }
            
            // 应用进化系统数据
            if (saveData.evolutionData) {
                window.evolutionSystem.evolutionLevel = saveData.evolutionData.evolutionLevel;
                window.evolutionSystem.evolutionPoints = saveData.evolutionData.evolutionPoints;
                window.evolutionSystem.requiredPoints = saveData.evolutionData.requiredPoints;
                window.evolutionSystem.updateUI();
                window.evolutionSystem.updateRequirementsList();
            }
            
            // 应用事件系统数据
            if (saveData.eventData && window.eventSystem) {
                window.eventSystem.currentArea = saveData.eventData.currentArea;
                // 重新加载活跃事件
                window.eventSystem.activeEvents.clear();
                if (saveData.eventData.activeEvents) {
                    saveData.eventData.activeEvents.forEach(event => {
                        window.eventSystem.activeEvents.set(event.name, event);
                    });
                }
            }
            
            // 应用进化路线系统数据
            if (saveData.routeData && window.evolutionRouteSystem) {
                window.evolutionRouteSystem.gameStarted = saveData.routeData.gameStarted;
                window.evolutionRouteSystem.hasThought = saveData.routeData.hasThought;
                window.evolutionRouteSystem.updateAvailableButtons();
                window.evolutionRouteSystem.updateAttributeDisplay(window.evolutionSystem.getEvolutionLevel());
            }
            
            // 更新所有UI
            window.stateSystem.updateUI();
            window.stateSystem.setButtonStates();
            
            console.log("存档导入成功");
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("游戏存档已导入");
                if (saveData.gameTime) {
                    window.evolutionSystem.addKeyEvent(`恢复到第${saveData.gameTime.day}天`);
                }
            }
            
        } catch (error) {
            console.error("应用存档数据失败:", error);
            alert("导入存档失败，数据可能已损坏");
        }
    }
    
    // 自动保存
    autoSave() {
        const saveData = this.collectGameData();
        if (saveData) {
            try {
                localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(saveData));
                console.log("自动保存完成");
            } catch (error) {
                console.error("自动保存失败:", error);
            }
        }
    }
    
    // 启动自动保存
    startAutoSave() {
        // 每30秒自动保存一次
        const timer = setInterval(() => {
            this.autoSave();
        }, 30000);
        this.timers.push(timer);
        
        // 页面关闭前自动保存
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
    }
    
    // 检查自动保存
    checkAutoSave() {
        try {
            const autoSaveData = localStorage.getItem(this.AUTO_SAVE_KEY);
            if (autoSaveData) {
                const saveData = JSON.parse(autoSaveData);
                
                // 检查是否为同一版本
                if (saveData.version === this.SAVE_VERSION) {
                    console.log("检测到自动保存的存档");
                    
                    // 可以在这里添加提示用户是否加载自动存档的代码
                    // this.promptLoadAutoSave(saveData);
                } else {
                    console.log("自动保存的存档版本不匹配，已忽略");
                    localStorage.removeItem(this.AUTO_SAVE_KEY);
                }
            }
        } catch (error) {
            console.error("检查自动保存失败:", error);
        }
    }
    
    // 提示加载自动存档（可选功能）
    promptLoadAutoSave(saveData) {
        if (confirm("检测到自动保存的存档，是否加载？")) {
            this.applySaveData(saveData);
        }
    }
    
    // 清理自动存档
    clearAutoSave() {
        try {
            localStorage.removeItem(this.AUTO_SAVE_KEY);
            console.log("自动存档已清除");
        } catch (error) {
            console.error("清除自动存档失败:", error);
        }
    }
}

// 初始化存档管理器
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.saveManager) {
            window.saveManager = new SaveManager();
            console.log("存档管理器初始化完成");
        }
    }, 3000);
});

// 响应式样式
const style = document.createElement('style');
style.textContent = `
    /* 存档按钮响应式适配 - 核心优化 */
    /* 平板/小屏设备（768px以下） */
    @media (max-width: 768px) {
        .save-buttons-container {
            position: fixed !important; /* 固定在顶部抬头区域 */
            top: 7px !important; /* 贴合顶部 */
            right: 75px !important; /* 基础右侧间距35px（满足最小要求） */
            left: auto !important;
            transform: translateX(0) translateY(0) !important; /* 先取消偏移 */
            /* 关键：通过max-width和margin实现"越小越居中" */
            max-width: calc(100% - 150px) !important; /* 左右各留75px，限制最大宽度 */
            margin: 0 auto !important; /* 水平居中 */
            gap: 8px !important;
        }
        
        .save-button {
            width: 32px !important;
            height: 26px !important;
            font-size: 14px !important;
        }
    }
    
    /* 手机设备（480px以下）- 更居中 */
    @media (max-width: 480px) {
        .save-buttons-container {
            top: 8px !important;
            right: 75px !important; /* 保持≥35px */
            left: 75px !important; /* 左侧也留35px，强制居中 */
            max-width: 100% !important;
            justify-content: center !important; /* 容器内元素居中 */
            gap: 6px !important;
        }
        
        .save-button {
            width: 30px !important;
            height: 24px !important;
            font-size: 13px !important;
        }
    }
    
    /* 窄屏手机（320px以下）- 最大化居中 */
    @media (max-width: 320px) {
        .save-buttons-container {
            top: 6px !important;
            right: 75px !important; /* 强制保留35px右侧间距 */
            left: 75px !important; /* 强制保留35px左侧间距 */
            gap: 5px !important;
        }
        
        .save-button {
            width: 28px !important;
            height: 22px !important;
            font-size: 12px !important;
        }
    }
    
    /* 桌面端保持原有样式 */
    @media (min-width: 769px) {
        .save-buttons-container {
            z-index: 999 !important;
        }
    }
    
    /* 确保按钮可点击性和视觉优化 */
    .save-button {
        min-width: 24px;
        min-height: 20px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        border: none !important;
        border-radius: 6px !important;
    }
    
    /* 防止文本选择和遮挡 */
    .save-buttons-container {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        z-index: 9999 !important; /* 确保在抬头区域最上层 */
    }
`;
document.head.appendChild(style);
