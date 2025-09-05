#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教师API路由模块
包含课程管理、数据同步等教师相关功能
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from extensions import db
from models import User, Course, CourseBooking, CourseSession, CourseAnnotation

# 创建教师蓝图
teacher_bp = Blueprint('teacher', __name__, url_prefix='/api/teacher')

# ==================== 课程管理API ====================

@teacher_bp.route('/<int:teacher_id>/courses', methods=['GET'])
def get_teacher_courses(teacher_id):
    """获取教师的课程列表"""
    try:
        # 获取查询参数
        date = request.args.get('date')
        status = request.args.get('status', 'all')
        
        # 构建查询
        query = Course.query.filter_by(teacher_id=teacher_id)
        
        # 按日期筛选
        if date:
            try:
                target_date = datetime.strptime(date, '%Y-%m-%d').date()
                query = query.filter_by(scheduled_date=target_date)
            except ValueError:
                return jsonify({'error': '日期格式错误'}), 400
        
        # 按状态筛选
        if status != 'all':
            query = query.filter_by(status=status)
        
        # 按时间排序
        courses = query.order_by(Course.scheduled_date, Course.scheduled_time).all()
        
        # 格式化返回数据
        course_list = []
        for course in courses:
            student = User.query.get(course.student_id)
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
                'student_id': course.student_id,
                'student_name': student.nickname if student else '未知学生',
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

@teacher_bp.route('/course/<int:course_id>/status', methods=['PUT'])
def update_course_status(course_id):
    """更新课程状态"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': '状态不能为空'}), 400
        
        course = Course.query.get_or_404(course_id)
        course.status = new_status
        
        # 如果课程开始，记录开始时间
        if new_status == 'active':
            course.started_at = datetime.utcnow()
        # 如果课程完成，记录完成时间
        elif new_status == 'completed':
            course.completed_at = datetime.utcnow()
        
        course.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程状态更新成功',
            'course_id': course_id,
            'status': new_status
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/course-record', methods=['POST'])
def save_course_record(course_id):
    """保存课程记录"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['course_id', 'teacher_id', 'student_id', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建课程会话记录
        session = CourseSession(
            course_id=data['course_id'],
            session_start=datetime.utcnow(),
            content_summary=data.get('session_notes', ''),
            key_points=data.get('feedback', {}).get('key_points', ''),
            homework_assigned=data.get('feedback', {}).get('homework', '')
        )
        
        db.session.add(session)
        
        # 更新课程状态
        course = Course.query.get(data['course_id'])
        if course:
            course.status = data['status']
            course.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程记录保存成功',
            'session_id': session.id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/course-booking/<int:booking_id>/start-class', methods=['POST'])
