#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI聊天API路由
提供AI聊天功能
"""
from flask import Blueprint, request, jsonify
from services.ai_service import AIService

# 创建AI蓝图
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/chat', methods=['POST'])
def chat():
    """AI聊天接口"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求数据不能为空'}), 400
        
        message = data.get('message')
        model = data.get('model', 'deepseek1.8')
        provider = data.get('provider', 'deepseek')
        
        if not message:
            return jsonify({'error': '消息内容不能为空'}), 400
        
        # 调用AI服务
        try:
            response = AIService.call_ai_service(provider, model, message)
            return jsonify({
                'success': True,
                'response': response,
                'model': model,
                'provider': provider
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'model': model,
                'provider': provider
            }), 500
            
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

@ai_bp.route('/providers', methods=['GET'])
def get_providers():
    """获取可用的AI提供商"""
    try:
        providers = AIService.get_available_providers()
        return jsonify({
            'success': True,
            'providers': providers
        })
    except Exception as e:
        return jsonify({'error': f'获取提供商信息失败: {str(e)}'}), 500

@ai_bp.route('/health', methods=['GET'])
def health_check():
    """AI服务健康检查"""
    try:
        # 检查Ollama连接
        ollama_available = False
        try:
            import requests
            response = requests.get('http://localhost:11434/api/tags', timeout=5)
            ollama_available = response.status_code == 200
        except:
            pass
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'ollama_available': ollama_available,
            'timestamp': __import__('datetime').datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': f'健康检查失败: {str(e)}'}), 500
