// 验证DeepSeek连接的Node.js脚本
// 在浏览器控制台中运行

async function verifyDeepSeek() {
    console.log('🔍 开始验证DeepSeek连接...');
    
    try {
        // 1. 检查Ollama服务
        console.log('1. 检查Ollama服务...');
        const healthResponse = await fetch('http://localhost:11434/api/tags');
        if (!healthResponse.ok) {
            throw new Error('Ollama服务未运行');
        }
        const healthData = await healthResponse.json();
        console.log('✅ Ollama服务正常，模型数量:', healthData.models.length);
        
        // 2. 检查DeepSeek模型
        const deepseekModels = healthData.models.filter(m => m.name.includes('deepseek'));
        if (deepseekModels.length === 0) {
            throw new Error('未找到DeepSeek模型');
        }
        console.log('✅ 找到DeepSeek模型:', deepseekModels.map(m => m.name));
        
        // 3. 测试简单对话
        console.log('2. 测试简单对话...');
        const chatResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1:1.5b',
                prompt: '请用中文回复：你好',
                stream: false,
                options: { temperature: 0.7 }
            })
        });
        
        if (!chatResponse.ok) {
            throw new Error(`对话测试失败: ${chatResponse.status}`);
        }
        
        const chatData = await chatResponse.json();
        console.log('✅ 对话测试成功，AI回复:', chatData.response);
        
        // 4. 测试写作分析
        console.log('3. 测试写作分析...');
        const analysisResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1:1.5b',
                prompt: '请分析作文题目"变形记"，给出3个写作角度建议',
                system: '你是专业的语文老师',
                stream: false,
                options: { temperature: 0.7, max_tokens: 500 }
            })
        });
        
        if (!analysisResponse.ok) {
            throw new Error(`分析测试失败: ${analysisResponse.status}`);
        }
        
        const analysisData = await analysisResponse.json();
        console.log('✅ 写作分析测试成功，AI建议:', analysisData.response);
        
        console.log('🎉 DeepSeek验证完成！所有测试通过，可以在主应用中使用AI功能了！');
        
        return true;
    } catch (error) {
        console.error('❌ 验证失败:', error.message);
        console.error('详细错误:', error);
        return false;
    }
}

// 如果在浏览器控制台中运行，直接执行
if (typeof window !== 'undefined') {
    verifyDeepSeek();
}