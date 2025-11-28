// 主程序 - 初始化所有系统
document。addEventListener('DOMContentLoaded'， function() {
    console.log("DOM加载完成，开始初始化系统");
    
    try {
        // 首先隐藏所有页面，防止显示错误页面
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });
        
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
        
        // 初始化进化路线系统（最后初始化，它会控制页面显示）
        const evolutionRouteSystem = new EvolutionRouteSystem(stateSystem, eventSystem, evolutionSystem);
        window.evolutionRouteSystem = evolutionRouteSystem;
        
        // 设置活动按钮事件监听器
        setupActivityListeners(activitySystem);
        
        // 初始化页面切换和控制台
        initPageAndConsole(evolutionSystem, stateSystem, eventSystem);
        
        console.log("所有系统初始化完成");
        
    } catch (error) {
        console.error("初始化过程中出现错误:", error);
        // 如果出现错误，至少显示开始页面
        const startPage = document.getElementById('start');
        if (startPage) {
            startPage.style.display = 'flex';
        }
    }
});

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
    
    // 控制台解锁机制 - 10秒内点击主题切换按钮10次
    let themeClickCount = 0;
    let themeClickTimer = null;
    
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
    
    // 初始化事件选择界面
    initEventSelection();
    
    // 主题切换按钮事件监听 - 添加控制台解锁功能
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            // 执行主题切换功能
            const body = document.body;
            if (body.classList.contains('light-theme')) {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                themeToggle.textContent = '☀️';
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
                themeToggle.textContent = '🌙';
            }
            
            // 控制台解锁计数逻辑
            themeClickCount++;
            
            // 清除之前的计时器
            if (themeClickTimer) {
                clearTimeout(themeClickTimer);
            }
            
            // 设置新的计时器，10秒后重置计数
            themeClickTimer = setTimeout(function() {
                themeClickCount = 0;
                console.log("控制台解锁计数已重置");
            }, 10000);
            
            // 检查是否达到解锁条件
            if (themeClickCount >= 10) {
                if (consoleElement) {
                    consoleElement.style.display = 'block';
                }
                themeClickCount = 0;
                if (themeClickTimer) {
                    clearTimeout(themeClickTimer);
                }
                
                // 添加解锁提示
                if (window.evolutionSystem) {
                    window.evolutionSystem.addKeyEvent("开发者控制台已解锁");
                }
                
                console.log("控制台已解锁");
            }
            
            console.log(`主题按钮点击次数: ${themeClickCount}`);
        });
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


