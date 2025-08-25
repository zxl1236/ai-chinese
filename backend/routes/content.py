#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内容路由模块
包含学习模块、内容管理等API和页面
"""
from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash, abort
from services.content_service import ContentService
from services.ai_service import AIService

# 创建API蓝图
content_api_bp = Blueprint('content_api', __name__, url_prefix='/api')

# 创建页面蓝图
content_page_bp = Blueprint('content_page', __name__)

# ==================== API路由 ====================

@content_api_bp.route('/study-modules')
def get_study_modules():
    """获取学习模块API"""
    try:
        response = ContentService.get_study_modules()
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_api_bp.route('/user/<username>/study-content')
def get_user_study_content(username):
    """获取指定用户有权限访问的学习内容"""
    try:
        content = ContentService.get_user_study_content(username)
        return jsonify(content)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_api_bp.route('/module/<module_id>/content')
def get_module_content(module_id):
    """获取特定模块的详细内容"""
    try:
        content_list = ContentService.get_module_content(module_id)
        return jsonify(content_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_api_bp.route('/personalized-content/<module_id>', methods=['POST'])
def get_personalized_content(module_id):
    """获取个性化训练内容"""
    try:
        data = request.get_json()
        user_profile = data.get('userProfile', {})
        
        content = ContentService.get_personalized_content(module_id, user_profile)
        return jsonify(content)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_api_bp.route('/save-essay', methods=['POST'])
def save_essay():
    """保存用户作文"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        module_id = data.get('moduleId', 'free-writing')
        title = data.get('title', '无标题')
        content = data.get('content', '')
        word_count = data.get('wordCount', 0)
        
        if not user_id or not content.strip():
            return jsonify({'error': '用户ID和作文内容不能为空'}), 400
        
        # 简单的文件保存方式
        import os
        import json
        from datetime import datetime
        
        # 确保essays目录存在
        essays_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'essays')
        os.makedirs(essays_dir, exist_ok=True)
        
        # 生成文件名
        filename = f"essay_{user_id}_{module_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(essays_dir, filename)
        
        # 保存作文数据
        essay_data = {
            'user_id': user_id,
            'module_id': module_id,
            'title': title,
            'content': content,
            'word_count': word_count,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(essay_data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'message': '作文保存成功',
            'essay_file': filename,
            'word_count': word_count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI写作助手端点
@content_api_bp.route('/ai-writing-assistant', methods=['POST'])
def ai_writing_assistant():
    """AI写作助手API"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        writing_style = data.get('writingStyle', 'creative')
        target_length = data.get('targetLength', 500)
        
        if not prompt.strip():
            return jsonify({'error': '写作提示不能为空'}), 400
        
        # 调用AI服务
        ai_response = AIService.get_writing_assistance(prompt, writing_style, target_length)
        
        return jsonify({
            'success': True,
            'suggestions': ai_response.get('suggestions', []),
            'improvements': ai_response.get('improvements', []),
            'writing_tips': ai_response.get('writing_tips', [])
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== 页面路由 ====================

@content_page_bp.route('/')
def index():
    """首页 - 重定向到管理界面"""
    return redirect(url_for('content_page.admin_dashboard'))

@content_page_bp.route('/admin')
def admin_dashboard():
    """管理界面首页"""
    from models import StudyModule, StudyContent
    
    # 获取统计数据
    try:
        total_modules = StudyModule.query.count()
        active_modules = StudyModule.query.filter_by(is_active=True).count()
        total_contents = StudyContent.query.count()
        
        stats = {
            'total_modules': total_modules,
            'active_modules': active_modules,
            'total_contents': total_contents
        }
    except Exception as e:
        # 如果数据库查询失败，提供默认值
        stats = {
            'total_modules': 0,
            'active_modules': 0,
            'total_contents': 0
        }
    
    return render_template('dashboard.html', stats=stats)

@content_page_bp.route('/modules')
def list_modules():
    """学习模块管理页面"""
    from models import StudyModule
    
    try:
        # 获取所有学习模块
        modules = StudyModule.query.order_by(StudyModule.created_at.desc()).all()
    except Exception as e:
        # 如果数据库查询失败，提供空列表
        modules = []
    
    return render_template('modules.html', modules=modules)

@content_page_bp.route('/content/<module_id>')
def list_content(module_id):
    """内容管理页面"""
    from models import StudyModule, StudyContent
    
    try:
        # 获取指定模块
        module = StudyModule.query.filter_by(module_id=module_id).first()
        if not module:
            abort(404, description="模块不存在")
        
        # 获取该模块的所有内容
        contents = StudyContent.query.filter_by(module_id=module_id).order_by(StudyContent.order_index).all()
        
        return render_template('content.html', module=module, contents=contents)
    except Exception as e:
        # 如果数据库查询失败，返回错误页面
        abort(500, description=f"数据库查询失败: {str(e)}")

@content_page_bp.route('/users')
def list_users():
    """用户管理页面"""
    from models import User
    
    try:
        # 获取所有用户
        users = User.query.order_by(User.created_at.desc()).all()
    except Exception as e:
        # 如果数据库查询失败，提供空列表
        users = []
    
    return render_template('users.html', users=users)

@content_page_bp.route('/permissions')
def permissions_page():
    """权限管理页面"""
    return render_template('user_permissions.html')

@content_page_bp.route('/reading-articles')
def list_reading_articles():
    """阅读文章管理页面"""
    return render_template('reading_articles.html')

@content_page_bp.route('/add-module')
def add_module():
    """添加模块页面"""
    return render_template('add_module.html')

@content_page_bp.route('/edit-module/<module_id>')
def edit_module(module_id):
    """编辑模块页面"""
    return render_template('edit_module.html')

@content_page_bp.route('/delete-module/<module_id>', methods=['POST'])
def delete_module(module_id):
    """删除模块"""
    # TODO: 实现删除逻辑
    flash('模块删除功能待实现', 'info')
    return redirect(url_for('content_page.list_modules'))

@content_page_bp.route('/add-content/<module_id>')
def add_content(module_id):
    """添加内容页面"""
    return render_template('add_content.html')

@content_page_bp.route('/edit-content/<int:content_id>')
def edit_content(content_id):
    """编辑内容页面"""
    return render_template('edit_content.html')

@content_page_bp.route('/delete-content/<int:content_id>', methods=['POST'])
def delete_content(content_id):
    """删除内容"""
    # TODO: 实现删除逻辑
    flash('内容删除功能待实现', 'info')
    return redirect(url_for('content_page.list_content'))

@content_page_bp.route('/add-user')
def add_user():
    """添加用户页面"""
    return render_template('add_user.html')

@content_page_bp.route('/manage-user-permissions/<int:user_id>')
def manage_user_permissions(user_id):
    """管理用户权限页面"""
    return render_template('user_permissions.html')

@content_page_bp.route('/add-reading-article')
def add_reading_article():
    """添加阅读文章页面"""
    return render_template('add_reading_article.html')

@content_page_bp.route('/view-reading-article/<int:article_id>')
def view_reading_article(article_id):
    """查看阅读文章页面"""
    return render_template('view_reading_article.html')

@content_page_bp.route('/edit-reading-article/<int:article_id>')
def edit_reading_article(article_id):
    """编辑阅读文章页面"""
    return render_template('edit_reading_article.html')

@content_page_bp.route('/toggle-reading-article/<int:article_id>', methods=['POST'])
def toggle_reading_article(article_id):
    """切换阅读文章状态"""
    # TODO: 实现状态切换逻辑
    flash('文章状态切换功能待实现', 'info')
    return redirect(url_for('content_page.list_reading_articles'))
