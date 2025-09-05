#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内容权限管理API路由
处理学生个性化学习内容的权限分配和管理
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import db
from models import User, StudyModule, StudyContent, UserModulePermission

# 创建内容权限蓝图
content_permission_bp = Blueprint('content_permission', __name__, url_prefix='/api/content-permission')

# ==================== 权限管理API ====================

@content_permission_bp.route('/student/<int:student_id>/modules', methods=['GET'])
def get_student_modules(student_id):
    """获取学生可访问的学习模块"""
    try:
        # 验证学生是否存在
        student = User.query.get_or_404(student_id)
        if student.user_type != 'student':
            return jsonify({'error': '用户不是学生'}), 400
        
        # 获取学生的模块权限
        permissions = UserModulePermission.query.filter_by(user_id=student_id).all()
        permitted_module_ids = [p.module_id for p in permissions]
        
        # 获取所有活跃的学习模块
        all_modules = StudyModule.query.filter_by(is_active=True).all()
        
        # 按分类组织模块
        categorized_modules = {
            'basicTraining': [],
            'readingTraining': [],
            'writingTraining': []
        }
        
        for module in all_modules:
            # 检查学生是否有权限访问该模块
            has_permission = module.module_id in permitted_module_ids
            
            module_data = {
                'id': module.module_id,
                'title': module.title,
                'description': module.description,
                'icon': module.icon,
                'category': module.category,
                'difficulty': module.difficulty,
                'hasPermission': has_permission,
                'isLocked': not has_permission
            }
            
            # 按分类添加到对应的列表
            if module.category == 'basic':
                categorized_modules['basicTraining'].append(module_data)
            elif module.category == 'reading':
                categorized_modules['readingTraining'].append(module_data)
            elif module.category == 'writing':
                categorized_modules['writingTraining'].append(module_data)
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'modules': categorized_modules,
            'total_modules': len(all_modules),
            'accessible_modules': len(permitted_module_ids)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_permission_bp.route('/student/<int:student_id>/module/<string:module_id>/content', methods=['GET'])