def start_class(booking_id):
    """开始上课 - 老师点击开始上课按钮"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        
        if not teacher_id:
            return jsonify({'error': '老师ID不能为空'}), 400
        
        # 获取课程预约
        booking = CourseBooking.query.get_or_404(booking_id)
        
        # 验证老师权限
        if booking.teacher_id != teacher_id:
            return jsonify({'error': '您没有权限开始这门课程'}), 400
        
        # 检查课程状态
        if booking.status != 'scheduled':
            return jsonify({'error': '只有已预约状态的课程才能开始'}), 400
        
        # 检查是否到了上课时间（允许提前15分钟开始）
        now = datetime.utcnow()
        time_until_class = booking.scheduled_time - now
        
        if time_until_class.total_seconds() > 900:  # 15分钟 = 900秒
            return jsonify({'error': '距离上课时间还有15分钟以上，无法开始课程'}), 400
        
        # 更新课程状态为进行中
        booking.status = 'active'
        booking.updated_at = now
        
        # 创建课程会话记录
        session = CourseSession(
            course_id=booking.id,  # 使用预约ID作为课程ID
            session_start=now,
            content_summary='课程已开始',
            key_points='',
            homework_assigned=''
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程已开始',
            'booking_id': booking_id,
            'session_id': session.id,
            'meeting_info': {
                'platform': '腾讯会议',
                'action': '请使用腾讯会议进行屏幕共享',
                'start_time': now.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'开始课程失败: {str(e)}'}), 500

@teacher_bp.route('/course-booking/<int:booking_id>/end-class', methods=['POST'])
def end_class(booking_id):
    """结束课程 - 老师结束课程并保存反馈"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        feedback = data.get('feedback', {})
        
        if not teacher_id:
            return jsonify({'error': '老师ID不能为空'}), 400
        
        # 获取课程预约
        booking = CourseBooking.query.get_or_404(booking_id)
        
        # 验证老师权限
        if booking.teacher_id != teacher_id:
            return jsonify({'error': '您没有权限结束这门课程'}), 400
        
        # 检查课程状态
        if booking.status != 'active':
            return jsonify({'error': '只有进行中的课程才能结束'}), 400
        
        # 更新课程状态为已完成
        booking.status = 'completed'
        booking.updated_at = datetime.utcnow()
        
        # 更新课程会话记录
        session = CourseSession.query.filter_by(course_id=booking.id).order_by(CourseSession.session_start.desc()).first()
        if session:
            session.session_end = datetime.utcnow()
            session.duration_minutes = int((session.session_end - session.session_start).total_seconds() / 60)
            session.content_summary = feedback.get('content_summary', '')
            session.key_points = feedback.get('key_points', '')
            session.homework_assigned = feedback.get('homework_assigned', '')
            session.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '课程已结束，反馈已保存',
            'booking_id': booking_id,
            'session_id': session.id if session else None
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'结束课程失败: {str(e)}'}), 500

@teacher_bp.route('/course-booking/<int:booking_id>/feedback', methods=['GET'])
def get_course_feedback(booking_id):
    """获取课程反馈 - 用于导出"""
    try:
        # 获取课程预约
        booking = CourseBooking.query.get_or_404(booking_id)
        
        # 获取课程会话记录
        session = CourseSession.query.filter_by(course_id=booking.id).order_by(CourseSession.session_start.desc()).first()
        
        # 获取学生和老师信息
        student = User.query.get(booking.user_id)
        teacher = User.query.get(booking.teacher_id)
        
        feedback_data = {
            'course_info': {
                'id': booking.id,
                'title': booking.course_title,
                'type': booking.course_type,
                'subject': booking.subject,
                'scheduled_time': booking.scheduled_time.isoformat(),
                'duration_minutes': booking.duration_minutes,
                'description': booking.description
            },
            'student_info': {
                'id': student.id,
                'name': student.nickname,
                'username': student.username
            },
            'teacher_info': {
                'id': teacher.id,
                'name': teacher.nickname,
                'username': teacher.username
            },
            'session_info': None
        }
        
        if session:
            feedback_data['session_info'] = {
                'session_start': session.session_start.isoformat(),
                'session_end': session.session_end.isoformat() if session.session_end else None,
                'duration_minutes': session.duration_minutes,
                'content_summary': session.content_summary,
                'key_points': session.key_points,
                'homework_assigned': session.homework_assigned
            }
        
        return jsonify({
            'success': True,
            'feedback': feedback_data
        })
        
    except Exception as e:
        return jsonify({'error': f'获取课程反馈失败: {str(e)}'}), 500

