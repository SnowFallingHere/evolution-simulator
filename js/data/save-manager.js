// 全局存档管理器
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
        
        // 移除现有按钮
        const existingContainer = document.querySelector('.save-buttons-container');
        const existingMobileMenu = document.querySelector('.save-mobile-menu');
        const existingFileInput = document.getElementById('save-file-input');
        
        if (existingContainer) existingContainer.remove();
        if (existingMobileMenu) existingMobileMenu.remove();
        if (existingFileInput) existingFileInput.remove();
        
        // 重新创建按钮
        this.createSaveButtons();
        this.setupEventListeners();
    }
    
    // 创建存档按钮
    createSaveButtons() {
        if (this.isMobile) {
            this.createMobileSaveButtons();
        } else {
            this.createDesktopSaveButtons();
        }
    }
    
    // 创建桌面端按钮
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
            top: 2.5%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
            z-index: 999;
        `;
        
        // 创建三个按钮
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
    
    // 创建移动端按钮
    createMobileSaveButtons() {
        // 创建移动端菜单容器
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'save-mobile-menu';
        mobileMenu.style.cssText = `
            position: fixed;
            top: 70px;
            right: 15px;
            background: var(--button-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
            flex-direction: column;
            padding: 8px;
            gap: 6px;
            min-width: 120px;
        `;
        
        // 创建三个菜单项
        const menuItems = [
            { id: 'mobile-new-save', icon: '🆕', text: '新存档' },
            { id: 'mobile-import-save', icon: '📁', text: '导入' },
            { id: 'mobile-export-save', icon: '💾', text: '导出' }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'save-mobile-menu-item';
            menuItem.id = item.id;
            menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s;
                font-size: 14px;
                color: var(--text-color);
            `;
            menuItem.innerHTML = `
                <span style="font-size: 16px;">${item.icon}</span>
                <span>${item.text}</span>
            `;
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = 'var(--button-hover)';
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
            });
            
            mobileMenu.appendChild(menuItem);
        });
        
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
    
    // 设置事件监听器
    setupEventListeners() {
        if (this.isMobile) {
            this.setupMobileEventListeners();
        } else {
            this.setupDesktopEventListeners();
        }
        
        // 添加窗口大小变化监听器 - 修复响应式检测
        window.addEventListener('resize', () => {
            this.checkDeviceType();
        });
    }
    
    // 设置桌面端事件监听
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
    
    // 设置移动端事件监听 - 修复与新的控制台下拉菜单的冲突
    setupMobileEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        const mobileMenu = document.querySelector('.save-mobile-menu');
        const fileInput = document.getElementById('save-file-input');
        
        if (!themeToggle || !mobileMenu) {
            console.warn("移动端元素未找到，延迟设置事件监听");
            setTimeout(() => this.setupMobileEventListeners(), 500);
            return;
        }
        
        console.log("设置移动端事件监听器");
        
        // 修复移动端主题切换按钮问题 - 不干扰控制台解锁功能
        this.setupMobileThemeToggle(themeToggle);
        
        // 双击主题切换按钮显示存档菜单（避免与控制台下拉菜单冲突）
        let lastTapTime = 0;
        let tapCount = 0;
        
        themeToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastTapTime;
            
            // 如果是双击（500ms内连续点击两次）
            if (timeDiff < 500 && tapCount === 1) {
                tapCount = 0;
                this.showMobileMenu();
                console.log("移动端双击触发，显示存档菜单");
                
                // 阻止事件继续传播，避免触发控制台下拉菜单
                e.stopImmediatePropagation();
                return;
            }
            
            tapCount++;
            lastTapTime = currentTime;
            
            // 重置计数
            setTimeout(() => {
                tapCount = 0;
            }, 500);
            
            // 如果不是双击，执行正常的主题切换
            if (tapCount === 1) {
                // 手动触发主题切换，但不干扰控制台解锁计数
                this.toggleThemeOnly();
                console.log("移动端点击触发主题切换");
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
        document.addEventListener('touchstart', (e) => {
            if (this.menuVisible && mobileMenu && !mobileMenu.contains(e.target) && e.target !== themeToggle) {
                this.hideMobileMenu();
            }
        });
        
        console.log("移动端存档菜单事件监听设置完成");
    }
    
    // 修复移动端主题切换按钮问题 - 不干扰控制台解锁功能
    setupMobileThemeToggle(themeToggle) {
        console.log("设置移动端主题切换按钮");
        
        // 移除原有的click事件监听器，防止冲突
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);
        
        // 重新添加主题切换功能，但不覆盖控制台解锁功能
        newToggle.addEventListener('click', (e) => {
            e.preventDefault();
            // 只执行主题切换，不处理控制台解锁
            this.toggleThemeOnly();
            console.log("移动端主题按钮点击（仅切换主题）");
        });
        
        // 更新全局引用
        window.themeToggle = newToggle;
        
        // 确保移动端也能触发控制台解锁
        this.setupMobileConsoleUnlock(newToggle);
    }
    
    // 设置移动端控制台解锁功能
    setupMobileConsoleUnlock(themeToggle) {
        let mobileClickCount = 0;
        let mobileClickTimer = null;
        
        // 添加触摸事件监听器，用于控制台解锁计数
        themeToggle.addEventListener('touchend', (e) => {
            // 只在移动端且不是双击时计数
            if (this.isMobile) {
                mobileClickCount++;
                console.log(`移动端控制台解锁计数: ${mobileClickCount}`);
                
                // 清除之前的计时器
                if (mobileClickTimer) {
                    clearTimeout(mobileClickTimer);
                }
                
                // 设置新的计时器，10秒后重置计数
                mobileClickTimer = setTimeout(() => {
                    mobileClickCount = 0;
                    console.log("移动端控制台解锁计数已重置");
                }, 10000);
                
                // 检查是否达到解锁条件
                if (mobileClickCount >= 10) {
                    const consoleElement = document.getElementById('de_console');
                    if (consoleElement) {
                        consoleElement.style.display = 'block';
                        console.log("移动端控制台已解锁并显示");
                        
                        // 重置计数
                        mobileClickCount = 0;
                        
                        // 设置保护期
                        if (mobileClickTimer) {
                            clearTimeout(mobileClickTimer);
                        }
                        mobileClickTimer = setTimeout(() => {
                            console.log("移动端控制台解锁保护期结束");
                            mobileClickCount = 0;
                        }, 2000);
                    }
                    
                    // 添加解锁提示
                    if (window.evolutionSystem) {
                        window.evolutionSystem.addKeyEvent("开发者控制台已解锁");
                    }
                }
            }
        });
    }
    
    // 仅切换主题，不干扰控制台解锁计数
    toggleThemeOnly() {
        const body = document.body;
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            window.themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            window.themeToggle.textContent = '🌙';
        }
        
        console.log("主题已切换（仅主题）");
    }
    
    // 显示移动端菜单
    showMobileMenu() {
        const mobileMenu = document.querySelector('.save-mobile-menu');
        if (mobileMenu) {
            mobileMenu.style.display = 'flex';
            this.menuVisible = true;
            
            // 添加显示动画
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                mobileMenu.style.transition = 'all 0.3s ease';
                mobileMenu.style.opacity = '1';
                mobileMenu.style.transform = 'translateY(0)';
            }, 10);
            
            console.log("移动端存档菜单已显示");
        }
    }
    
    // 隐藏移动端菜单
    hideMobileMenu() {
        const mobileMenu = document.querySelector('.save-mobile-menu');
        if (mobileMenu) {
            mobileMenu.style.transition = 'all 0.2s ease';
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                mobileMenu.style.display = 'none';
                this.menuVisible = false;
            }, 200);
            
            console.log("移动端存档菜单已隐藏");
        }
    }
    
    // 创建新存档
    createNewSave() {
        if (confirm("确定要创建新存档吗？当前进度将会丢失！")) {
            // 清除所有缓存数据
            this.clearAllStorage();
            
            // 添加重置冷却时间的标记
            localStorage.setItem("reset_cooldowns", "true");
            
            // 重新加载页面
            location.reload();
        }
    }
    
    // 清除所有存储数据
    clearAllStorage() {
        try {
            // 清除状态系统缓存
            localStorage.removeItem("evolution_simulator_cache");
            
            // 清除自动存档
            localStorage.removeItem("evolution_simulator_auto_save");
            
            // 清除主存档
            localStorage.removeItem(this.STORAGE_KEY);
            
            // 清除重置标记（如果有）
            localStorage.removeItem("reset_cooldowns");
            
            console.log("所有存档数据已清除");
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("已清除所有存档数据，开始新游戏");
            }
        } catch (error) {
            console.error("清除存档数据失败:", error);
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

// 响应式样式
const style = document.createElement('style');
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
    
    /* 移动端存档菜单样式 */
    .save-mobile-menu {
        position: fixed;
        top: 70px;
        right: 15px;
        background: var(--button-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: none;
        flex-direction: column;
        padding: 8px;
        gap: 6px;
        min-width: 120px;
    }
    
    .save-mobile-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 14px;
        color: var(--text-color);
    }
    
    .save-mobile-menu-item:hover {
        background-color: var(--button-hover);
    }
    
    /* 移动端主题按钮长按提示 */
    @media (max-width: 768px) {
        .theme-toggle::after {
            content: "双击显示存档菜单";
            position: absolute;
            top: 50px;
            right: 0;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 1002;
        }
        
        .theme-toggle:hover::after {
            opacity: 1;
        }
        
        /* 隐藏桌面端按钮容器 */
        .save-buttons-container {
            display: none !important;
        }
    }
    
    /* 桌面端样式 */
    @media (min-width: 769px) {
        /* 隐藏移动端菜单 */
        .save-mobile-menu {
            display: none !important;
        }
    }
    
    /* 防止文本选择和遮挡 */
    .save-buttons-container, .save-mobile-menu {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        z-index: 9999;
    }
`;
document.head.appendChild(style);