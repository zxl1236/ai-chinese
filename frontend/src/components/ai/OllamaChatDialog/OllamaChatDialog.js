import React, { useState, useEffect, useRef } from 'react';
import './OllamaChatDialog.css';

const OllamaChatDialog = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek1.8');
  const [connectionStatus, setConnectionStatus] = useState('检查中...');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [useOnlineAPI, setUseOnlineAPI] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 可用本地模型
  const availableModels = [
    { value: 'deepseek1.8', label: 'DeepSeek 1.8 - 本地模型' },
  ];

  // 在线API模型选项
  const onlineModels = [
    { value: 'qwen-turbo', label: 'Qwen Turbo - 快速响应' },
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // 连接检查
  const checkOllamaConnection = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) {
        setConnectionStatus('已连接');
        // 只有在当前选择的是本地模型时才自动切换到本地
        if (!onlineModels.some(m => m.value === selectedModel)) {
          setUseOnlineAPI(false);
        }
        return true;
      } else {
        setConnectionStatus('连接错误');
        // 只有在当前选择的是本地模型时才自动切换
        if (!onlineModels.some(m => m.value === selectedModel)) {
          setUseOnlineAPI(true);
        }
        return false;
      }
    } catch {
      setConnectionStatus('未连接 - 使用在线API');
      // 只有在当前选择的是本地模型时才自动切换
      if (!onlineModels.some(m => m.value === selectedModel)) {
        setUseOnlineAPI(true);
      }
      return false;
    }
  };

  // 发送消息到在线API
  const sendMessageToOnlineAPI = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          model: selectedModel,
          provider: selectedModel.includes('qwen') ? 'qwen' : 'deepseek'
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      
      const aiMsg = {
        id: Date.now() + 1,
        text: result.response || '抱歉，我没能生成有效回复。',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        text: `在线API调用失败：${err.message}。请检查后端服务是否启动。`,
        sender: 'ai',
        isError: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  // 发送消息到本地Ollama
  const sendMessageToOllama = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: userMessage.text },
          ],
          stream: true,
          options: { temperature: 0.7, top_p: 0.9, num_predict: 2048 },
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              full += data.message.content;
              setStreamingMessage(full);
            }
          } catch {
            // 忽略半包
          }
        }
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: full || '抱歉，我没能生成有效回复。',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setStreamingMessage('');
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        text: `本地Ollama连接失败：${err.message}。正在切换到在线API...`,
        sender: 'ai',
        isError: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
      
      // 自动切换到在线API
      setUseOnlineAPI(true);
      setConnectionStatus('自动切换到在线API');
      
      // 重试发送消息
      await sendMessageToOnlineAPI(userMessage);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // 根据选择的模型类型决定使用哪个API
      const isOnlineModel = onlineModels.some(m => m.value === selectedModel);
      if (isOnlineModel || useOnlineAPI) {
        await sendMessageToOnlineAPI(userMessage);
      } else {
        await sendMessageToOllama(userMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => { setMessages([]); setStreamingMessage(''); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoGrow = () => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
  };

  useEffect(() => {
    if (isOpen) {
      checkOllamaConnection();
      const it = setInterval(checkOllamaConnection, 30000);
      return () => clearInterval(it);
    }
  }, [isOpen]);

  useEffect(scrollToBottom, [messages, streamingMessage]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);
  useEffect(autoGrow, [inputValue]);

  if (!isOpen) return null;

  const hasMessages = messages.length > 0;

  return (
    <div className="cgpt-overlay">
      <div className="cgpt-shell">
        {/* 顶栏 */}
        <header className="cgpt-topbar">
          <div className="cgpt-topbar-inner">
            <div className="cgpt-brand">AI 助手</div>
            <div className="cgpt-tools">
              <select
                className="cgpt-model"
                value={selectedModel}
                onChange={(e) => {
                  const newModel = e.target.value;
                  setSelectedModel(newModel);
                  // 根据选择的模型类型自动设置API模式
                  const isOnlineModel = onlineModels.some(m => m.value === newModel);
                  setUseOnlineAPI(isOnlineModel);
                }}
              >
                <optgroup label="本地模型 (Ollama)">
                  {availableModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
                <optgroup label="在线API">
                  {onlineModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
              </select>
              <button 
                className={`cgpt-toggle-api ${useOnlineAPI ? 'online' : 'local'}`}
                onClick={() => {
                  const newMode = !useOnlineAPI;
                  setUseOnlineAPI(newMode);
                  // 如果切换到本地模式，自动选择本地模型
                  if (!newMode) {
                    setSelectedModel(availableModels[0].value);
                  }
                  // 如果切换到在线模式，自动选择在线模型
                  else {
                    setSelectedModel(onlineModels[0].value);
                  }
                }}
                title={useOnlineAPI ? '切换到本地模型' : '切换到在线API'}
              >
                {useOnlineAPI ? '🌐 在线' : '💻 本地'}
              </button>
              <div className={`cgpt-conn ${connectionStatus === '已连接' ? 'ok' : connectionStatus === '连接错误' ? 'warn' : 'off'}`}>
                <span className="dot" />
                {connectionStatus}
              </div>
              <button className="cgpt-close" onClick={onClose} aria-label="关闭">✕</button>
            </div>
          </div>
        </header>

        {/* 消息流 */}
        <main className={`cgpt-main ${hasMessages ? 'with' : 'empty'}`}>
          {!hasMessages && (
            <div className="cgpt-empty">
              <div className="emoji">💬</div>
              <h3>有什么可以帮忙的？</h3>
              <p>提出问题或粘贴文本，我会像 ChatGPT 一样回答。</p>
            </div>
          )}

          {hasMessages && (
            <div className="cgpt-thread">
              {messages.map(msg => (
                <section
                  key={msg.id}
                  className={`cgpt-msg ${msg.sender === 'user' ? 'user' : 'ai'} ${msg.isError ? 'error' : ''}`}
                >
                  <div className="avatar">{msg.sender === 'user' ? '👤' : (msg.isError ? '⚠️' : '🤖')}</div>
                  <div className="content">
                    {msg.text}
                  </div>
                </section>
              ))}

              {/* 流式显示 */}
              {isLoading && streamingMessage && (
                <section className="cgpt-msg ai">
                  <div className="avatar">🤖</div>
                  <div className="content streaming">
                    {streamingMessage}<span className="caret">|</span>
                  </div>
                </section>
              )}

              {/* "AI 正在思考…" 占位（无流片段时） */}
              {isLoading && !streamingMessage && (
                <div className="cgpt-thinking">
                  <div className="dots"><i/><i/><i/></div>
                  <span>AI 正在思考…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* 输入区（吸底） */}
        <footer className="cgpt-composer">
          <div className="cgpt-composer-inner">
            <div className="input-wrap">
              <textarea
                ref={inputRef}
                className="input"
                value={inputValue}
                placeholder="询问任何问题"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
              />
              <button
                className="send"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                title="发送"
              >
                ➤
              </button>
            </div>

            {messages.length > 0 && (
              <div className="composer-actions">
                <button className="clear" onClick={clearMessages} disabled={isLoading}>清空对话</button>
              </div>
            )}

            <div className="hint">ChatGPT 也可能会犯错，请核对重要信息。</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OllamaChatDialog;