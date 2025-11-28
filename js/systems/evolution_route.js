// 进化路线系统类
class EvolutionRouteSystem extends CoreSystem {
    constructor(stateSystem, eventSystem, evolutionSystem) {
        super();
        this.stateSystem = stateSystem;
        this.eventSystem = eventSystem;
        this.evolutionSystem = evolutionSystem;
        this.gameStarted = false;
        this.hasThought = false; // 记录是否进行过思考
        
        // 确保全局可用
        window.evolutionRouteSystem = this;
        
        this.init();
    }
    
    init() {
        console.log("初始化进化路线系统");
        this.createStartPage();
        this.setupEventListeners();
        
        // 不再默认显示开始页面，由main.js根据缓存情况决定
        console.log("进化路线系统初始化完成，等待主程序决定显示哪个页面");
    }
    
    createStartPage() {
        // 检查是否已存在开始页面
        if (document.getElementById('start')) {
            return; // 如果已存在，不再创建
        }
        
        // 创建开始页面
        const startPage = document.createElement('div');
        startPage.id = 'start';
        startPage.className = 'page start-page';
        startPage.innerHTML = `
            <div class="start-container">
                <div class="left-start-panel"></div>
                <div class="center-start-panel">
                    <h1>进化模拟器</h1>
                    <p>开始你的进化之旅</p>
                    <button id="start-journey" class="start-btn">开始旅程</button>
                </div>
                <div class="right-start-panel"></div>
            </div>
        `;
        
        document.body.appendChild(startPage);
        console.log("开始页面创建完成");
    }
    
    setupEventListeners() {
        // 延迟绑定事件，确保按钮存在
        setTimeout(() => {
            const startButton = document.getElementById('start-journey');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    console.log("开始游戏按钮被点击");
                    this.startGame();
                });
            } else {
                console.error("开始按钮未找到");
            }
        }, 100);
    }
    
    startGame() {
        console.log("开始游戏");
        this.gameStarted = true;
        
        // 确保状态系统有安全的初始值
        this.stateSystem.hunger = 0;
        this.stateSystem.mentalHealth = 0; // 初始没有心理健康值
        this.stateSystem.disease = 0;
        this.stateSystem.foodStorage = 20;
        
        // 初始化1-50级状态：没有智慧和心理健康值
        this.stateSystem.intelligence = 0;
        
        // 隐藏开始页面，显示进行中页面
        this.showPage('ongoing');
        
        // 初始只显示基本按钮
        this.updateAvailableButtons();
        
        // 更新UI
        this.stateSystem.updateUI();
        
        // 更新属性显示状态
        this.updateAttributeDisplay(0);
        
        // 添加开始事件
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("旅程开始！初始阶段只有基本生存能力");
        }
        
        console.log("游戏开始完成");
    }
    
    // 直接从缓存加载游戏
    loadFromCache() {
        console.log("从缓存加载游戏状态");
        this.gameStarted = true;
        
        // 更新可用按钮
        this.updateAvailableButtons();
        
        // 更新属性显示状态
        this.updateAttributeDisplay(this.evolutionSystem.getEvolutionLevel());
        
        // 添加加载提示
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("游戏进度已从缓存恢复");
        }
        
        console.log("从缓存加载完成");
    }
    
    updateAvailableButtons() {
        const evolutionLevel = this.evolutionSystem.getEvolutionLevel();
        console.log("更新可用按钮，当前等级:", evolutionLevel, "力量:", this.stateSystem.strength, "智慧:", this.stateSystem.intelligence);
        
        // 定义按钮显示规则
        const buttons = {
            'get-evolution-points': true,
            'hunt-btn': true,
            'rest-btn': true,
            'dormancy-btn': true,
            'explore-btn': evolutionLevel >= 6,
            // 锻炼按钮：力量达到20后显示
            'exercise-btn': this.stateSystem.strength >= 20,
            // 思考按钮：智慧达到45后显示
            'think-btn': this.stateSystem.intelligence >= 45,
            // 以下按钮在思考后且51级后才显示
            'interact-btn': evolutionLevel >= 51 && this.hasThought,
            'tool-btn': evolutionLevel >= 51 && this.hasThought,
            'social-btn': evolutionLevel >= 51 && this.hasThought
        };
        
        // 更新按钮显示状态
        for (const [buttonId, shouldShow] of Object.entries(buttons)) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = shouldShow ? 'block' : 'none';
                console.log(`按钮 ${buttonId}: ${shouldShow ? '显示' : '隐藏'}`);
            } else {
                console.warn(`按钮未找到: ${buttonId}`);
            }
        }
        
        // 更新属性显示状态
        this.updateAttributeDisplay(evolutionLevel);
    }
    
    updateAttributeDisplay(evolutionLevel) {
        console.log("更新属性显示，当前等级:", evolutionLevel);
        
        const intelligenceItem = document.getElementById('intelligence-item');
        const mentalHealthItem = document.getElementById('mental-health-item');
        
        if (evolutionLevel <= 50) {
            // 1-50级隐藏智慧和心理健康
            if (intelligenceItem) {
                intelligenceItem.style.display = 'none';
                console.log("隐藏智慧属性");
            }
            if (mentalHealthItem) {
                mentalHealthItem.style.display = 'none';
                console.log("隐藏心理健康属性");
            }
            
            // 确保1-50级没有智慧值
            this.stateSystem.intelligence = 0;
        } else {
            // 51级及以上显示智慧
            if (intelligenceItem) {
                intelligenceItem.style.display = 'block';
                console.log("显示智慧属性");
            }
            
            // 心理健康值在思考后显示
            if (mentalHealthItem) {
                mentalHealthItem.style.display = this.hasThought ? 'block' : 'none';
                console.log(`心理健康属性: ${this.hasThought ? '显示' : '隐藏'}`);
            }
            
            // 51级时解锁智慧
            if (evolutionLevel === 51) {
                this.stateSystem.intelligence = 1.0;
                console.log("解锁智慧，设置为1.0");
            }
        }
        
        // 更新UI显示
        this.stateSystem.updateUI();
    }
    
    // 当进行思考时调用
    onThink() {
        this.hasThought = true;
        console.log("完成思考，解锁心理健康值和高级互动");
        
        // 解锁心理健康值
        this.stateSystem.mentalHealth = 50;
        
        // 更新按钮显示
        this.updateAvailableButtons();
        
        // 更新属性显示
        this.updateAttributeDisplay(this.evolutionSystem.getEvolutionLevel());
        
        if (window.evolutionSystem) {
            window.evolutionSystem.addKeyEvent("通过思考，意识到了自我存在和心理健康的重要性");
        }
    }
    
    onEvolution() {
        const evolutionLevel = this.evolutionSystem.getEvolutionLevel();
        console.log("进化事件触发，新等级:", evolutionLevel);
        
        // 更新可用按钮
        this.updateAvailableButtons();
        
        // 特殊事件
        if (evolutionLevel === 6) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("解锁新能力：探索远处");
            }
        } else if (evolutionLevel === 51) {
            if (window.evolutionSystem) {
                window.evolutionSystem.addKeyEvent("觉醒智慧！现在可以感受到心理健康状态，并解锁了新的能力");
                // 解锁智慧
                this.stateSystem.intelligence = 1.0;
            }
        }
        
        // 更新UI
        this.stateSystem.updateUI();
    }
    
    showPage(pageId) {
        console.log("显示页面:", pageId);
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
}
