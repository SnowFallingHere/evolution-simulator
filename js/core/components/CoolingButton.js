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
