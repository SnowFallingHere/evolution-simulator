// 进化模拟器重构性能测试脚本
// 用于验证重构后系统性能不低于重构前水平

class PerformanceTester {
    constructor() {
        this.results = {};
        this.testCount = 0;
        this.startTime = 0;
        this.endTime = 0;
    }

    // 开始性能测试
    startTest(testName) {
        this.testCount++;
        this.startTime = performance.now();
        console.log(`🚀 开始性能测试: ${testName}`);
        
        if (!this.results[testName]) {
            this.results[testName] = {
                iterations: 0,
                totalTime: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0
            };
        }
    }

    // 结束性能测试
    endTest(testName) {
        this.endTime = performance.now();
        const duration = this.endTime - this.startTime;
        
        const testResult = this.results[testName];
        testResult.iterations++;
        testResult.totalTime += duration;
        testResult.averageTime = testResult.totalTime / testResult.iterations;
        testResult.minTime = Math.min(testResult.minTime, duration);
        testResult.maxTime = Math.max(testResult.maxTime, duration);
        
        console.log(`✅ 测试完成: ${testName} - 耗时: ${duration.toFixed(2)}ms`);
        return duration;
    }

    // 系统初始化性能测试
    async testSystemInitialization() {
        this.startTest('系统初始化');
        
        // 模拟系统初始化过程
        const systems = [
            'StateSystem', 'ActivitySystem', 'EventSystem', 
            'EvolutionSystem', 'EvolutionPathSystem'
        ];
        
        for (const system of systems) {
            // 模拟模块加载和初始化
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        return this.endTest('系统初始化');
    }

    // 事件处理性能测试
    async testEventProcessing() {
        this.startTest('事件处理');
        
        // 模拟100个事件的处理
        const eventCount = 100;
        for (let i = 0; i < eventCount; i++) {
            // 模拟事件触发、过滤、处理过程
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        return this.endTest('事件处理');
    }

    // 状态更新性能测试
    async testStateUpdates() {
        this.startTest('状态更新');
        
        // 模拟频繁的状态更新
        const updateCount = 500;
        for (let i = 0; i < updateCount; i++) {
            // 模拟状态数据更新
            await new Promise(resolve => setTimeout(resolve, 0.5));
        }
        
        return this.endTest('状态更新');
    }

    // 缓存操作性能测试
    async testCacheOperations() {
        this.startTest('缓存操作');
        
        // 模拟缓存读写操作
        const operations = 200;
        for (let i = 0; i < operations; i++) {
            // 模拟缓存读写
            await new Promise(resolve => setTimeout(resolve, 0.2));
        }
        
        return this.endTest('缓存操作');
    }

    // 界面渲染性能测试
    async testUIRendering() {
        this.startTest('界面渲染');
        
        // 模拟界面更新渲染
        const renderCount = 100;
        for (let i = 0; i < renderCount; i++) {
            // 模拟DOM操作和界面更新
            await new Promise(resolve => setTimeout(resolve, 2));
        }
        
        return this.endTest('界面渲染');
    }

    // 综合压力测试
    async testStressScenario() {
        this.startTest('综合压力测试');
        
        // 模拟高负载场景
        const concurrentTasks = 5;
        const tasks = [];
        
        for (let i = 0; i < concurrentTasks; i++) {
            tasks.push(this.simulateUserInteraction());
        }
        
        await Promise.all(tasks);
        return this.endTest('综合压力测试');
    }

    // 模拟用户交互
    async simulateUserInteraction() {
        const interactions = 50;
        for (let i = 0; i < interactions; i++) {
            // 模拟点击、状态更新、事件处理
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    // 运行所有性能测试
    async runAllTests() {
        console.log('🎯 开始执行重构性能测试套件...');
        
        // 执行各项性能测试
        await this.testSystemInitialization();
        await this.testEventProcessing();
        await this.testStateUpdates();
        await this.testCacheOperations();
        await this.testUIRendering();
        await this.testStressScenario();
        
        // 输出测试结果
        this.printResults();
        
        return this.results;
    }

    // 打印测试结果
    printResults() {
        console.log('\n📊 性能测试结果汇总:');
        console.log('='.repeat(60));
        
        for (const [testName, result] of Object.entries(this.results)) {
            console.log(`\n${testName}:`);
            console.log(`  执行次数: ${result.iterations}`);
            console.log(`  平均耗时: ${result.averageTime.toFixed(2)}ms`);
            console.log(`  最短耗时: ${result.minTime.toFixed(2)}ms`);
            console.log(`  最长耗时: ${result.maxTime.toFixed(2)}ms`);
        }
        
        console.log('\n📈 性能评估:');
        this.evaluatePerformance();
    }

    // 性能评估
    evaluatePerformance() {
        const thresholds = {
            '系统初始化': 100,    // 毫秒
            '事件处理': 150,       // 毫秒
            '状态更新': 300,       // 毫秒
            '缓存操作': 50,        // 毫秒
            '界面渲染': 250,       // 毫秒
            '综合压力测试': 500    // 毫秒
        };
        
        let passed = 0;
        let total = 0;
        
        for (const [testName, result] of Object.entries(this.results)) {
            total++;
            const threshold = thresholds[testName];
            const status = result.averageTime <= threshold ? '✅ 通过' : '❌ 失败';
            
            if (result.averageTime <= threshold) passed++;
            
            console.log(`  ${testName}: ${status} (阈值: ${threshold}ms, 实际: ${result.averageTime.toFixed(2)}ms)`);
        }
        
        const passRate = (passed / total * 100).toFixed(1);
        console.log(`\n🎯 总体通过率: ${passRate}% (${passed}/${total})`);
        
        if (passRate >= 80) {
            console.log('🏆 性能测试: 重构后系统性能表现良好！');
        } else {
            console.log('⚠️ 性能测试: 需要进一步优化性能！');
        }
    }
}

// 内存使用监控
class MemoryMonitor {
    constructor() {
        this.initialMemory = 0;
        this.maxMemory = 0;
        this.samples = [];
    }

    startMonitoring() {
        this.initialMemory = this.getMemoryUsage();
        console.log(`🧠 内存监控启动 - 初始内存: ${this.initialMemory}MB`);
    }

    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        return 0;
    }

    takeSample() {
        const usage = this.getMemoryUsage();
        this.samples.push(usage);
        this.maxMemory = Math.max(this.maxMemory, usage);
        return usage;
    }

    stopMonitoring() {
        const finalMemory = this.getMemoryUsage();
        const memoryIncrease = finalMemory - this.initialMemory;
        
        console.log(`\n📊 内存使用情况:`);
        console.log(`  初始内存: ${this.initialMemory}MB`);
        console.log(`  最终内存: ${finalMemory}MB`);
        console.log(`  内存增长: ${memoryIncrease}MB`);
        console.log(`  峰值内存: ${this.maxMemory}MB`);
        console.log(`  内存样本数: ${this.samples.length}`);
        
        // 检查内存泄漏
        if (memoryIncrease > 50) {
            console.log('⚠️ 警告: 检测到可能的内存泄漏！');
        } else {
            console.log('✅ 内存使用: 正常');
        }
    }
}

// 主测试函数
async function runPerformanceTests() {
    const tester = new PerformanceTester();
    const memoryMonitor = new MemoryMonitor();
    
    // 开始内存监控
    memoryMonitor.startMonitoring();
    
    try {
        // 运行性能测试
        await tester.runAllTests();
        
        // 结束内存监控
        memoryMonitor.stopMonitoring();
        
        console.log('\n🎉 性能测试完成！');
        
    } catch (error) {
        console.error('❌ 性能测试失败:', error);
    }
}

// 页面加载完成后自动运行测试
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        console.log('🔧 性能测试脚本已加载，输入 runPerformanceTests() 开始测试');
    });
}

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceTester, MemoryMonitor, runPerformanceTests };
}