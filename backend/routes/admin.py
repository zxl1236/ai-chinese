#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
管理员API路由
提供课程预约管理功能
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from extensions import db
from models import User, CourseBooking, Course, CourseSession

# 创建管理员蓝图
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/course-bookings', methods=['GET'])
def get_all_course_bookings():
    """获取所有课程预约"""
    try:
        # 获取查询参数
        status = request.args.get('status')
        teacher_id = request.args.get('teacher_id')
        student_id = request.args.get('student_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        # 构建查询
        query = CourseBooking.query
        
        if status:
            query = query.filter_by(status=status)
        if teacher_id:
            query = query.filter_by(teacher_id=teacher_id)
        if student_id:
            query = query.filter_by(user_id=student_id)
        if from_date:
            from_date_obj = datetime.fromisoformat(from_date)
            query = query.filter(CourseBooking.scheduled_time >= from_date_obj)
        if to_date:
            to_date_obj = datetime.fromisoformat(to_date)
            query = query.filter(CourseBooking.scheduled_time < to_date_obj)
        
        # 按时间排序
        bookings = query.order_by(CourseBooking.scheduled_time).all()
        
        # 格式化返回数据
        booking_list = []
        for booking in bookings:
            student = User.query.get(booking.user_id)
            teacher = User.query.get(booking.teacher_id)
            
            booking_data = {
                'id': booking.id,
                'course_title': booking.course_title,
                'course_type': booking.course_type,
                'subject': booking.subject,
                'scheduled_time': booking.scheduled_time.isoformat(),
                'duration_minutes': booking.duration_minutes,
                'description': booking.description,
                'status': booking.status,
                'student': {
                    'id': student.id,
                    'username': student.username,
                    'nickname': student.nickname
                },
                'teacher': {
                    'id': teacher.id,
                    'username': teacher.username,
                    'nickname': teacher.nickname
                },
                'created_at': booking.created_at.isoformat()
            }
            booking_list.append(booking_data)
        
        return jsonify({
            'success': True,
            'bookings': booking_list,
            'total': len(booking_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'获取课程预约失败: {str(e)}'}), 500

@admin_bp.route('/course-bookings', methods=['POST'])
def create_course_booking():
    """管理员创建课程预约"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求数据不能为空'}), 400
        
        # 验证必需字段
        required_fields = ['student_id', 'teacher_id', 'course_title', 'course_type', 'subject', 'scheduled_time']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 验证学生和老师是否存在
        student = User.query.get(data['student_id'])
        teacher = User.query.get(data['teacher_id'])
        
        if not student or student.user_type != 'student':
            return jsonify({'error': '学生不存在或用户类型错误'}), 400
        
        if not teacher or teacher.user_type != 'teacher':
            return jsonify({'error': '老师不存在或用户类型错误'}), 400
        
        # 检查时间冲突
        scheduled_time = datetime.fromisoformat(data['scheduled_time'])
        duration = data.get('duration_minutes', 60)
        end_time = scheduled_time + timedelta(minutes=duration)
        
        # 检查学生时间冲突
        student_conflict = CourseBooking.query.filter(
            CourseBooking.user_id == data['student_id'],
            CourseBooking.status.in_(['scheduled', 'active']),
            CourseBooking.scheduled_time < end_time,
            CourseBooking.scheduled_time + timedelta(minutes=CourseBooking.duration_minutes) > scheduled_time
        ).first()
        
        if student_conflict:
            return jsonify({'error': '学生在该时间段已有其他课程安排'}), 400
        
        # 检查老师时间冲突
        teacher_conflict = CourseBooking.query.filter(
            CourseBooking.teacher_id == data['teacher_id'],
            CourseBooking.status.in_(['scheduled', 'active']),
            CourseBooking.scheduled_time < end_time,
            CourseBooking.scheduled_time + timedelta(minutes=CourseBooking.duration_minutes) > scheduled_time
        ).first()
        
        if teacher_conflict:
            return jsonify({'error': '老师在该时间段已有其他课程安排'}), 400
        
        # 创建课程预约
        booking = CourseBooking(
            user_id=data['student_id'],
            teacher_id=data['teacher_id'],
            course_title=data['course_title'],
            course_type=data['course_type'],
            subject=data['subject'],
            scheduled_time=scheduled_time,
            duration_minutes=duration,
            description=data.get('description', ''),
            status='scheduled'
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程预约创建成功',
            'booking_id': booking.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建课程预约失败: {str(e)}'}), 500

@admin_bp.route('/course-bookings/<int:booking_id>', methods=['PUT'])
def update_course_booking(booking_id):
    """管理员更新课程预约"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求数据不能为空'}), 400
        
        booking = CourseBooking.query.get_or_404(booking_id)
        
        # 可更新的字段
        updatable_fields = ['course_title', 'course_type', 'subject', 'scheduled_time', 'duration_minutes', 'description', 'status']
        
        for field in updatable_fields:
            if field in data:
                if field == 'scheduled_time':
                    # 检查时间冲突
                    new_time = datetime.fromisoformat(data[field])
                    duration = data.get('duration_minutes', booking.duration_minutes)
                    end_time = new_time + timedelta(minutes=duration)
                    
                    # 检查学生时间冲突
                    student_conflict = CourseBooking.query.filter(
                        CourseBooking.user_id == booking.user_id,
                        CourseBooking.status.in_(['scheduled', 'active']),
                        CourseBooking.scheduled_time < end_time,
                        CourseBooking.scheduled_time + timedelta(minutes=CourseBooking.duration_minutes) > new_time,
                        CourseBooking.id != booking_id
                    ).first()
                    
                    if student_conflict:
                        return jsonify({'error': '学生在该时间段已有其他课程安排'}), 400
                    
                    # 检查老师时间冲突
                    teacher_conflict = CourseBooking.query.filter(
                        CourseBooking.teacher_id == booking.teacher_id,
                        CourseBooking.status.in_(['scheduled', 'active']),
                        CourseBooking.scheduled_time < end_time,
                        CourseBooking.scheduled_time + timedelta(minutes=CourseBooking.duration_minutes) > new_time,
                        CourseBooking.id != booking_id
                    ).first()
                    
                    if teacher_conflict:
                        return jsonify({'error': '老师在该时间段已有其他课程安排'}), 400
                    
                    setattr(booking, field, new_time)
                else:
                    setattr(booking, field, data[field])
        
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程预约更新成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新课程预约失败: {str(e)}'}), 500

@admin_bp.route('/course-bookings/<int:booking_id>', methods=['DELETE'])
def delete_course_booking(booking_id):
    """管理员删除课程预约"""
    try:
        booking = CourseBooking.query.get_or_404(booking_id)
        
        # 只有已预约状态的课程可以删除
        if booking.status != 'scheduled':
            return jsonify({'error': '只能删除已预约状态的课程'}), 400
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程预约删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除课程预约失败: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
def get_users():
    """获取用户列表"""
    try:
        user_type = request.args.get('user_type')
        
        query = User.query
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        users = query.all()
        
        user_list = []
        for user in users:
            user_data = {
                'id': user.id,
                'username': user.username,
                'nickname': user.nickname,
                'user_type': user.user_type,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat()
            }
            user_list.append(user_data)
        
        return jsonify({
            'success': True,
            'users': user_list,
            'total': len(user_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'获取用户列表失败: {str(e)}'}), 500

@admin_bp.route('/dashboard', methods=['GET'])
def get_admin_dashboard():
    """获取管理员仪表板数据"""
    try:
        # 统计课程预约
        total_bookings = CourseBooking.query.count()
        scheduled_bookings = CourseBooking.query.filter_by(status='scheduled').count()
        active_bookings = CourseBooking.query.filter_by(status='active').count()
        completed_bookings = CourseBooking.query.filter_by(status='completed').count()
        cancelled_bookings = CourseBooking.query.filter_by(status='cancelled').count()
        
        # 统计用户
        total_students = User.query.filter_by(user_type='student').count()
        total_teachers = User.query.filter_by(user_type='teacher').count()
        
        # 最近的课程预约
        recent_bookings = CourseBooking.query.order_by(CourseBooking.created_at.desc()).limit(5).all()
        recent_booking_list = []
        
        for booking in recent_bookings:
            student = User.query.get(booking.user_id)
            teacher = User.query.get(booking.teacher_id)
            
            recent_booking_list.append({
                'id': booking.id,
                'course_title': booking.course_title,
                'student_name': student.nickname if student else '未知',
                'teacher_name': teacher.nickname if teacher else '未知',
                'scheduled_time': booking.scheduled_time.strftime('%Y-%m-%d %H:%M'),
                'status': booking.status
            })
        
        return jsonify({
            'success': True,
            'dashboard': {
                'bookings': {
                    'total': total_bookings,
                    'scheduled': scheduled_bookings,
                    'active': active_bookings,
                    'completed': completed_bookings,
                    'cancelled': cancelled_bookings
                },
                'users': {
                    'students': total_students,
                    'teachers': total_teachers
                },
                'recent_bookings': recent_booking_list
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'获取仪表板数据失败: {str(e)}'}), 500
