// 存档管理模块 - 完全解耦版本
class SaveManager extends CoreSystem {
    constructor() {
        super();
        
        // 存档版本控制
        this.SAVE_VERSION = "1.0.0";
        this.STORAGE_KEY = "evolution_simulator_save";
        this.AUTO_SAVE_KEY = "evolution_simulator_auto_save";
        
        // 移动端状态
        this.isMobile = false;
        this.menuVisible = false;
        this.longPressTimer = null;
        this.longPressTriggered = false;
        
        // 新增：独立的存档菜单触发元素
        this.saveTriggerElement = null;
        
        // 初始化
        this.init();
    }
    
    init() {
        console.log("存档管理器初始化");
        this.checkDeviceType();
        this.createSaveButtons();
        this.setupEventListeners();
        
        // 检查是否有自动保存的存档
        this.checkAutoSave();
        
        // 启动自动保存
        this.startAutoSave();
    }
    
    // 检查设备类型 - 修复响应式检测
    checkDeviceType() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        console.log(`设备类型检测: ${this.isMobile ? '移动端' : '桌面端'}, 窗口宽度: ${window.innerWidth}px`);
        
        // 如果设备类型发生变化，重新创建按钮
        if (wasMobile !== this.isMobile) {
            console.log(`设备类型变化: ${wasMobile ? '移动端' : '桌面端'} -> ${this.isMobile ? '移动端' : '桌面端'}`);
            this.recreateButtons();
        }
    }
    
    // 重新创建按钮（设备类型变化时）
    recreateButtons() {
        console.log("重新创建存档按钮");
        
        // 移除现有元素
        const existingContainer = document.querySelector('.save-buttons-container');
        const existingMobileMenu = document.querySelector('.save-mobile-menu');
        const existingFileInput = document.getElementById('save-file-input');
        const existingTrigger = document.querySelector('.save-menu-trigger');
        
        if (existingContainer) existingContainer.remove();
        if (existingMobileMenu) existingMobileMenu.remove();
        if (existingFileInput) existingFileInput.remove();
        if (existingTrigger) existingTrigger.remove();
        
        // 重新创建
        this.createSaveButtons();
        this.setupEventListeners();
    }
    
    // 创建存档按钮 - 关键修改：完全分离触发元素
    createSaveButtons() {
        if (this.isMobile) {
            this.createMobileSaveTrigger(); // 创建独立的触发元素
            this.createMobileSaveMenu();
        } else {
            this.createDesktopSaveButtons();
        }
    }
    
    // 桌面端：创建独立的存档按钮
    createDesktopSaveButtons() {
        const timeDisplay = document.getElementById('game-time-display');
        if (!timeDisplay) {
            console.warn("时间显示元素未找到，延迟创建存档按钮");
            setTimeout(() => this.createDesktopSaveButtons(), 1000);
            return;
        }
        
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'save-buttons-container desktop-save-buttons';
        buttonContainer.style.cssText = `
            position: absolute;
            right: 110px;
            top: 46.5%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
            z-index: 999;
        `;
        
        // 创建三个独立按钮
        const buttons = [
            { id: 'new-save', icon: '🆕', title: '新存档' },
            { id: 'import-save', icon: '📁', title: '导入存档' },
            { id: 'export-save', icon: '💾', title: '导出存档' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.className = 'save-button';
            button.innerHTML = btn.icon;
            button.title = btn.title;
            button.style.cssText = `
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
            buttonContainer.appendChild(button);
        });
        
        // 隐藏的文件输入元素
        const fileInput = document.createElement('input');
        fileInput.id = 'save-file-input';
        fileInput.type = 'file';
        fileInput.accept = '.json,.txt';
        fileInput.style.cssText = `display: none;`;
        
        timeDisplay.parentNode.appendChild(buttonContainer);
        document.body.appendChild(fileInput);
        
        console.log("桌面端存档按钮创建完成");
    }
    
    // 移动端：创建独立的触发元素（修改为点击触发）
    createMobileSaveTrigger() {
        const trigger = document.createElement('div');
        trigger.className = 'save-menu-trigger';
        trigger.id = 'save-menu-trigger';
        trigger.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: var(--button-bg);
            border: 2px solid var(--border-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 998;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 24px;
            transition: all 0.3s ease;
        `;
        trigger.innerHTML = '💾';
        trigger.title = '点击显示存档菜单';
        
        document.body.appendChild(trigger);
        this.saveTriggerElement = trigger;
        
        console.log("移动端存档触发按钮创建完成");
    }
    
    // 移动端：创建存档菜单（优化样式）
    createMobileSaveMenu() {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'save-mobile-menu';
        mobileMenu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--panel-bg);
            border: 2px solid var(--border-color);
            border-radius: 16px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.4);
            z-index: 1001;
            display: none;
            flex-direction: column;
            padding: 16px;
            gap: 12px;
            min-width: 200px;
            backdrop-filter: blur(10px);
        `;
        
        // 创建菜单标题
        const menuHeader = document.createElement('div');
        menuHeader.style.cssText = `
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            color: var(--text-color);
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-color);
        `;
        menuHeader.textContent = '存档管理';
        mobileMenu.appendChild(menuHeader);
        
        // 创建三个菜单项
        const menuItems = [
            { id: 'mobile-new-save', icon: '🆕', text: '新游戏', color: '#ff6b6b' },
            { id: 'mobile-import-save', icon: '📁', text: '导入存档', color: '#4ecdc4' },
            { id: 'mobile-export-save', icon: '💾', text: '导出存档', color: '#45b7d1' }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'save-mobile-menu-item';
            menuItem.id = item.id;
            menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                color: var(--text-color);
                background: var(--button-bg);
                border: 1px solid var(--border-color);
            `;
            menuItem.innerHTML = `
                <span style="font-size: 20px;">${item.icon}</span>
                <span style="flex: 1;">${item.text}</span>
            `;
            
            // 悬停效果
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = 'var(--button-hover)';
                menuItem.style.transform = 'translateX(5px)';
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'var(--button-bg)';
                menuItem.style.transform = 'translateX(0)';
            });
            
            // 点击效果
            menuItem.addEventListener('mousedown', () => {
                menuItem.style.transform = 'scale(0.95)';
            });
            menuItem.addEventListener('mouseup', () => {
                menuItem.style.transform = 'scale(1)';
            });
            
            mobileMenu.appendChild(menuItem);
        });
        
        // 创建关闭按钮
        const closeButton = document.createElement('div');
        closeButton.style.cssText = `
            text-align: center;
            margin-top: 8px;
            padding: 10px;
            color: var(--text-color);
            opacity: 0.7;
            font-size: 14px;
            cursor: pointer;
            border-top: 1px solid var(--border-color);
            padding-top: 12px;
        `;
        closeButton.textContent = '点击外部关闭';
        closeButton.addEventListener('click', () => this.hideMobileMenu());
        
        mobileMenu.appendChild(closeButton);
        
        // 隐藏的文件输入元素
        const fileInput = document.createElement('input');
        fileInput.id = 'save-file-input';
        fileInput.type = 'file';
        fileInput.accept = '.json,.txt';
        fileInput.style.cssText = `display: none;`;
        
        document.body.appendChild(mobileMenu);
        document.body.appendChild(fileInput);
        
        console.log("移动端存档菜单创建完成");
    }
    
    // 设置事件监听器 - 关键修改：完全分离主题和存档事件
    setupEventListeners() {
        if (this.isMobile) {
            this.setupMobileEventListeners(); // 移动端：独立的触发元素
        } else {
            this.setupDesktopEventListeners(); // 桌面端：独立按钮
        }
        
        // 添加窗口大小变化监听器
        window.addEventListener('resize', () => {
            this.checkDeviceType();
        });
    }
    
    // 桌面端事件监听 - 保持不变
    setupDesktopEventListeners() {
        const newSaveButton = document.getElementById('new-save');
        const importButton = document.getElementById('import-save');
        const exportButton = document.getElementById('export-save');
        const fileInput = document.getElementById('save-file-input');
        
        if (newSaveButton) {
            newSaveButton.addEventListener('click', () => {
                this.createNewSave();
            });
        }
        
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
        
        // 桌面端按钮交互效果
        const buttons = [newSaveButton, exportButton, importButton];
        buttons.forEach(button => {
            if (button) {
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
            }
        });
    }
    
    // 移动端事件监听 - 修改为点击触发
    setupMobileEventListeners() {
        const fileInput = document.getElementById('save-file-input');
        const saveTrigger = this.saveTriggerElement;
        
        if (!saveTrigger) {
            console.warn("移动端存档触发元素未找到，延迟设置事件监听");
            setTimeout(() => this.setupMobileEventListeners(), 500);
            return;
        }
        
        console.log("设置移动端存档事件监听器 - 点击触发");
        
        // 关键修改：改为点击触发，移除所有长按逻辑
        saveTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.menuVisible) {
                this.hideMobileMenu();
            } else {
                this.showMobileMenu();
            }
            
            // 点击动画
            saveTrigger.style.transform = 'scale(0.9)';
            setTimeout(() => {
                saveTrigger.style.transform = 'scale(1)';
            }, 150);
        });
        
        // 触摸事件（移动端）
        saveTrigger.addEventListener('touchstart', (e) => {
            e.preventDefault();
            saveTrigger.style.transform = 'scale(0.9)';
        });
        
        saveTrigger.addEventListener('touchend', (e) => {
            e.preventDefault();
            saveTrigger.style.transform = 'scale(1)';
            
            if (this.menuVisible) {
                this.hideMobileMenu();
            } else {
                this.showMobileMenu();
            }
        });
        
        // 点击菜单项
        const newSaveItem = document.getElementById('mobile-new-save');
        const importItem = document.getElementById('mobile-import-save');
        const exportItem = document.getElementById('mobile-export-save');
        
        if (newSaveItem) {
            newSaveItem.addEventListener('click', () => {
                this.createNewSave();
                this.hideMobileMenu();
            });
        }
        
        if (exportItem) {
            exportItem.addEventListener('click', () => {
                this.exportSave();
                this.hideMobileMenu();
            });
        }
        
        if (importItem && fileInput) {
            importItem.addEventListener('click', () => {
                fileInput.click();
                this.hideMobileMenu();
            });
            
            fileInput.addEventListener('change', (event) => {
                this.importSave(event);
            });
        }
        
        // 点击菜单外部关闭菜单
        document.addEventListener('click', (e) => {
            const mobileMenu = document.querySelector('.save-mobile-menu');
            const saveTrigger = document.getElementById('save-menu-trigger');
            
            if (this.menuVisible && 
                mobileMenu && 
                !mobileMenu.contains(e.target) && 
                e.target !== saveTrigger) {
                this.hideMobileMenu();
            }
        });
        
        // 触摸事件的外部关闭
        document.addEventListener('touchstart', (e) => {
            const mobileMenu = document.querySelector('.save-mobile-menu');
            const saveTrigger = document.getElementById('save-menu-trigger');
            
            if (this.menuVisible && 
                mobileMenu && 
                !mobileMenu.contains(e.target) && 
                e.target !== saveTrigger) {
                this.hideMobileMenu();
            }
        });
        
        console.log("移动端存档菜单事件监听设置完成");
    }
    
    // 显示移动端菜单（优化动画）
    showMobileMenu() {
        const mobileMenu = document.querySelector('.save-mobile-menu');
        const saveTrigger = this.saveTriggerElement;
        
        if (mobileMenu && saveTrigger) {
            mobileMenu.style.display = 'flex';
            this.menuVisible = true;
            
            // 添加显示动画
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            setTimeout(() => {
                mobileMenu.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                mobileMenu.style.opacity = '1';
                mobileMenu.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
            
            // 触发按钮高亮
            saveTrigger.style.background = 'var(--button-hover)';
            saveTrigger.style.boxShadow = '0 0 20px rgba(0,0,0,0.4)';
            
            console.log("移动端存档菜单已显示");
        }
    }
    
    // 隐藏移动端菜单（优化动画）
    hideMobileMenu() {
        const mobileMenu = document.querySelector('.save-mobile-menu');
        const saveTrigger = this.saveTriggerElement;
        
        if (mobileMenu && saveTrigger) {
            mobileMenu.style.transition = 'all 0.2s ease';
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            setTimeout(() => {
                mobileMenu.style.display = 'none';
                this.menuVisible = false;
            }, 200);
            
            // 恢复触发按钮样式
            saveTrigger.style.background = 'var(--button-bg)';
            saveTrigger.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            
            console.log("移动端存档菜单已隐藏");
        }
    }
    
    // 创建新存档 - 修复缓存清除问题
    createNewSave() {
        if (confirm("确定要创建新存档吗？当前进度将会丢失！")) {
            console.log("开始创建新存档，清除所有缓存数据...");
            
            // 清除所有缓存数据
            this.clearAllStorage();
            
            // 添加重置冷却时间的标记
            localStorage.setItem("reset_cooldowns", "true");
            
            console.log("缓存清除完成，等待100ms后重新加载页面...");
            
            // 延迟100ms确保缓存完全清除
            setTimeout(() => {
                console.log("重新加载页面，开始新游戏");
                location.reload();
            }, 100);
        }
    }
    
    // 清除所有存储数据 - 修复状态重置问题
    clearAllStorage() {
        try {
            console.log("开始清除所有存档数据...");
            
            // 清除状态系统缓存
            localStorage.removeItem("evolution_simulator_cache");
            console.log("已清除状态系统缓存");
            
            // 清除自动存档
            localStorage.removeItem("evolution_simulator_auto_save");
            console.log("已清除自动存档");
            
            // 清除主存档
            localStorage.removeItem(this.STORAGE_KEY);
            console.log("已清除主存档");
            
            // 清除重置标记（如果有）
            localStorage.removeItem("reset_cooldowns");
            console.log("已清除重置标记");
            
            // 强制重置游戏状态
            this.forceResetGameState();
            
            console.log("所有存档数据已清除，游戏状态已重置");
            
        } catch (error) {
            console.error("清除存档数据失败:", error);
        }
    }
    
    // 强制重置游戏状态
    forceResetGameState() {
        // 如果游戏系统已初始化，直接重置状态
        if (window.stateSystem && window.evolutionSystem) {
            console.log("强制重置游戏状态...");
            
            // 重置状态系统
            window.stateSystem.initializeDefaultValues();
            
            // 重置进化系统
            window.evolutionSystem.evolutionLevel = 0;
            window.evolutionSystem.evolutionPoints = 0;
            window.evolutionSystem.requiredPoints = window.evolutionSystem.calculateRequiredPoints(1);
            
            // 重置进化路线系统
            if (window.evolutionRouteSystem) {
                window.evolutionRouteSystem.hasThought = false;
                window.evolutionRouteSystem.updateAvailableButtons();
                window.evolutionRouteSystem.updateAttributeDisplay(0);
            }
            
            // 更新UI
            window.stateSystem.updateUI();
            window.evolutionSystem.updateUI();
            window.evolutionSystem.updateRequirementsList();
            
            console.log("游戏状态强制重置完成");
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

// 移除干扰主题的CSS样式（原样式中的移动端主题按钮提示）
const existingStyle = document.querySelector('style[data-save-manager-style]');
if (existingStyle) existingStyle.remove();

const style = document.createElement('style');
style.setAttribute('data-save-manager-style', 'true');
style.textContent = `
    /* 桌面端存档按钮样式 */
    .desktop-save-buttons {
        position: absolute;
        right: 110px;
        top: 2.5%;
        transform: translateY(-50%);
        display: flex;
        gap: 8px;
        z-index: 999;
    }
    
    .save-button {
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
    }
    
    .save-button:hover {
        background-color: var(--button-hover);
        transform: scale(1.1);
    }
    
    .save-button:active {
        transform: scale(0.95);
    }
    
    /* 移动端存档触发按钮样式 */
    .save-menu-trigger {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: var(--button-bg);
        border: 2px solid var(--border-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 998;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 24px;
        transition: all 0.3s ease;
    }
    
    .save-menu-trigger:active {
        transform: scale(0.9);
        background: var(--button-hover);
    }
    
    /* 移动端存档菜单样式 */
    .save-mobile-menu {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--panel-bg);
        border: 2px solid var(--border-color);
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        z-index: 1001;
        display: none;
        flex-direction: column;
        padding: 16px;
        gap: 12px;
        min-width: 200px;
        backdrop-filter: blur(10px);
    }
    
    .save-mobile-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;
        color: var(--text-color);
        background: var(--button-bg);
        border: 1px solid var(--border-color);
    }
    
    .save-mobile-menu-item:active {
        transform: scale(0.95);
        background: var(--button-hover);
    }
    
    /* 移动端：隐藏桌面端按钮 */
    @media (max-width: 768px) {
        .desktop-save-buttons {
            display: none !important;
        }
    }
    
    /* 桌面端：隐藏移动端元素 */
    @media (min-width: 769px) {
        .save-menu-trigger,
        .save-mobile-menu {
            display: none !important;
        }
    }
    
    /* 防止文本选择和遮挡 */
    .save-buttons-container, .save-mobile-menu, .save-menu-trigger {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        z-index: 9999;
    }
    
    /* 小屏幕手机优化 */
    @media (max-width: 480px) {
        .save-menu-trigger {
            width: 55px;
            height: 55px;
            font-size: 22px;
            bottom: 15px;
            right: 15px;
        }
        
        .save-mobile-menu {
            min-width: 180px;
            padding: 14px;
        }
        
        .save-mobile-menu-item {
            padding: 12px 14px;
            font-size: 15px;
        }
    }
    
    /* 超大屏幕优化 */
    @media (min-width: 1200px) {
        .save-menu-trigger {
            width: 65px;
            height: 65px;
            font-size: 26px;
        }
    }
`;
document.head.appendChild(style);