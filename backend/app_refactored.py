#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI语文学习助手 - 后台管理系统 (重构版)
使用应用工厂模式和模块化结构
"""
import os
from flask import Flask
from config import get_config
from extensions import init_extensions
from routes.auth import auth_bp
from routes.content import content_api_bp, content_page_bp
from routes.ai import ai_bp
from routes.teacher import teacher_bp
from routes.student import student_bp
from routes.admin import admin_bp

def create_app(config_name=None):
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 配置应用
    if config_name:
        app.config.from_object(config_name)
    else:
        app.config.from_object(get_config())
    
    # 设置数据库URI
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DATABASE_URL']
    
    # 初始化扩展
    init_extensions(app)
    
    # 注册蓝图
    app.register_blueprint(auth_bp)
    app.register_blueprint(content_api_bp)
    app.register_blueprint(content_page_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    
    # 注册其他蓝图（如果有的话）
    # app.register_blueprint(course_bp)
    # app.register_blueprint(reading_bp)
    # app.register_blueprint(admin_bp)
    
    # 创建数据库表
    with app.app_context():
        from extensions import db
        db.create_all()
    
    return app

def init_sample_data():
    """初始化示例数据"""
    from extensions import db
    from models import StudyModule, User, UserModulePermission, CourseBooking
    from datetime import datetime
    
    # 检查是否已有数据
    if StudyModule.query.count() > 0:
        return
    
    # 扩展的学习模块结构 - 16个细分模块，匹配前端默认内容
    main_modules = [
        # 基础能力训练 (4个)
        {'module_id': 'word-foundation', 'title': '字词基础', 'description': '巩固汉字词汇基础知识', 'icon': '📝', 'category': 'basic', 'difficulty': 1},
        {'module_id': 'grammar-rules', 'title': '语音规范', 'description': '标准普通话语音训练', 'icon': '🎵', 'category': 'basic', 'difficulty': 1},
        {'module_id': 'grammar-foundation', 'title': '修辞基础', 'description': '学习基本修辞方法', 'icon': '🎨', 'category': 'basic', 'difficulty': 2},
        {'module_id': 'classical-foundation', 'title': '古文基础', 'description': '文言文基础知识学习', 'icon': '🏛️', 'category': 'basic', 'difficulty': 2},
        
        # 阅读理解训练 (9个)
        {'module_id': 'modern-text', 'title': '现代文', 'description': '现代文阅读理解训练', 'icon': '📄', 'category': 'reading', 'difficulty': 2},
        {'module_id': 'narrative-text', 'title': '记叙文', 'description': '记叙文阅读与分析', 'icon': '📖', 'category': 'reading', 'difficulty': 2},
        {'module_id': 'novel', 'title': '小说', 'description': '小说作品阅读鉴赏', 'icon': '📚', 'category': 'reading', 'difficulty': 3},
        {'module_id': 'argumentative', 'title': '议论文', 'description': '议论文阅读理解', 'icon': '💭', 'category': 'reading', 'difficulty': 3},
        {'module_id': 'expository', 'title': '说明文', 'description': '说明文阅读训练', 'icon': '📊', 'category': 'reading', 'difficulty': 2},
        {'module_id': 'poetry', 'title': '诗', 'description': '诗歌鉴赏与理解', 'icon': '✒️', 'category': 'reading', 'difficulty': 3},
        {'module_id': 'prose', 'title': '词', 'description': '词作欣赏与分析', 'icon': '📜', 'category': 'reading', 'difficulty': 3},
        {'module_id': 'classical-prose', 'title': '文言文', 'description': '文言文阅读训练', 'icon': '🏮', 'category': 'reading', 'difficulty': 3},
        {'module_id': 'non-continuous', 'title': '非连续性文本阅读', 'description': '图表数据文本理解', 'icon': '📊', 'category': 'reading', 'difficulty': 2},
        
        # 写作表达训练 (3个)
        {'module_id': 'proposition-writing', 'title': '全命题作文', 'description': '全命题作文写作训练', 'icon': '📝', 'category': 'writing', 'difficulty': 2},
        {'module_id': 'semi-proposition', 'title': '半命题作文', 'description': '半命题作文写作指导', 'icon': '✏️', 'category': 'writing', 'difficulty': 2},
        {'module_id': 'ai-writing-assistant', 'title': 'AI写作助手', 'description': '智能写作辅导与建议', 'icon': '🤖', 'category': 'writing', 'difficulty': 1}
    ]
    
    # 添加主要模块
    for module_data in main_modules:
        module = StudyModule(**module_data)
        db.session.add(module)
    
    # 创建示例用户
    sample_users = [
        {'username': 'admin', 'nickname': '系统管理员', 'user_type': 'admin'},
        {'username': 'teacher1', 'nickname': '李老师', 'user_type': 'teacher'},
        {'username': 'teacher2', 'nickname': '王老师', 'user_type': 'teacher'},
        {'username': 'student1', 'nickname': '张小明', 'user_type': 'student'},
        {'username': 'student2', 'nickname': '王小红', 'user_type': 'student'}
    ]
    
    for user_data in sample_users:
        user = User(**user_data)
        db.session.add(user)
    
    db.session.commit()
    
    # 为示例学生分配权限
    student01 = User.query.filter_by(username='student1').first()
    student02 = User.query.filter_by(username='student2').first()
    admin_user = User.query.filter_by(username='admin').first()
    
    # 为student1分配基础权限
    basic_permissions = ['word-foundation', 'modern-text', 'proposition-writing', 'semi-proposition']
    for module_id in basic_permissions:
        permission = UserModulePermission(
            user_id=student01.id,
            module_id=module_id,
            granted_by=admin_user.id
        )
        db.session.add(permission)
    
    # 为student2分配更多权限
    extended_permissions = ['word-foundation', 'modern-text', 'classical-prose', 'proposition-writing', 'semi-proposition', 'ai-writing-assistant']
    for module_id in extended_permissions:
        permission = UserModulePermission(
            user_id=student02.id,
            module_id=module_id,
            granted_by=admin_user.id
        )
        db.session.add(permission)
    
    db.session.commit()
    
    # 创建示例课程预约
    teacher = User.query.filter_by(username='teacher1').first()
    
    # 为student1创建预约
    sample_bookings = [
        {
            'user_id': student01.id,
            'teacher_id': teacher.id,
            'course_title': '小学五年级阅读方法课',
            'course_type': '1对1辅导',
            'subject': '阅读理解专项',
            'scheduled_time': datetime(2025, 8, 15, 18, 0),  # 2025年8月15日 18:00
            'duration_minutes': 60,
            'description': '阅读理解方法训练，提升阅读技巧',
            'status': 'scheduled'
        },
        {
            'user_id': student02.id,
            'teacher_id': teacher.id,
            'course_title': '初中古诗文解析课',
            'course_type': '小班教学',
            'subject': '古诗文鉴赏',
            'scheduled_time': datetime(2025, 8, 18, 19, 30),  # 2025年8月18日 19:30
            'duration_minutes': 60,
            'description': '古诗文鉴赏技巧，文言文理解',
            'status': 'scheduled'
        }
    ]
    
    for booking_data in sample_bookings:
        booking = CourseBooking(**booking_data)
        db.session.add(booking)
    
    db.session.commit()
    print("示例数据初始化完成！")

if __name__ == '__main__':
    # 确保模板目录存在
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # 创建应用
    app = create_app()
    
    # 在应用上下文中初始化示例数据
    with app.app_context():
        init_sample_data()
    
    print("🚀 AI语文学习助手后台管理系统启动中...")
    print("📝 管理界面: http://localhost:5000")
    print("🔗 API接口: http://localhost:5000/api/study-modules")
    print("🔥 开发模式: 热重载已启用")
    
    # 启动Flask应用 - 开发模式配置
    app.run(
        debug=True,
        host='0.0.0.0', 
        port=5000,
        use_reloader=True,  # 启用自动重载
        use_debugger=True,  # 启用调试器
        threaded=True       # 支持多线程
    )
