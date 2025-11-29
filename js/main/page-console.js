// 页面和控制台模块 - 折中方案版本
const PageConsole = {
    currentArea: 'sea',
    
    consoleUnlockData: {
        clickCount: 0,
        resetTimer: null,
        isUnlocked: false,
        lastClickTime: 0
    },
    
    initPageAndConsole: function(evolutionSystem, stateSystem, eventSystem) {
        console.log("初始化页面和控制台");
        
        try {
            this.setupPageSwitching();
            this.setupConsole(evolutionSystem, stateSystem, eventSystem);
            this.setupThemeToggle(); // 只处理主题切换
            this.createConsoleButton(); // 创建控制台按钮（初始隐藏）
            this.setupTimeControl(stateSystem);
            console.log("页面和控制台初始化完成");
        } catch (error) {
            console.error("页面和控制台初始化失败:", error);
        }
    },
    
    setupPageSwitching: function() {
        const showDeathBtn = document.getElementById('show-death');
        const showOngoingBtn = document.getElementById('show-ongoing');
        const showTheEndBtn = document.getElementById('show-theEnd');
        
        if (showDeathBtn) {
            showDeathBtn.addEventListener('click', () => showPage('death'));
        }
        if (showOngoingBtn) {
            showOngoingBtn.addEventListener('click', () => showPage('ongoing'));
        }
        if (showTheEndBtn) {
            showTheEndBtn.addEventListener('click', () => showPage('theEnd'));
        }
    },
    
    setupConsole: function(evolutionSystem, stateSystem, eventSystem) {
        const consoleElement = document.getElementById('de_console');
        const closeConsoleBtn = document.getElementById('close-console');
        
        if (closeConsoleBtn && consoleElement) {
            closeConsoleBtn.addEventListener('click', () => {
                consoleElement.style.display = 'none';
                console.log("控制台已关闭");
            });
        }
        
        if (consoleElement) {
            this.makeConsoleDraggable(consoleElement);
        }
        
        if (typeof ConsoleFeatures !== 'undefined') {
            ConsoleFeatures.initEventSelection(eventSystem);
            ConsoleFeatures.setupConsoleInputs(evolutionSystem, stateSystem);
            ConsoleFeatures.setupEventControls();
        }
    },
    
    setupThemeToggle: function() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        this.initTheme();
        
        // 绑定主题按钮点击（包含解锁逻辑）
        themeToggle.addEventListener('click', this.handleThemeClick.bind(this));
        
        console.log("主题按钮初始化完成");
    },
    
    // 处理主题点击（包含解锁计数）
    handleThemeClick: function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 切换主题
        this.toggleTheme();
        
        // 如果已解锁，不再计数
        if (this.consoleUnlockData.isUnlocked) return;
        
        // 记录本次点击时间
        const now = Date.now();
        
        // 如果超过5秒，重置计数
        if (now - this.consoleUnlockData.lastClickTime > 5000) {
            this.consoleUnlockData.clickCount = 0;
            console.log("超时重置计数器");
        }
        
        // 更新计数
        this.consoleUnlockData.clickCount++;
        this.consoleUnlockData.lastClickTime = now;
        
        console.log(`主题点击 (${this.consoleUnlockData.clickCount}/10)`);
        
        // 清除并重新设置5秒定时器
        if (this.consoleUnlockData.resetTimer) {
            clearTimeout(this.consoleUnlockData.resetTimer);
        }
        
        this.consoleUnlockData.resetTimer = setTimeout(() => {
            this.consoleUnlockData.clickCount = 0;
            console.log("5秒超时，计数重置为0");
        }, 5000);
        
        // 检查是否解锁
        if (this.consoleUnlockData.clickCount >= 10) {
            console.log("达到10次，解锁控制台！");
            this.unlockConsole();
        }
    },
    
    // 创建控制台按钮（初始隐藏）
    createConsoleButton: function() {
        const header = document.querySelector('.header');
        if (!header) {
            setTimeout(() => this.createConsoleButton(), 500);
            return;
        }
        
        // 检查是否已存在
        if (document.getElementById('console-btn')) return;
        
        const consoleBtn = document.createElement('button');
        consoleBtn.id = 'console-btn';
        consoleBtn.innerHTML = '🔧';
        consoleBtn.title = '开发者控制台';
        consoleBtn.style.cssText = `
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            margin-left: 100px; /* 放在标题右侧 */
            background: var(--button-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 16px;
            display: none; /* 初始隐藏 */
            transition: all 0.3s;
            z-index: 100;
        `;
        
        // 点击事件
        consoleBtn.addEventListener('click', () => {
            const consoleElement = document.getElementById('de_console');
            if (consoleElement) {
                consoleElement.style.display = 'block';
                consoleElement.style.zIndex = '10000';
            }
        });
        
        // 悬停效果
        consoleBtn.addEventListener('mouseenter', () => {
            consoleBtn.style.backgroundColor = 'var(--button-hover)';
            consoleBtn.style.transform = 'translateX(-50%) scale(1.1)';
        });
        
        consoleBtn.addEventListener('mouseleave', () => {
            consoleBtn.style.backgroundColor = 'var(--button-bg)';
            consoleBtn.style.transform = 'translateX(-50%) scale(1)';
        });
        
        header.appendChild(consoleBtn);
        console.log("控制台按钮已创建（初始隐藏）");
    },
    
    // 解锁控制台
    unlockConsole: function() {
        this.consoleUnlockData.isUnlocked = true;
        localStorage.setItem('console_unlocked', 'true');
        
        // 清除定时器
        if (this.consoleUnlockData.resetTimer) {
            clearTimeout(this.consoleUnlockData.resetTimer);
            this.consoleUnlockData.resetTimer = null;
        }
        
        console.log("=== 控制台解锁成功！===");
        
        // 显示控制台按钮
        const consoleBtn = document.getElementById('console-btn');
        if (consoleBtn) {
            consoleBtn.style.display = 'block';
            // 添加显示动画
            setTimeout(() => {
                consoleBtn.style.opacity = '0';
                consoleBtn.style.transform = 'translateX(-50%) scale(0.8)';
                setTimeout(() => {
                    consoleBtn.style.transition = 'all 0.3s ease';
                    consoleBtn.style.opacity = '1';
                    consoleBtn.style.transform = 'translateX(-50%) scale(1)';
                }, 10);
            }, 0);
        }
        
        // 提示
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("🎉 开发者控制台已解锁！");
        }
        
        setTimeout(() => {
            alert("控制台已解锁！按钮已显示在标题右侧");
        }, 100);
    },
    
    toggleTheme: function() {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (!themeToggle) return;
        
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
        
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: body.classList.contains('dark-theme') ? 'dark' : 'light' }
        }));
    },
    
    initTheme: function() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const themeToggle = document.getElementById('theme-toggle');
        
        if (!themeToggle) return;
        
        if (savedTheme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            themeToggle.textContent = '🌙';
        }
    },
    
    setupTimeControl: function(stateSystem) {
        const pauseTimeBtn = document.getElementById('pause-time');
        if (pauseTimeBtn) {
            let timePaused = false;
            
            pauseTimeBtn.addEventListener('click', () => {
                timePaused = !timePaused;
                stateSystem.setTimePaused(timePaused);
                pauseTimeBtn.textContent = timePaused ? '恢复时间' : '暂停时间';
                
                if (window.evolutionSystem) {
                    window.evolutionSystem.addKeyEvent(timePaused ? "时间已暂停" : "时间已恢复");
                }
            });
        }
    },
    
    makeConsoleDraggable: function(element) {
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
    },
    
    onPageShow: function(pageId) {
        console.log(`页面显示: ${pageId}`);
        switch(pageId) {
            case 'ongoing':
                if (window.stateSystem) {
                    window.stateSystem.setButtonStates();
                }
                break;
        }
    }
};

// 导出到全局
window.PageConsole = PageConsole;
console.log("页面和控制台模块加载完成");

// 初始化主题
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.PageConsole) {
            window.PageConsole.initTheme();
        }
    }, 100);
});