#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一学习系统主应用
集成学员端学习模块和陪练端上课界面
"""

from flask import Flask, render_template, request
from flask_socketio import SocketIO
from flask_cors import CORS
import logging
from datetime import datetime

# 导入现有模块
from extensions import db
from models import *
from config import Config

# 导入路由模块
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.teacher import teacher_bp
from routes.student import student_bp
from routes.ai import ai_bp
from routes.content import content_bp

# 导入新的统一系统模块
from routes.content_permission import content_permission_bp
from services.sync_service import init_sync_service

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_unified_app(config_class=Config):
    """创建统一学习应用"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # 初始化扩展
    db.init_app(app)
    
    # 配置CORS，允许跨域请求
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",  # 本地开发
                "https://ai-chinese.netlify.app",  # 生产前端地址
                "https://*.netlify.app"  # 其他netlify预览地址
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        },
        r"/socket.io/*": {"origins": "*"}
    })
    
    # 初始化SocketIO
    socketio = SocketIO(
        app, 
        cors_allowed_origins="*",
        async_mode='threading',
        logger=True,
        engineio_logger=True
    )
    
    # 初始化同步服务
    sync_service = init_sync_service(socketio)
    logger.info("同步服务初始化完成")
    
    # 注册蓝图
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(content_permission_bp)  # 新增权限管理
    
    logger.info("所有路由蓝图注册完成")
    
    # 创建数据库表
    with app.app_context():
        try:
            db.create_all()
            logger.info("数据库表创建完成")
            
            # 初始化默认数据
            init_default_data()
            
        except Exception as e:
            logger.error(f"数据库初始化失败: {e}")
    
    # 添加统一系统的路由
    @app.route('/')
    def index():
        """主页路由"""
        return render_template('unified_index.html')
    
    @app.route('/unified-learning')
    def unified_learning():
        """统一学习界面路由"""
        return render_template('unified_learning.html')
    
    @app.route('/api/system/status')
    def system_status():
        """系统状态检查"""
        try:
            # 检查数据库连接
            db.session.execute('SELECT 1')
            db_status = 'connected'
        except:
            db_status = 'disconnected'
        
        # 检查同步服务状态
        sync_status = 'active' if sync_service else 'inactive'
        
        # 获取活跃会话数
        active_sessions = len(sync_service.get_active_sessions()) if sync_service else 0
        
        return {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'status': {
                'database': db_status,
                'sync_service': sync_status,
                'active_sessions': active_sessions,
                'websocket': 'enabled'
            }
        }
    
    @app.route('/api/unified/config')
    def get_unified_config():
        """获取统一系统配置"""
        return {
            'success': True,
            'config': {
                'websocket_url': 'http://localhost:5000',
                'sync_enabled': True,
                'annotation_types': ['highlight', 'note', 'comment', 'question'],
                'supported_modes': ['learning', 'tutoring'],
                'max_concurrent_users': 100,
                'auto_save_interval': 30  # 秒
            }
        }
    
    # WebSocket事件处理（已在sync_service中定义）
    logger.info("WebSocket事件处理器已注册")
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return {'error': '页面未找到'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"内部服务器错误: {error}")
        return {'error': '内部服务器错误'}, 500
    
    # 在应用上下文中存储socketio实例，供其他模块使用
    app.socketio = socketio
    app.sync_service = sync_service
    
    return app, socketio

def init_default_data():
    """初始化默认数据"""
    try:
        # 检查是否已有管理员用户
        admin_user = User.query.filter_by(user_type='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                nickname='系统管理员',
                user_type='admin',
                is_active=True
            )
            db.session.add(admin_user)
            logger.info("创建默认管理员用户")
        
        # 初始化默认学习模块
        default_modules = [
            # 基础能力训练模块
            {'module_id': 'basic-pinyin', 'title': '拼音基础', 'description': '学习汉语拼音基础知识', 'icon': '🔤', 'category': 'basic', 'difficulty': 1},
            {'module_id': 'basic-characters', 'title': '汉字认读', 'description': '认识常用汉字', 'icon': '📝', 'category': 'basic', 'difficulty': 1},
            {'module_id': 'basic-vocabulary', 'title': '词汇积累', 'description': '扩展词汇量', 'icon': '📚', 'category': 'basic', 'difficulty': 2},
            {'module_id': 'basic-grammar', 'title': '语法基础', 'description': '掌握基本语法规则', 'icon': '🔧', 'category': 'basic', 'difficulty': 2},
            
            # 阅读理解训练模块
            {'module_id': 'reading-modern', 'title': '现代文阅读', 'description': '现代文章阅读理解', 'icon': '📖', 'category': 'reading', 'difficulty': 2},
            {'module_id': 'reading-classical', 'title': '古诗文阅读', 'description': '古典文学作品阅读', 'icon': '📜', 'category': 'reading', 'difficulty': 3},
            {'module_id': 'reading-comprehension', 'title': '阅读理解技巧', 'description': '提升阅读理解能力', 'icon': '🎯', 'category': 'reading', 'difficulty': 2},
            {'module_id': 'reading-speed', 'title': '快速阅读', 'description': '提高阅读速度和效率', 'icon': '⚡', 'category': 'reading', 'difficulty': 3},
            
            # 写作表达训练模块
            {'module_id': 'writing-basic', 'title': '写作基础', 'description': '掌握基本写作技巧', 'icon': '✍️', 'category': 'writing', 'difficulty': 2},
            {'module_id': 'writing-narrative', 'title': '记叙文写作', 'description': '学习记叙文写作方法', 'icon': '📔', 'category': 'writing', 'difficulty': 2},
            {'module_id': 'writing-argumentative', 'title': '议论文写作', 'description': '掌握议论文写作技巧', 'icon': '💭', 'category': 'writing', 'difficulty': 3},
            {'module_id': 'writing-creative', 'title': '创意写作', 'description': '培养创意写作能力', 'icon': '🎨', 'category': 'writing', 'difficulty': 3}
        ]
        
        for module_data in default_modules:
            existing_module = StudyModule.query.get(module_data['module_id'])
            if not existing_module:
                module = StudyModule(**module_data)
                db.session.add(module)
        
        logger.info("初始化默认学习模块")
        
        # 提交所有更改
        db.session.commit()
        logger.info("默认数据初始化完成")
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"初始化默认数据失败: {e}")

if __name__ == '__main__':
    # 创建应用
    app, socketio = create_unified_app()
    
    # 启动应用
    logger.info("启动统一学习系统...")
    logger.info("访问地址: http://localhost:5000")
    logger.info("统一学习界面: http://localhost:5000/unified-learning")
    
    # 使用SocketIO运行应用
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False  # 避免SocketIO的重载问题
    )
