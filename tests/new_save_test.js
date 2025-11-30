// 新存档标志测试脚本
console.log("=== 新存档标志功能测试开始 ===");

// 测试新存档标志在缓存加载中的行为
function testNewSaveFlag() {
    console.log("\n[测试场景] 模拟新存档和自动加载流程");
    
    // 模拟SaveManager的相关方法
    const mockSaveManager = {
        NEW_SAVE_FLAG: "evolution_simulator_new_save_test",
        AUTO_SAVE_KEY: "evolution_simulator_auto_save_test",
        SAVE_VERSION: "1.0.0",
        
        setNewSaveFlag: function() {
            localStorage.setItem(this.NEW_SAVE_FLAG, 'true');
            console.log("✓ 设置新存档标志");
        },
        
        clearNewSaveFlag: function() {
            localStorage.removeItem(this.NEW_SAVE_FLAG);
            console.log("✓ 清除新存档标志");
        },
        
        isNewSave: function() {
            return localStorage.getItem(this.NEW_SAVE_FLAG) === 'true';
        },
        
        // 模拟checkAutoSave函数的逻辑
        checkAutoSave: function() {
            console.log("\n执行checkAutoSave逻辑...");
            
            // 检查是否是新存档
            if (this.isNewSave()) {
                console.log("✓ 检测到新存档标志，跳过自动存档加载询问");
                return true; // 返回true表示跳过了询问
            }
            
            // 模拟有自动存档的情况
            const hasAutoSave = localStorage.getItem(this.AUTO_SAVE_KEY) !== null;
            if (hasAutoSave) {
                console.log("⚠️ 检测到自动存档，正常情况下会弹出询问");
                return false; // 返回false表示会显示询问
            }
            
            console.log("✓ 没有自动存档，设置新存档标志");
            return true;
        }
    };
    
    // 测试场景1: 没有新存档标志，没有自动存档
    console.log("\n测试场景1: 没有新存档标志，没有自动存档");
    mockSaveManager.clearNewSaveFlag();
    localStorage.removeItem(mockSaveManager.AUTO_SAVE_KEY);
    mockSaveManager.checkAutoSave();
    
    // 测试场景2: 设置了新存档标志
    console.log("\n测试场景2: 设置了新存档标志");
    mockSaveManager.setNewSaveFlag();
    // 创建模拟的自动存档数据
    localStorage.setItem(mockSaveManager.AUTO_SAVE_KEY, JSON.stringify({version: mockSaveManager.SAVE_VERSION}));
    const skipped = mockSaveManager.checkAutoSave();
    console.log(skipped ? "✓ 预期行为：成功跳过询问" : "⚠️ 意外行为：没有跳过询问");
    
    // 测试场景3: 清除新存档标志，有自动存档
    console.log("\n测试场景3: 清除新存档标志，有自动存档");
    mockSaveManager.clearNewSaveFlag();
    mockSaveManager.checkAutoSave();
    
    // 清理测试数据
    console.log("\n清理测试数据...");
    mockSaveManager.clearNewSaveFlag();
    localStorage.removeItem(mockSaveManager.AUTO_SAVE_KEY);
    console.log("✓ 测试数据已清理");
    
    console.log("\n=== 新存档标志功能测试完成 ===");
}

// 运行测试
testNewSaveFlag();
