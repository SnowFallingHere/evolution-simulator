// 状态同步模块 - 彻底修复版本
const StateSync = {
    // 同步状态
    isSyncing: false,
    lastSyncTime: null,
    syncTimeout: null,
    monitorInterval: null, // 添加监控间隔引用
    
    // 初始化状态同步
    init: function() {
        console.log("初始化状态同步模块");
        
        // 检查依赖系统是否可用
        if (!this.checkDependencies()) {
            console.warn("依赖系统未就绪，延迟初始化...");
            setTimeout(() => this.init(), 1000); // 1秒后重试
            return;
        }
        
        // 设置防抖的同步函数
        this.debouncedSync = this.debounce(() => {
            this.performSync();
        }, 5000); // 5秒防抖
        
        // 设置监听器
        this.setupSyncListeners();
        
        // 验证状态一致性
        this.validateStateConsistency();
        
        console.log("状态同步初始化完成");
    },
    
    // 检查依赖系统
    checkDependencies: function() {
        return window.stateSystem && window.evolutionSystem;
    },
    
    // 简单的防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 设置同步监听器 - 优化版本
    setupSyncListeners: function() {
        console.log("设置同步监听器");
        
        // 温和的监控方式
        this.setupGentleMonitoring();
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log("页面隐藏，强制同步");
                this.forceSync();
            }
        });
        
        // 监听页面卸载
        window.addEventListener('beforeunload', () => {
            console.log("页面卸载，强制同步");
            this.forceSync();
        });
    },
    
    // 温和的监控方式 - 修复版本
    setupGentleMonitoring: function() {
        console.log("设置温和的状态监控");
        
        // 先清理可能存在的旧定时器
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        
        // 使用定时器检查状态变化
        this.monitorInterval = setInterval(() => {
            // 只在不处于同步状态时才检查
            if (!this.isSyncing) {
                this.checkForSignificantChanges();
            }
        }, 15000); // 延长到15秒，减少频率
        
        // 监听用户交互 - 使用节流避免过度触发
        let interactionTimeout;
        document.addEventListener('click', () => {
            if (interactionTimeout) clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(() => {
                this.onUserInteraction();
            }, 1000); // 1秒节流
        });
    },
    
    // 检查显著变化 - 优化版本
    checkForSignificantChanges: function() {
        if (!this.checkDependencies()) return;
        
        try {
            // 保存上次检查的状态
            if (!this.lastState) {
                this.lastState = this.getCurrentStateSnapshot();
                return;
            }
            
            const currentState = this.getCurrentStateSnapshot();
            const hasSignificantChange = this.hasSignificantStateChange(this.lastState, currentState);
            
            if (hasSignificantChange) {
                console.log("检测到显著状态变化，执行同步");
                this.scheduleSync();
                this.lastState = currentState;
            }
        } catch (error) {
            console.error("检查状态变化时出错:", error);
        }
    },
    
    // 获取当前状态快照
    getCurrentStateSnapshot: function() {
        if (!this.checkDependencies()) return null;
        
        return {
            evolutionLevel: window.evolutionSystem.evolutionLevel,
            evolutionPoints: window.evolutionSystem.evolutionPoints,
            hunger: window.stateSystem.hunger,
            disease: window.stateSystem.disease,
            foodStorage: window.stateSystem.foodStorage,
            timestamp: Date.now()
        };
    },
    
    // 检查是否有显著状态变化
    hasSignificantStateChange: function(oldState, newState) {
        if (!oldState || !newState) return false;
        
        // 定义显著变化的阈值
        const significantChanges = [
            Math.abs(oldState.evolutionLevel - newState.evolutionLevel) >= 1,
            Math.abs(oldState.evolutionPoints - newState.evolutionPoints) >= 200, // 提高阈值
            Math.abs(oldState.hunger - newState.hunger) >= 15, // 提高阈值
            Math.abs(oldState.disease - newState.disease) >= 15, // 提高阈值
            Math.abs(oldState.foodStorage - newState.foodStorage) >= 100 // 提高阈值
        ];
        
        return significantChanges.some(change => change);
    },
    
    // 用户交互处理 - 修复版本
    onUserInteraction: function() {
        // 如果已在等待同步，跳过
        if (this.syncTimeout) return;
        
        // 用户交互时可能发生重要状态变化
        this.scheduleSync();
    },
    
    // 状态变化回调
    onStateChange: function(system) {
        if (this.isSyncing) return;
        
        // 使用防抖的同步，避免频繁触发
        this.debouncedSync();
    },
    
    // 安排同步 - 修复版本
    scheduleSync: function() {
        // 如果已经在同步中，跳过
        if (this.isSyncing) return;
        
        // 防抖：避免频繁同步
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        
        this.syncTimeout = setTimeout(() => {
            this.performSync();
        }, 3000); // 延长到3秒，减少同步频率
    },
    
    // 执行同步 - 优化版本
    performSync: function() {
        if (this.isSyncing) {
            console.warn("同步已在进行中，跳过本次同步");
            return;
        }
        
        this.isSyncing = true;
        console.log("开始状态同步");
        
        try {
            // 只同步重要数据，避免不必要的操作
            this.syncEssentialData();
            
            this.lastSyncTime = new Date();
            console.log("状态同步完成");
            
        } catch (error) {
            console.error("状态同步失败:", error);
            // 发生错误时重置同步状态，避免永久锁定
            this.isSyncing = false;
        } finally {
            // 确保同步状态被重置
            setTimeout(() => {
                this.isSyncing = false;
            }, 1000); // 1秒冷却
        }
    },
    
    // 同步必要数据 - 优化版本
    syncEssentialData: function() {
        // 状态系统有自己的缓存机制，我们不需要重复同步
        // 这里主要是验证一致性，而不是主动同步
        
        if (window.stateSystem) {
            const stateData = window.stateSystem.getStateData();
            this.validateEssentialStateData(stateData);
        }
        
        if (window.evolutionSystem) {
            const evolutionData = {
                evolutionLevel: window.evolutionSystem.evolutionLevel,
                evolutionPoints: window.evolutionSystem.evolutionPoints
            };
            this.validateEssentialEvolutionData(evolutionData);
        }
    },
    
    // 验证必要状态数据
    validateEssentialStateData: function(stateData) {
        const criticalIssues = [];
        
        // 只检查关键问题
        if (stateData.hunger < 0 || stateData.hunger > 100) {
            criticalIssues.push(`饥饿值异常: ${stateData.hunger}`);
        }
        
        if (stateData.disease < 0 || stateData.disease > 100) {
            criticalIssues.push(`疾病值异常: ${stateData.disease}`);
        }
        
        if (stateData.foodStorage < 0) {
            criticalIssues.push(`食物储存异常: ${stateData.foodStorage}`);
        }
        
        if (criticalIssues.length > 0) {
            console.error("关键状态数据问题:", criticalIssues);
            this.repairCriticalStateData(stateData, criticalIssues);
        }
    },
    
    // 验证必要进化数据
    validateEssentialEvolutionData: function(evolutionData) {
        const criticalIssues = [];
        
        if (evolutionData.evolutionLevel < 0 || evolutionData.evolutionLevel > 100) {
            criticalIssues.push(`进化等级异常: ${evolutionData.evolutionLevel}`);
        }
        
        if (evolutionData.evolutionPoints < 0) {
            criticalIssues.push(`进化点数异常: ${evolutionData.evolutionPoints}`);
        }
        
        if (criticalIssues.length > 0) {
            console.error("关键进化数据问题:", criticalIssues);
            this.repairCriticalEvolutionData(evolutionData, criticalIssues);
        }
    },
    
    // 修复关键状态数据
    repairCriticalStateData: function(stateData, issues) {
        console.log("修复关键状态数据");
        
        issues.forEach(issue => {
            if (issue.includes('饥饿值异常')) {
                stateData.hunger = Math.max(0, Math.min(100, stateData.hunger));
            } else if (issue.includes('疾病值异常')) {
                stateData.disease = Math.max(0, Math.min(100, stateData.disease));
            } else if (issue.includes('食物储存异常')) {
                stateData.foodStorage = Math.max(0, stateData.foodStorage);
            }
        });
    },
    
    // 修复关键进化数据
    repairCriticalEvolutionData: function(evolutionData, issues) {
        console.log("修复关键进化数据");
        
        issues.forEach(issue => {
            if (issue.includes('进化等级异常')) {
                evolutionData.evolutionLevel = Math.max(0, Math.min(100, evolutionData.evolutionLevel));
            } else if (issue.includes('进化点数异常')) {
                evolutionData.evolutionPoints = Math.max(0, evolutionData.evolutionPoints);
            }
        });
    },
    
    // 强制同步
    forceSync: function() {
        console.log("强制状态同步");
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
            this.syncTimeout = null; // 重置引用
        }
        this.performSync();
    },
    
    // 停止同步 - 修复版本
    stopSync: function() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
            this.syncTimeout = null;
        }
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        console.log("状态同步已停止");
    },
    
    // 验证状态一致性 - 最终版本
    validateStateConsistency: function() {
        console.log("验证状态一致性");
        
        // 只检查最关键的一致性
        if (!window.stateSystem || !window.evolutionSystem) {
            console.warn("系统未完全初始化，跳过一致性检查");
            return false;
        }
        
        const evolutionLevel = window.evolutionSystem.getEvolutionLevel();
        const hasThought = window.evolutionRouteSystem ? window.evolutionRouteSystem.hasThought : false;
        
        // 关键检查：51级以上的智慧值逻辑
        if (evolutionLevel > 50 && !hasThought && window.stateSystem.intelligence > 0) {
            console.warn("51级以上但未进行思考，重置智慧值为0");
            window.stateSystem.intelligence = 0;
        }
        
        console.log("状态一致性验证完成");
        return true;
    },
    
    // 禁用状态同步（紧急情况下使用）
    disable: function() {
        console.log("禁用状态同步模块");
        this.stopSync();
        this.isSyncing = false;
        this.lastState = null; // 清理状态快照
    },
    
    // 启用状态同步
    enable: function() {
        console.log("启用状态同步模块");
        // 重新初始化监听
        this.setupSyncListeners();
        this.lastState = null; // 重置状态快照
        console.log("状态同步模块已重新启用");
    }
};

// 导出到全局
window.StateSync = StateSync;

// 优化初始化时机
function initStateSync() {
    if (window.stateSystem && window.evolutionSystem) {
        StateSync.init();
    } else {
        console.warn("状态同步模块：系统未完全初始化，将在5秒后重试...");
        setTimeout(initStateSync, 5000);
    }
}

// 延迟初始化
setTimeout(initStateSync, 1000); // 改为1秒，更早初始化

console.log("状态同步模块加载完成（彻底修复版本）");