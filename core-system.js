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