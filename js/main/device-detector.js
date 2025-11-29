// 设备检测模块
const DeviceDetector = {
    // 设备信息
    deviceInfo: {
        type: 'unknown',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isTouch: false,
        orientation: 'portrait',
        screenSize: {
            width: 0,
            height: 0
        }
    },
    
    // 初始化设备检测
    init: function() {
        console.log("初始化设备检测");
        
        this.detectDeviceType();
        this.detectTouchSupport();
        this.detectOrientation();
        this.setupEventListeners();
        
        console.log("设备检测完成:", this.deviceInfo);
    },
    
    // 检测设备类型
    detectDeviceType: function() {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent.toLowerCase();
        
        // 检测移动设备
        const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent);
        const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent);
        
        // 基于宽度的检测（备用方案）
        const widthBasedMobile = width <= 768;
        const widthBasedTablet = width > 768 && width <= 1024;
        
        if (isMobile || widthBasedMobile) {
            this.deviceInfo.type = 'mobile';
            this.deviceInfo.isMobile = true;
        } else if (isTablet || widthBasedTablet) {
            this.deviceInfo.type = 'tablet';
            this.deviceInfo.isTablet = true;
        } else {
            this.deviceInfo.type = 'desktop';
            this.deviceInfo.isDesktop = true;
        }
        
        // 更新屏幕尺寸
        this.updateScreenSize();
    },
    
    // 检测触摸支持
    detectTouchSupport: function() {
        this.deviceInfo.isTouch = 'ontouchstart' in window || 
                                 navigator.maxTouchPoints > 0 || 
                                 navigator.msMaxTouchPoints > 0;
    },
    
    // 检测屏幕方向
    detectOrientation: function() {
        if (window.screen && window.screen.orientation) {
            this.deviceInfo.orientation = window.screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait';
        } else {
            // 备用检测方法
            this.deviceInfo.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        }
    },
    
    // 更新屏幕尺寸
    updateScreenSize: function() {
        this.deviceInfo.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 屏幕方向变化
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        // 可视性变化（处理多标签页）
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    },
    
    // 处理窗口大小变化
    handleResize: function() {
        const oldType = this.deviceInfo.type;
        const oldWidth = this.deviceInfo.screenSize.width;
        
        this.detectDeviceType();
        this.detectOrientation();
        
        // 如果设备类型或宽度变化显著，触发事件
        if (oldType !== this.deviceInfo.type || Math.abs(oldWidth - this.deviceInfo.screenSize.width) > 100) {
            this.triggerDeviceChange();
        }
        
        console.log(`窗口大小变化: ${this.deviceInfo.screenSize.width}x${this.deviceInfo.screenSize.height}`);
    },
    
    // 处理方向变化
    handleOrientationChange: function() {
        const oldOrientation = this.deviceInfo.orientation;
        this.detectOrientation();
        
        if (oldOrientation !== this.deviceInfo.orientation) {
            console.log(`屏幕方向变化: ${oldOrientation} -> ${this.deviceInfo.orientation}`);
            this.triggerOrientationChange();
        }
    },
    
    // 处理可视性变化
    handleVisibilityChange: function() {
        const isVisible = !document.hidden;
        console.log(`页面可视性变化: ${isVisible ? '可见' : '隐藏'}`);
        
        if (isVisible) {
            // 页面重新可见时刷新设备信息
            this.detectDeviceType();
            this.detectOrientation();
        }
    },
    
    // 触发设备变化事件
    triggerDeviceChange: function() {
        const event = new CustomEvent('deviceChange', {
            detail: { ...this.deviceInfo }
        });
        window.dispatchEvent(event);
        
        console.log("设备类型变化:", this.deviceInfo.type);
    },
    
    // 触发方向变化事件
    triggerOrientationChange: function() {
        const event = new CustomEvent('orientationChange', {
            detail: { orientation: this.deviceInfo.orientation }
        });
        window.dispatchEvent(event);
    },
    
    // 获取设备信息
    getDeviceInfo: function() {
        return { ...this.deviceInfo };
    },
    
    // 检查是否是特定设备类型
    isDeviceType: function(type) {
        return this.deviceInfo.type === type;
    },
    
    // 检查是否是移动端
    isMobileDevice: function() {
        return this.deviceInfo.isMobile;
    },
    
    // 检查是否是平板
    isTabletDevice: function() {
        return this.deviceInfo.isTablet;
    },
    
    // 检查是否是桌面端
    isDesktopDevice: function() {
        return this.deviceInfo.isDesktop;
    },
    
    // 检查是否支持触摸
    isTouchDevice: function() {
        return this.deviceInfo.isTouch;
    },
    
    // 获取屏幕方向
    getOrientation: function() {
        return this.deviceInfo.orientation;
    },
    
    // 获取屏幕尺寸
    getScreenSize: function() {
        return { ...this.deviceInfo.screenSize };
    },
    
    // 获取断点信息
    getBreakpoint: function() {
        const width = this.deviceInfo.screenSize.width;
        
        if (width < 576) return 'xs';
        if (width < 768) return 'sm';
        if (width < 992) return 'md';
        if (width < 1200) return 'lg';
        return 'xl';
    },
    
    // 优化移动端体验
    optimizeForMobile: function() {
        if (!this.isMobileDevice()) return;
        
        console.log("优化移动端体验");
        
        // 防止缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // 添加移动端CSS类
        document.body.classList.add('mobile-device');
        
        // 优化触摸滚动
        this.optimizeTouchScrolling();
    },
    
    // 优化触摸滚动
    optimizeTouchScrolling: function() {
        if (!this.isTouchDevice()) return;
        
        // 添加CSS样式优化滚动
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device {
                -webkit-overflow-scrolling: touch;
            }
            .mobile-device .scrollable {
                overflow-scrolling: touch;
                -webkit-overflow-scrolling: touch;
            }
        `;
        document.head.appendChild(style);
    },
    
    // 检测浏览器信息
    getBrowserInfo: function() {
        const ua = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        
        // 检测常见浏览器
        if (ua.includes('Chrome')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (ua.includes('Edge')) {
            browser = 'Edge';
            version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'unknown';
        }
        
        return { browser, version, userAgent: ua };
    }
};

// 导出到全局
window.DeviceDetector = DeviceDetector;

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        DeviceDetector.init();
    }, 100);
});

console.log("设备检测模块加载完成");