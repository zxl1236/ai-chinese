#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flask扩展模块
用于初始化各种Flask扩展
"""
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# 初始化数据库
db = SQLAlchemy()

# 初始化CORS
cors = CORS()

def init_extensions(app):
    """初始化所有扩展"""
    # 初始化数据库
    db.init_app(app)
    
    # 初始化CORS
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', ["*"]),
            "methods": app.config.get('CORS_METHODS', ["GET", "POST", "PUT", "DELETE", "OPTIONS"]),
            "allow_headers": app.config.get('CORS_ALLOW_HEADERS', ["Content-Type", "Authorization"])
        }
    })
