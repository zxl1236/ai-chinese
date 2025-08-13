"""
AI语文学习助手 - 后端API代理服务
用于解决前端跨域访问Ollama API的问题
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
import os
from datetime import datetime

try:
    from dashscope import Generation
    DASHSCOPE_AVAILABLE = True
except ImportError:
    DASHSCOPE_AVAILABLE = False
    print("⚠️  DashScope库未安装，将使用requests方式调用API")

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# ✅ 显式放开 CORS 预检
CORS(app,
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=False,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

# API配置
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = "deepseek-r1:1.5b"

# 在线API配置
API_PROVIDERS = {
    "deepseek": {
        "base_url": "https://api.deepseek.com/v1",
        "models": ["deepseek-chat", "deepseek-coder"],
        "api_key_env": "DEEPSEEK_API_KEY"
    },
    "qwen": {
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "models": ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-long", "qwen-plus-2025-04-28"],
        "api_key_env": "DASHSCOPE_API_KEY"
    },
    "ollama": {
        "base_url": OLLAMA_BASE_URL,
        "models": ["deepseek-r1:1.5b", "qwen2.5:0.5b", "llama3.2:1b"],
        "api_key_env": None
    }
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_status = "connected" if response.status_code == 200 else "error"
    except Exception:
        ollama_status = "disconnected"
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "AI语文学习助手后端代理",
        "ollama_status": ollama_status
    })

@app.route('/api/providers', methods=['GET'])
def get_providers():
    """获取可用的API提供商和模型"""
    providers_info = {}
    for provider, config in API_PROVIDERS.items():
        api_key_available = True
        if config["api_key_env"]:
            api_key_available = bool(os.getenv(config["api_key_env"]))
        providers_info[provider] = {
            "models": config["models"],
            "api_key_required": config["api_key_env"] is not None,
            "api_key_available": api_key_available,
            "base_url": config["base_url"]
        }
    return jsonify({"success": True, "providers": providers_info})

@app.route('/api/models', methods=['GET'])
def get_models():
    """获取可用的AI模型列表（从本地Ollama读取）"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=10)
        if response.status_code == 200:
            data = response.json()
            models = [model['name'] for model in data.get('models', [])]
            return jsonify({"success": True, "models": models, "default_model": DEFAULT_MODEL})
        else:
            raise Exception(f"Ollama服务响应错误: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"连接Ollama服务失败: {str(e)}")
        return jsonify({
            "success": False,
            "error": "无法连接到Ollama服务，请确保Ollama正在运行",
            "details": str(e)
        }), 500

 

@app.route('/api/generate', methods=['POST'])
def generate_text():
    """AI文本生成接口 - 支持多提供商（Ollama/DeepSeek/Qwen）"""
    try:
        data = request.get_json() or {}
        prompt = (data.get('prompt') or '').strip()
        if not prompt:
            return jsonify({"success": False, "error": "prompt参数不能为空"}), 400

        model = data.get('model', DEFAULT_MODEL)
        provider = data.get('provider') or detect_provider(model)
        
        logger.info(f"处理AI请求 - 提供商: {provider}, 模型: {model}, 提示长度: {len(prompt)}")
        
        # 使用通用AI响应生成函数
        return generate_ai_response(prompt, model=model)

    except Exception as e:
        logger.error(f"处理AI请求时发生错误: {str(e)}")
        return jsonify({"success": False, "error": "服务器内部错误", "details": str(e)}), 500

# ===== 业务接口 =====

@app.route('/api/analyze-topic', methods=['POST'])
def analyze_topic():
    try:
        data = request.get_json() or {}
        topic = (data.get('topic') or '').strip()
        model = data.get('model', DEFAULT_MODEL)  # ✅ 前端模型透传
        if not topic:
            return jsonify({"success": False, "error": "题目不能为空"}), 400

        prompt = f"""请分析作文题目"{topic}"：

**题目解读**：
- 关键词含义
- 写作重点

**写作角度**（3个）：
1. 角度一
2. 角度二  
3. 角度三

**写作建议**：
- 开头方式
- 结构安排
- 注意事项

请简洁回答，条理清晰。"""

        return generate_ai_response(prompt, model=model)

    except Exception as e:
        logger.error(f"分析题目时发生错误: {str(e)}")
        return jsonify({"success": False, "error": "题目分析失败", "details": str(e)}), 500

@app.route('/api/get-inspiration', methods=['POST'])
def get_inspiration():
    try:
        data = request.get_json() or {}
        topic = (data.get('topic') or '').strip()
        model = data.get('model', DEFAULT_MODEL)
        if not topic:
            return jsonify({"success": False, "error": "题目不能为空"}), 400

        prompt = f"""题目"{topic}"的写作灵感：

**角度一：情感体验**
- 写个人情感经历
- 重点：真实细节

**角度二：成长感悟** 
- 写成长转折点
- 重点：思想变化

**角度三：社会观察**
- 写身边人和事
- 重点：时代特点

**角度四：哲理思考**
- 写人生感悟
- 重点：深入浅出

请简洁回答。"""

        return generate_ai_response(prompt, model=model)

    except Exception as e:
        logger.error(f"获取写作灵感时发生错误: {str(e)}")
        return jsonify({"success": False, "error": "获取写作灵感失败", "details": str(e)}), 500

@app.route('/api/improve-writing', methods=['POST'])
def improve_writing():
    try:
        data = request.get_json() or {}
        content = (data.get('content') or '').strip()
        model = data.get('model', DEFAULT_MODEL)
        if not content:
            return jsonify({"success": False, "error": "文章内容不能为空"}), 400

        if len(content) > 2000:
            content = content[:2000] + "..."

        prompt = f"""请对以下文章内容进行优化分析，提供具体的改进建议：

【文章内容】
{content}

请从以下方面给出详细建议：

1. **语言表达优化**
   - 词汇选择建议
   - 句式变化建议
   - 修辞手法运用

2. **结构和逻辑优化**
   - 段落安排建议
   - 逻辑连接优化
   - 层次结构调整

3. **内容丰富和深化**
   - 细节描写建议
   - 情感表达深化
   - 主题升华建议

4. **具体修改建议**
   - 指出具体需要修改的地方
   - 提供修改后的示例
   - 解释修改原因

请提供实用、具体的建议，帮助提升文章质量。"""

        return generate_ai_response(prompt, model=model)

    except Exception as e:
        logger.error(f"优化文章时发生错误: {str(e)}")
        return jsonify({"success": False, "error": "文章优化失败", "details": str(e)}), 500

@app.route('/api/continue-writing', methods=['POST'])
def continue_writing():
    try:
        data = request.get_json() or {}
        content = (data.get('content') or '').strip()
        model = data.get('model', DEFAULT_MODEL)
        if not content:
            return jsonify({"success": False, "error": "文章内容不能为空"}), 400

        last_part = content[-500:] if len(content) > 500 else content

        prompt = f"""基于以下文章内容，请提供续写建议：

【当前文章内容（结尾部分）】
...{last_part}

请提供以下续写指导：

1. **内容发展方向**
   - 接下来可以写什么内容
   - 情节发展的可能走向
   - 主题深化的方向

2. **承接技巧**
   - 如何自然地承接上文
   - 过渡句的写法建议
   - 保持文章连贯性的方法

3. **写作建议**
   - 段落安排建议
   - 重点突出的内容
   - 需要注意的问题

4. **结尾规划**
   - 如何安排文章结尾
   - 呼应开头的技巧
   - 升华主题的方法

请提供具体、实用的续写指导。"""

        return generate_ai_response(prompt, model=model)

    except Exception as e:
        logger.error(f"提供续写建议时发生错误: {str(e)}")
        return jsonify({"success": False, "error": "续写建议失败", "details": str(e)}), 500

# ===== 调度层：根据模型名选择 provider ，并调用 =====

def detect_provider(model: str) -> str:
    """根据模型名称检测API提供商"""
    for provider, config in API_PROVIDERS.items():
        if model in config["models"]:
            return provider
    if "qwen" in model.lower():
        return "qwen"
    if "deepseek" in model.lower():
        return "deepseek"
    return "ollama"

def call_deepseek_api(prompt, model="deepseek-chat"):
    """调用DeepSeek在线API"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise Exception("请设置DEEPSEEK_API_KEY环境变量")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
        "temperature": 0.7
    }
    response = requests.post("https://api.deepseek.com/v1/chat/completions",
                             headers=headers, json=data, timeout=120)
    if response.status_code == 200:
        result = response.json()
        return result["choices"][0]["message"]["content"]
    else:
        raise Exception(f"DeepSeek API错误: {response.status_code} - {response.text}")

def call_qwen_api(prompt, model="qwen-plus-2025-04-28"):
    """调用阿里Qwen在线API - 优先使用DashScope SDK；失败则走兼容HTTP接口"""
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise Exception("请设置DASHSCOPE_API_KEY环境变量")
    if DASHSCOPE_AVAILABLE:
        try:
            messages = [{"role": "user", "content": prompt}]
            completion = Generation.call(
                api_key=api_key,
                model=model,
                messages=messages,
                result_format="message",
                enable_thinking=True,
                stream=False,               # ✅ 关闭流式，避免前端等太久
                request_timeout=120,        # 120s
                max_output_tokens=1000
            )
            content = completion.output.choices[0].message.content
            reasoning = getattr(completion.output.choices[0].message, "reasoning_content", "") or ""
            if reasoning:
                return f"💭 思考过程：\n{reasoning}\n\n📝 回答：\n{content}"
            return content
        except Exception as e:
            logger.error(f"DashScope SDK调用失败: {str(e)}，切换到HTTP兼容接口")
            return call_qwen_api_fallback(prompt, model, api_key)
    else:
        return call_qwen_api_fallback(prompt, model, api_key)

def call_qwen_api_fallback(prompt, model, api_key):
    """Qwen API备用调用方式（兼容 OpenAI Chat Completions 协议）"""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
        "temperature": 0.7,
        "stream": False
    }
    response = requests.post("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                             headers=headers, json=data, timeout=120)
    if response.status_code == 200:
        result = response.json()
        return result["choices"][0]["message"]["content"]
    else:
        raise Exception(f"Qwen API错误: {response.status_code} - {response.text}")

def call_ollama_api(prompt, model="deepseek-r1:1.5b"):
    """调用本地Ollama API"""
    ollama_request = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 1000,
            "num_predict": 1000,
            "num_ctx": 2048,
            "num_thread": 4
        }
    }
    response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=ollama_request, timeout=120)
    if response.status_code == 200:
        data = response.json()
        return data.get('response', '')
    else:
        raise Exception(f"Ollama API错误: {response.status_code}")

def generate_ai_response(prompt, model=None):
    """通用AI响应生成函数 - 支持多个API提供商"""
    model = model or DEFAULT_MODEL
    provider = detect_provider(model)
    try:
        if provider == "deepseek":
            ai_response = call_deepseek_api(prompt, model)
        elif provider == "qwen":
            ai_response = call_qwen_api(prompt, model)
        elif provider == "ollama":
            ai_response = call_ollama_api(prompt, model)
        else:
            raise Exception(f"不支持的API提供商: {provider}")

        # ✅ 正确返回成功结果（你原来这里少了 return）
        return jsonify({
            "success": True,
            "response": ai_response,
            "model": model,
            "provider": provider
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "AI响应生成失败",
            "details": str(e),
            "provider": provider
        }), 500

if __name__ == '__main__':
    print("🚀 启动AI语文学习助手后端服务...")
    print("📡 服务地址: http://localhost:5000")
    print("🤖 支持的AI模型:")
    print("   📱 在线模型:")
    print("     - DeepSeek Chat/Coder (需要DEEPSEEK_API_KEY)")
    print("     - Qwen Turbo/Plus/Max (需要DASHSCOPE_API_KEY)")
    print("   💻 本地模型:")
    print("     - DeepSeek R1:1.5b")
    print("     - Qwen2.5:0.5b")
    print("     - Llama3.2:1b")
    print("🔗 代理目标: Ollama API (http://localhost:11434)")

    print("\n🔑 API密钥状态:")
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    dashscope_key = os.getenv("DASHSCOPE_API_KEY")
    print(f"   DeepSeek:   {'✅ 已配置' if deepseek_key else '❌ 未配置'}")
    print(f"   DashScope:  {'✅ 已配置' if dashscope_key else '❌ 未配置'}")

    print(f"\n🔧 SDK状态:")
    print(f"   DashScope SDK: {'✅ 已安装' if DASHSCOPE_AVAILABLE else '❌ 未安装'}")

    if dashscope_key and DASHSCOPE_AVAILABLE:
        print("🧠 已启用通义千问思考模式！")
    elif not dashscope_key:
        print("\n💡 提示: 设置DASHSCOPE_API_KEY环境变量以使用思考模型")

    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
