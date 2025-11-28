// 主程序 - 初始化所有系统

// 控制台解锁机制 - 全局变量
let themeClickCount = 0;
let themeClickTimer = null;
let dropdownTimer = null; // 新增：下拉菜单显示计时器

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成，开始初始化系统");
    
    // 创建增强的加载界面
    createEnhancedLoadingScreen();
    
    // 延迟初始化，确保DOM完全加载
    setTimeout(() => {
        try {
            // 首先隐藏所有页面，防止显示错误页面
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.style.display = 'none';
            });
            
            // 检查是否有缓存数据
            const hasCache = checkForCache();
            
            if (hasCache) {
                console.log("检测到缓存数据，直接加载游戏");
                loadGameDirectly();
            } else {
                console.log("未检测到缓存数据，显示开始界面");
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
                
                // 设置活动按钮事件监听器
                setupActivityListeners(activitySystem);
                
                // 初始化页面切换和控制台
                initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
                
                console.log("所有系统初始化完成");
                
                // 显示开始页面
                showPage('start');
            }
            
        } catch (error) {
            console.error("初始化过程中出现错误:", error);
            // 如果出现错误，显示开始页面
            showPage('start');
        } finally {
            // 隐藏加载界面
            hideLoadingScreen();
        }
    }, 500); // 增加延迟确保DOM完全加载
});

// 创建增强的加载界面
function createEnhancedLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--bg-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    loadingScreen.innerHTML = `
        <div class="loading-container" style="text-align: center; margin-bottom: 100px;">
            <div class="loading-spinner" style="
                width: 60px;
                height: 60px;
                border: 6px solid var(--border-color);
                border-top: 6px solid var(--progress-fill);
                border-radius: 50%;
                animation: spin 1.5s linear infinite;
                margin: 0 auto 30px;
            "></div>
            <div class="loading-text" style="
                color: var(--text-color);
                font-size: 18px;
                margin-bottom: 10px;
            ">正在初始化系统</div>
        </div>
        <div class="loading-footer" style="
            position: absolute;
            bottom: 40px;
            right: 40px;
            color: var(--text-color);
            font-size: 14px;
            opacity: 0.8;
        ">
            <span id="loading-dots">正在加载模拟器系统中...</span>
        </div>
    `;
    
    // 添加动画关键帧
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 确保加载界面覆盖所有内容 */
        #loading-screen {
            background-color: var(--bg-color) !important;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingScreen);
    
    // 启动动态点动画
    startLoadingDotsAnimation();
    
    console.log("增强加载界面创建完成");
}

// 启动加载点动画
function startLoadingDotsAnimation() {
    const dotsElement = document.getElementById('loading-dots');
    if (!dotsElement) return;
    
    let dotCount = 0;
    const maxDots = 3;
    const baseText = "正在加载模拟器系统中";
    
    const dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % (maxDots + 1);
        const dots = '.'.repeat(dotCount);
        dotsElement.textContent = baseText + dots;
    }, 500);
    
    // 保存interval以便清理
    window.loadingDotsInterval = dotsInterval;
}

