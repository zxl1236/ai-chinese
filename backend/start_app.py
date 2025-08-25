#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动AI语文学习助手后台管理系统
"""
import os
import sys

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """主函数"""
    try:
        from app_refactored import create_app
        
        # 创建应用
        app = create_app()
        
        print("🚀 AI语文学习助手后台管理系统启动中...")
        print("📝 管理界面: http://localhost:5000/admin")
        print("🔗 API接口: http://localhost:5000/api/study-modules")
        print("🔥 开发模式: 热重载已启用")
        
        # 启动Flask应用
        app.run(
            debug=True,
            host='0.0.0.0', 
            port=5000,
            use_reloader=True,
            use_debugger=True,
            threaded=True
        )
        
    except ImportError as e:
        print(f"❌ 导入错误: {e}")
        print("请确保所有依赖已安装: pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
