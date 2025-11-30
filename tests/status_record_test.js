// 状态记录机制测试脚本
console.log("=== 状态记录机制测试开始 ===");

// 测试辅助函数
function runTest(testName, testFunction) {
    console.log(`\n[测试] ${testName}`);
    try {
        testFunction();
        console.log("✓ 测试通过");
        return true;
    } catch (error) {
        console.error("✗ 测试失败:", error);
        return false;
    }
}

// 测试1: 验证新存档标志设置和清除功能
runTest("新存档标志基本功能", function() {
    // 模拟saveManager对象进行测试
    const testSaveManager = {
        NEW_SAVE_FLAG: "evolution_simulator_new_save_test",
        setNewSaveFlag: function() {
            localStorage.setItem(this.NEW_SAVE_FLAG, 'true');
        },
        clearNewSaveFlag: function() {
            localStorage.removeItem(this.NEW_SAVE_FLAG);
        },
        isNewSave: function() {
            return localStorage.getItem(this.NEW_SAVE_FLAG) === 'true';
        }
    };
    
    // 设置新存档标志
    testSaveManager.setNewSaveFlag();
    if (!testSaveManager.isNewSave()) {
        throw new Error("设置新存档标志后，isNewSave()应返回true");
    }
    
    // 清除新存档标志
    testSaveManager.clearNewSaveFlag();
    if (testSaveManager.isNewSave()) {
        throw new Error("清除新存档标志后，isNewSave()应返回false");
    }
    
    // 清理测试数据
    localStorage.removeItem(testSaveManager.NEW_SAVE_FLAG);
});

// 测试2: 验证控制台解锁状态与新存档标志的组合逻辑
runTest("控制台解锁状态与新存档标志组合逻辑", function() {
    // 模拟测试场景
    const testScenarios = [
        { consoleUnlocked: true, newSave: false, shouldSkipCounting: true },
        { consoleUnlocked: true, newSave: true, shouldSkipCounting: false },
        { consoleUnlocked: false, newSave: false, shouldSkipCounting: false },
        { consoleUnlocked: false, newSave: true, shouldSkipCounting: false }
    ];
    
    testScenarios.forEach((scenario, index) => {
        // 设置测试状态
        if (scenario.consoleUnlocked) {
            localStorage.setItem('console_unlocked_test', 'true');
        } else {
            localStorage.removeItem('console_unlocked_test');
        }
        
        if (scenario.newSave) {
            localStorage.setItem('new_save_flag_test', 'true');
        } else {
            localStorage.removeItem('new_save_flag_test');
        }
        
        // 模拟条件判断
        const isConsoleUnlocked = localStorage.getItem('console_unlocked_test') === 'true';
        const isNewSave = localStorage.getItem('new_save_flag_test') === 'true';
        const shouldSkipCounting = isConsoleUnlocked && !isNewSave;
        
        // 验证结果
        if (shouldSkipCounting !== scenario.shouldSkipCounting) {
            throw new Error(`场景${index + 1}测试失败: 预期${scenario.shouldSkipCounting}，实际${shouldSkipCounting}`);
        }
    });
    
    // 清理测试数据
    localStorage.removeItem('console_unlocked_test');
    localStorage.removeItem('new_save_flag_test');
});

console.log("\n=== 状态记录机制测试完成 ===");

// 在实际环境中使用的建议:
/*
1. 为了完全测试，请在浏览器控制台中运行此脚本
2. 测试不同场景:
   - 首次启动（新存档）
   - 解锁控制台后刷新页面
   - 解锁控制台后加载存档
   - 解锁控制台后创建新存档
*/