// 隐藏加载界面
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // 先停止点动画
        if (window.loadingDotsInterval) {
            clearInterval(window.loadingDotsInterval);
        }
        
        // 添加淡出动画
        loadingScreen.style.transition = 'opacity 0.5s ease';
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// 检查是否有缓存数据
function checkForCache() {
    try {
        // 检查状态系统的缓存
        const stateCache = localStorage.getItem("evolution_simulator_cache");
        if (stateCache) {
            const parsedData = JSON.parse(stateCache);
            if (parsedData.version === "1.0" && parsedData.stateData) {
                return true;
            }
        }
        
        // 检查自动存档
        const autoSave = localStorage.getItem("evolution_simulator_auto_save");
        if (autoSave) {
            const parsedData = JSON.parse(autoSave);
            if (parsedData.version === "1.0.0") {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error("检查缓存时出错:", error);
        return false;
    }
}

// 直接加载游戏（有缓存时）
function loadGameDirectly() {
    // 更新加载文字
    updateLoadingText("正在恢复游戏进度...");
    
    // 初始化事件系统
    const eventSystem = new EventSystem();
    window.eventSystem = eventSystem;
    
    // 初始化状态系统（会自动加载缓存）
    const stateSystem = new StateSystem(eventSystem);
    window.stateSystem = stateSystem;
    
    // 重置冷却时间 - 修复新存档冷却问题
    resetAllCooldowns();
    
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
    setupActivityListeners(activitySystem);
    
    // 初始化页面切换和控制台
    initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
    
    // 直接显示进行中页面
    showPage('ongoing');
    
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
    
    console.log("游戏从缓存直接加载完成");
}

// 重置所有冷却时间
function resetAllCooldowns() {
    if (!window.stateSystem) return;
    
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
}

// 更新加载文字
function updateLoadingText(text) {
    const dotsElement = document.getElementById('loading-dots');
    if (dotsElement) {
        const baseText = text;
        dotsElement.textContent = baseText;
        
        // 重新启动点动画
        if (window.loadingDotsInterval) {
            clearInterval(window.loadingDotsInterval);
        }
        
        let dotCount = 0;
        const maxDots = 3;
        
        window.loadingDotsInterval = setInterval(() => {
            dotCount = (dotCount + 1) % (maxDots + 1);
            const dots = '.'.repeat(dotCount);
            dotsElement.textContent = baseText + dots;
        }, 500);
    }
}

// 设置活动按钮事件监听器
function setupActivityListeners(activitySystem) {
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
        CoolingBtnRoll.createCoolingButtons(coolingButtonConfigs);
        
        console.log("冷却按钮组件初始化完成");
    }, 1000);
}

