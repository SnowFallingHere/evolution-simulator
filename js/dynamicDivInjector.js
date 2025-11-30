/**
 * 动态创建并注入分割矩形元素
 * 确保元素位于页面中部并被分割线精确分为两半
 */
class DynamicDivInjector {
    constructor() {
        this.divElement = null;
        this.splitLinePosition = 0;
        this.angleIndicator = null;
        this.indicatorRotation = -45; // 默认旋转45度
    }

    /**
     * 初始化并注入div元素
     */
    init() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createAndInjectDiv());
        } else {
            this.createAndInjectDiv();
        }

        // 监听窗口大小变化，确保定位正确
        window.addEventListener('resize', () => this.positionDiv());
        
        // 监听页面滚动，确保div始终在视口中正确定位
        window.addEventListener('scroll', () => this.positionDiv());
    }

    /**
     * 创建并注入div元素
     */
    createAndInjectDiv() {
        // 创建div元素
        this.divElement = document.createElement('div');
        this.divElement.className = 'split-rectangle';
        
        // 将div添加到body中
        document.body.appendChild(this.divElement);
        
        // 创建角度指示器
        this.createAngleIndicator();
        
        // 计算分割线位置并定位div
        this.calculateSplitLinePosition();
        this.positionDiv();
        
        // 添加一个小延迟后显示元素，确保样式已应用
        setTimeout(() => {
            this.divElement.classList.add('visible');
        }, 100);
    }
    
    /**
     * 创建角度指示器元素
     */
    createAngleIndicator() {
        // 创建角度指示器元素
        this.angleIndicator = document.createElement('div');
        this.angleIndicator.className = 'angle-indicator';
        
        // 应用默认旋转角度
        this.angleIndicator.style.transform = `rotate(${this.indicatorRotation}deg)`;
        
        // 将指示器添加到body中（作为独立元素，不影响矩形）
        document.body.appendChild(this.angleIndicator);
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
     * 计算分割线（center-panel::after伪元素）的位置
     */
    calculateSplitLinePosition() {
        // 尝试直接找到主内容区域中的分割线元素
        const mainContent = document.querySelector('.main-content');
        
        // 首先尝试基于center-panel的右边缘定位（对应CSS中的伪元素分隔线）
        const centerPanel = document.querySelector('.center-panel');
        
        if (centerPanel && mainContent) {
            // 获取center-panel相对于页面的位置
            const rect = centerPanel.getBoundingClientRect();
            
            // 关键点：分割线位置 = center-panel的右边缘（即CSS中center-panel::after伪元素的位置） + 页面滚动偏移
            // 这是分隔center panel和right panel的真实分割线位置
            this.splitLinePosition = rect.right + window.pageXOffset;
            
            // 计算主内容区域的flex布局比例，确保精确对齐
            const mainRect = mainContent.getBoundingClientRect();
            const totalFlexUnits = 1.5 + 6 + 2.5; // left-panel(1.5) + center-panel(6) + right-panel(2.5)
            const centerFlexEnd = (1.5 + 6) / totalFlexUnits; // 中心面板结束的比例位置
            const proportionalSplitPosition = mainRect.left + mainRect.width * centerFlexEnd + window.pageXOffset;
            
            // 使用两种方法的平均值提高精度
            this.splitLinePosition = (this.splitLinePosition + proportionalSplitPosition) / 2;
            console.log('基于flex布局计算的精确分割线位置:', this.splitLinePosition);
        } else {
            // 如果找不到相关元素，默认将分割线放在页面水平居中位置
            this.splitLinePosition = window.innerWidth / 2;
            console.warn('未找到足够的布局元素，使用默认分割线位置');
        }
    }

    /**
     * 定位div元素，使其向右移动10px（部分覆盖分割线）
     */
    positionDiv() {
        if (!this.divElement) return;

        // 重新计算分割线位置（确保窗口大小变化后仍正确）
        this.calculateSplitLinePosition();
        
        // 获取div元素的尺寸
        const divWidth = this.divElement.offsetWidth || this.divElement.clientWidth || 40;
        const divHeight = this.divElement.offsetHeight || this.divElement.clientHeight || 50;
        
        // 关键点：让矩形元素向右移动10px，不再完全紧贴分割线左侧
        // 左边缘位置 = 分割线位置 - div宽度 + 10px
        const leftPosition = this.splitLinePosition - divWidth + 10;
        
        // 垂直位置调整 - 放置在主内容区域的中部
        const mainContent = document.querySelector('.main-content');
        let topPosition;
        
        if (mainContent) {
            // 如果能找到主内容区域，放在其垂直中心
            const mainRect = mainContent.getBoundingClientRect();
            topPosition = (mainRect.top + mainRect.bottom) / 2 - divHeight / 2 + window.pageYOffset;
        } else {
            // 否则放在视口中心
            const viewportHeight = window.innerHeight;
            const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
            topPosition = pageYOffset + (viewportHeight / 2) - (divHeight / 2);
        }
        
        // 应用定位样式
        this.divElement.style.left = `${leftPosition}px`;
        this.divElement.style.top = `${topPosition}px`;
        
        // 更新角度指示器的位置（向左偏移）
        this.positionAngleIndicator(leftPosition, topPosition, divHeight);
        
        // 记录定位信息以便调试
        console.log(`矩形定位 - 左: ${leftPosition}px, 上: ${topPosition}px, 向右偏移10px`);
        
        // 确保元素在可视区域内
        this.ensureVisibility();
    }
    
    /**
     * 定位角度指示器，使其向左偏移并与矩形关联
     * @param {number} rectLeft - 矩形的左位置
     * @param {number} rectTop - 矩形的上位置
     * @param {number} rectHeight - 矩形的高度
     */
    positionAngleIndicator(rectLeft, rectTop, rectHeight) {
        if (!this.angleIndicator) return;
        
        // 获取指示器尺寸
        const indicatorSize = 20;
        
        // 定位指示器在矩形的右侧边缘，但向左偏移更多（10px）
        // 水平位置 = 矩形左位置 + 矩形宽度 - 向左偏移量
        const indicatorLeft = rectLeft + 40 - 30; // 40是矩形固定宽度，向左偏移10px
        
        // 垂直位置与矩形垂直居中对齐
        const indicatorTop = rectTop + rectHeight / 2 - indicatorSize / 2;
        
        // 应用定位和旋转样式
        this.angleIndicator.style.left = `${indicatorLeft}px`;
        this.angleIndicator.style.top = `${indicatorTop}px`;
        this.angleIndicator.style.transform = `rotate(${this.indicatorRotation}deg)`;
        
        console.log(`角度指示器定位 - 左: ${indicatorLeft}px, 上: ${indicatorTop}px, 旋转: ${this.indicatorRotation}deg, 向左偏移10px`);
    }

    /**
     * 确保div元素在可视区域内，同时保持向右偏移10px的定位关系
     */
    ensureVisibility() {
        if (!this.divElement) return;

        // 获取元素的尺寸和位置
        const rect = this.divElement.getBoundingClientRect();
        const divWidth = rect.width || this.divElement.offsetWidth || this.divElement.clientWidth || 40;
        const divHeight = rect.height || this.divElement.offsetHeight || this.divElement.clientHeight || 50;
        
        // 获取视口尺寸和滚动位置
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pageXOffset = window.pageXOffset || document.documentElement.scrollLeft;
        const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
        
        // 获取当前位置
        let left = parseFloat(this.divElement.style.left) || 0;
        let top = parseFloat(this.divElement.style.top) || 0;
        
        // 重要：保持向右偏移10px的定位关系
        // 重新计算正确的偏移位置
        // 左边缘位置 = 分割线位置 - div宽度 + 10px
        const correctLeftPosition = this.splitLinePosition - divWidth + 7;
        
        // 只在极端情况下（元素几乎完全在视口外）才调整水平位置
        if (rect.right < 0 || rect.left > viewportWidth) {
            // 如果元素几乎完全在视口外，重新定位
            left = Math.max(pageXOffset, Math.min(pageXOffset + viewportWidth - divWidth, correctLeftPosition));
            console.log(`因完全不可见进行水平调整，新位置: ${left}px，尝试保持向右偏移10px`);
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
            top = pageYOffset + viewportHeight - divHeight;
        }
        
        // 应用调整后的位置
        this.divElement.style.left = `${left}px`;
        this.divElement.style.top = `${top}px`;
    }
}

// 创建实例并初始化
const dynamicDivInjector = new DynamicDivInjector();
dynamicDivInjector.init();

// 暴露实例到window对象，方便外部调整角度
window.dynamicDivInjector = dynamicDivInjector;