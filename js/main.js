// 主程序入口 - 初始化所有系统（修复版本 - 优化加载超时问题）
// 控制台解锁机制 - 全局变量
let themeClickCount = 0;
let themeClickTimer = null;
let consoleUnlocked = false;

// 添加初始化状态跟踪（增强版）
let initializationStarted = false;
let initializationTimeout = null;
let currentInitPhase = 'idle'; // 跟踪当前初始化阶段
let initStartTime = null; // 记录初始化开始时间

// 性能优化：禁用非必要监控的标志
let enableAdvancedMonitoring = true;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成，开始初始化系统");
    initStartTime = Date.now();
    
    // 检测是否为移动端或低端设备
    detectDeviceAndOptimize();
    
    // 创建增强的加载界面
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.createEnhancedLoadingScreen();
        // 立即显示加载进度，提升用户体验
        LoadingManager.updateLoadingText("正在检测设备环境...");
        LoadingManager.updateProgress(5, "检测设备类型和性能...");
    } else {
        console.error("LoadingManager未加载，使用降级启动");
        fallbackStartup();
        return;
    }
    
    // 设置初始化超时保护（延长至25秒，分阶段超时）
    initializationTimeout = setTimeout(() => {
        console.error("初始化超时！强制隐藏loading界面");
        LoadingManager.hideLoadingScreen();
        if (!initializationStarted) {
            console.error("初始化从未开始，显示错误页面");
            ErrorHandler.showErrorPage("初始化超时", "系统初始化花费时间过长。建议：1) 刷新页面重试 2) 清除浏览器缓存 3) 检查网络连接");
        } else {
            console.error(`初始化在阶段 ${currentInitPhase} 超时，耗时: ${Date.now() - initStartTime}ms`);
            // 超时但已开始，尝试降级完成
            forceCompleteInitialization();
        }
    }, 25000); // 延长至25秒
    
    // 延迟初始化，确保DOM完全加载（缩短基础延迟）
    setTimeout(() => {
        try {
            // 标记初始化开始
            initializationStarted = true;
            currentInitPhase = 'pre-check';
            
            // 更新加载进度
            LoadingManager.updateProgress(10, "初始化前置检查...");
            
            // 首先隐藏所有页面，防止显示错误页面
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.style.display = 'none';
            });
            
            // 更新加载进度
            LoadingManager.updateProgress(15, "检查缓存数据...");
            
            // 快速检查是否有缓存数据（优化：先验证缓存有效性）
            const hasValidCache = CacheManager && CacheManager.checkForCache() && CacheManager.validateCacheIntegrity();
            console.log(`缓存检查结果: ${hasValidCache ? '有有效缓存' : '无缓存或缓存损坏'}`);
            
            LoadingManager.updateProgress(20, hasValidCache ? "发现有效缓存，准备恢复游戏..." : "无缓存，准备初始化新游戏...");
            
            if (hasValidCache) {
                console.log("检测到有效缓存数据，尝试直接加载游戏");
                
                // 优化：分阶段加载缓存，每阶段增加进度
                loadGameFromCacheWithProgress();
            } else {
                console.log("未检测到有效缓存数据，显示开始界面");
                initializeGameSystemsWithProgress();
            }
            
        } catch (error) {
            console.error("初始化过程中出现致命错误:", error);
            ErrorHandler.handleInitializationError(error);
            LoadingManager.hideLoadingScreen();
        }
    }, 200); // 从500ms缩短到200ms
});

// 新增：检测设备并优化设置
function detectDeviceAndOptimize() {
    try {
        if (typeof DeviceDetector !== 'undefined') {
            DeviceDetector.init();
            const deviceInfo = DeviceDetector.getDeviceInfo();
            
            // 移动端或低端设备禁用高级监控
            if (deviceInfo.isMobile || deviceInfo.screenSize.width < 1024) {
                console.log("检测到移动端或低端设备，禁用高级监控以提升性能");
                enableAdvancedMonitoring = false;
            }
            
            // 根据设备性能调整超时时间
            if (deviceInfo.isMobile) {
                // 移动端给予更长时间
                console.log("移动端设备，调整超时设置...");
            }
        }
    } catch (error) {
        console.warn("设备检测失败:", error);
    }
}