// 初始化页面切换和控制台
function initPageAndConsole(evolutionSystem, stateSystem, eventSystem) {
    const deathPage = document.getElementById('death');
    const ongoingPage = document.getElementById('ongoing');
    const theEndPage = document.getElementById('theEnd');
    
    const showDeathBtn = document.getElementById('show-death');
    const showOngoingBtn = document.getElementById('show-ongoing');
    const showTheEndBtn = document.getElementById('show-theEnd');
    
    const consoleElement = document.getElementById('de_console');
    const closeConsoleBtn = document.getElementById('close-console');
    
    const evolutionPointsProgress = document.getElementById('evolution-points-progress');
    
    const setPointsBtn = document.getElementById('set-points');
    const setPointsInput = document.getElementById('set-points-input');
    
    const setLevelBtn = document.getElementById('set-level');
    const setLevelInput = document.getElementById('set-level-input');
    
    const themeToggle = document.getElementById('theme-toggle');
    
    // 事件控制相关元素
    const clearEventsBtn = document.getElementById('clear-events');
    
    // 时间暂停状态
    let timePaused = false;
    
    // 当前选中的区域
    let currentArea = 'sea';
    
    // 初始化事件选择界面
    function initEventSelection() {
        if (!window.eventSystem) return;
        
        // 延迟执行，确保事件系统已加载
        setTimeout(() => {
            updateEventButtonsByArea(currentArea);
            
            console.log(`事件选择界面初始化完成，当前区域: ${currentArea}`);
            
            // 设置选项卡切换
            setupEventTabs();
            setupAreaTabs();
            
        }, 2000);
    }
    
    // 按区域更新事件按钮
    function updateEventButtonsByArea(area) {
        if (!window.eventSystem) return;
        
        const events = window.eventSystem.getEventsByArea(area);
        
        // 按稀有度分类事件
        const commonEvents = events.filter(event => event.rarity === "common");
        const rareEvents = events.filter(event => event.rarity === "rare");
        const epicEvents = events.filter(event => event.rarity === "epic");
        
        // 清空现有事件按钮
        const commonContainer = document.getElementById('common-events');
        const rareContainer = document.getElementById('rare-events');
        const epicContainer = document.getElementById('epic-events');
        
        commonContainer.innerHTML = '';
        rareContainer.innerHTML = '';
        epicContainer.innerHTML = '';
        
        // 填充普通事件选项卡
        commonEvents.forEach(event => {
            const eventBtn = createEventButton(event);
            commonContainer.appendChild(eventBtn);
        });
        
        // 填充稀有事件选项卡
        rareEvents.forEach(event => {
            const eventBtn = createEventButton(event);
            rareContainer.appendChild(eventBtn);
        });
        
        // 填充史诗事件选项卡
        epicEvents.forEach(event => {
            const eventBtn = createEventButton(event);
            epicContainer.appendChild(eventBtn);
        });
        
        console.log(`更新${window.eventSystem.getAreaName(area)}事件: ${commonEvents.length}个普通, ${rareEvents.length}个稀有, ${epicEvents.length}个史诗`);
    }
    
    // 创建事件按钮
    function createEventButton(event) {
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
    }
    
    // 设置事件选项卡切换
    function setupEventTabs() {
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
                document.getElementById(`${targetTab}-events`).classList.add('active');
            });
        });
    }
    
    // 设置区域选项卡切换
    function setupAreaTabs() {
        const areaButtons = document.querySelectorAll('.area-tab-btn');
        
        areaButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetArea = this.getAttribute('data-area');
                
                // 移除所有active类
                areaButtons.forEach(btn => btn.classList.remove('active'));
                
                // 添加active类到当前选项卡
                this.classList.add('active');
                
                // 更新当前区域
                currentArea = targetArea;
                
                // 更新事件系统当前区域
                if (window.eventSystem) {
                    window.eventSystem.setCurrentArea(targetArea);
                }
                
                // 更新事件按钮
                updateEventButtonsByArea(targetArea);
            });
        });
    }
    
    // 创建主题按钮下拉菜单
    function createThemeToggleDropdown() {
        // 检查是否已存在下拉菜单
        if (document.querySelector('.theme-toggle-dropdown')) {
            return;
        }
        
        const dropdown = document.createElement('div');
        dropdown.className = 'theme-toggle-dropdown';
        dropdown.innerHTML = `
            <button class="theme-toggle-dropdown-item" id="console-dropdown-item">
                <span>🔧</span>
                <span>控制台</span>
            </button>
        `;
        
        // 将下拉菜单添加到主题按钮后面
        if (themeToggle && themeToggle.parentNode) {
            themeToggle.parentNode.appendChild(dropdown);
        }
        
        // 绑定控制台选项点击事件
        const consoleItem = document.getElementById('console-dropdown-item');
        if (consoleItem) {
            consoleItem.addEventListener('click', function() {
                if (consoleElement) {
                    consoleElement.style.display = 'block';
                    console.log("通过下拉菜单打开控制台");
                    
                    // 添加解锁提示
                    if (window.evolutionSystem) {
                        window.evolutionSystem.addKeyEvent("开发者控制台已解锁");
                    }
                }
                
                // 隐藏下拉菜单
                hideThemeDropdown();
            });
        }
        
        // 点击页面其他位置隐藏下拉菜单
        document.addEventListener('click', function(e) {
            if (!themeToggle.contains(e.target) && !dropdown.contains(e.target)) {
                hideThemeDropdown();
            }
        });
        
        console.log("主题按钮下拉菜单创建完成");
    }
    
    // 显示主题下拉菜单
    function showThemeDropdown() {
        const dropdown = document.querySelector('.theme-toggle-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
        }
    }
    
    // 隐藏主题下拉菜单
    function hideThemeDropdown() {
        const dropdown = document.querySelector('.theme-toggle-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
    
    // 切换主题下拉菜单显示状态
    function toggleThemeDropdown() {
        const dropdown = document.querySelector('.theme-toggle-dropdown');
        if (dropdown) {
            if (dropdown.classList.contains('show')) {
                hideThemeDropdown();
            } else {
                showThemeDropdown();
            }
        }
    }
    
    // 初始化事件选择界面
    initEventSelection();
    
    // 创建主题按钮下拉菜单
    createThemeToggleDropdown();
    
    // 主题切换按钮事件监听 - 增强版
    if (themeToggle) {
        // 保存原始的事件处理器
        const originalOnClick = themeToggle.onclick;
        
        // 移除所有现有的事件监听器
        const newThemeToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
        
        // 桌面端：鼠标悬停显示下拉菜单
        newThemeToggle.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) { // 桌面端
                showThemeDropdown();
            }
        });
        
        newThemeToggle.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) { // 桌面端
                // 延迟隐藏，避免无法点击菜单项
                if (dropdownTimer) {
                    clearTimeout(dropdownTimer);
                }
                dropdownTimer = setTimeout(() => {
                    hideThemeDropdown();
                }, 300);
            }
        });
        
        // 移动端：长按显示下拉菜单
        let longPressTimer = null;
        let longPressTriggered = false;
        
        newThemeToggle.addEventListener('touchstart', function(e) {
            if (window.innerWidth <= 768) { // 移动端
                e.preventDefault();
                longPressTriggered = false;
                
                longPressTimer = setTimeout(() => {
                    longPressTriggered = true;
                    toggleThemeDropdown();
                    console.log("移动端长按触发，显示下拉菜单");
                }, 800); // 800毫秒长按
            }
        });
        
        newThemeToggle.addEventListener('touchend', function(e) {
            if (window.innerWidth <= 768) { // 移动端
                e.preventDefault();
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                
                // 如果不是长按，执行正常的主题切换和控制台解锁计数
                if (!longPressTriggered) {
                    // 执行主题切换功能
                    const body = document.body;
                    if (body.classList.contains('light-theme')) {
                        body.classList.remove('light-theme');
                        body.classList.add('dark-theme');
                        newThemeToggle.textContent = '☀️';
                    } else {
                        body.classList.remove('dark-theme');
                        body.classList.add('light-theme');
                        newThemeToggle.textContent = '🌙';
                    }
                    
                    // 控制台解锁计数逻辑
                    themeClickCount++;
                    
                    // 清除之前的计时器
                    if (themeClickTimer) {
                        clearTimeout(themeClickTimer);
                    }
                    
                    // 设置新的计时器，10秒后重置计数
                    themeClickTimer = setTimeout(function() {
                        console.log("控制台解锁计数已重置");
                        themeClickCount = 0;
                    }, 10000);
                    
                    // 检查是否达到解锁条件
                    if (themeClickCount >= 10) {
                        if (consoleElement) {
                            consoleElement.style.display = 'block';
                            console.log("控制台已解锁并显示");
                            
                            // 重置计数，但不清除计时器，允许继续计数
                            themeClickCount = 0;
                            
                            // 设置新的计时器，防止立即重复触发
                            if (themeClickTimer) {
                                clearTimeout(themeClickTimer);
                            }
                            themeClickTimer = setTimeout(function() {
                                console.log("控制台解锁保护期结束");
                                themeClickCount = 0;
                            }, 2000); // 2秒保护期，防止误触
                        }
                        
                        // 添加解锁提示
                        if (window.evolutionSystem) {
                            window.evolutionSystem.addKeyEvent("开发者控制台已解锁");
                        }
                    }
                    
                    console.log(`主题按钮点击次数: ${themeClickCount}`);
                }
                
                longPressTriggered = false;
            }
        });
        
        newThemeToggle.addEventListener('touchmove', function(e) {
            if (window.innerWidth <= 768) { // 移动端
                e.preventDefault();
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    longPressTriggered = false;
                }
            }
        });
        
        // 桌面端：点击切换主题
        newThemeToggle.addEventListener('click', function(e) {
            if (window.innerWidth > 768) { // 桌面端
                e.preventDefault();
                
                // 执行主题切换功能
                const body = document.body;
                if (body.classList.contains('light-theme')) {
                    body.classList.remove('light-theme');
                    body.classList.add('dark-theme');
                    newThemeToggle.textContent = '☀️';
                } else {
                    body.classList.remove('dark-theme');
                    body.classList.add('light-theme');
                    newThemeToggle.textContent = '🌙';
                }
                
                // 控制台解锁计数逻辑
                themeClickCount++;
                
                // 清除之前的计时器
                if (themeClickTimer) {
                    clearTimeout(themeClickTimer);
                }
                
                // 设置新的计时器，10秒后重置计数
                themeClickTimer = setTimeout(function() {
                    console.log("控制台解锁计数已重置");
                    themeClickCount = 0;
                }, 10000);
                
                // 检查是否达到解锁条件
                if (themeClickCount >= 10) {
                    if (consoleElement) {
                        consoleElement.style.display = 'block';
                        console.log("控制台已解锁并显示");
                        
                        // 重置计数
                        themeClickCount = 0;
                        
                        // 设置新的计时器，防止立即重复触发
                        if (themeClickTimer) {
                            clearTimeout(themeClickTimer);
                        }
                        themeClickTimer = setTimeout(function() {
                            console.log("控制台解锁保护期结束");
                            themeClickCount = 0;
                        }, 2000);
                    }
                    
                    // 添加解锁提示
                    if (window.evolutionSystem) {
                        window.evolutionSystem.addKeyEvent("开发者控制台已解锁");
                    }
                }
                
                console.log(`主题按钮点击次数: ${themeClickCount}`);
                
                // 执行原始的事件处理器（如果有）
                if (originalOnClick) {
                    originalOnClick.call(this, e);
                }
            }
        });
        
        // 更新全局引用
        window.themeToggle = newThemeToggle;
    }
    
    // 页面切换按钮事件监听
    if (showDeathBtn) {
        showDeathBtn.addEventListener('click', function() {
            showPage('death');
        });
    }
    
    if (showOngoingBtn) {
        showOngoingBtn.addEventListener('click', function() {
            showPage('ongoing');
        });
    }
    
    if (showTheEndBtn) {
        showTheEndBtn.addEventListener('click', function() {
            showPage('theEnd');
        });
    }
    
    // 关闭控制台
    if (closeConsoleBtn) {
        closeConsoleBtn.addEventListener('click', function() {
            if (consoleElement) {
                consoleElement.style.display = 'none';
                console.log("控制台已关闭");
            }
        });
    }
    
    // 设置进化点数
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
    if (setLevelBtn && setLevelInput) {
        setLevelBtn.addEventListener('click', function() {
            const level = parseInt(setLevelInput.value);
            if (!isNaN(level) && level >= 0 && level <= 100) {
                evolutionSystem.setEvolutionLevel(level);
                setLevelInput.value = '';
            }
        });
    }
    
    // 时间暂停/恢复
    const pauseTimeBtn = document.getElementById('pause-time');
    if (pauseTimeBtn) {
        pauseTimeBtn.addEventListener('click', function() {
            timePaused = !timePaused;
            stateSystem.setTimePaused(timePaused);
            pauseTimeBtn.textContent = timePaused ? '恢复时间' : '暂停时间';
            
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent(timePaused ? "时间已暂停" : "时间已恢复");
            }
        });
    }
    
    // 设置属性值
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
    
    // 新增：设置食物储存
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
    
    // 新增：事件控制
    if (clearEventsBtn) {
        clearEventsBtn.addEventListener('click', function() {
            if (window.eventSystem) {
                window.eventSystem.clearAllEvents();
                console.log("已清除所有活跃事件");
            }
        });
    }
    
    // 控制台拖拽功能
    if (consoleElement) {
        makeConsoleDraggable(consoleElement);
    }
    
    // 进化点数进度条点击事件（保留原有功能，但改为在桌面端有效）
    if (evolutionPointsProgress) {
        let clickCount = 0;
        let clickTimer = null;
        
        evolutionPointsProgress.addEventListener('click', function() {
            // 在移动端，点击一次就显示控制台
            if (window.innerWidth <= 768) {
                if (consoleElement) {
                    consoleElement.style.display = 'block';
                }
            } else {
                // 桌面端保持原有逻辑
                clickCount++;
                
                if (clickTimer) {
                    clearTimeout(clickTimer);
                }
                
                clickTimer = setTimeout(function() {
                    clickCount = 0;
                }, 10000);
                
                if (clickCount >= 10) {
                    if (consoleElement) {
                        consoleElement.style.display = 'block';
                    }
                    clickCount = 0;
                    if (clickTimer) {
                        clearTimeout(clickTimer);
                    }
                }
            }
        });
    }
}

// 全局函数 - 显示指定页面
function showPage(pageId) {
    console.log("全局showPage被调用:", pageId);
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'flex';
        console.log("成功显示页面:", pageId);
    } else {
        console.error("页面未找到:", pageId);
    }
}

// 使控制台可拖拽的函数
function makeConsoleDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.console-header');
    
    if (!header) return;
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// 设置全局函数
window.showPage = showPage;

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    console.error('文件名:', e.filename);
    console.error('行号:', e.lineno);
    console.error('列号:', e.colno);
});