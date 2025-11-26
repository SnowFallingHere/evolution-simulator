// 事件系统类
class EventSystem extends CoreSystem {
    constructor() {
        super();
        this.randomEvents = {
            injury: { active: false, duration: 0, severity: 0 },
            poison: { active: false, duration: 0, severity: 0 },
            suffocation: { active: false, duration: 0, severity: 0 }
        };
        
        this.init();
    }
    
    init() {
        this.startEventUpdates();
    }
    
    startEventUpdates() {
        const timer = setInterval(() => {
            this.updateRandomEvents();
        }, 2000);
        this.timers.push(timer);
    }
    
    updateRandomEvents() {
        // 处理活跃事件的效果
        if (this.randomEvents.injury.active) {
            this.randomEvents.injury.duration--;
            
            if (window.stateSystem) {
                window.stateSystem.hunger += 0.8 * this.randomEvents.injury.severity;
                window.stateSystem.mentalHealth -= 0.5 * this.randomEvents.injury.severity;
                window.stateSystem.updateUI();
            }
            
            if (this.randomEvents.injury.duration <= 0) {
                this.randomEvents.injury.active = false;
                if (window.evolutionSystem) {
                    window.evolutionSystem.addDailyActivity("受伤状态已恢复");
                }
            }
        }
        
        if (this.randomEvents.poison.active) {
            this.randomEvents.poison.duration--;
            
            if (window.stateSystem) {
                window.stateSystem.disease += 1 * this.randomEvents.poison.severity;
                window.stateSystem.hunger += 0.3 * this.randomEvents.poison.severity;
                window.stateSystem.updateUI();
            }
            
            if (this.randomEvents.poison.duration <= 0) {
                this.randomEvents.poison.active = false;
                if (window.evolutionSystem) {
                    window.evolutionSystem.addDailyActivity("毒素已清除");
                }
            }
        }
        
        if (this.randomEvents.suffocation.active) {
            this.randomEvents.suffocation.duration--;
            
            if (window.stateSystem) {
                window.stateSystem.mentalHealth -= 1 * this.randomEvents.suffocation.severity;
                window.stateSystem.hunger += 0.5 * this.randomEvents.suffocation.severity;
                window.stateSystem.updateUI();
            }
            
            if (this.randomEvents.suffocation.duration <= 0) {
                this.randomEvents.suffocation.active = false;
                if (window.evolutionSystem) {
                    window.evolutionSystem.addDailyActivity("窒息感已缓解");
                }
            }
        }
        
        // 随机触发新事件（概率随等级降低）- 降低窒息事件概率
        const evolutionLevel = window.evolutionSystem ? window.evolutionSystem.getEvolutionLevel() : 0;
        const suffocationChance = 0.005 * (1 - evolutionLevel / 200); // 从0.01降低到0.005
        
        if (Math.random() < suffocationChance && !this.randomEvents.suffocation.active) {
            this.triggerSuffocation();
        }
    }
    
    triggerInjury(severity = 1) {
        this.randomEvents.injury.active = true;
        this.randomEvents.injury.duration = 5 + Math.floor(Math.random() * 10);
        this.randomEvents.injury.severity = severity;
        
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity(`受伤了！将持续${this.randomEvents.injury.duration}个周期`);
            window.evolutionSystem.addKeyEvent("受伤：饥饿值增加，心理健康值下降");
        }
    }
    
    triggerPoison(severity = 1) {
        this.randomEvents.poison.active = true;
        this.randomEvents.poison.duration = 3 + Math.floor(Math.random() * 7);
        this.randomEvents.poison.severity = severity;
        
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity(`中毒了！将持续${this.randomEvents.poison.duration}个周期`);
            window.evolutionSystem.addKeyEvent("中毒：疾病值增加，饥饿值略微增加");
        }
    }
    
    triggerSuffocation() {
        this.randomEvents.suffocation.active = true;
        this.randomEvents.suffocation.duration = 2 + Math.floor(Math.random() * 5);
        this.randomEvents.suffocation.severity = 1;
        
        if (window.evolutionSystem) {
            window.evolutionSystem.addDailyActivity(`感到窒息！将持续${this.randomEvents.suffocation.duration}个周期`);
            window.evolutionSystem.addKeyEvent("窒息：心理健康值下降，饥饿值增加");
        }
    }
}