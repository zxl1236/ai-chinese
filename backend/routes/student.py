#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
学生API路由模块
包含课程预约、学习进度等学生相关功能
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from extensions import db
from models import User, Course, CourseBooking, CourseSession, CourseAnnotation

# 创建学生蓝图
student_bp = Blueprint('student', __name__, url_prefix='/api/student')

# ==================== 课程预约API ====================

@student_bp.route('/<int:student_id>/bookings', methods=['GET'])
def get_student_bookings(student_id):
    """获取学生的课程预约列表"""
    try:
        # 获取查询参数
        status = request.args.get('status', 'all')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # 构建查询
        query = CourseBooking.query.filter_by(user_id=student_id)
        
        # 按状态筛选
        if status != 'all':
            query = query.filter_by(status=status)
        
        # 按日期范围筛选
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d')
                query = query.filter(CourseBooking.scheduled_time >= from_date)
            except ValueError:
                return jsonify({'error': '开始日期格式错误'}), 400
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
                query = query.filter(CourseBooking.scheduled_time < to_date)
            except ValueError:
                return jsonify({'error': '结束日期格式错误'}), 400
        
        # 按时间排序
        bookings = query.order_by(CourseBooking.scheduled_time).all()
        
        # 格式化返回数据
        booking_list = []
        for booking in bookings:
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
                'teacher_id': booking.teacher_id,
                'teacher_name': teacher.nickname if teacher else '未知教师',
                'created_at': booking.created_at.isoformat()
            }
            booking_list.append(booking_data)
        
        return jsonify({
            'success': True,
            'bookings': booking_list,
            'total': len(booking_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 学生不再具有创建课程预约的权限
# 课程预约由管理员统一安排

# 学生不再具有更新课程预约的权限
# 课程预约由管理员统一管理

# 学生不再具有取消课程预约的权限
# 课程预约由管理员统一管理

# ==================== 课程管理API ====================

@student_bp.route('/<int:student_id>/courses', methods=['GET'])
def get_student_courses(student_id):
    """获取学生的课程列表"""
    try:
        # 获取查询参数
        status = request.args.get('status', 'all')
        date = request.args.get('date')
        
        # 构建查询
        query = Course.query.filter_by(student_id=student_id)
        
        # 按状态筛选
        if status != 'all':
            query = query.filter_by(status=status)
        
        # 按日期筛选
        if date:
            try:
                target_date = datetime.strptime(date, '%Y-%m-%d').date()
                query = query.filter_by(scheduled_date=target_date)
            except ValueError:
                return jsonify({'error': '日期格式错误'}), 400
        
        # 按时间排序
        courses = query.order_by(Course.scheduled_date, Course.scheduled_time).all()
        
        # 格式化返回数据
        course_list = []
        for course in courses:
            teacher = User.query.get(course.teacher_id)
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'course_type': course.course_type,
                'difficulty_level': course.difficulty_level,
                'scheduled_date': course.scheduled_date.strftime('%Y-%m-%d'),
                'scheduled_time': course.scheduled_time.strftime('%H:%M'),
                'duration_minutes': course.duration_minutes,
                'status': course.status.value,
                'teacher_id': course.teacher_id,
                'teacher_name': teacher.nickname if teacher else '未知教师',
                'meeting_link': course.meeting_link,
                'notes': course.notes,
                'created_at': course.created_at.isoformat()
            }
            course_list.append(course_data)
        
        return jsonify({
            'success': True,
            'courses': course_list,
            'total': len(course_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/course/<int:course_id>/join', methods=['POST'])
def join_course(course_id):
    """学生加入课程"""
    try:
        course = Course.query.get_or_404(course_id)
        
        # 检查课程状态
        if course.status != 'active':
            return jsonify({'error': '课程未开始或已结束'}), 400
        
        # 检查学生身份
        student_id = request.json.get('student_id')
        if course.student_id != student_id:
            return jsonify({'error': '无权限加入此课程'}), 403
        
        # 记录学生加入时间
        # 这里可以添加更多的逻辑，比如记录出勤等
        
        return jsonify({
            'success': True,
            'message': '成功加入课程',
            'course_id': course_id,
            'meeting_link': course.meeting_link
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== 学习进度API ====================

@student_bp.route('/<int:student_id>/progress', methods=['GET'])
def get_student_progress(student_id):
    """获取学生的学习进度"""
    try:
        # 获取学生的所有课程
        courses = Course.query.filter_by(student_id=student_id).all()
        
        # 计算统计数据
        total_courses = len(courses)
        completed_courses = len([c for c in courses if c.status == 'completed'])
        active_courses = len([c for c in courses if c.status == 'active'])
        scheduled_courses = len([c for c in courses if c.status == 'scheduled'])
        
        # 按课程类型分组
        course_types = {}
        for course in courses:
            course_type = course.course_type
            if course_type not in course_types:
                course_types[course_type] = {
                    'total': 0,
                    'completed': 0,
                    'active': 0,
                    'scheduled': 0
                }
            
            course_types[course_type]['total'] += 1
            if course.status == 'completed':
                course_types[course_type]['completed'] += 1
            elif course.status == 'active':
                course_types[course_type]['active'] += 1
            elif course.status == 'scheduled':
                course_types[course_type]['scheduled'] += 1
        
        progress_data = {
            'student_id': student_id,
            'overview': {
                'total_courses': total_courses,
                'completed_courses': completed_courses,
                'active_courses': active_courses,
                'scheduled_courses': scheduled_courses,
                'completion_rate': (completed_courses / total_courses * 100) if total_courses > 0 else 0
            },
            'by_type': course_types,
            'recent_courses': []
        }
        
        # 获取最近的课程记录
        recent_courses = Course.query.filter_by(student_id=student_id)\
            .order_by(Course.created_at.desc())\
            .limit(5).all()
        
        for course in recent_courses:
            teacher = User.query.get(course.teacher_id)
            course_data = {
                'id': course.id,
                'title': course.title,
                'course_type': course.course_type,
                'scheduled_date': course.scheduled_date.strftime('%Y-%m-%d'),
                'status': course.status.value,
                'teacher_name': teacher.nickname if teacher else '未知教师',
                'created_at': course.created_at.isoformat()
            }
            progress_data['recent_courses'].append(course_data)
        
        return jsonify({
            'success': True,
            'progress': progress_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== 教师查询API ====================

@student_bp.route('/teachers', methods=['GET'])
def get_available_teachers():
    """获取可用的教师列表"""
    try:
        # 获取所有教师用户
        teachers = User.query.filter_by(user_type='teacher', is_active=True).all()
        
        teacher_list = []
        for teacher in teachers:
            # 获取教师的课程统计
            total_courses = Course.query.filter_by(teacher_id=teacher.id).count()
            completed_courses = Course.query.filter_by(
                teacher_id=teacher.id, 
                status='completed'
            ).count()
            
            teacher_data = {
                'id': teacher.id,
                'username': teacher.username,
                'nickname': teacher.nickname,
                'total_courses': total_courses,
                'completed_courses': completed_courses,
                'rating': 4.8,  # 这里可以添加实际的评分系统
                'specialties': ['阅读理解', '写作训练', '古诗文'],  # 这里可以添加实际的专长信息
                'available_times': [
                    '周一 18:00-20:00',
                    '周三 19:00-21:00',
                    '周六 14:00-16:00'
                ]  # 这里可以添加实际的可预约时间
            }
            teacher_list.append(teacher_data)
        
        return jsonify({
            'success': True,
            'teachers': teacher_list,
            'total': len(teacher_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/teacher/<int:teacher_id>/schedule', methods=['GET'])
def get_teacher_schedule(teacher_id):
    """获取教师的可预约时间"""
    try:
        # 获取查询参数
        date = request.args.get('date')
        if not date:
            return jsonify({'error': '日期参数不能为空'}), 400
        
        try:
            target_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': '日期格式错误'}), 400
        
        # 获取该教师在该日期的所有预约
        existing_bookings = CourseBooking.query.filter(
            CourseBooking.teacher_id == teacher_id,
            db.func.date(CourseBooking.scheduled_time) == target_date
        ).all()
        
        # 定义可预约时间段（这里可以根据实际需求调整）
        available_slots = [
            '09:00-10:00', '10:00-11:00', '14:00-15:00', 
            '15:00-16:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'
        ]
        
        # 过滤掉已被预约的时间段
        booked_times = [booking.scheduled_time.strftime('%H:%M') for booking in existing_bookings]
        available_times = []
        
        for slot in available_slots:
            start_time = slot.split('-')[0]
            if start_time not in booked_times:
                available_times.append(slot)
        
        return jsonify({
            'success': True,
            'teacher_id': teacher_id,
            'date': date,
            'available_slots': available_times,
            'booked_slots': booked_times
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