// 新增：带进度反馈的缓存加载
function loadGameFromCacheWithProgress() {
    currentInitPhase = 'cache-loading';
    
    // 使用Promise包装缓存加载，支持超时
    const cacheLoadPromise = new Promise((resolve, reject) => {
        const cacheTimeout = setTimeout(() => {
            reject(new Error("缓存加载超时（12秒）"));
        }, 12000); // 12秒缓存加载超时
        
        try {
            LoadingManager.updateProgress(25, "正在初始化事件系统...");
            
            // 初始化事件系统
            const eventSystem = new EventSystem();
            window.eventSystem = eventSystem;
            
            LoadingManager.updateProgress(35, "正在恢复游戏状态...");
            
            // 初始化状态系统（会自动加载缓存）
            const stateSystem = new StateSystem(eventSystem);
            window.stateSystem = stateSystem;
            
            // 重置冷却时间 - 修复新存档冷却问题
            CacheManager.resetAllCooldowns();
            
            LoadingManager.updateProgress(50, "正在初始化活动系统...");
            
            // 初始化活动系统
            const activitySystem = new ActivitySystem(stateSystem, eventSystem);
            window.activitySystem = activitySystem;
            
            LoadingManager.updateProgress(65, "正在初始化进化系统...");
            
            // 初始化进化系统
            const evolutionSystem = new EvolutionSystem(stateSystem, eventSystem);
            window.evolutionSystem = evolutionSystem;
            
            LoadingManager.updateProgress(80, "正在初始化进化路线系统...");
            
            // 初始化进化路线系统
            const evolutionRouteSystem = new EvolutionRouteSystem(stateSystem, eventSystem, evolutionSystem);
            window.evolutionRouteSystem = evolutionRouteSystem;
            
            LoadingManager.updateProgress(90, "正在设置活动监听器...");
            
            // 分阶段延迟设置监听器，避免阻塞
            setTimeout(() => {
                if (typeof ActivityListeners !== 'undefined') {
                    ActivityListeners.setupActivityListeners(activitySystem);
                }
            }, 100);
            
            setTimeout(() => {
                if (typeof PageConsole !== 'undefined') {
                    PageConsole.initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
                }
            }, 300);
            
            // 延迟显示进行中页面
            setTimeout(() => {
                clearTimeout(cacheTimeout);
                resolve();
            }, 500);
            
        } catch (cacheError) {
            clearTimeout(cacheTimeout);
            reject(cacheError);
        }
    });
    
    cacheLoadPromise.then(() => {
        LoadingManager.updateProgress(95, "正在完成初始化...");
        setTimeout(() => {
            if (typeof GameInitializer !== 'undefined') {
                GameInitializer.restartGame();
            } else {
                fallbackRestartGame();
            }
            LoadingManager.updateProgress(100, "游戏恢复完成！");
            console.log("游戏从缓存直接加载完成，总耗时:", Date.now() - initStartTime, "ms");
            completeInitialization();
        }, 300);
    }).catch((error) => {
        console.error("缓存加载失败，降级到正常初始化:", error);
        LoadingManager.showErrorState("缓存加载失败，尝试正常启动...");
        setTimeout(() => {
            initializeGameSystemsWithProgress();
        }, 1000);
    });
}

