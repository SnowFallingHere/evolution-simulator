// 错误处理模块
const ErrorHandler = {
    // 处理初始化错误
    handleInitializationError: function(error) {
        console.error("初始化错误:", error);
        
        // 显示错误页面或降级界面
        this.showErrorPage("初始化失败", error.message);
        
        // 尝试降级初始化
        this.fallbackInitialization();
    },
    
    // 处理系统初始化错误
    handleSystemInitializationError: function(error) {
        console.error("系统初始化错误:", error);
        
        // 隐藏加载界面
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.hideLoadingScreen();
        }
        
        // 显示错误提示
        this.showErrorAlert("系统初始化失败，请刷新页面重试");
    },
    
    // 处理全局错误
    handleGlobalError: function(event) {
        console.error('全局错误:', event.error);
        console.error('文件名:', event.filename);
        console.error('行号:', event.lineno);
        console.error('列号:', event.colno);
        
        // 可以在这里添加错误上报逻辑
        // this.reportError(event);
    },
    
    // 显示错误页面
    showErrorPage: function(title, message) {
        // 创建错误页面
        const errorPage = document.createElement('div');
        errorPage.id = 'error-page';
        errorPage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 10000;
            text-align: center;
            padding: 20px;
        `;
        
        errorPage.innerHTML = `
            <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️</h1>
            <h2 style="font-size: 24px; margin-bottom: 10px;">${title}</h2>
            <p style="font-size: 16px; margin-bottom: 30px; opacity: 0.8;">${message}</p>
            <button onclick="location.reload()" style="
                padding: 12px 24px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            ">重新加载</button>
        `;
        
        document.body.appendChild(errorPage);
    },
    
    // 显示错误提示
    showErrorAlert: function(message) {
        alert(`错误: ${message}`);
    },
    
    // 降级初始化
    fallbackInitialization: function() {
        console.log("尝试降级初始化");
        
        try {
            // 隐藏所有页面
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.style.display = 'none';
            });
            
            // 显示开始页面
            const startPage = document.getElementById('start');
            if (startPage) {
                startPage.style.display = 'flex';
            }
            
            console.log("降级初始化完成");
            
        } catch (error) {
            console.error("降级初始化失败:", error);
        }
    },
    
    // 错误上报（可选）
    reportError: function(error) {
        // 这里可以集成错误上报服务，如Sentry等
        // 示例：发送到后端
        /*
        fetch('/api/error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: error.message,
                stack: error.stack,
                url: window.location.href,
                timestamp: new Date().toISOString()
            })
        }).catch(console.error);
        */
    },
    
    // 创建错误边界
    createErrorBoundary: function(componentName) {
        return {
            componentDidCatch: function(error, errorInfo) {
                console.error(`错误边界捕获到错误 (${componentName}):`, error, errorInfo);
                this.reportError(error);
            }
        };
    }
};

// 导出到全局
window.ErrorHandler = ErrorHandler;
console.log("错误处理模块加载完成");