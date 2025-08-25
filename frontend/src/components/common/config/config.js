// 写作模块配置文件
class WritingConfig {
    constructor() {
        // 根据环境自动检测模式
        this.environment = this.detectEnvironment();
        
        // 配置选项
        this.config = {
            // 开发模式配置
            development: {
                enableBackendAPI: false,          // 是否启用后端API
                apiBaseURL: 'http://localhost:3000',
                apiTimeout: 5000,
                enableMockData: true,             // 是否使用模拟数据
                enableConsoleLogging: true,       // 是否启用控制台日志
                showDataSource: true,             // 是否显示数据来源指示器
                autoSaveInterval: 2000,           // 自动保存间隔(毫秒)
                enableDebugMode: true             // 是否启用调试模式
            },
            
            // 测试模式配置
            testing: {
                enableBackendAPI: false,          // 测试阶段先使用默认界面
                apiBaseURL: 'http://localhost:3000',
                apiTimeout: 3000,
                enableMockData: true,
                enableConsoleLogging: true,
                showDataSource: true,
                autoSaveInterval: 1000,
                enableDebugMode: true
            },
            
            // 生产模式配置
            production: {
                enableBackendAPI: true,           // 生产环境启用API
                apiBaseURL: 'https://api.yourapp.com',
                apiTimeout: 10000,
                enableMockData: false,            // 生产环境不使用模拟数据
                enableConsoleLogging: false,      // 生产环境关闭详细日志
                showDataSource: false,            // 生产环境不显示数据来源
                autoSaveInterval: 5000,
                enableDebugMode: false
            }
        };
    }

    detectEnvironment() {
        // 检测当前环境
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 本地开发环境
            if (port === '3000' || port === '8080') {
                return 'development';
            }
            return 'testing';
        } else if (hostname.includes('test') || hostname.includes('staging')) {
            return 'testing';
        } else {
            return 'production';
        }
    }

    get(key) {
        return this.config[this.environment][key];
    }

    set(key, value) {
        this.config[this.environment][key] = value;
    }

    getCurrentEnvironment() {
        return this.environment;
    }

    setEnvironment(env) {
        if (this.config[env]) {
            this.environment = env;
        }
    }

    getAllConfig() {
        return this.config[this.environment];
    }

    // 手动切换模式的方法（用于测试）
    switchToTestingMode() {
        this.environment = 'testing';
        console.log('🔄 已切换到测试模式');
        return this.getAllConfig();
    }

    switchToProductionMode() {
        this.environment = 'production';
        console.log('🚀 已切换到生产模式');
        return this.getAllConfig();
    }

    switchToDevelopmentMode() {
        this.environment = 'development';
        console.log('🛠️ 已切换到开发模式');
        return this.getAllConfig();
    }

    // 日志方法
    log(message, type = 'info') {
        if (this.get('enableConsoleLogging')) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}] [写作模块]`;
            
            switch (type) {
                case 'error':
                    console.error(`${prefix} ❌`, message);
                    break;
                case 'warn':
                    console.warn(`${prefix} ⚠️`, message);
                    break;
                case 'success':
                    console.log(`${prefix} ✅`, message);
                    break;
                default:
                    console.log(`${prefix} ℹ️`, message);
            }
        }
    }

    // 获取API相关配置
    getAPIConfig() {
        return {
            baseURL: this.get('apiBaseURL'),
            timeout: this.get('apiTimeout'),
            enabled: this.get('enableBackendAPI')
        };
    }

    // 获取UI相关配置
    getUIConfig() {
        return {
            showDataSource: this.get('showDataSource'),
            autoSaveInterval: this.get('autoSaveInterval'),
            enableDebugMode: this.get('enableDebugMode')
        };
    }
}

// 创建全局配置实例
window.WritingConfig = new WritingConfig();

// 导出配置对象供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WritingConfig;
}

// 在控制台提供配置操作方法
window.switchWritingMode = {
    testing: () => window.WritingConfig.switchToTestingMode(),
    production: () => window.WritingConfig.switchToProductionMode(),
    development: () => window.WritingConfig.switchToDevelopmentMode(),
    current: () => {
        console.log(`当前模式: ${window.WritingConfig.getCurrentEnvironment()}`);
        console.log('当前配置:', window.WritingConfig.getAllConfig());
        return window.WritingConfig.getAllConfig();
    }
};

// 输出当前配置信息
console.log(`🎯 写作模块配置初始化完成，当前环境: ${window.WritingConfig.getCurrentEnvironment()}`);
console.log('💡 可以使用以下命令切换模式:');
console.log('- switchWritingMode.testing() - 切换到测试模式');
console.log('- switchWritingMode.production() - 切换到生产模式');
console.log('- switchWritingMode.development() - 切换到开发模式');
console.log('- switchWritingMode.current() - 查看当前配置');