// 新增：带进度反馈的系统初始化
function initializeGameSystemsWithProgress() {
    currentInitPhase = 'system-init';
    
    const initStartTime = Date.now();
    console.log("开始初始化游戏系统...");
    LoadingManager.updateProgress(30, "正在初始化核心系统...");
    
    try {
        // 性能优化：禁用高级监控
        if (!enableAdvancedMonitoring && typeof PerformanceMonitor !== 'undefined') {
            PerformanceMonitor.setEnabled(false);
        }
        
        // 初始化事件系统
        if (typeof EventSystem === 'undefined') {
            throw new Error("EventSystem未定义，检查js文件加载顺序");
        }
        const eventSystem = new EventSystem();
        window.eventSystem = eventSystem;
        console.log("事件系统初始化完成");
        LoadingManager.updateProgress(40, "事件系统初始化完成...");
        
        // 初始化状态系统
        if (typeof StateSystem === 'undefined') {
            throw new Error("StateSystem未定义，检查js文件加载顺序");
        }
        const stateSystem = new StateSystem(eventSystem);
        window.stateSystem = stateSystem;
        console.log("状态系统初始化完成");
        LoadingManager.updateProgress(55, "状态系统初始化完成...");
        
        // 初始化活动系统
        if (typeof ActivitySystem === 'undefined') {
            throw new Error("ActivitySystem未定义，检查js文件加载顺序");
        }
        const activitySystem = new ActivitySystem(stateSystem, eventSystem);
        window.activitySystem = activitySystem;
        console.log("活动系统初始化完成");
        LoadingManager.updateProgress(70, "活动系统初始化完成...");
        
        // 初始化进化系统
        if (typeof EvolutionSystem === 'undefined') {
            throw new Error("EvolutionSystem未定义，检查js文件加载顺序");
        }
        const evolutionSystem = new EvolutionSystem(stateSystem, eventSystem);
        window.evolutionSystem = evolutionSystem;
        console.log("进化系统初始化完成");
        LoadingManager.updateProgress(85, "进化系统初始化完成...");
        
        // 初始化进化路线系统
        if (typeof EvolutionRouteSystem === 'undefined') {
            throw new Error("EvolutionRouteSystem未定义，检查js文件加载顺序");
        }
        const evolutionRouteSystem = new EvolutionRouteSystem(stateSystem, eventSystem, evolutionSystem);
        window.evolutionRouteSystem = evolutionRouteSystem;
        console.log("进化路线系统初始化完成");
        LoadingManager.updateProgress(95, "进化路线系统初始化完成...");
        
        // 优化：延迟设置监听器，确保不阻塞主流程
        setTimeout(() => {
            if (typeof ActivityListeners !== 'undefined') {
                ActivityListeners.setupActivityListeners(activitySystem);
                console.log("活动监听器设置完成");
            }
        }, 50);
        
        setTimeout(() => {
            if (typeof PageConsole !== 'undefined') {
                PageConsole.initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
                console.log("页面和控制台初始化完成");
            }
        }, 150);
        
        console.log("所有系统初始化完成，耗时:", Date.now() - initStartTime, "ms");
        LoadingManager.updateProgress(100, "初始化完成！");
        
        // 延迟显示开始页面，确保所有UI就绪
        setTimeout(() => {
            showPage('start');
            console.log("开始页面已显示，总初始化耗时:", Date.now() - initStartTime, "ms");
            completeInitialization();
        }, 300);
        
    } catch (error) {
        console.error("游戏系统初始化失败:", error);
        ErrorHandler.handleSystemInitializationError(error);
        throw error;
    }
}

// 新增：强制完成初始化（超时但可继续的情况）
function forceCompleteInitialization() {
    console.warn("强制完成初始化，启用降级模式...");
    
    // 确保至少显示开始页面
    const startPage = document.getElementById('start');
    if (startPage) {
        startPage.style.display = 'flex';
    }
    
    // 清理可能存在的定时器
    if (window.stateSystem) {
        window.stateSystem.cleanup();
    }
    if (window.evolutionSystem) {
        window.evolutionSystem.cleanup();
    }
    
    // 尝试基本的功能恢复
    showPage('start');
    LoadingManager.hideLoadingScreen();
    
    // 显示提示
    setTimeout(() => {
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("系统在初始化时遇到超时，已启用降级模式");
        }
    }, 1000);
    
    completeInitialization();
}

// 新增：初始化完成后的清理工作
function completeInitialization() {
    console.log("初始化完成，执行清理...");
    
    // 清除超时定时器
    if (initializationTimeout) {
        clearTimeout(initializationTimeout);
        initializationTimeout = null;
    }
    
    // 延迟隐藏loading，让用户看到完成状态
    setTimeout(() => {
        LoadingManager.hideLoadingScreen();
        
        // 恢复高级监控（如果之前禁用）
        if (enableAdvancedMonitoring && typeof PerformanceMonitor !== 'undefined' && !PerformanceMonitor.config.enabled) {
            PerformanceMonitor.setEnabled(true);
        }
        
        // 触发初始化完成事件
        window.dispatchEvent(new CustomEvent('gameInitialized'));
        
        console.log("=== 游戏初始化全流程完成，总耗时:", Date.now() - initStartTime, "ms", "===");
    }, 600);
}

