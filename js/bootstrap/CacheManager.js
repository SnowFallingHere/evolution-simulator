// 缓存管理模块
const CacheManager = {
    // 缓存配置
    STORAGE_VERSION: "1.0",
    STORAGE_KEY: "evolution_simulator_cache",
    AUTO_SAVE_KEY: "evolution_simulator_auto_save",
    
    // 检查是否有缓存数据
    checkForCache: function() {
        console.log("检查缓存数据");
        
        try {
            // 检查状态系统的缓存
            const stateCache = localStorage.getItem(this.STORAGE_KEY);
            if (stateCache) {
                const parsedData = JSON.parse(stateCache);
                if (parsedData.version === this.STORAGE_VERSION && parsedData.stateData) {
                    console.log("找到状态系统缓存");
                    return true;
                }
            }
            
            // 检查自动存档
            const autoSave = localStorage.getItem(this.AUTO_SAVE_KEY);
            if (autoSave) {
                const parsedData = JSON.parse(autoSave);
                if (parsedData.version === "1.0.0") {
                    console.log("找到自动存档");
                    return true;
                }
            }
            
            console.log("未找到有效的缓存数据");
            return false;
            
        } catch (error) {
            console.error("检查缓存时出错:", error);
            return false;
        }
    },
    
    // 直接加载游戏（有缓存时）
    loadGameDirectly: function() {
        console.log("开始直接加载游戏");
        
        // 更新加载文字
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.updateLoadingText("正在恢复游戏进度");
        }
        
        try {
            // 初始化事件系统
            const eventSystem = new EventSystem();
            window.eventSystem = eventSystem;
            
            // 初始化状态系统（会自动加载缓存）
            const stateSystem = new StateSystem(eventSystem);
            window.stateSystem = stateSystem;
            
            // 重置冷却时间 - 修复新存档冷却问题
            this.resetAllCooldowns();
            
            // 初始化活动系统
            const activitySystem = new ActivitySystem(stateSystem, eventSystem);
            window.activitySystem = activitySystem;
            
            // 初始化进化系统
            const evolutionSystem = new EvolutionSystem(stateSystem, eventSystem);
            window.evolutionSystem = evolutionSystem;
            
            // 初始化进化路线系统
            const evolutionRouteSystem = new EvolutionRouteSystem(stateSystem, eventSystem, evolutionSystem);
            window.evolutionRouteSystem = evolutionRouteSystem;
            
            // 设置活动按钮事件监听器
            if (typeof ActivityListeners !== 'undefined') {
                ActivityListeners.setupActivityListeners(activitySystem);
            } else {
                console.warn("ActivityListeners未加载，跳过活动监听器设置");
            }
            
            // 初始化页面切换和控制台
            if (typeof PageConsole !== 'undefined') {
                PageConsole.initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
            } else {
                console.warn("PageConsole未加载，跳过页面控制台初始化");
            }
            
            // 直接显示进行中页面
            if (typeof GameInitializer !== 'undefined') {
                GameInitializer.restartGame();
            } else {
                // 降级处理
                this.fallbackRestartGame();
            }
            
            console.log("游戏从缓存直接加载完成");
            
        } catch (error) {
            console.error("直接加载游戏失败:", error);
            this.handleCacheLoadError(error);
        }
    },
    
    // 降级重启游戏
    fallbackRestartGame: function() {
        console.log("使用降级重启游戏");
        
        // 直接显示进行中页面
        const startPage = document.getElementById('start');
        const ongoingPage = document.getElementById('ongoing');
        if (startPage) startPage.style.display = 'none';
        if (ongoingPage) ongoingPage.style.display = 'flex';
        
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
    },
    
    // 重置所有冷却时间
    resetAllCooldowns: function() {
        if (!window.stateSystem) {
            console.warn("状态系统未初始化，无法重置冷却时间");
            return;
        }
        
        console.log("重置所有冷却时间");
        
        // 重置所有活动冷却时间
        const activities = ['hunt', 'rest', 'dormancy', 'explore', 'exercise', 'think', 'interact', 'tool', 'social'];
        activities.forEach(activity => {
            window.stateSystem.cooldowns[activity] = 0;
        });
        
        // 重置全局冷却
        window.stateSystem.globalCooldown = 0;
        
        // 重置活动状态
        window.stateSystem.activityState = 'idle';
        
        console.log("所有冷却时间已重置");
    },
    
    // 处理缓存加载错误
    handleCacheLoadError: function(error) {
        console.error("缓存加载错误处理:", error);
        
        // 显示错误信息
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.showErrorState("缓存数据损坏，将重新开始游戏");
        }
        
        // 清除损坏的缓存
        this.clearCorruptedCache();
        
        // 延迟后重新加载页面
        setTimeout(() => {
            if (confirm("缓存数据损坏，是否重新开始游戏？")) {
                this.clearAllStorage();
                location.reload();
            }
        }, 2000);
    },
    
    // 清除损坏的缓存
    clearCorruptedCache: function() {
        console.log("清除损坏的缓存数据");
        
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.AUTO_SAVE_KEY);
            console.log("损坏的缓存已清除");
        } catch (error) {
            console.error("清除损坏缓存失败:", error);
        }
    },
    
    // 清除所有存储数据
    clearAllStorage: function() {
        console.log("开始清除所有存档数据");
        
        try {
            // 清除状态系统缓存
            localStorage.removeItem(this.STORAGE_KEY);
            console.log("已清除状态系统缓存");
            
            // 清除自动存档
            localStorage.removeItem(this.AUTO_SAVE_KEY);
            console.log("已清除自动存档");
            
            // 清除重置标记（如果有）
            localStorage.removeItem("reset_cooldowns");
            console.log("已清除重置标记");
            
            console.log("所有存档数据已清除");
            
        } catch (error) {
            console.error("清除存档数据失败:", error);
        }
    },
    
    // 验证缓存完整性
    validateCacheIntegrity: function() {
        console.log("验证缓存完整性");
        
        try {
            const stateCache = localStorage.getItem(this.STORAGE_KEY);
            if (!stateCache) {
                console.log("无状态缓存");
                return false;
            }
            
            const parsedData = JSON.parse(stateCache);
            
            // 检查必需字段
            const requiredFields = ['version', 'stateData', 'timestamp'];
            for (const field of requiredFields) {
                if (!parsedData[field]) {
                    console.warn(`缓存缺少必需字段: ${field}`);
                    return false;
                }
            }
            
            // 检查状态数据完整性
            const stateData = parsedData.stateData;
            const stateRequiredFields = ['strength', 'speed', 'intelligence', 'hunger', 'disease', 'foodStorage'];
            for (const field of stateRequiredFields) {
                if (typeof stateData[field] === 'undefined') {
                    console.warn(`状态数据缺少字段: ${field}`);
                    return false;
                }
            }
            
            console.log("缓存完整性验证通过");
            return true;
            
        } catch (error) {
            console.error("缓存完整性验证失败:", error);
            return false;
        }
    },
    
    // 获取缓存信息
    getCacheInfo: function() {
        try {
            const stateCache = localStorage.getItem(this.STORAGE_KEY);
            const autoSave = localStorage.getItem(this.AUTO_SAVE_KEY);
            
            return {
                hasStateCache: !!stateCache,
                hasAutoSave: !!autoSave,
                stateCacheSize: stateCache ? stateCache.length : 0,
                autoSaveSize: autoSave ? autoSave.length : 0,
                lastUpdate: stateCache ? JSON.parse(stateCache).timestamp : null
            };
        } catch (error) {
            console.error("获取缓存信息失败:", error);
            return null;
        }
    },
    
    // 备份缓存
    backupCache: function() {
        try {
            const stateCache = localStorage.getItem(this.STORAGE_KEY);
            const autoSave = localStorage.getItem(this.AUTO_SAVE_KEY);
            
            const backup = {
                stateCache: stateCache,
                autoSave: autoSave,
                timestamp: Date.now(),
                version: this.STORAGE_VERSION
            };
            
            localStorage.setItem('evolution_simulator_backup', JSON.stringify(backup));
            console.log("缓存备份完成");
            return true;
            
        } catch (error) {
            console.error("缓存备份失败:", error);
            return false;
        }
    },
    
    // 恢复备份
    restoreBackup: function() {
        try {
            const backup = localStorage.getItem('evolution_simulator_backup');
            if (!backup) {
                console.log("无备份可恢复");
                return false;
            }
            
            const parsedBackup = JSON.parse(backup);
            
            if (parsedBackup.stateCache) {
                localStorage.setItem(this.STORAGE_KEY, parsedBackup.stateCache);
            }
            
            if (parsedBackup.autoSave) {
                localStorage.setItem(this.AUTO_SAVE_KEY, parsedBackup.autoSave);
            }
            
            console.log("缓存恢复完成");
            return true;
            
        } catch (error) {
            console.error("缓存恢复失败:", error);
            return false;
        }
    }
};

// 导出到全局
window.CacheManager = CacheManager;
console.log("缓存管理模块加载完成");