@teacher_bp.route('/course-booking/<int:booking_id>/export-feedback', methods=['POST'])
def export_course_feedback(booking_id):
    """导出课程反馈 - 生成可下载的反馈报告"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        export_format = data.get('format', 'json')  # json, pdf, excel
        
        if not teacher_id:
            return jsonify({'error': '老师ID不能为空'}), 400
        
        # 获取课程预约
        booking = CourseBooking.query.get_or_404(booking_id)
        
        # 验证老师权限
        if booking.teacher_id != teacher_id:
            return jsonify({'error': '您没有权限导出这门课程的反馈'}), 400
        
        # 获取反馈数据
        session = CourseSession.query.filter_by(course_id=booking.id).order_by(CourseSession.session_start.desc()).first()
        student = User.query.get(booking.user_id)
        teacher = User.query.get(booking.teacher_id)
        
        if not session:
            return jsonify({'error': '课程会话记录不存在'}), 400
        
        # 生成反馈报告数据
        feedback_report = {
            'report_type': '课程反馈报告',
            'generated_at': datetime.utcnow().isoformat(),
            'course_info': {
                'title': booking.course_title,
                'type': booking.course_type,
                'subject': booking.subject,
                'scheduled_time': booking.scheduled_time.strftime('%Y-%m-%d %H:%M'),
                'duration_minutes': booking.duration_minutes
            },
            'participants': {
                'student': student.nickname,
                'teacher': teacher.nickname
            },
            'session_summary': {
                'start_time': session.session_start.strftime('%Y-%m-%d %H:%M'),
                'end_time': session.session_end.strftime('%Y-%m-%d %H:%M') if session.session_end else '未结束',
                'actual_duration': session.duration_minutes or '未知'
            },
            'content_summary': session.content_summary,
            'key_points': session.key_points,
            'homework_assigned': session.homework_assigned,
            'export_format': export_format
        }
        
        # 这里可以根据export_format生成不同格式的文件
        # 目前返回JSON格式的数据
        return jsonify({
            'success': True,
            'message': '课程反馈导出成功',
            'report': feedback_report,
            'download_url': f'/api/teacher/course-booking/{booking_id}/download-feedback?format={export_format}'
        })
        
    except Exception as e:
        return jsonify({'error': f'导出课程反馈失败: {str(e)}'}), 500

# ==================== 数据同步API ====================

@teacher_bp.route('/<int:teacher_id>/sync-history', methods=['GET'])
def get_sync_history(teacher_id):
    """获取教师的数据同步历史"""
    try:
        # 这里应该查询实际的同步历史记录
        # 暂时返回模拟数据
        history = [
            {
                'id': 1,
                'sync_time': datetime.utcnow().isoformat(),
                'status': 'success',
                'data_types': ['course_records', 'student_progress'],
                'records_count': 25,
                'duration_seconds': 15
            },
            {
                'id': 2,
                'sync_time': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'status': 'success',
                'data_types': ['teaching_materials'],
                'records_count': 10,
                'duration_seconds': 8
            }
        ]
        
        return jsonify({
            'success': True,
            'history': history
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>/last-sync', methods=['GET'])
def get_last_sync_time(teacher_id):
    """获取教师最后同步时间"""
    try:
        # 这里应该查询实际的最后同步时间
        # 暂时返回模拟数据
        last_sync = datetime.utcnow() - timedelta(hours=1)
        
        return jsonify({
            'success': True,
            'last_sync_time': last_sync.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>/sync-stats', methods=['GET'])
def get_sync_stats(teacher_id):
    """获取教师同步统计信息"""
    try:
        # 这里应该查询实际的同步统计
        # 暂时返回模拟数据
        stats = {
            'total_records': 150,
            'new_records': 12,
            'updated_records': 8,
            'failed_records': 0,
            'last_24h_syncs': 3,
            'success_rate': 100.0
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/data-sync', methods=['POST'])
def execute_data_sync():
    """执行数据同步"""
    try:
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        data_types = data.get('data_types', [])
        sync_only_new = data.get('sync_only_new', False)
        retry_count = data.get('retry_count', 0)
        
        if not teacher_id:
            return jsonify({'error': '教师ID不能为空'}), 400
        
        # 模拟同步过程
        sync_results = {
            'course_records': {'synced': 25, 'new': 5, 'updated': 3, 'failed': 0},
            'student_progress': {'synced': 15, 'new': 2, 'updated': 1, 'failed': 0},
            'teaching_materials': {'synced': 10, 'new': 1, 'updated': 0, 'failed': 0},
            'assessments': {'synced': 8, 'new': 0, 'updated': 2, 'failed': 0},
            'feedback': {'synced': 12, 'new': 3, 'updated': 1, 'failed': 0},
            'schedules': {'synced': 5, 'new': 0, 'updated': 1, 'failed': 0}
        }
        
        # 计算总统计
        total_stats = {
            'total_records': sum(item['synced'] for item in sync_results.values()),
            'new_records': sum(item['new'] for item in sync_results.values()),
            'updated_records': sum(item['updated'] for item in sync_results.values()),
            'failed_records': sum(item['failed'] for item in sync_results.values())
        }
        
        return jsonify({
            'success': True,
            'message': '数据同步完成',
            'sync_results': sync_results,
            'stats': total_stats,
            'sync_time': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== 课程预约管理API ====================

@teacher_bp.route('/<int:teacher_id>/bookings', methods=['GET'])
def get_teacher_bookings(teacher_id):
    """获取教师的课程预约列表"""
    try:
        # 获取查询参数
        status = request.args.get('status', 'all')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # 构建查询
        query = CourseBooking.query.filter_by(teacher_id=teacher_id)
        
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
            student = User.query.get(booking.user_id)
            booking_data = {
                'id': booking.id,
                'course_title': booking.course_title,
                'course_type': booking.course_type,
                'subject': booking.subject,
                'scheduled_time': booking.scheduled_time.isoformat(),
                'duration_minutes': booking.duration_minutes,
                'description': booking.description,
                'status': booking.status,
                'student_id': booking.user_id,
                'student_name': student.nickname if student else '未知学生',
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

@teacher_bp.route('/booking/<int:booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    """更新预约状态"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': '状态不能为空'}), 400
        
        booking = CourseBooking.query.get_or_404(booking_id)
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '预约状态更新成功',
            'booking_id': booking_id,
            'status': new_status
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== 学生管理API ====================

