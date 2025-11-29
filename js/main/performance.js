// 性能监控模块
const PerformanceMonitor = {
    // 监控数据
    metrics: {
        fps: 0,
        memory: null,
        loadTime: 0,
        frameTimes: [],
        resourceUsage: {},
        performanceEntries: []
    },
    
    // 配置
    config: {
        enabled: true,
        logToConsole: false,
        maxFrameSamples: 60,
        memoryCheckInterval: 5000,
        performanceCheckInterval: 10000
    },
    
    // 初始化性能监控
    init: function() {
        if (!this.config.enabled) {
            console.log("性能监控已禁用");
            return;
        }
        
        console.log("初始化性能监控");
        
        this.startTime = performance.now();
        
        // 监控帧率
        this.monitorFPS();
        
        // 监控内存（如果浏览器支持）
        if (performance.memory) {
            this.monitorMemory();
        }
        
        // 监控加载时间
        this.monitorLoadTime();
        
        // 监控长任务
        this.monitorLongTasks();
        
        // 监控资源使用
        this.monitorResourceUsage();
        
        // 设置定期检查
        this.setupPeriodicChecks();
        
        console.log("性能监控初始化完成");
    },
    
    // 监控帧率
    monitorFPS: function() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const calculateFPS = () => {
            if (!this.config.enabled) return;
            
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // 记录帧时间
                this.metrics.frameTimes.push(this.metrics.fps);
                if (this.metrics.frameTimes.length > this.config.maxFrameSamples) {
                    this.metrics.frameTimes.shift();
                }
                
                // 低帧率警告
                if (this.metrics.fps < 30) {
                    this.handleLowFPS(this.metrics.fps);
                }
                
                if (this.config.logToConsole) {
                    console.log(`FPS: ${this.metrics.fps}`);
                }
            }
            
            requestAnimationFrame(calculateFPS);
        };
        
        calculateFPS();
    },
    
    // 监控内存使用
    monitorMemory: function() {
        if (!performance.memory) return;
        
        this.memoryInterval = setInterval(() => {
            if (!this.config.enabled) return;
            
            this.metrics.memory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
            
            // 内存使用率警告
            const usagePercent = (this.metrics.memory.used / this.metrics.memory.limit) * 100;
            if (usagePercent > 80) {
                this.handleHighMemoryUsage(usagePercent);
            }
            
            if (this.config.logToConsole) {
                console.log(`内存使用: ${(this.metrics.memory.used / 1024 / 1024).toFixed(1)}MB / ${(this.metrics.memory.limit / 1024 / 1024).toFixed(1)}MB (${usagePercent.toFixed(1)}%)`);
            }
        }, this.config.memoryCheckInterval);
    },
    
    // 监控加载时间
    monitorLoadTime: function() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            
            // 记录性能条目
            this.collectPerformanceEntries();
            
            console.log(`页面加载完成，耗时: ${this.metrics.loadTime.toFixed(2)}ms`);
            
            // 加载时间警告
            if (this.metrics.loadTime > 5000) {
                this.handleLongLoadTime(this.metrics.loadTime);
            }
        });
    },
    
    // 监控长任务
    monitorLongTasks: function() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            this.longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // 50ms阈值
                        this.handleLongTask(entry);
                    }
                }
            });
            
            this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
            console.warn("长任务监控不可用:", error);
        }
    },
    
    // 监控资源使用
    monitorResourceUsage: function() {
        // 监控定时器数量
        this.monitorTimers();
        
        // 监控事件监听器
        this.monitorEventListeners();
        
        // 监控DOM节点数量
        this.monitorDOMNodes();
    },
    
    // 监控定时器
    monitorTimers: function() {
        setInterval(() => {
            // 可以通过重写setTimeout/setInterval来监控
            // 这里只是简单的示例
            if (this.config.logToConsole) {
                console.log("活跃定时器监控...");
            }
        }, this.config.performanceCheckInterval);
    },
    
    // 监控事件监听器
    monitorEventListeners: function() {
        // 可以监控事件监听器数量，但需要重写addEventListener
        // 这里只是简单的示例
    },
    
    // 监控DOM节点
    monitorDOMNodes: function() {
        setInterval(() => {
            const nodeCount = document.getElementsByTagName('*').length;
            this.metrics.resourceUsage.domNodes = nodeCount;
            
            if (nodeCount > 5000) {
                this.handleHighDOMCount(nodeCount);
            }
        }, this.config.performanceCheckInterval);
    },
    
    // 收集性能条目
    collectPerformanceEntries: function() {
        if (!performance.getEntriesByType) return;
        
        try {
            const entries = performance.getEntriesByType('navigation');
            this.metrics.performanceEntries = entries;
        } catch (error) {
            console.warn("无法收集性能条目:", error);
        }
    },
    
    // 设置定期检查
    setupPeriodicChecks: function() {
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.config.performanceCheckInterval);
    },
    
    // 执行健康检查
    performHealthCheck: function() {
        if (!this.config.enabled) return;
        
        const checks = [];
        
        // 检查帧率
        if (this.metrics.fps < 30) {
            checks.push(`低帧率: ${this.metrics.fps}FPS`);
        }
        
        // 检查内存
        if (this.metrics.memory) {
            const usagePercent = (this.metrics.memory.used / this.metrics.memory.limit) * 100;
            if (usagePercent > 80) {
                checks.push(`高内存使用: ${usagePercent.toFixed(1)}%`);
            }
        }
        
        // 检查DOM节点
        if (this.metrics.resourceUsage.domNodes > 5000) {
            checks.push(`高DOM节点数: ${this.metrics.resourceUsage.domNodes}`);
        }
        
        if (checks.length > 0) {
            console.warn("性能健康检查问题:", checks);
            this.generatePerformanceReport();
        }
    },
    
    // 处理低帧率
    handleLowFPS: function(fps) {
        console.warn(`低帧率警告: ${fps}FPS`);
        
        // 可以在这里添加优化建议或自动优化
        this.suggestOptimizations('fps');
    },
    
    // 处理高内存使用
    handleHighMemoryUsage: function(usagePercent) {
        console.warn(`高内存使用警告: ${usagePercent.toFixed(1)}%`);
        
        // 建议清理内存
        this.suggestOptimizations('memory');
        
        // 尝试触发垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
    },
    
    // 处理长加载时间
    handleLongLoadTime: function(loadTime) {
        console.warn(`长加载时间警告: ${loadTime.toFixed(2)}ms`);
        this.suggestOptimizations('loadTime');
    },
    
    // 处理长任务
    handleLongTask: function(task) {
        console.warn(`检测到长任务: ${task.duration.toFixed(2)}ms`, task);
        this.suggestOptimizations('longTask');
    },
    
    // 处理高DOM节点数
    handleHighDOMCount: function(nodeCount) {
        console.warn(`高DOM节点数警告: ${nodeCount}个节点`);
        this.suggestOptimizations('domNodes');
    },
    
    // 建议优化
    suggestOptimizations: function(issueType) {
        const suggestions = {
            fps: [
                "减少同时运行的动画数量",
                "优化复杂的CSS选择器",
                "使用transform和opacity进行动画",
                "避免强制同步布局"
            ],
            memory: [
                "及时清理不再使用的对象",
                "避免内存泄漏",
                "使用弱引用",
                "分块加载大型数据集"
            ],
            loadTime: [
                "优化资源加载顺序",
                "使用代码分割",
                "压缩资源文件",
                "使用CDN加速"
            ],
            longTask: [
                "将长时间运行的任务分解为小块",
                "使用Web Workers处理复杂计算",
                "避免在主线程进行大量DOM操作"
            ],
            domNodes: [
                "使用虚拟DOM",
                "及时移除不需要的DOM节点",
                "使用文档片段进行批量操作",
                "避免深层嵌套的DOM结构"
            ]
        };
        
        const issueSuggestions = suggestions[issueType] || ["检查代码性能瓶颈"];
        console.log(`优化建议 (${issueType}):`, issueSuggestions);
    },
    
    // 生成性能报告
    generatePerformanceReport: function() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            userAgent: navigator.userAgent,
            url: window.location.href,
            suggestions: this.getOptimizationSuggestions()
        };
        
        return report;
    },
    
    // 获取优化建议
    getOptimizationSuggestions: function() {
        const suggestions = [];
        
        if (this.metrics.fps < 30) {
            suggestions.push("考虑优化动画和渲染性能");
        }
        
        if (this.metrics.memory && (this.metrics.memory.used / this.metrics.memory.limit) > 0.8) {
            suggestions.push("检查内存泄漏，优化内存使用");
        }
        
        if (this.metrics.loadTime > 5000) {
            suggestions.push("优化资源加载，减少初始加载时间");
        }
        
        return suggestions;
    },
    
    // 显示性能面板
    showPerformancePanel: function() {
        if (this.performancePanel) {
            this.performancePanel.style.display = 'block';
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(panel);
        this.performancePanel = panel;
        
        const updatePanel = () => {
            if (!this.config.enabled || !panel.parentNode) {
                if (this.panelUpdateInterval) {
                    clearInterval(this.panelUpdateInterval);
                }
                return;
            }
            
            const memoryInfo = this.metrics.memory ? 
                `内存: ${(this.metrics.memory.used / 1024 / 1024).toFixed(1)}MB` : 
                '内存: N/A';
                
            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>性能监控</span>
                    <button onclick="PerformanceMonitor.hidePerformancePanel()" style="
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                    ">×</button>
                </div>
                <div>FPS: ${this.metrics.fps}</div>
                <div>${memoryInfo}</div>
                <div>加载: ${this.metrics.loadTime.toFixed(0)}ms</div>
                <div>DOM节点: ${this.metrics.resourceUsage.domNodes || 'N/A'}</div>
                <div style="margin-top: 5px; font-size: 10px; opacity: 0.7;">
                    按P键隐藏/显示
                </div>
            `;
        };
        
        // 更新面板
        this.panelUpdateInterval = setInterval(updatePanel, 1000);
        updatePanel();
        
        // 切换显示/隐藏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                this.togglePerformancePanel();
            }
        });
    },
    
    // 隐藏性能面板
    hidePerformancePanel: function() {
        if (this.performancePanel) {
            this.performancePanel.style.display = 'none';
        }
    },
    
    // 切换性能面板
    togglePerformancePanel: function() {
        if (!this.performancePanel) {
            this.showPerformancePanel();
            return;
        }
        
        this.performancePanel.style.display = 
            this.performancePanel.style.display === 'none' ? 'block' : 'none';
    },
    
    // 启用/禁用监控
    setEnabled: function(enabled) {
        this.config.enabled = enabled;
        
        if (!enabled) {
            this.cleanup();
        } else {
            this.init();
        }
    },
    
    // 清理资源
    cleanup: function() {
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }
        
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        if (this.panelUpdateInterval) {
            clearInterval(this.panelUpdateInterval);
        }
        
        if (this.longTaskObserver) {
            this.longTaskObserver.disconnect();
        }
        
        if (this.performancePanel && this.performancePanel.parentNode) {
            this.performancePanel.parentNode.removeChild(this.performancePanel);
        }
        
        console.log("性能监控已清理");
    }
};

// 导出到全局
window.PerformanceMonitor = PerformanceMonitor;

// 自动初始化（可选）
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        PerformanceMonitor.init();
    }, 1000);
});

console.log("性能监控模块加载完成");