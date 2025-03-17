// 加载环境变量
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { askAI } = require('./ai_service');
const { getShippingOptions, getShippingRate, getSupportedCountries } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// AI助手API
app.post('/api/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: '问题不能为空' });
    }
    
    const answer = await askAI(question, context);
    res.json({ answer });
  } catch (error) {
    console.error('处理请求出错:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取支持的国家
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await getSupportedCountries();
    res.json({ countries });
  } catch (error) {
    console.error('获取国家列表出错:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取物流选项
app.get('/api/shipping-options', async (req, res) => {
  try {
    const { country } = req.query;
    
    if (!country) {
      return res.status(400).json({ error: '国家参数不能为空' });
    }
    
    const options = await getShippingOptions(country);
    res.json({ options });
  } catch (error) {
    console.error('获取物流选项出错:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取物流费率
app.get('/api/shipping-rate', async (req, res) => {
  try {
    const { country, weight, productId } = req.query;
    
    if (!country || !weight || !productId) {
      return res.status(400).json({ error: '参数不完整' });
    }
    
    const rate = await getShippingRate(country, parseFloat(weight), productId);
    
    if (!rate) {
      return res.status(404).json({ error: '未找到匹配的费率' });
    }
    
    res.json({ rate });
  } catch (error) {
    console.error('获取物流费率出错:', error);
    res.status(500).json({ error: error.message });
  }
});

// 查询数据库API
app.post('/api/query-db', async (req, res) => {
  try {
    const { country, weight, itemType } = req.body;
    
    console.log('查询参数:', { country, weight, itemType });
    
    if (!country || !weight) {
      return res.status(400).json({ error: '国家和重量参数不能为空' });
    }
    
    // 获取所有支持该国家的物流产品
    const options = await getShippingOptions(country);
    console.log(`找到 ${options.length} 个支持 ${country} 的物流产品`);
    
    // 根据物品类型筛选产品
    let filteredOptions = options;
    if (itemType && itemType !== 'all') {
      const itemTypeMap = {
        'normal': product => product.product_name.includes('普货') && !product.product_name.includes('带电') && !product.product_name.includes('服装'),
        'battery': product => product.product_name.includes('带电'),
        'clothes': product => product.product_name.includes('服装')
      };
      
      if (itemTypeMap[itemType]) {
        filteredOptions = options.filter(itemTypeMap[itemType]);
        console.log(`根据物品类型 ${itemType} 筛选后剩余 ${filteredOptions.length} 个物流产品`);
      }
    }
    
    // 获取每个产品的费率
    const results = [];
    for (const option of filteredOptions) {
      try {
        console.log(`尝试获取产品 ${option.product_id} 的费率...`);
        const rate = await getShippingRate(country, parseFloat(weight), option.product_id);
        
        if (rate) {
          console.log(`成功获取产品 ${option.product_id} 的费率`);
          results.push({
            category: itemType || 'all',
            name: rate.name,
            deliveryTime: rate.deliveryTime,
            weightRange: `${rate.minWeight}<W≤${rate.maxWeight}KG`,
            unitPrice: rate.unitCost,
            basePrice: rate.baseCost,
            totalPrice: rate.totalPrice
          });
        } else {
          console.log(`未找到产品 ${option.product_id} 的费率`);
        }
      } catch (error) {
        console.error(`获取产品 ${option.product_id} 的费率出错:`, error);
        // 继续处理其他产品
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('查询数据库出错:', error);
    res.status(500).json({ error: error.message });
  }
});

// 添加测试函数
async function testAIBehavior() {
  console.log('开始测试AI行为...');
  
  const { askAI } = require('./ai_service');
  
  // 测试场景1: 只提供物品类型，不提供品牌、型号和目的地
  console.log('\n测试场景1: 只提供物品类型，不提供品牌、型号和目的地');
  const test1 = await askAI('我想寄一部手机', {});
  console.log('AI回复:', test1);
  
  // 测试场景2: 提供物品类型和品牌，但不提供型号和目的地
  console.log('\n测试场景2: 提供物品类型和品牌，但不提供型号和目的地');
  const test2 = await askAI('我想寄一部iPhone手机', {});
  console.log('AI回复:', test2);
  
  // 测试场景3: 提供物品类型、品牌和型号，但不提供目的地
  console.log('\n测试场景3: 提供物品类型、品牌和型号，但不提供目的地');
  const test3 = await askAI('我想寄一部iPhone 14 Pro手机', {});
  console.log('AI回复:', test3);
  
  // 测试场景4: 提供物品类型和目的地，但不提供品牌和型号
  console.log('\n测试场景4: 提供物品类型和目的地，但不提供品牌和型号');
  const test4 = await askAI('我想寄一部手机到美国', {});
  console.log('AI回复:', test4);
  
  // 测试场景5: 提供完整信息
  console.log('\n测试场景5: 提供完整信息');
  const test5 = await askAI('我想寄一部iPhone 14 Pro手机到美国', {});
  console.log('AI回复:', test5);
  
  console.log('\n测试完成');
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  // 设置环境变量
  require('dotenv').config();
  
  // 运行测试
  testAIBehavior().catch(err => {
    console.error('测试出错:', err);
  });
} else {
  // 正常启动服务器
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API密钥状态: ${process.env.OPENAI_API_KEY ? '已设置' : '未设置'}`);
  });
} 