// 降级启动方案
function fallbackStartup() {
    console.warn("使用降级启动方案...");
    
    setTimeout(() => {
        // 显示基础开始页面
        const startPage = document.getElementById('start');
        if (startPage) {
            startPage.style.display = 'flex';
        } else {
            // 创建极简开始页面
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial;">
                    <div style="text-align: center;">
                        <h1>进化模拟器</h1>
                        <p>检测到系统加载失败</p>
                        <button onclick="location.reload()" style="padding: 10px 20px;">重新加载</button>
                    </div>
                </div>
            `;
        }
        
        // 隐藏任何可能存在的loading界面
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.hideLoadingScreenImmediately();
        }
        
        alert("系统加载失败，将使用降级模式。请刷新页面尝试完整功能。");
    }, 1000);
}

// 全局函数 - 显示指定页面（增强版）
function showPage(pageId) {
    console.log("全局showPage被调用:", pageId, "当前时间:", new Date().toLocaleTimeString());
    
    // 验证页面元素存在
    const targetPage = document.getElementById(pageId);
    if (!targetPage) {
        console.error("页面未找到:", pageId, "可用页面:", Array.from(document.querySelectorAll('.page')).map(p => p.id));
        
        // 降级处理：如果目标页面不存在，显示start或ongoing
        const fallbackPage = document.getElementById('start') || document.getElementById('ongoing');
        if (fallbackPage) {
            fallbackPage.style.display = 'flex';
        }
        return;
    }
    
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // 显示目标页面
    targetPage.style.display = 'flex';
    console.log("成功显示页面:", pageId);
    
    // 触发页面显示事件
    if (typeof PageConsole !== 'undefined') {
        PageConsole.onPageShow(pageId);
    }
    
    // 更新按钮状态
    if (window.stateSystem) {
        setTimeout(() => {
            window.stateSystem.setButtonStates();
        }, 50);
    }
}

// 降级重启游戏（用于缓存恢复）
function fallbackRestartGame() {
    console.log("使用降级重启游戏方案");
    
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
        window.evolutionSystem.addKeyEvent("从缓存恢复游戏进度（降级模式）");
    }
}

// 全局错误处理（增强版）
window.addEventListener('error', function(e) {
    console.error("全局错误捕获:", e.error || e.message, "文件:", e.filename, "行号:", e.lineno);
    ErrorHandler.handleGlobalError(e);
    
    // 确保在发生错误时也隐藏loading
    if (LoadingManager && LoadingManager.isLoading) {
        setTimeout(() => {
            LoadingManager.hideLoadingScreen();
        }, 1500);
    }
});

// 页面卸载前的清理（增强版）
window.addEventListener('beforeunload', function() {
    console.log("页面卸载，执行清理...");
    
    // 清理资源
    if (typeof PerformanceMonitor !== 'undefined') {
        PerformanceMonitor.cleanup();
    }
    
    if (typeof StateSync !== 'undefined') {
        StateSync.stopSync();
    }
    
    // 自动保存
    if (typeof CacheManager !== 'undefined') {
        CacheManager.autoSave();
    }
});

// 设置全局函数
window.showPage = showPage;
window.consoleUnlocked = consoleUnlocked;
window.themeClickCount = themeClickCount;
window.themeClickTimer = themeClickTimer;
window.initializeGameSystems = GameInitializer ? GameInitializer.initializeAllSystems : null;

// 导出全局解锁控制台函数
function unlockConsole() {
    consoleUnlocked = true;
    console.log("控制台已解锁（全局函数）");
    
    // 添加解锁提示
    if (window.evolutionSystem) {
        window.evolutionSystem.addKeyEvent("开发者控制台已解锁");
    }
    
    // 显示解锁提示
    setTimeout(() => {
        alert("控制台已解锁！\n\n桌面端：鼠标悬停在主题按钮上显示控制台选项\n移动端：长按主题按钮3秒显示存档菜单，点击标题打开控制台");
    }, 100);
}

window.unlockConsole = unlockConsole;

console.log("主入口文件（修复版）加载完成");

// 添加性能监控：记录脚本加载时间
const loadCompleteTime = performance.now();
console.log(`所有脚本加载完成，耗时: ${(loadCompleteTime - performance.timeOrigin).toFixed(2)}ms`);