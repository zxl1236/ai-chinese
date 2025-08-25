#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI服务模块
包含调用各种AI服务的功能
"""
import os
import requests
import json
from typing import Optional

class AIService:
    """AI服务类"""
    
    @staticmethod
    def call_ai_service(provider: str, model: str, prompt: str) -> str:
        """调用AI服务"""
        try:
            if provider == 'qwen':
                return AIService._call_qwen(model, prompt)
            elif provider == 'deepseek':
                return AIService._call_deepseek(model, prompt)
            elif provider == 'ollama' or model.startswith('deepseek'):
                return AIService._call_ollama(model, prompt)
            else:
                raise Exception(f'不支持的提供商: {provider}')
                
        except requests.exceptions.Timeout:
            raise Exception('AI服务响应超时，请稍后重试')
        except requests.exceptions.ConnectionError:
            if provider == 'ollama':
                raise Exception('无法连接到Ollama服务，请确保Ollama正在运行')
            else:
                raise Exception('网络连接错误，请检查网络连接')
        except requests.exceptions.HTTPError as e:
            raise Exception(f'AI服务错误: {e.response.status_code} - {e.response.text}')
        except Exception as e:
            raise Exception(f'AI服务调用失败: {str(e)}')
    
    @staticmethod
    def _call_qwen(model: str, prompt: str) -> str:
        """调用阿里云Qwen API"""
        api_key = os.getenv('DASHSCOPE_API_KEY')
        if not api_key:
            raise Exception('Qwen API密钥未配置，请设置 DASHSCOPE_API_KEY 环境变量')
        
        url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        data = {
            'model': model,
            'input': {
                'messages': [
                    {'role': 'user', 'content': prompt}
                ]
            },
            'parameters': {'temperature': 0.7}
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if 'output' in result and 'text' in result['output']:
            return result['output']['text']
        else:
            raise Exception(f'Qwen API返回格式错误: {result}')
    
    @staticmethod
    def _call_deepseek(model: str, prompt: str) -> str:
        """调用DeepSeek API"""
        api_key = os.getenv('DEEPSEEK_API_KEY')
        if not api_key:
            raise Exception('DeepSeek API密钥未配置，请设置 DEEPSEEK_API_KEY 环境变量')
        
        url = 'https://api.deepseek.com/chat/completions'
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        data = {
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.7
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' in result and len(result['choices']) > 0:
            return result['choices'][0]['message']['content']
        else:
            raise Exception(f'DeepSeek API返回格式错误: {result}')
    
    @staticmethod
    def _call_ollama(model: str, prompt: str) -> str:
        """调用本地Ollama API"""
        url = 'http://127.0.0.1:11434/api/generate'
        data = {
            'model': model,
            'prompt': prompt,
            'stream': False
        }
        
        response = requests.post(url, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        if 'response' in result:
            return result['response']
        else:
            raise Exception(f'Ollama API返回格式错误: {result}')
    
    @staticmethod
    def get_available_providers() -> dict:
        """获取可用的AI提供商和API密钥状态"""
        deepseek_key_available = bool(os.getenv('DEEPSEEK_API_KEY'))
        qwen_key_available = bool(os.getenv('DASHSCOPE_API_KEY'))
        
        return {
            "ollama": {
                "name": "Ollama (Local)",
                "endpoint": "http://127.0.0.1:11434",
                "api_key_available": True,
                "models": [
                    {"id": "qwen2.5:0.5b", "label": "Qwen2.5 0.5B"},
                    {"id": "llama3.2:1b", "label": "Llama3.2 1B"},
                    {"id": "deepseek-r1:1.5b", "label": "DeepSeek R1 1.5B"}
                ]
            },
            "deepseek": {
                "name": "DeepSeek (Cloud)",
                "endpoint": "https://api.deepseek.com",
                "api_key_available": deepseek_key_available,
                "models": [
                    {"id": "deepseek-chat", "label": "DeepSeek Chat"},
                    {"id": "deepseek-coder", "label": "DeepSeek Coder"}
                ]
            },
            "qwen": {
                "name": "Qwen (Cloud)",
                "endpoint": "https://dashscope.aliyuncs.com",
                "api_key_available": qwen_key_available,
                "models": [
                    {"id": "qwen-turbo", "label": "Qwen Turbo"},
                    {"id": "qwen-plus", "label": "Qwen Plus"},
                    {"id": "qwen-max", "label": "Qwen Max"},
                    {"id": "qwen-plus-2025-04-28", "label": "Qwen Plus 思考模型"}
                ]
            }
        }
