from datetime import datetime
from enum import Enum
from extensions import db

class CourseStatus(Enum):
    SCHEDULED = 'scheduled'      # 已预约
    ACTIVE = 'active'            # 进行中
    COMPLETED = 'completed'      # 已完成
    CANCELLED = 'cancelled'      # 已取消

class AnnotationType(Enum):
    HIGHLIGHT = 'highlight'      # 高亮
    NOTE = 'note'                # 笔记
    COMMENT = 'comment'          # 评论
    QUESTION = 'question'        # 问题

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    nickname = db.Column(db.String(100), nullable=False)
    user_type = db.Column(db.String(20), nullable=False, default='student')  # admin, teacher, student
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    teacher_courses = db.relationship('Course', foreign_keys='Course.teacher_id', backref='teacher', lazy='dynamic')
    student_courses = db.relationship('Course', foreign_keys='Course.student_id', backref='student', lazy='dynamic')

class Course(db.Model):
    """线下转线上课程模型"""
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_type = db.Column(db.String(50), nullable=False)  # 阅读训练、写作训练、AI辅导等
    difficulty_level = db.Column(db.String(20), default='intermediate')  # beginner, intermediate, advanced
    
    # 预约信息
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheduled_date = db.Column(db.Date, nullable=False)
    scheduled_time = db.Column(db.Time, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    
    # 课程状态
    status = db.Column(db.Enum(CourseStatus), default=CourseStatus.SCHEDULED)
    
    # 线上课程信息
    meeting_link = db.Column(db.String(500))
    training_content_id = db.Column(db.Integer)  # 关联的训练内容ID
    notes = db.Column(db.Text)
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    # 关系
    annotations = db.relationship('CourseAnnotation', backref='course', lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('CourseSession', backref='course', lazy='dynamic', cascade='all, delete-orphan')

class CourseAnnotation(db.Model):
    """课程标注模型"""
    __tablename__ = 'course_annotations'
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # 标注内容
    annotation_type = db.Column(db.Enum(AnnotationType), nullable=False)
    text_content = db.Column(db.Text, nullable=False)  # 被标注的文本
    annotation_text = db.Column(db.Text)  # 标注内容
    color = db.Column(db.String(7), default='#FFD700')  # 颜色代码
    
    # 位置信息
    start_position = db.Column(db.Integer)  # 文本开始位置
    end_position = db.Column(db.Integer)    # 文本结束位置
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', backref='annotations')

class CourseSession(db.Model):
    """课程会话记录模型"""
    __tablename__ = 'course_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # 会话信息
    session_start = db.Column(db.DateTime, nullable=False)
    session_end = db.Column(db.DateTime)
    duration_minutes = db.Column(db.Integer)
    
    # 会话内容
    content_summary = db.Column(db.Text)
    key_points = db.Column(db.Text)
    homework_assigned = db.Column(db.Text)
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TrainingContent(db.Model):
    """训练内容模型"""
    __tablename__ = 'training_contents'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)  # reading, writing, ai_tutoring
    content_data = db.Column(db.JSON)  # 存储具体的训练内容
    difficulty_level = db.Column(db.String(20), default='intermediate')
    tags = db.Column(db.String(255))  # 标签，用逗号分隔
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StudyModule(db.Model):
    """学习模块模型"""
    __tablename__ = 'study_modules'
    
    module_id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(10))
    category = db.Column(db.String(20))  # basic, reading, writing
    difficulty = db.Column(db.Integer, default=1)
    is_active = db.Column(db.Boolean, default=True)
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StudyContent(db.Model):
    """学习内容"""
    __tablename__ = 'study_contents'
    
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.String(50), db.ForeignKey('study_modules.module_id'), nullable=False)
    content_type = db.Column(db.String(20), nullable=False)  # text, image, video, exercise
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    order_index = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    module = db.relationship('StudyModule', backref='contents')

class UserModulePermission(db.Model):
    """用户模块权限模型"""
    __tablename__ = 'user_module_permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.String(50), db.ForeignKey('study_modules.module_id'), nullable=False)
    granted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', foreign_keys=[user_id], backref='module_permissions')
    module = db.relationship('StudyModule', backref='user_permissions')
    granter = db.relationship('User', foreign_keys=[granted_by], backref='granted_permissions')

class CourseBooking(db.Model):
    """课程预约模型"""
    __tablename__ = 'course_bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_title = db.Column(db.String(200), nullable=False)
    course_type = db.Column(db.String(50), nullable=False)  # 1对1辅导、小班教学等
    subject = db.Column(db.String(100), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, active, completed, cancelled
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', foreign_keys=[user_id], backref='bookings')
    teacher = db.relationship('User', foreign_keys=[teacher_id], backref='teaching_bookings')
