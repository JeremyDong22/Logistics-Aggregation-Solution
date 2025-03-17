// 测试AI服务的行为
require('dotenv').config();
const { askAI } = require('./ai_service');

// 模拟对话历史
let conversationHistory = [];

// 模拟对话函数
async function simulateConversation(userMessage, context = {}) {
  console.log(`\n用户: ${userMessage}`);
  
  // 添加对话历史到上下文
  const contextWithHistory = {
    ...context,
    history: conversationHistory
  };
  
  // 获取AI回复
  const aiResponse = await askAI(userMessage, contextWithHistory);
  console.log(`AI: ${aiResponse}`);
  
  // 更新对话历史
  conversationHistory.push({ role: 'user', content: userMessage });
  conversationHistory.push({ role: 'assistant', content: aiResponse });
  
  return aiResponse;
}

// 测试场景
async function runTests() {
  try {
    console.log('=== 测试场景1: 只提供物品类型，不提供品牌、型号和目的地 ===');
    conversationHistory = [];
    await simulateConversation('我想寄一部手机');
    
    console.log('\n=== 测试场景2: 提供物品类型和品牌，不提供型号和目的地 ===');
    conversationHistory = [];
    await simulateConversation('我想寄一部iPhone手机');
    
    console.log('\n=== 测试场景3: 提供物品类型、品牌和型号，不提供目的地 ===');
    conversationHistory = [];
    await simulateConversation('我想寄一部iPhone 14 Pro手机');
    
    console.log('\n=== 测试场景4: 提供物品类型和目的地，不提供品牌和型号 ===');
    conversationHistory = [];
    await simulateConversation('我想寄一部手机到美国');
    
    console.log('\n=== 测试场景5: 提供完整信息 ===');
    conversationHistory = [];
    await simulateConversation('我想寄一部iPhone 14 Pro手机到美国');
    
    console.log('\n=== 测试场景6: 多轮对话测试 - 逐步提供信息 ===');
    conversationHistory = [];
    await simulateConversation('我想寄一部手机');
    await simulateConversation('是iPhone 14 Pro');
    await simulateConversation('我要寄到美国');
    
    console.log('\n=== 测试场景7: 多轮对话测试 - 提供不同顺序的信息 ===');
    conversationHistory = [];
    await simulateConversation('我想寄东西到日本');
    await simulateConversation('是一部手机');
    await simulateConversation('是iPhone 14 Pro');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
console.log('开始AI行为测试...');
runTests().then(() => {
  console.log('\n测试完成');
}); 