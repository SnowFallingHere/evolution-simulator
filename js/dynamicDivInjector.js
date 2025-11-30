/**
 * 页面展开按钮管理器
 * 管理书签式展开按钮及其指示器的创建、定位和交互
 * 提供可扩展的API以支持未来的功能增强
 */
class ExpandingButtonManager {
    constructor() {
        // 核心元素引用
        this.buttonElement = null;    // 展开按钮元素
        this.splitLinePosition = 0;   // 分割线位置
        this.angleIndicator = null;   // 角度指示器元素
        this.indicatorRotation = -45; // 默认旋转角度（形成<形状）
        
        // 配置常量
        this.BUTTON_WIDTH = 40;       // 按钮宽度
        this.BUTTON_HEIGHT = 50;      // 按钮高度
        this.INDICATOR_SIZE = 20;     // 指示器大小
        this.RIGHT_OFFSET = 10;       // 右侧偏移量
        
        // 事件监听器引用，便于后续移除
        this.resizeListener = null;
        this.scrollListener = null;
        this.clickListener = null;
    }

    /**
     * 初始化展开按钮系统
     * 设置DOM元素、事件监听器和初始位置
     */
    init() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createButton());
        } else {
            this.createButton();
        }

        // 设置事件监听器
        this.setupEventListeners();
    }

    /**
     * 创建展开按钮及其指示器
     * 设置为书签式按钮，ID为bookmark
     */
    createButton() {
        // 创建按钮元素
        this.buttonElement = document.createElement('div');
        this.buttonElement.className = 'expanding-btn';
        this.buttonElement.id = 'bookmark'; // 设置ID为bookmark
        this.buttonElement.setAttribute('role', 'button'); // 语义化标记
        this.buttonElement.setAttribute('aria-label', '页面展开按钮'); // 可访问性支持
        
        // 将按钮添加到body中
        document.body.appendChild(this.buttonElement);
        
        // 创建角度指示器
        this.createAngleIndicator();
        
        // 计算位置并定位按钮
        this.calculateSplitLinePosition();
        this.positionButton();
        
        // 添加点击事件处理
        this.setupButtonClickHandler();
        
        // 添加一个小延迟后显示元素，确保样式已应用
        setTimeout(() => {
            this.buttonElement.classList.add('visible');
        }, 100);
    }
    
    /**
     * 创建角度指示器元素
     * 形成类似于<的形状
     */
    createAngleIndicator() {
        // 创建角度指示器元素
        this.angleIndicator = document.createElement('div');
        this.angleIndicator.className = 'angle-indicator';
        
        // 应用默认旋转角度，形成<形状
        this.angleIndicator.style.transform = `rotate(${this.indicatorRotation}deg)`;
        
        // 将指示器添加到body中（作为独立元素，不影响按钮）
        document.body.appendChild(this.angleIndicator);
    }
    
    /**
     * 设置按钮点击事件处理器
     * 预留接口，供未来实现展开功能
     */
    setupButtonClickHandler() {
        this.clickListener = () => {
            // 切换活动状态类
            this.toggleActiveState();
            
            // TODO: 实现实际的展开/收起功能
            // 预留接口，等待具体实现
            console.log('展开按钮被点击');
        };
        
        this.buttonElement.addEventListener('click', this.clickListener);
    }
    
    /**
     * 切换按钮的活动状态
     */
    toggleActiveState() {
        if (this.buttonElement) {
            this.buttonElement.classList.toggle('active');
            return this.buttonElement.classList.contains('active');
        }
        return false;
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听窗口大小变化，确保定位正确
        this.resizeListener = () => this.positionButton();
        window.addEventListener('resize', this.resizeListener);
        
        // 监听页面滚动，确保按钮始终在视口中正确定位
        this.scrollListener = () => this.positionButton();
        window.addEventListener('scroll', this.scrollListener);
    }
    
    /**
     * 移除所有事件监听器
     * 用于清理资源，防止内存泄漏
     */
    removeEventListeners() {
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
        
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
        
        if (this.clickListener && this.buttonElement) {
            this.buttonElement.removeEventListener('click', this.clickListener);
            this.clickListener = null;
        }
    }
    
    /**
     * 设置角度指示器的旋转角度
     * @param {number} degrees - 旋转角度（度）
     */
    setIndicatorRotation(degrees) {
        this.indicatorRotation = degrees;
        if (this.angleIndicator) {
            this.angleIndicator.style.transform = `rotate(${degrees}deg)`;
        }
    }

    /**
     * 计算分割线位置
     * 基于页面布局确定按钮的定位参考点
     */
    calculateSplitLinePosition() {
        // 尝试直接找到主内容区域中的分割线元素
        const mainContent = document.querySelector('.main-content');
        
        // 首先尝试基于center-panel的右边缘定位（对应CSS中的伪元素分隔线）
        const centerPanel = document.querySelector('.center-panel');
        
        if (centerPanel && mainContent) {
            // 获取center-panel相对于页面的位置
            const rect = centerPanel.getBoundingClientRect();
            
            // 关键点：分割线位置 = center-panel的右边缘 + 页面滚动偏移
            // 这是分隔center panel和right panel的真实分割线位置
            this.splitLinePosition = rect.right + window.pageXOffset;
            
            // 计算主内容区域的flex布局比例，确保精确对齐
            const mainRect = mainContent.getBoundingClientRect();
            const totalFlexUnits = 1.5 + 6 + 2.5; // left-panel(1.5) + center-panel(6) + right-panel(2.5)
            const centerFlexEnd = (1.5 + 6) / totalFlexUnits; // 中心面板结束的比例位置
            const proportionalSplitPosition = mainRect.left + mainRect.width * centerFlexEnd + window.pageXOffset;
            
            // 使用两种方法的平均值提高精度
            this.splitLinePosition = (this.splitLinePosition + proportionalSplitPosition) / 2;
        } else {
            // 如果找不到相关元素，默认将分割线放在页面水平居中位置
            this.splitLinePosition = window.innerWidth / 2;
        }
    }

    /**
     * 定位按钮元素
     * 使其相对于分割线正确定位
     */
    positionButton() {
        if (!this.buttonElement) return;

        // 重新计算分割线位置（确保窗口大小变化后仍正确）
        this.calculateSplitLinePosition();
        
        // 获取按钮元素的尺寸
        const buttonWidth = this.buttonElement.offsetWidth || this.buttonElement.clientWidth || this.BUTTON_WIDTH;
        const buttonHeight = this.buttonElement.offsetHeight || this.buttonElement.clientHeight || this.BUTTON_HEIGHT;
        
        // 计算左侧位置：分割线位置 - 按钮宽度 + 右侧偏移量
        const leftPosition = this.splitLinePosition - buttonWidth + this.RIGHT_OFFSET;
        
        // 垂直位置调整 - 放置在主内容区域的中部
        const mainContent = document.querySelector('.main-content');
        let topPosition;
        
        if (mainContent) {
            // 如果能找到主内容区域，放在其垂直中心
            const mainRect = mainContent.getBoundingClientRect();
            topPosition = (mainRect.top + mainRect.bottom) / 2 - buttonHeight / 2 + window.pageYOffset;
        } else {
            // 否则放在视口中心
            const viewportHeight = window.innerHeight;
            const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
            topPosition = pageYOffset + (viewportHeight / 2) - (buttonHeight / 2);
        }
        
        // 应用定位样式
        this.buttonElement.style.left = `${leftPosition}px`;
        this.buttonElement.style.top = `${topPosition}px`;
        
        // 更新角度指示器的位置
        this.positionAngleIndicator(leftPosition, topPosition, buttonHeight);
        
        // 确保元素在可视区域内
        this.ensureVisibility();
    }
    
    /**
     * 定位角度指示器
     * @param {number} buttonLeft - 按钮的左位置
     * @param {number} buttonTop - 按钮的上位置
     * @param {number} buttonHeight - 按钮的高度
     */
    positionAngleIndicator(buttonLeft, buttonTop, buttonHeight) {
        if (!this.angleIndicator) return;
        
        // 定位指示器在按钮的右侧边缘，但向左偏移
        const indicatorLeft = buttonLeft + this.BUTTON_WIDTH - 30; // 向左偏移
        
        // 垂直位置与按钮垂直居中对齐
        const indicatorTop = buttonTop + buttonHeight / 2 - this.INDICATOR_SIZE / 2;
        
        // 应用定位和旋转样式
        this.angleIndicator.style.left = `${indicatorLeft}px`;
        this.angleIndicator.style.top = `${indicatorTop}px`;
        this.angleIndicator.style.transform = `rotate(${this.indicatorRotation}deg)`;
    }

    /**
     * 确保按钮元素在可视区域内
     */
    ensureVisibility() {
        if (!this.buttonElement) return;

        // 获取元素的尺寸和位置
        const rect = this.buttonElement.getBoundingClientRect();
        const buttonWidth = rect.width || this.buttonElement.offsetWidth || this.buttonElement.clientWidth || this.BUTTON_WIDTH;
        const buttonHeight = rect.height || this.buttonElement.offsetHeight || this.buttonElement.clientHeight || this.BUTTON_HEIGHT;
        
        // 获取视口尺寸和滚动位置
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pageXOffset = window.pageXOffset || document.documentElement.scrollLeft;
        const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
        
        // 获取当前位置
        let left = parseFloat(this.buttonElement.style.left) || 0;
        let top = parseFloat(this.buttonElement.style.top) || 0;
        
        // 重新计算正确的偏移位置
        const correctLeftPosition = this.splitLinePosition - buttonWidth + 7;
        
        // 只在极端情况下（元素几乎完全在视口外）才调整水平位置
        if (rect.right < 0 || rect.left > viewportWidth) {
            // 如果元素几乎完全在视口外，重新定位
            left = Math.max(pageXOffset, Math.min(pageXOffset + viewportWidth - buttonWidth, correctLeftPosition));
        } else {
            // 否则，强制保持正确的偏移位置
            left = correctLeftPosition;
        }
        
        // 垂直边界检查
        if (rect.top < 0) {
            // 如果元素顶部超出视口，调整位置
            top = pageYOffset;
        } else if (rect.bottom > viewportHeight) {
            // 如果元素底部超出视口，调整位置
            top = pageYOffset + viewportHeight - buttonHeight;
        }
        
        // 应用调整后的位置
        this.buttonElement.style.left = `${left}px`;
        this.buttonElement.style.top = `${top}px`;
    }
    
    /**
     * 销毁方法
     * 清理资源，移除元素和事件监听器
     */
    destroy() {
        // 移除事件监听器
        this.removeEventListeners();
        
        // 移除DOM元素
        if (this.buttonElement && this.buttonElement.parentNode) {
            this.buttonElement.parentNode.removeChild(this.buttonElement);
            this.buttonElement = null;
        }
        
        if (this.angleIndicator && this.angleIndicator.parentNode) {
            this.angleIndicator.parentNode.removeChild(this.angleIndicator);
            this.angleIndicator = null;
        }
    }
}

// 创建实例并初始化
const expandingButtonManager = new ExpandingButtonManager();
expandingButtonManager.init();

// 暴露实例到window对象，方便外部控制和扩展
window.expandingButtonManager = expandingButtonManager;