def get_module_content(student_id, module_id):
    """获取指定模块的学习内容"""
    try:
        # 验证学生权限
        permission = UserModulePermission.query.filter_by(
            user_id=student_id,
            module_id=module_id
        ).first()
        
        if not permission:
            return jsonify({'error': '没有访问该模块的权限'}), 403
        
        # 获取模块信息
        module = StudyModule.query.get_or_404(module_id)
        
        # 获取模块内容
        contents = StudyContent.query.filter_by(
            module_id=module_id,
            is_active=True
        ).order_by(StudyContent.order_index).all()
        
        content_list = []
        for content in contents:
            content_data = {
                'id': content.id,
                'title': content.title,
                'content_type': content.content_type,
                'content': content.content,
                'order_index': content.order_index
            }
            content_list.append(content_data)
        
        return jsonify({
            'success': True,
            'module': {
                'id': module.module_id,
                'title': module.title,
                'description': module.description,
                'category': module.category,
                'difficulty': module.difficulty
            },
            'contents': content_list,
            'total_contents': len(content_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_permission_bp.route('/admin/grant-permission', methods=['POST'])
def grant_permission():
    """管理员授予学生模块权限"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['student_id', 'module_id', 'granted_by']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        student_id = data['student_id']
        module_id = data['module_id']
        granted_by = data['granted_by']
        
        # 验证授权者是管理员
        granter = User.query.get(granted_by)
        if not granter or granter.user_type != 'admin':
            return jsonify({'error': '只有管理员可以授予权限'}), 403
        
        # 验证学生和模块存在
        student = User.query.get(student_id)
        if not student or student.user_type != 'student':
            return jsonify({'error': '学生不存在'}), 400
            
        module = StudyModule.query.get(module_id)
        if not module:
            return jsonify({'error': '学习模块不存在'}), 400
        
        # 检查是否已经有权限
        existing_permission = UserModulePermission.query.filter_by(
            user_id=student_id,
            module_id=module_id
        ).first()
        
        if existing_permission:
            return jsonify({'error': '学生已经拥有该模块权限'}), 400
        
        # 创建权限记录
        permission = UserModulePermission(
            user_id=student_id,
            module_id=module_id,
            granted_by=granted_by
        )
        
        db.session.add(permission)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '权限授予成功',
            'permission': {
                'student_id': student_id,
                'student_name': student.nickname,
                'module_id': module_id,
                'module_title': module.title,
                'granted_by': granter.nickname,
                'granted_at': permission.granted_at.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@content_permission_bp.route('/admin/revoke-permission', methods=['DELETE'])
def revoke_permission():
    """管理员撤销学生模块权限"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['student_id', 'module_id', 'revoked_by']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        student_id = data['student_id']
        module_id = data['module_id']
        revoked_by = data['revoked_by']
        
        # 验证撤销者是管理员
        revoker = User.query.get(revoked_by)
        if not revoker or revoker.user_type != 'admin':
            return jsonify({'error': '只有管理员可以撤销权限'}), 403
        
        # 查找权限记录
        permission = UserModulePermission.query.filter_by(
            user_id=student_id,
            module_id=module_id
        ).first()
        
        if not permission:
            return jsonify({'error': '权限记录不存在'}), 404
        
        # 获取学生和模块信息用于返回
        student = User.query.get(student_id)
        module = StudyModule.query.get(module_id)
        
        # 删除权限记录
        db.session.delete(permission)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '权限撤销成功',
            'revoked_permission': {
                'student_id': student_id,
                'student_name': student.nickname if student else '未知学生',
                'module_id': module_id,
                'module_title': module.title if module else '未知模块',
                'revoked_by': revoker.nickname,
                'revoked_at': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@content_permission_bp.route('/admin/batch-grant', methods=['POST'])
def batch_grant_permissions():
    """批量授予权限"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['student_ids', 'module_ids', 'granted_by']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        student_ids = data['student_ids']
        module_ids = data['module_ids']
        granted_by = data['granted_by']
        
        # 验证授权者是管理员
        granter = User.query.get(granted_by)
        if not granter or granter.user_type != 'admin':
            return jsonify({'error': '只有管理员可以授予权限'}), 403
        
        success_count = 0
        error_count = 0
        results = []
        
        for student_id in student_ids:
            for module_id in module_ids:
                try:
                    # 检查是否已经有权限
                    existing = UserModulePermission.query.filter_by(
                        user_id=student_id,
                        module_id=module_id
                    ).first()
                    
                    if existing:
                        results.append({
                            'student_id': student_id,
                            'module_id': module_id,
                            'status': 'skipped',
                            'message': '权限已存在'
                        })
                        continue
                    
                    # 创建权限记录
                    permission = UserModulePermission(
                        user_id=student_id,
                        module_id=module_id,
                        granted_by=granted_by
                    )
                    
                    db.session.add(permission)
                    success_count += 1
                    
                    results.append({
                        'student_id': student_id,
                        'module_id': module_id,
                        'status': 'success',
                        'message': '权限授予成功'
                    })
                    
                except Exception as e:
                    error_count += 1
                    results.append({
                        'student_id': student_id,
                        'module_id': module_id,
                        'status': 'error',
                        'message': str(e)
                    })
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'批量授予完成：成功 {success_count} 个，错误 {error_count} 个',
            'summary': {
                'total_operations': len(student_ids) * len(module_ids),
                'success_count': success_count,
                'error_count': error_count,
                'skipped_count': len([r for r in results if r['status'] == 'skipped'])
            },
            'results': results
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@content_permission_bp.route('/admin/students/<int:student_id>/permissions', methods=['GET'])
def get_student_permissions(student_id):
    """获取学生的所有权限"""
    try:
        # 验证学生存在
        student = User.query.get_or_404(student_id)
        if student.user_type != 'student':
            return jsonify({'error': '用户不是学生'}), 400
        
        # 获取学生的所有权限
        permissions = db.session.query(UserModulePermission, StudyModule, User)\
            .join(StudyModule, UserModulePermission.module_id == StudyModule.module_id)\
            .join(User, UserModulePermission.granted_by == User.id)\
            .filter(UserModulePermission.user_id == student_id)\
            .all()
        
        permission_list = []
        for permission, module, granter in permissions:
            permission_data = {
                'id': permission.id,
                'module_id': module.module_id,
                'module_title': module.title,
                'module_category': module.category,
                'module_difficulty': module.difficulty,
                'granted_by': granter.nickname,
                'granted_at': permission.granted_at.isoformat()
            }
            permission_list.append(permission_data)
        
        return jsonify({
            'success': True,
            'student': {
                'id': student.id,
                'username': student.username,
                'nickname': student.nickname
            },
            'permissions': permission_list,
            'total_permissions': len(permission_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_permission_bp.route('/admin/modules/<string:module_id>/students', methods=['GET'])
def get_module_students(module_id):
    """获取拥有指定模块权限的学生列表"""
    try:
        # 验证模块存在
        module = StudyModule.query.get_or_404(module_id)
        
        # 获取拥有该模块权限的学生
        permissions = db.session.query(UserModulePermission, User)\
            .join(User, UserModulePermission.user_id == User.id)\
            .filter(UserModulePermission.module_id == module_id)\
            .all()
        
        student_list = []
        for permission, student in permissions:
            student_data = {
                'id': student.id,
                'username': student.username,
                'nickname': student.nickname,
                'granted_at': permission.granted_at.isoformat()
            }
            student_list.append(student_data)
        
        return jsonify({
            'success': True,
            'module': {
                'id': module.module_id,
                'title': module.title,
                'description': module.description,
                'category': module.category
            },
            'students': student_list,
            'total_students': len(student_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== 学习路径推荐API ====================

@content_permission_bp.route('/recommend/<int:student_id>', methods=['GET'])
def recommend_learning_path(student_id):
    """为学生推荐学习路径"""
    try:
        # 验证学生存在
        student = User.query.get_or_404(student_id)
        if student.user_type != 'student':
            return jsonify({'error': '用户不是学生'}), 400
        
        # 获取学生当前的权限
        current_permissions = UserModulePermission.query.filter_by(user_id=student_id).all()
        current_module_ids = [p.module_id for p in current_permissions]
        
        # 获取所有模块
        all_modules = StudyModule.query.filter_by(is_active=True).all()
        
        # 简单的推荐逻辑：基于难度递增
        recommendations = {
            'immediate': [],  # 立即可学习
            'next_level': [], # 下一阶段
            'advanced': []    # 高级阶段
        }
        
        for module in all_modules:
            if module.module_id not in current_module_ids:
                if module.difficulty == 1:
                    recommendations['immediate'].append({
                        'id': module.module_id,
                        'title': module.title,
                        'description': module.description,
                        'category': module.category,
                        'difficulty': module.difficulty,
                        'reason': '基础模块，建议优先学习'
                    })
                elif module.difficulty == 2:
                    recommendations['next_level'].append({
                        'id': module.module_id,
                        'title': module.title,
                        'description': module.description,
                        'category': module.category,
                        'difficulty': module.difficulty,
                        'reason': '中级模块，适合进阶学习'
                    })
                else:
                    recommendations['advanced'].append({
                        'id': module.module_id,
                        'title': module.title,
                        'description': module.description,
                        'category': module.category,
                        'difficulty': module.difficulty,
                        'reason': '高级模块，需要扎实基础'
                    })
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'current_modules': len(current_module_ids),
            'recommendations': recommendations,
            'total_recommendations': sum(len(recs) for recs in recommendations.values())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
