// 首次访问缓存加载测试脚本

// 模拟SaveManager相关方法
const mockSaveManager = {
    FIRST_VISIT_KEY: 'evolution_simulator_first_visit',
    NEW_SAVE_FLAG: 'evolution_simulator_new_save',
    AUTO_SAVE_KEY: 'evolution_simulator_auto_save',
    SAVE_VERSION: '1.0',
    
    // 模拟setNewSaveFlag方法
    setNewSaveFlag() {
        localStorage.setItem(this.NEW_SAVE_FLAG, 'true');
        console.log('已设置新存档标志');
    },
    
    // 模拟clearNewSaveFlag方法
    clearNewSaveFlag() {
        localStorage.removeItem(this.NEW_SAVE_FLAG);
        console.log('已清除新存档标志');
    },
    
    // 模拟isNewSave方法
    isNewSave() {
        return localStorage.getItem(this.NEW_SAVE_FLAG) === 'true';
    },
    
    // 模拟checkAutoSave方法（包含首次访问逻辑）
    checkAutoSave() {
        try {
            // 检查是否是首次访问
            const isFirstVisit = !localStorage.getItem(this.FIRST_VISIT_KEY);
            if (isFirstVisit) {
                console.log("检测到首次访问，跳过自动存档加载询问");
                localStorage.setItem(this.FIRST_VISIT_KEY, 'false');
                this.setNewSaveFlag();
                return {
                    result: 'skip',
                    reason: 'first_visit'
                };
            }
            
            // 检查是否是新存档
            if (this.isNewSave()) {
                console.log("检测到新存档标志，跳过自动存档加载询问");
                return {
                    result: 'skip',
                    reason: 'new_save'
                };
            }
            
            // 检查自动存档
            const autoSaveData = localStorage.getItem(this.AUTO_SAVE_KEY);
            if (autoSaveData) {
                console.log("检测到自动存档");
                return {
                    result: 'ask',
                    reason: 'has_auto_save'
                };
            } else {
                // 没有自动存档
                this.setNewSaveFlag();
                return {
                    result: 'new_save',
                    reason: 'no_auto_save'
                };
            }
        } catch (error) {
            console.error("检查自动保存失败:", error);
            this.setNewSaveFlag();
            return {
                result: 'error',
                error: error
            };
        }
    },
    
    // 清除所有测试相关的localStorage项
    clearAllTestData() {
        localStorage.removeItem(this.FIRST_VISIT_KEY);
        localStorage.removeItem(this.NEW_SAVE_FLAG);
        localStorage.removeItem(this.AUTO_SAVE_KEY);
        console.log('已清除所有测试数据');
    }
};

// 测试用例1: 首次访问（没有任何存储数据）
function testFirstVisit() {
    console.log('\n=== 测试用例1: 首次访问 ===');
    mockSaveManager.clearAllTestData();
    
    const result = mockSaveManager.checkAutoSave();
    console.log('测试结果:', result);
    
    // 验证结果
    const isFirstVisitSet = localStorage.getItem(mockSaveManager.FIRST_VISIT_KEY) === 'false';
    const isNewSaveSet = localStorage.getItem(mockSaveManager.NEW_SAVE_FLAG) === 'true';
    
    console.log('首次访问标志已设置:', isFirstVisitSet);
    console.log('新存档标志已设置:', isNewSaveSet);
    console.log('测试通过:', result.result === 'skip' && result.reason === 'first_visit' && isFirstVisitSet && isNewSaveSet);
}

// 测试用例2: 非首次访问但有自动存档
function testSubsequentVisitWithAutoSave() {
    console.log('\n=== 测试用例2: 非首次访问但有自动存档 ===');
    mockSaveManager.clearAllTestData();
    
    // 模拟非首次访问
    localStorage.setItem(mockSaveManager.FIRST_VISIT_KEY, 'false');
    
    // 创建自动存档
    const mockAutoSave = JSON.stringify({
        version: mockSaveManager.SAVE_VERSION,
        data: 'test_data'
    });
    localStorage.setItem(mockSaveManager.AUTO_SAVE_KEY, mockAutoSave);
    
    const result = mockSaveManager.checkAutoSave();
    console.log('测试结果:', result);
    
    // 验证结果
    console.log('测试通过:', result.result === 'ask' && result.reason === 'has_auto_save');
}

// 测试用例3: 重置首次访问状态
function testResetFirstVisitState() {
    console.log('\n=== 测试用例3: 重置首次访问状态 ===');
    mockSaveManager.clearAllTestData();
    
    // 模拟已访问过
    localStorage.setItem(mockSaveManager.FIRST_VISIT_KEY, 'false');
    localStorage.setItem(mockSaveManager.NEW_SAVE_FLAG, 'false');
    
    // 重置首次访问状态
    localStorage.removeItem(mockSaveManager.FIRST_VISIT_KEY);
    
    const result = mockSaveManager.checkAutoSave();
    console.log('测试结果:', result);
    
    // 验证结果
    const isFirstVisitSet = localStorage.getItem(mockSaveManager.FIRST_VISIT_KEY) === 'false';
    const isNewSaveSet = localStorage.getItem(mockSaveManager.NEW_SAVE_FLAG) === 'true';
    
    console.log('首次访问标志已设置:', isFirstVisitSet);
    console.log('新存档标志已设置:', isNewSaveSet);
    console.log('测试通过:', result.result === 'skip' && result.reason === 'first_visit' && isFirstVisitSet && isNewSaveSet);
}

// 运行所有测试
function runAllTests() {
    console.log('开始执行首次访问缓存加载测试...');
    
    testFirstVisit();
    testSubsequentVisitWithAutoSave();
    testResetFirstVisitState();
    
    // 清理测试数据
    mockSaveManager.clearAllTestData();
    console.log('\n所有测试执行完毕！');
}

// 提供手动运行测试的接口
window.runFirstVisitTests = runAllTests;

// 自动运行测试（如果直接在浏览器中打开）
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('首次访问测试脚本已加载');
        // 不自动运行测试，需要手动调用runFirstVisitTests()
    });
} else {
    // 在Node.js环境中自动运行
    runAllTests();
}

// 使用说明：
// 1. 在浏览器控制台中执行: runFirstVisitTests()
// 2. 查看测试结果输出
// 3. 注意：运行测试会清除相关的localStorage数据