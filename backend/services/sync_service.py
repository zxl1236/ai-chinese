#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
实时同步服务
处理学习界面和上课界面之间的数据同步
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
from extensions import db
from models import User, Course, CourseAnnotation, CourseSession

logger = logging.getLogger(__name__)

@dataclass
class SyncEvent:
    """同步事件数据结构"""
    event_type: str
    user_id: int
    session_id: str
    data: Dict[str, Any]
    timestamp: str
    
    def to_dict(self):
        return asdict(self)

class SyncService:
    """同步服务类"""
    
    def __init__(self, socketio: SocketIO):
        self.socketio = socketio
        self.active_sessions: Dict[str, Dict] = {}
        self.user_sessions: Dict[int, str] = {}
        
        # 注册WebSocket事件处理器
        self._register_handlers()
    
    def _register_handlers(self):
        """注册WebSocket事件处理器"""
        
        @self.socketio.on('connect')
        def handle_connect(auth):
            """处理客户端连接"""
            try:
                user_id = auth.get('userId') if auth else None
                user_type = auth.get('userType') if auth else None
                session_type = auth.get('sessionType', 'learning')
                
                if not user_id:
                    logger.warning("连接被拒绝：缺少用户ID")
                    return False
                
                # 获取用户信息
                user = User.query.get(user_id)
                if not user:
                    logger.warning(f"连接被拒绝：用户不存在 {user_id}")
                    return False
                
                # 创建或加入会话
                session_id = self._create_or_join_session(user, session_type)
                
                # 记录用户会话
                self.user_sessions[user_id] = session_id
                
                logger.info(f"用户 {user.nickname} 连接到会话 {session_id}")
                
                # 通知会话参与者更新
                self._notify_participant_update(session_id)
                
                return True
                
            except Exception as e:
                logger.error(f"处理连接失败: {e}")
                return False
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """处理客户端断开连接"""
            try:
                # 获取当前用户的会话
                user_id = self._get_current_user_id()
                if user_id and user_id in self.user_sessions:
                    session_id = self.user_sessions[user_id]
                    
                    # 从会话中移除用户
                    self._leave_session(user_id, session_id)
                    
                    # 通知会话参与者更新
                    self._notify_participant_update(session_id)
                    
                    logger.info(f"用户 {user_id} 断开连接")
                
            except Exception as e:
                logger.error(f"处理断开连接失败: {e}")
        
        @self.socketio.on('annotation-change')
        def handle_annotation_change(data):
            """处理标注变化"""
            try:
                user_id = self._get_current_user_id()
                session_id = data.get('sessionId')
                annotation = data.get('annotation')
                action = data.get('action', 'add')
                
                if not all([user_id, session_id, annotation]):
                    logger.warning("标注同步失败：缺少必要参数")
                    return
                
                # 保存标注到数据库
                self._save_annotation(annotation, action, user_id)
                
                # 广播给会话中的其他用户
                self._broadcast_to_session(session_id, 'annotation-sync', {
                    'annotation': annotation,
                    'action': action,
                    'userId': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, exclude_user=user_id)
                
                logger.info(f"标注同步成功：用户 {user_id}, 动作 {action}")
                
            except Exception as e:
                logger.error(f"处理标注变化失败: {e}")
        
        @self.socketio.on('progress-change')
        def handle_progress_change(data):
            """处理学习进度变化"""
            try:
                user_id = self._get_current_user_id()
                session_id = data.get('sessionId')
                progress = data.get('progress')
                
                if not all([user_id, session_id, progress]):
                    logger.warning("进度同步失败：缺少必要参数")
                    return
                
                # 保存进度到数据库
                self._save_progress(progress, user_id)
                
                # 广播给会话中的其他用户
                self._broadcast_to_session(session_id, 'progress-sync', {
                    'progress': progress,
                    'userId': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, exclude_user=user_id)
                
                logger.info(f"进度同步成功：用户 {user_id}")
                
            except Exception as e:
                logger.error(f"处理进度变化失败: {e}")
        
        @self.socketio.on('content-update')
        def handle_content_update(data):
            """处理内容更新"""
            try:
                user_id = self._get_current_user_id()
                session_id = data.get('sessionId')
                content = data.get('content')
                
                if not all([user_id, session_id, content]):
                    logger.warning("内容同步失败：缺少必要参数")
                    return
                
                # 只有教师可以更新内容
                user = User.query.get(user_id)
                if not user or user.user_type != 'teacher':
                    logger.warning(f"内容更新被拒绝：用户 {user_id} 不是教师")
                    return
                
                # 广播给会话中的其他用户
                self._broadcast_to_session(session_id, 'content-update', {
                    'content': content,
                    'userId': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, exclude_user=user_id)
                
                logger.info(f"内容更新成功：教师 {user_id}")
                
            except Exception as e:
                logger.error(f"处理内容更新失败: {e}")
        
        @self.socketio.on('interaction')
        def handle_interaction(data):
            """处理互动事件"""
            try:
                user_id = self._get_current_user_id()
                session_id = self.user_sessions.get(user_id)
                
                if not session_id:
                    logger.warning("互动失败：用户未在会话中")
                    return
                
                # 广播互动事件
                self._broadcast_to_session(session_id, 'interaction', {
                    **data,
                    'userId': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                })
                
                logger.info(f"互动事件：用户 {user_id}")
                
            except Exception as e:
                logger.error(f"处理互动失败: {e}")
    
    def _create_or_join_session(self, user: User, session_type: str) -> str:
        """创建或加入会话"""
        # 生成会话ID
        session_id = f"{session_type}_{user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # 如果是学生，查找是否有对应的教师会话
        if user.user_type == 'student':
            # 查找该学生的活跃课程
            active_course = Course.query.filter_by(
                student_id=user.id,
                status='active'
            ).first()
            
            if active_course:
                # 查找教师的会话
                teacher_session = None
                for sid, session_info in self.active_sessions.items():
                    if (session_info.get('teacher_id') == active_course.teacher_id and 
                        session_info.get('course_id') == active_course.id):
                        teacher_session = sid
                        break
                
                if teacher_session:
                    session_id = teacher_session
        
        # 加入会话房间
        join_room(session_id)
        
        # 初始化会话信息
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = {
                'session_id': session_id,
                'session_type': session_type,
                'created_at': datetime.utcnow().isoformat(),
                'participants': [],
                'course_id': None,
                'teacher_id': None,
                'student_ids': []
            }
        
        # 添加参与者
        participant_info = {
            'user_id': user.id,
            'user_type': user.user_type,
            'username': user.username,
            'nickname': user.nickname,
            'joined_at': datetime.utcnow().isoformat()
        }
        
        session_info = self.active_sessions[session_id]
        
        # 避免重复添加
        existing_participant = next(
            (p for p in session_info['participants'] if p['user_id'] == user.id),
            None
        )
        
        if not existing_participant:
            session_info['participants'].append(participant_info)
        
        # 更新会话角色信息
        if user.user_type == 'teacher':
            session_info['teacher_id'] = user.id
        elif user.user_type == 'student':
            if user.id not in session_info['student_ids']:
                session_info['student_ids'].append(user.id)
        
        return session_id
    
    def _leave_session(self, user_id: int, session_id: str):
        """离开会话"""
        leave_room(session_id)
        
        if session_id in self.active_sessions:
            session_info = self.active_sessions[session_id]
            session_info['participants'] = [
                p for p in session_info['participants'] 
                if p['user_id'] != user_id
            ]
            
            # 如果会话没有参与者，清理会话
            if not session_info['participants']:
                del self.active_sessions[session_id]
        
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
    
    def _notify_participant_update(self, session_id: str):
        """通知参与者更新"""
        if session_id in self.active_sessions:
            session_info = self.active_sessions[session_id]
            self._broadcast_to_session(session_id, 'participant-update', {
                'participants': session_info['participants'],
                'session_info': {
                    'session_id': session_id,
                    'session_type': session_info['session_type'],
                    'participant_count': len(session_info['participants'])
                }
            })
    
    def _broadcast_to_session(self, session_id: str, event: str, data: Dict, exclude_user: Optional[int] = None):
        """向会话中的所有用户广播消息"""
        self.socketio.emit(event, data, room=session_id, skip_sid=exclude_user)
    
    def _get_current_user_id(self) -> Optional[int]:
        """获取当前用户ID"""
        # 这里需要从Flask-SocketIO的上下文中获取用户ID
        # 实际实现可能需要根据具体的认证方式调整
        try:
            from flask import request
            return request.sid  # 临时实现，实际需要从认证信息中获取
        except:
            return None
    
    def _save_annotation(self, annotation: Dict, action: str, user_id: int):
        """保存标注到数据库"""
        try:
            if action == 'add':
                course_annotation = CourseAnnotation(
                    course_id=annotation.get('courseId'),
                    user_id=user_id,
                    annotation_type=annotation.get('type', 'highlight'),
                    text_content=annotation.get('text', ''),
                    annotation_text=annotation.get('content', ''),
                    color=annotation.get('color', '#FFD700'),
                    start_position=annotation.get('position', {}).get('start', 0),
                    end_position=annotation.get('position', {}).get('end', 0)
                )
                db.session.add(course_annotation)
                
            elif action == 'update':
                annotation_id = annotation.get('id')
                if annotation_id:
                    existing = CourseAnnotation.query.get(annotation_id)
                    if existing and existing.user_id == user_id:
                        existing.annotation_text = annotation.get('content', existing.annotation_text)
                        existing.color = annotation.get('color', existing.color)
                        existing.updated_at = datetime.utcnow()
                        
            elif action == 'delete':
                annotation_id = annotation.get('id')
                if annotation_id:
                    existing = CourseAnnotation.query.get(annotation_id)
                    if existing and existing.user_id == user_id:
                        db.session.delete(existing)
            
            db.session.commit()
            logger.info(f"标注保存成功：{action} - 用户 {user_id}")
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"保存标注失败: {e}")
    
    def _save_progress(self, progress: Dict, user_id: int):
        """保存学习进度"""
        try:
            # 这里可以保存到专门的进度表或者更新课程会话
            # 暂时记录到日志
            logger.info(f"进度更新：用户 {user_id}, 进度 {progress}")
            
        except Exception as e:
            logger.error(f"保存进度失败: {e}")
    
    def get_session_info(self, session_id: str) -> Optional[Dict]:
        """获取会话信息"""
        return self.active_sessions.get(session_id)
    
    def get_user_session(self, user_id: int) -> Optional[str]:
        """获取用户当前会话"""
        return self.user_sessions.get(user_id)
    
    def get_active_sessions(self) -> Dict[str, Dict]:
        """获取所有活跃会话"""
        return self.active_sessions.copy()

# 全局同步服务实例
sync_service = None

def init_sync_service(socketio: SocketIO):
    """初始化同步服务"""
    global sync_service
    sync_service = SyncService(socketio)
    return sync_service

def get_sync_service() -> Optional[SyncService]:
    """获取同步服务实例"""
    return sync_service
