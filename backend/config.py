#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置文件
包含数据库配置、环境配置等
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """基础配置类"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 数据库配置
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///chinese_learning.db')
    
    # 环境配置
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # CORS配置
    CORS_ORIGINS = ["*"]
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS = ["Content-Type", "Authorization"]

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    ENV = 'production'
    
    # 生产环境数据库配置
    if Config.DATABASE_URL.startswith('mysql://'):
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 10,
            'pool_recycle': 3600,
            'pool_pre_ping': True
        }
    elif Config.DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = Config.DATABASE_URL.replace('postgres://', 'postgresql://', 1)

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DEBUG = True
    DATABASE_URL = 'sqlite:///:memory:'

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """获取当前环境配置"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
