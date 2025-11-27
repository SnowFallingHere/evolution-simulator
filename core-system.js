// 核心系统基础类
class CoreSystem {
    constructor() {
        this.timers = [];
    }
    
    // 格式化数字显示
    formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) {
            return "极";
        }
        
        const units = [
            { value: 1e8, symbol: "亿" },
            { value: 1e12, symbol: "兆" },
            { value: 1e16, symbol: "京" },
            { value: 1e20, symbol: "垓" },
            { value: 1e24, symbol: "秭" },
            { value: 1e28, symbol: "穰" },
            { value: 1e32, symbol: "沟" },
            { value: 1e36, symbol: "涧" },
            { value: 1e40, symbol: "正" },
            { value: 1e44, symbol: "载" },
            { value: 1e48, symbol: "极" }
        ];
        
        if (num < 10000) {
            return num.toFixed(0);
        }
        
        let unitIndex = -1;
        for (let i = 0; i < units.length; i++) {
            if (num >= units[i].value) {
                unitIndex = i;
            } else {
                break;
            }
        }
        
        if (unitIndex === -1) {
            return (num / 10000).toFixed(2) + "万";
        }
        
        const unit = units[unitIndex];
        const formattedValue = (num / unit.value).toFixed(2);
        return formattedValue + unit.symbol;
    }
    
    // 获取当前时间
    getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    }
    
    // 添加事件记录
    addEvent(containerId, event, maxCount = 10) {
        const container = document.getElementById(containerId);
        const eventElement = document.createElement('div');
        eventElement.textContent = `${this.getCurrentTime()} - ${event}`;
        container.appendChild(eventElement);
        
        // 限制事件数量
        const events = container.querySelectorAll('div');
        if (events.length > maxCount) {
            for (let i = 0; i < events.length - maxCount; i++) {
                events[i].remove();
            }
        }
        
        container.scrollTop = container.scrollHeight;
    }
    
    // 清理所有计时器
    cleanup() {
        this.timers.forEach(timer => {
            if (timer) clearInterval(timer);
        });
        this.timers = [];
    }
}

// 冷却按钮组件类
class CoolingBtnRoll {
    constructor(buttonId, cooldownKey, maxCooldown, onClickCallback) {
        this.buttonId = buttonId;
        this.cooldownKey = cooldownKey;
        this.maxCooldown = maxCooldown;
        this.onClickCallback = onClickCallback;
        this.button = null;
        this.progressBar = null;
        
        this.init();
    }
    
    init() {
        // 延迟初始化，确保DOM已加载
        setTimeout(() => {
            this.button = document.getElementById(this.buttonId);
            if (!this.button) {
                console.warn(`按钮未找到: ${this.buttonId}`);
                return;
            }
            
            // 创建冷却进度条
            this.createProgressBar();
            
            // 绑定点击事件
            this.button.addEventListener('click', () => {
                this.handleClick();
            });
            
            console.log(`冷却按钮初始化完成: ${this.buttonId}`);
        }, 100);
    }
    
    createProgressBar() {
        // 检查是否已存在进度条
        if (this.button.querySelector('.cooldown-progress')) {
            this.progressBar = this.button.querySelector('.cooldown-progress');
            return;
        }
        
        // 创建新的进度条
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'cooldown-progress';
        this.progressBar.style.width = '0%';
        this.button.appendChild(this.progressBar);
        
        // 添加按钮样式
        this.button.style.position = 'relative';
        this.button.style.overflow = 'hidden';
    }
    
    handleClick() {
        if (!window.stateSystem) {
            console.warn('状态系统未初始化');
            return;
        }
        
        // 检查冷却状态
        if (window.stateSystem.cooldowns[this.cooldownKey] > 0) {
            console.log(`按钮 ${this.buttonId} 正在冷却中`);
            return;
        }
        
        // 检查全局冷却
        if (window.stateSystem.globalCooldown > 0) {
            console.log(`全局冷却中，无法执行 ${this.buttonId}`);
            return;
        }
        
        // 检查活动状态
        if (window.stateSystem.activityState !== 'idle') {
            console.log(`当前状态为 ${window.stateSystem.activityState}，无法执行 ${this.buttonId}`);
            return;
        }
        
        // 执行回调函数
        if (this.onClickCallback && typeof this.onClickCallback === 'function') {
            this.onClickCallback();
        }
        
        // 设置冷却时间
        window.stateSystem.cooldowns[this.cooldownKey] = this.maxCooldown;
        
        // 更新按钮状态
        this.updateButtonState();
    }
    
    updateButtonState() {
        if (!this.button || !this.progressBar) return;
        
        const currentCooldown = window.stateSystem.cooldowns[this.cooldownKey];
        const progressPercent = (1 - currentCooldown / this.maxCooldown) * 100;
        
        this.progressBar.style.width = `${progressPercent}%`;
        
        if (currentCooldown <= 0) {
            this.button.disabled = false;
            this.progressBar.style.width = '0%';
        } else {
            this.button.disabled = true;
        }
    }
    
    // 静态方法：批量创建冷却按钮
    static createCoolingButtons(buttonConfigs) {
        const buttons = [];
        buttonConfigs.forEach(config => {
            const button = new CoolingBtnRoll(
                config.buttonId,
                config.cooldownKey,
                config.maxCooldown,
                config.onClickCallback
            );
            buttons.push(button);
        });
        return buttons;
    }
}
