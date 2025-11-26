// 主程序 - 初始化所有系统
document.addEventListener('DOMContentLoaded', function() {
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
    
    // 设置活动按钮事件监听器
    setupActivityListeners(activitySystem);
    
    // 初始化页面切换和控制台
    initPageAndConsole(evolutionSystem, stateSystem);
});

// 设置活动按钮事件监听器
function setupActivityListeners(activitySystem) {
    document.getElementById('hunt-btn').addEventListener('click', () => {
        activitySystem.hunt();
    });
    
    document.getElementById('rest-btn').addEventListener('click', () => {
        activitySystem.rest();
    });
    
    document.getElementById('dormancy-btn').addEventListener('click', () => {
        activitySystem.dormancy();
    });
    
    document.getElementById('explore-btn').addEventListener('click', () => {
        activitySystem.explore();
    });
}

// 初始化页面切换和控制台
function initPageAndConsole(evolutionSystem, stateSystem) {
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
    
    // 初始显示进行中页面
    showPage('ongoing');
    
    // 显示死亡页面
    showDeathBtn.addEventListener('click', function() {
        showPage('death');
    });
    
    // 显示进行中页面
    showOngoingBtn.addEventListener('click', function() {
        showPage('ongoing');
    });
    
    // 显示终点页面
    showTheEndBtn.addEventListener('click', function() {
        showPage('theEnd');
    });
    
    // 关闭控制台
    closeConsoleBtn.addEventListener('click', function() {
        consoleElement.style.display = 'none';
    });
    
    // 设置进化点数
    setPointsBtn.addEventListener('click', function() {
        const points = parseFloat(setPointsInput.value);
        if (!isNaN(points) && points >= 0) {
            evolutionSystem.setEvolutionPoints(points);
            setPointsInput.value = '';
        }
    });
    
    // 设置等级
    setLevelBtn.addEventListener('click', function() {
        const level = parseInt(setLevelInput.value);
        if (!isNaN(level) && level >= 0 && level <= 100) {
            evolutionSystem.setEvolutionLevel(level);
            setLevelInput.value = '';
        }
    });
    
    // 主题切换
    themeToggle.addEventListener('click', function() {
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
    });
    
    // 控制台拖拽功能
    makeConsoleDraggable(consoleElement);
    
    // 控制台触发机制 - 10秒内点击进化点数进度条10次
    let clickCount = 0;
    let clickTimer = null;
    
    evolutionPointsProgress.addEventListener('click', function() {
        clickCount++;
        
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
        
        clickTimer = setTimeout(function() {
            clickCount = 0;
        }, 10000);
        
        if (clickCount >= 10) {
            consoleElement.style.display = 'block';
            clickCount = 0;
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
        }
    });
}

// 全局函数 - 显示指定页面
function showPage(pageId) {
    const deathPage = document.getElementById('death');
    const ongoingPage = document.getElementById('ongoing');
    const theEndPage = document.getElementById('theEnd');
    
    deathPage.style.display = 'none';
    ongoingPage.style.display = 'none';
    theEndPage.style.display = 'none';
    
    switch(pageId) {
        case 'death':
            deathPage.style.display = 'flex';
            break;
        case 'ongoing':
            ongoingPage.style.display = 'flex';
            break;
        case 'theEnd':
            theEndPage.style.display = 'flex';
            break;
    }
}

// 使控制台可拖拽的函数
function makeConsoleDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.console-header');
    
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