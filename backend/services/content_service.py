#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内容服务模块
包含内容管理和个性化内容选择功能
"""
from typing import Dict, List, Any
from extensions import db
from models import StudyModule, StudyContent

class ContentService:
    """内容服务类"""
    
    @staticmethod
    def get_study_modules() -> Dict[str, Any]:
        """获取学习模块"""
        try:
            # 获取所有活跃的学习模块
            all_modules = StudyModule.query.filter_by(is_active=True).order_by(StudyModule.difficulty).all()
            
            def module_to_dict(module):
                return {
                    'id': module.module_id,
                    'title': module.title,
                    'text': module.title,
                    'description': module.description,
                    'icon': module.icon,
                    'category': module.category,
                    'difficulty': module.difficulty
                }
            
            # 按类别分组
            modules_by_category = {
                'basic': [],
                'reading': [],
                'writing': [],
                'speaking': [],
                'knowledge': []
            }
            
            for module in all_modules:
                category = module.category
                if category in modules_by_category:
                    modules_by_category[category].append(module_to_dict(module))
            
            # 构建响应格式
            response = {
                'allModules': [module_to_dict(m) for m in all_modules],
                'byCategory': modules_by_category,
                'mainModules': []
            }
            
            # 提取主要模块（16个细分模块）
            main_module_ids = [
                # 基础能力训练 (4个)
                'word-foundation', 'grammar-rules', 'grammar-foundation', 'classical-foundation',
                # 阅读理解训练 (9个)
                'modern-text', 'narrative-text', 'novel', 'argumentative', 'expository', 
                'poetry', 'prose', 'classical-prose', 'non-continuous',
                # 写作表达训练 (3个)
                'proposition-writing', 'semi-proposition', 'ai-writing-assistant'
            ]
            
            for module_id in main_module_ids:
                module = StudyModule.query.filter_by(module_id=module_id, is_active=True).first()
                if module:
                    response['mainModules'].append(module_to_dict(module))
            
            return response
        except Exception as e:
            raise Exception(f'获取学习模块失败: {str(e)}')
    
    @staticmethod
    def get_user_study_content(username: str) -> Dict[str, Any]:
        """获取指定用户有权限访问的学习内容"""
        try:
            from models import User, UserModulePermission
            
            def module_to_dict(module):
                return {
                    'id': module.module_id,
                    'title': module.title,
                    'text': module.title,
                    'description': module.description,
                    'icon': module.icon,
                    'category': module.category,
                    'difficulty': module.difficulty
                }
            
            # 查找用户 - 支持多种用户名格式
            user = None
            
            # 首先尝试直接匹配
            user = User.query.filter_by(username=username, is_active=True).first()
            
            # 如果没有找到，尝试处理常见的用户名变体
            if not user:
                # 处理 student01 -> student1 的情况
                if username == 'student01':
                    user = User.query.filter_by(username='student1', is_active=True).first()
                elif username == 'student02':
                    user = User.query.filter_by(username='student2', is_active=True).first()
                elif username == 'teacher01':
                    user = User.query.filter_by(username='teacher1', is_active=True).first()
                elif username == 'teacher02':
                    user = User.query.filter_by(username='teacher2', is_active=True).first()
            
            if not user:
                raise Exception(f'用户 {username} 不存在或已禁用')
            
            # 获取用户有权限的模块ID列表
            permissions = UserModulePermission.query.filter_by(user_id=user.id).all()
            allowed_module_ids = [p.module_id for p in permissions]
            
            # 管理员和教师有所有权限
            if user.user_type in ['admin', 'teacher']:
                all_modules = StudyModule.query.filter_by(is_active=True).all()
                allowed_modules = [module_to_dict(m) for m in all_modules]
            else:
                # 学生只能访问被授权的模块
                allowed_modules = []
                if allowed_module_ids:
                    modules = StudyModule.query.filter(
                        StudyModule.is_active == True,
                        StudyModule.module_id.in_(allowed_module_ids)
                    ).all()
                    allowed_modules = [module_to_dict(m) for m in modules]
            
            # 按类别分组用户可访问的模块
            modules_by_category = {
                'basic': [],
                'reading': [],
                'writing': [],
                'speaking': [],
                'knowledge': []
            }
            
            for module in allowed_modules:
                category = module['category']
                if category in modules_by_category:
                    modules_by_category[category].append(module)
            
            content = {
                'allModules': allowed_modules,
                'byCategory': modules_by_category,
                'mainModules': [m for m in allowed_modules if m['id'] in [
                    'word-foundation', 'grammar-rules', 'grammar-foundation', 'classical-foundation',
                    'modern-text', 'narrative-text', 'novel', 'argumentative', 'expository', 
                    'poetry', 'prose', 'classical-prose', 'non-continuous',
                    'proposition-writing', 'semi-proposition', 'ai-writing-assistant'
                ]],
                'user': {
                    'username': user.username,
                    'nickname': user.nickname,
                    'user_type': user.user_type
                }
            }
            
            return content
        except Exception as e:
            raise Exception(f'获取用户学习内容失败: {str(e)}')
    
    @staticmethod
    def get_module_content(module_id: str) -> List[Dict[str, Any]]:
        """获取特定模块的详细内容"""
        try:
            contents = StudyContent.query.filter_by(
                module_id=module_id, 
                is_active=True
            ).order_by(StudyContent.order_index).all()
            
            content_list = []
            for content in contents:
                content_list.append({
                    'id': content.id,
                    'type': content.content_type,
                    'title': content.title,
                    'content': content.content,
                    'order': content.order_index
                })
            
            return content_list
        except Exception as e:
            raise Exception(f'获取模块内容失败: {str(e)}')
    
    @staticmethod
    def get_personalized_content(module_id: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """获取个性化训练内容"""
        try:
            # 获取模块信息
            module = StudyModule.query.filter_by(module_id=module_id, is_active=True).first()
            if not module:
                raise Exception('模块不存在')
            
            # 根据用户档案选择内容
            content = ContentService._select_content_by_profile(module, user_profile)
            
            return content
        except Exception as e:
            raise Exception(f'获取个性化内容失败: {str(e)}')
    
    @staticmethod
    def _select_content_by_profile(module: StudyModule, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """根据用户档案选择合适的内容"""
        grade = user_profile.get('grade', '初一')
        
        # 获取模块的所有内容
        all_contents = StudyContent.query.filter_by(
            module_id=module.module_id, 
            is_active=True
        ).order_by(StudyContent.order_index).all()
        
        if not all_contents:
            return ContentService._generate_default_content(module.module_id)
        
        # 格式化返回内容
        formatted_contents = []
        for content in all_contents[:5]:  # 限制数量
            formatted_contents.append({
                'id': content.id,
                'type': content.content_type,
                'title': content.title,
                'content': content.content,
                'order': content.order_index,
                'difficulty': getattr(content, 'difficulty', 'medium')
            })
        
        return {
            'module': {
                'id': module.module_id,
                'title': module.title,
                'category': module.category,
                'description': module.description
            },
            'contents': formatted_contents,
            'personalization': {
                'grade': grade,
                'recommended_time': '15-30分钟',
                'focus_areas': user_profile.get('weakAreas', []),
                'difficulty': user_profile.get('difficultyPreference', 'medium')
            },
            'total_items': len(formatted_contents)
        }
    
    @staticmethod
    def _generate_default_content(module_id: str) -> Dict[str, Any]:
        """生成默认内容（当数据库中没有内容时）"""
        # 这里包含所有默认内容的映射
        default_contents = {
            'word-foundation': {
                'module': {'id': module_id, 'title': '字词基础', 'category': 'basic'},
                'contents': [
                    {
                        'id': 'word-1',
                        'type': 'vocabulary',
                        'title': '常用字词练习',
                        'content': '练习常见汉字的读音、写法和用法，巩固汉字词汇基础知识',
                        'difficulty': 'easy'
                    }
                ],
                'personalization': {
                    'recommended_time': '15分钟',
                    'focus_areas': ['字音字形', '词汇积累'],
                    'difficulty': 'easy'
                },
                'total_items': 1
            },
            # ... 其他模块的默认内容
        }
        
        return default_contents.get(module_id, {
            'module': {'id': module_id, 'title': '训练模块', 'category': 'general'},
            'contents': [],
            'personalization': {'message': '正在准备内容...'},
            'total_items': 0
        })
