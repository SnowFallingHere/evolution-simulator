// 工具函数模块
const Utils = {
    // 格式化数字显示
    formatNumber: function(num) {
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
    },
    
    // 获取当前时间
    getCurrentTime: function() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    },
    
    // 添加事件记录
    addEvent: function(containerId, event, maxCount = 10) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`事件容器未找到: ${containerId}`);
            return;
        }
        
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
    },
    
    // 防抖函数
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 深拷贝对象
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },
    
    // 生成随机数范围
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 生成随机浮点数
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // 检查元素是否存在
    elementExists: function(selector) {
        return document.querySelector(selector) !== null;
    },
    
    // 等待元素出现
    waitForElement: function(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function checkElement() {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime >= timeout) {
                    reject(new Error(`元素 ${selector} 在 ${timeout}ms 内未找到`));
                } else {
                    setTimeout(checkElement, 100);
                }
            }
            
            checkElement();
        });
    },
    
    // 安全设置本地存储
    safeSetStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`设置本地存储失败 (${key}):`, error);
            return false;
        }
    },
    
    // 安全获取本地存储
    safeGetStorage: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`获取本地存储失败 (${key}):`, error);
            return defaultValue;
        }
    },
    
    // 检查网络状态
    checkOnlineStatus: function() {
        return navigator.onLine;
    },
    
    // 复制到剪贴板
    copyToClipboard: function(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (error) {
                    reject(error);
                }
                document.body.removeChild(textArea);
            }
        });
    },
    
    // 下载文件
    downloadFile: function(content, filename, contentType = 'application/json') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    // 加载脚本
    loadScript: function(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    // 加载样式
    loadStyle: function(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
};

// 导出到全局
window.Utils = Utils;
console.log("工具函数模块加载完成");