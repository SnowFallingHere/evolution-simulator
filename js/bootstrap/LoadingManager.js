// 加载界面管理模块
const LoadingManager = {
    // 加载状态
    isLoading: false,
    loadingDotsInterval: null,
    loadingStartTime: null,
    
    // 创建增强的加载界面
    createEnhancedLoadingScreen: function() {
        console.log("创建增强加载界面");
        
        // 检查是否已存在加载界面
        if (document.getElementById('loading-screen')) {
            console.log("加载界面已存在，跳过创建");
            return;
        }
        
        // 记录开始时间
        this.loadingStartTime = Date.now();
        
        try {
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
                transition: opacity 0.3s ease;
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
                    <div class="loading-subtext" style="
                        color: var(--text-color);
                        font-size: 14px;
                        opacity: 0.7;
                    ">请稍候...</div>
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
                <div class="loading-progress" style="
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200px;
                    height: 4px;
                    background-color: var(--progress-bg);
                    border-radius: 2px;
                    display: none;
                ">
                    <div class="loading-progress-bar" style="
                        height: 100%;
                        background-color: var(--progress-fill);
                        width: 0%;
                        border-radius: 2px;
                        transition: width 0.3s ease;
                    "></div>
                </div>
            `;
            
            // 添加动画关键帧
            this.addLoadingStyles();
            
            document.body.appendChild(loadingScreen);
            this.isLoading = true;
            
            // 启动动态点动画
            this.startLoadingDotsAnimation();
            
            console.log("增强加载界面创建完成");
            
        } catch (error) {
            console.error("创建加载界面失败:", error);
            this.createFallbackLoadingScreen();
        }
    },
    
    // 添加加载样式
    addLoadingStyles: function() {
        // 检查是否已存在样式
        if (document.getElementById('loading-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* 确保加载界面覆盖所有内容 */
            #loading-screen {
                background-color: var(--bg-color) !important;
            }
            
            /* 加载界面响应式样式 */
            @media (max-width: 768px) {
                #loading-screen .loading-container {
                    margin-bottom: 50px !important;
                }
                
                #loading-screen .loading-spinner {
                    width: 50px !important;
                    height: 50px !important;
                    border-width: 5px !important;
                }
                
                #loading-screen .loading-text {
                    font-size: 16px !important;
                }
                
                #loading-screen .loading-footer {
                    bottom: 20px !important;
                    right: 20px !important;
                    font-size: 12px !important;
                }
                
                #loading-screen .loading-subtext {
                    font-size: 12px !important;
                }
            }
            
            @media (max-width: 480px) {
                #loading-screen .loading-spinner {
                    width: 40px !important;
                    height: 40px !important;
                    border-width: 4px !important;
                }
                
                #loading-screen .loading-text {
                    font-size: 14px !important;
                }
                
                #loading-screen .loading-footer {
                    bottom: 15px !important;
                    right: 15px !important;
                    font-size: 11px !important;
                }
                
                #loading-screen .loading-subtext {
                    font-size: 11px !important;
                }
                
                #loading-screen .loading-progress {
                    width: 150px !important;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // 创建降级加载界面（当增强版创建失败时）
    createFallbackLoadingScreen: function() {
        console.log("创建降级加载界面");
        
        // 先尝试移除可能存在的损坏的loading界面
        const existing = document.getElementById('loading-screen');
        if (existing) {
            existing.remove();
        }
        
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        
        loadingScreen.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 16px; color: #333; margin-bottom: 10px;">
                    正在加载进化模拟器...
                </div>
                <div style="font-size: 12px; color: #666;">
                    请稍候
                </div>
            </div>
        `;
        
        document.body.appendChild(loadingScreen);
        this.isLoading = true;
        console.log("降级加载界面创建完成");
    },
    
    // 启动加载点动画
    startLoadingDotsAnimation: function() {
        const dotsElement = document.getElementById('loading-dots');
        if (!dotsElement) {
            console.warn("加载点元素未找到");
            return;
        }
        
        let dotCount = 0;
        const maxDots = 3;
        const baseText = "正在加载模拟器系统中";
        
        // 清除之前的interval
        if (this.loadingDotsInterval) {
            clearInterval(this.loadingDotsInterval);
        }
        
        this.loadingDotsInterval = setInterval(() => {
            dotCount = (dotCount + 1) % (maxDots + 1);
            const dots = '.'.repeat(dotCount);
            dotsElement.textContent = baseText + dots;
        }, 500);
        
        console.log("加载点动画启动");
    },
    
    // 更新加载文字
    updateLoadingText: function(text) {
        const dotsElement = document.getElementById('loading-dots');
        const subtextElement = document.querySelector('#loading-screen .loading-subtext');
        
        if (!dotsElement) {
            console.warn("加载点元素未找到，无法更新文字");
            return;
        }
        
        const baseText = text;
        dotsElement.textContent = baseText;
        
        // 如果有副标题，更新提示
        if (subtextElement) {
            subtextElement.textContent = "请稍候...";
        }
        
        // 重新启动点动画
        if (this.loadingDotsInterval) {
            clearInterval(this.loadingDotsInterval);
        }
        
        let dotCount = 0;
        const maxDots = 3;
        
        this.loadingDotsInterval = setInterval(() => {
            dotCount = (dotCount + 1) % (maxDots + 1);
            const dots = '.'.repeat(dotCount);
            dotsElement.textContent = baseText + dots;
        }, 500);
        
        console.log(`加载文字更新为: ${text}`);
    },
    
    // 更新加载进度条
    updateProgress: function(progress, text) {
        const progressBar = document.querySelector('#loading-screen .loading-progress');
        const progressBarFill = document.querySelector('#loading-screen .loading-progress-bar');
        const loadingText = document.getElementById('loading-dots');
        
        if (progressBar && progressBarFill) {
            progressBar.style.display = 'block';
            progressBarFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        if (loadingText && text) {
            loadingText.textContent = text;
        }
        
        console.log(`加载进度: ${progress}% - ${text || ''}`);
    },
    
    // 显示加载界面
    showLoadingScreen: function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            this.isLoading = true;
            this.startLoadingDotsAnimation();
            console.log("加载界面已显示");
        } else {
            this.createEnhancedLoadingScreen();
        }
    },
    
    // 隐藏加载界面 - 增强版本，确保总是能被隐藏
    hideLoadingScreen: function() {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (!loadingScreen) {
            console.warn("加载界面未找到，但标记为非加载状态");
            this.isLoading = false;
            return;
        }
        
        console.log("正在隐藏加载界面...");
        
        // 先停止点动画
        if (this.loadingDotsInterval) {
            clearInterval(this.loadingDotsInterval);
            this.loadingDotsInterval = null;
        }
        
        // 检查是否已经在动画中
        if (loadingScreen.style.transition && loadingScreen.style.opacity === '0') {
            console.log("加载界面已经在淡出中");
            this.isLoading = false;
            return;
        }
        
        // 计算加载耗时
        if (this.loadingStartTime) {
            const loadTime = Date.now() - this.loadingStartTime;
            console.log(`加载总耗时: ${loadTime}ms`);
        }
        
        // 添加淡出动画
        loadingScreen.style.transition = 'opacity 0.5s ease';
        loadingScreen.style.opacity = '0';
        
        // 使用更可靠的隐藏方式
        const hideTimer = setTimeout(() => {
            // 再次检查元素是否存在
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.style.display = 'none';
                console.log("加载界面已隐藏");
            } else {
                console.warn("加载界面已被移除");
            }
            this.isLoading = false;
            
            // 触发加载完成事件
            const event = new CustomEvent('loadingComplete');
            window.dispatchEvent(event);
        }, 500);
        
        // 保存定时器引用，以便在需要时清除
        this.hideTimer = hideTimer;
    },
    
    // 立即隐藏加载界面（无动画）
    hideLoadingScreenImmediately: function() {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (this.loadingDotsInterval) {
            clearInterval(this.loadingDotsInterval);
            this.loadingDotsInterval = null;
        }
        
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        
        if (loadingScreen && loadingScreen.parentNode) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '0';
        }
        
        this.isLoading = false;
        console.log("加载界面已立即隐藏");
    },
    
    // 显示错误状态
    showErrorState: function(errorMessage) {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            console.error("错误状态：加载界面未找到，创建错误提示");
            this.createFallbackErrorScreen(errorMessage);
            return;
        }
        
        // 停止动画
        if (this.loadingDotsInterval) {
            clearInterval(this.loadingDotsInterval);
            this.loadingDotsInterval = null;
        }
        
        // 更新内容显示错误
        const container = loadingScreen.querySelector('.loading-container');
        if (container) {
            container.innerHTML = `
                <div style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">
                    ⚠️ 加载失败
                </div>
                <div style="color: #666; font-size: 16px; margin-bottom: 30px;">
                    ${errorMessage || '未知错误'}
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="location.reload()" style="
                        padding: 10px 20px;
                        background: #1976d2;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        重新加载
                    </button>
                    <button onclick="LoadingManager.hideLoadingScreen(); showPage('start');" style="
                        padding: 10px 20px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        进入游戏
                    </button>
                </div>
            `;
        }
        
        console.error("显示错误状态:", errorMessage);
        
        // 5秒后自动隐藏并显示开始页面
        setTimeout(() => {
            this.hideLoadingScreen();
            showPage('start');
        }, 5000);
    },
    
    // 创建降级错误提示
    createFallbackErrorScreen: function(errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border: 2px solid #d32f2f;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            max-width: 90%;
        `;
        errorDiv.innerHTML = `
            <div style="color: #d32f2f; font-size: 18px; margin-bottom: 10px;">加载失败</div>
            <div style="color: #666; margin-bottom: 15px;">${errorMessage}</div>
            <button onclick="this.parentElement.remove(); showPage('start');" style="
                padding: 8px 16px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">进入游戏</button>
        `;
        document.body.appendChild(errorDiv);
    },
    
    // 显示进度（可选功能）
    showProgress: function(progress, message) {
        const progressBar = document.querySelector('#loading-screen .loading-progress');
        const progressBarFill = document.querySelector('#loading-screen .loading-progress-bar');
        const loadingText = document.getElementById('loading-dots');
        
        if (progressBar && progressBarFill) {
            progressBar.style.display = 'block';
            progressBarFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        if (loadingText && message) {
            loadingText.textContent = message;
        }
        
        console.log(`加载进度: ${progress}% - ${message || ''}`);
    },
    
    // 检查加载状态
    getLoadingState: function() {
        return {
            isLoading: this.isLoading,
            hasLoadingScreen: !!document.getElementById('loading-screen'),
            loadingDuration: this.loadingStartTime ? Date.now() - this.loadingStartTime : 0
        };
    },
    
    // 强制完成加载（紧急情况下使用）
    forceCompleteLoading: function() {
        console.warn("强制完成加载！");
        this.hideLoadingScreenImmediately();
        
        // 确保页面显示
        const startPage = document.getElementById('start');
        if (startPage) {
            startPage.style.display = 'flex';
        }
    }
};

// 导出到全局
window.LoadingManager = LoadingManager;
console.log("加载界面模块加载完成");

// 自动初始化加载界面
document.addEventListener('DOMContentLoaded', function() {
    // 延迟创建加载界面，确保DOM完全就绪
    setTimeout(() => {
        if (!document.getElementById('loading-screen')) {
            LoadingManager.createEnhancedLoadingScreen();
        }
    }, 100);
});