@teacher_bp.route('/<int:teacher_id>/students', methods=['GET'])
def get_teacher_students(teacher_id):
    """获取教师的学生列表"""
    try:
        # 获取该教师的所有学生
        students = db.session.query(User).join(Course, User.id == Course.student_id)\
            .filter(Course.teacher_id == teacher_id)\
            .distinct().all()
        
        student_list = []
        for student in students:
            # 获取学生的学习统计
            course_count = Course.query.filter_by(
                teacher_id=teacher_id, 
                student_id=student.id
            ).count()
            
            completed_count = Course.query.filter_by(
                teacher_id=teacher_id, 
                student_id=student.id,
                status='completed'
            ).count()
            
            student_data = {
                'id': student.id,
                'username': student.username,
                'nickname': student.nickname,
                'user_type': student.user_type,
                'course_count': course_count,
                'completed_count': completed_count,
                'completion_rate': (completed_count / course_count * 100) if course_count > 0 else 0
            }
            student_list.append(student_data)
        
        return jsonify({
            'success': True,
            'students': student_list,
            'total': len(student_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>/student/<int:student_id>/progress', methods=['GET'])
def get_student_progress(teacher_id, student_id):
    """获取指定学生的学习进度"""
    try:
        # 获取该教师和学生的课程记录
        courses = Course.query.filter_by(
            teacher_id=teacher_id,
            student_id=student_id
        ).order_by(Course.created_at.desc()).all()
        
        progress_data = {
            'student_id': student_id,
            'total_courses': len(courses),
            'completed_courses': len([c for c in courses if c.status == 'completed']),
            'active_courses': len([c for c in courses if c.status == 'active']),
            'scheduled_courses': len([c for c in courses if c.status == 'scheduled']),
            'course_history': []
        }
        
        for course in courses:
            course_data = {
                'id': course.id,
                'title': course.title,
                'course_type': course.course_type,
                'scheduled_date': course.scheduled_date.strftime('%Y-%m-%d'),
                'status': course.status.value,
                'created_at': course.created_at.isoformat()
            }
            progress_data['course_history'].append(course_data)
        
        return jsonify({
            'success': True,
            'progress': progress_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
