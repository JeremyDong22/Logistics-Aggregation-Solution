// OpenAI API服务
const fetch = require('node-fetch');
const { getShippingOptions, getShippingRate, getSupportedCountries } = require('./db');

// 使用环境变量获取API密钥
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// 物品重量参考数据
const itemWeightReference = {
  '手机': {
    '通用': 0.2,
    'iPhone': {
      '通用': 0.2,
      'iPhone 15 Pro Max': 0.221,
      'iPhone 15 Pro': 0.187,
      'iPhone 15': 0.171,
      'iPhone 14 Pro Max': 0.240,
      'iPhone 14 Pro': 0.206,
      'iPhone 14': 0.172,
      'iPhone 13': 0.174,
      'iPhone 12': 0.164,
      'iPhone SE': 0.148
    },
    '三星': {
      '通用': 0.2,
      'Galaxy S23 Ultra': 0.234,
      'Galaxy S23': 0.168,
      'Galaxy S22': 0.167,
      'Galaxy A54': 0.202,
      'Galaxy A34': 0.199
    },
    '华为': {
      '通用': 0.2,
      'Mate 60 Pro': 0.225,
      'P60 Pro': 0.200,
      'Nova 12': 0.191
    },
    '小米': {
      '通用': 0.2,
      '14 Pro': 0.230,
      '14': 0.193,
      'Redmi Note 12': 0.188
    },
    'OPPO': {
      '通用': 0.2,
      'Find X6 Pro': 0.216,
      'Reno 10 Pro': 0.185
    }
  },
  '笔记本电脑': {
    '通用': 2.0,
    'MacBook': {
      '通用': 1.5,
      'MacBook Air M2': 1.24,
      'MacBook Air M1': 1.29,
      'MacBook Pro 14': 1.6,
      'MacBook Pro 16': 2.15
    },
    '联想': {
      '通用': 1.8,
      'ThinkPad X1': 1.38,
      'Yoga': 1.5,
      'Legion': 2.5
    },
    '戴尔': {
      '通用': 1.9,
      'XPS 13': 1.27,
      'XPS 15': 1.96,
      'Inspiron': 1.7
    },
    '华硕': {
      '通用': 1.8,
      'ZenBook': 1.3,
      'ROG': 2.4
    }
  },
  '平板电脑': {
    '通用': 0.6,
    'iPad': {
      '通用': 0.5,
      'iPad Pro 12.9': 0.682,
      'iPad Pro 11': 0.466,
      'iPad Air': 0.461,
      'iPad': 0.487,
      'iPad mini': 0.293
    },
    '三星': {
      '通用': 0.55,
      'Galaxy Tab S9 Ultra': 0.732,
      'Galaxy Tab S9': 0.498,
      'Galaxy Tab A': 0.508
    }
  },
  '相机': {
    '通用': 0.7,
    '单反': 0.9,
    '微单': 0.5,
    '卡片机': 0.3
  },
  '服装': {
    '通用': 0.5,
    'T恤': 0.2,
    '衬衫': 0.3,
    '裤子': 0.5,
    '外套': 0.8,
    '羽绒服': 1.2,
    '鞋子': 0.8
  },
  '化妆品': {
    '通用': 0.3,
    '口红': 0.05,
    '粉底液': 0.15,
    '眼影盘': 0.1,
    '护肤套装': 0.8
  },
  '首饰': {
    '通用': 0.1,
    '项链': 0.05,
    '手链': 0.03,
    '耳环': 0.01,
    '戒指': 0.01
  }
};

/**
 * 根据物品描述估算重量
 * @param {string} itemDescription - 物品描述
 * @returns {Object} - 估算结果，包含重量和是否需要更多信息
 */
function estimateItemWeight(itemDescription) {
  // 转换为小写并移除标点符号，便于匹配
  const normalizedDesc = itemDescription.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  
  // 检查是否包含特定物品类型
  let itemType = null;
  let brand = null;
  let model = null;
  
  // 检查物品类型
  for (const type in itemWeightReference) {
    if (normalizedDesc.includes(type.toLowerCase())) {
      itemType = type;
      break;
    }
  }
  
  // 如果找到物品类型，尝试识别品牌和型号
  if (itemType) {
    // 检查品牌
    for (const brandName in itemWeightReference[itemType]) {
      if (brandName !== '通用' && normalizedDesc.includes(brandName.toLowerCase())) {
        brand = brandName;
        
        // 检查型号
        if (typeof itemWeightReference[itemType][brand] === 'object') {
          for (const modelName in itemWeightReference[itemType][brand]) {
            if (modelName !== '通用' && normalizedDesc.includes(modelName.toLowerCase())) {
              model = modelName;
              break;
            }
          }
        }
        break;
      }
    }
    
    // 获取估算重量
    let weight = 0;
    let needMoreInfo = false;
    
    if (model && brand) {
      // 有具体型号
      weight = itemWeightReference[itemType][brand][model];
    } else if (brand) {
      // 只有品牌
      weight = itemWeightReference[itemType][brand]['通用'];
      needMoreInfo = true;
    } else {
      // 只有物品类型
      weight = itemWeightReference[itemType]['通用'];
      needMoreInfo = true;
    }
    
    return {
      itemType,
      brand,
      model,
      weight,
      needMoreInfo,
      confidence: model ? 'high' : (brand ? 'medium' : 'low')
    };
  }
  
  // 未找到匹配的物品类型
  return {
    itemType: null,
    weight: 0,
    needMoreInfo: true,
    confidence: 'none'
  };
}

/**
 * 使用网络搜索获取物品重量
 * @param {string} query - 搜索查询
 * @returns {Promise<number>} - 搜索到的重量（kg）
 */
async function searchItemWeight(query) {
  try {
    // 构建搜索查询
    const searchQuery = `${query} 重量 kg`;
    
    // 这里应该调用实际的网络搜索API，如Google Search API或Bing Search API
    // 由于这里没有实际的API密钥，我们使用模拟数据
    
    // 模拟网络搜索延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 从参考数据中尝试匹配
    const estimationResult = estimateItemWeight(query);
    
    if (estimationResult.weight > 0) {
      return estimationResult.weight;
    }
    
    // 如果参考数据中没有，返回默认值
    return 0.5; // 默认0.5kg
  } catch (error) {
    console.error('搜索物品重量出错:', error);
    return 0.5; // 出错时返回默认值
  }
}

/**
 * 调用OpenAI API获取回答
 * @param {string} question - 用户问题
 * @param {object} context - 查询上下文（物品类型、重量、国家等）
 * @returns {Promise<string>} - AI回答
 */
async function askAI(question, context) {
  try {
    // 检查API密钥是否设置
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API密钥未设置，请在.env文件中设置OPENAI_API_KEY');
      return '抱歉，AI助手未正确配置。请联系管理员设置API密钥。';
    }

    // 处理对话历史
    const history = context.history || [];
    
    // 从历史对话中提取信息
    let extractedItemType = '';
    let extractedBrand = '';
    let extractedModel = '';
    let extractedCountry = '';
    
    // 分析历史对话，提取已知信息
    for (const message of history) {
      if (message.role === 'user') {
        // 检查物品类型
        for (const type in itemWeightReference) {
          if (message.content.toLowerCase().includes(type.toLowerCase())) {
            extractedItemType = type;
          }
        }
        
        // 检查品牌
        if (extractedItemType) {
          for (const brand in itemWeightReference[extractedItemType]) {
            if (brand !== '通用' && message.content.toLowerCase().includes(brand.toLowerCase())) {
              extractedBrand = brand;
            }
          }
        }
        
        // 检查型号
        if (extractedItemType && extractedBrand) {
          if (typeof itemWeightReference[extractedItemType][extractedBrand] === 'object') {
            for (const model in itemWeightReference[extractedItemType][extractedBrand]) {
              if (model !== '通用' && message.content.toLowerCase().includes(model.toLowerCase())) {
                extractedModel = model;
              }
            }
          }
        }
        
        // 检查国家
        const countryMatch = message.content.match(/到([\u4e00-\u9fa5]+)(?:国家|国)?/);
        if (countryMatch && countryMatch[1]) {
          extractedCountry = countryMatch[1];
        }
      }
    }

    // 分析用户问题，检查是否包含物品描述和目的地
    const containsItem = /寄.*?到|发.*?到|送.*?到/.test(question);
    const estimationResult = containsItem ? estimateItemWeight(question) : null;
    
    // 提取目的地国家
    let destinationCountry = context.country || extractedCountry;
    const countryMatch = question.match(/到([\u4e00-\u9fa5]+)(?:国家|国)?/);
    if (countryMatch && countryMatch[1]) {
      destinationCountry = countryMatch[1];
    }
    
    // 合并从历史对话中提取的信息和当前问题中的信息
    let finalItemType = estimationResult ? estimationResult.itemType : null;
    let finalBrand = estimationResult ? estimationResult.brand : null;
    let finalModel = estimationResult ? estimationResult.model : null;
    
    if (!finalItemType && extractedItemType) finalItemType = extractedItemType;
    if (!finalBrand && extractedBrand) finalBrand = extractedBrand;
    if (!finalModel && extractedModel) finalModel = extractedModel;
    
    // 创建合并后的估算结果
    let mergedEstimationResult = null;
    if (finalItemType) {
      let weight = 0;
      let needMoreInfo = true;
      let confidence = 'low';
      
      if (finalModel && finalBrand) {
        weight = itemWeightReference[finalItemType][finalBrand][finalModel];
        needMoreInfo = false;
        confidence = 'high';
      } else if (finalBrand) {
        weight = itemWeightReference[finalItemType][finalBrand]['通用'];
        needMoreInfo = true;
        confidence = 'medium';
      } else {
        weight = itemWeightReference[finalItemType]['通用'];
        needMoreInfo = true;
        confidence = 'low';
      }
      
      mergedEstimationResult = {
        itemType: finalItemType,
        brand: finalBrand,
        model: finalModel,
        weight,
        needMoreInfo,
        confidence
      };
    } else {
      mergedEstimationResult = estimationResult;
    }
    
    // 如果用户提到了物品但没有提供足够信息，且没有明确的型号
    const needMoreItemInfo = mergedEstimationResult && 
                            (mergedEstimationResult.needMoreInfo || !mergedEstimationResult.model) && 
                            mergedEstimationResult.confidence !== 'high';
    const needCountryInfo = containsItem && !destinationCountry;
    
    if (needMoreItemInfo || needCountryInfo) {
      // 构建提示，询问更多信息
      let promptMessage = '';
      
      if (needMoreItemInfo) {
        promptMessage += `用户似乎想寄送${mergedEstimationResult.itemType || '某种物品'}，但我需要更多信息来准确估算重量。
请询问用户更具体的信息，如品牌、型号等，以便我能提供更准确的物流方案建议。`;
      }
      
      if (needCountryInfo) {
        promptMessage += `
用户没有明确指定目的地国家，这对于提供准确的物流方案和价格至关重要。
请询问用户想要将物品寄送到哪个国家，以便我能提供相应的物流选项和价格。`;
      }
      
      const systemPrompt = `你是菜鸟物流价格查询助手，帮助用户查询最合适的物流方案。
${promptMessage}

重要提示：
1. 只询问一次所需信息，不要重复询问相同的问题
2. 如果用户已经提供了某项信息，不要再询问该信息
3. 保持回答简洁明了`;

      // 构建消息历史
      const messages = [
        { role: 'system', content: systemPrompt }
      ];
      
      // 添加历史对话（最多3轮）
      const recentHistory = history.slice(-6);
      if (recentHistory.length > 0) {
        messages.push(...recentHistory);
      }
      
      // 添加当前问题
      messages.push({ role: 'user', content: question });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API错误:', data.error);
        return `抱歉，我遇到了问题：${data.error.message || '未知错误'}`;
      }
      
      return data.choices[0].message.content;
    }

    // 如果有足够信息，或者用户已经提供了重量
    let weight = context.weight ? parseFloat(context.weight) : 0;
    
    // 如果用户没有明确提供重量，但我们可以估算
    if (!weight && mergedEstimationResult && mergedEstimationResult.weight > 0) {
      weight = mergedEstimationResult.weight;
      
      // 如果是手机，考虑包装重量
      if (mergedEstimationResult.itemType === '手机') {
        // 手机包装通常增加约0.3kg
        weight += 0.3;
      } else if (mergedEstimationResult.itemType === '笔记本电脑') {
        // 笔记本包装通常增加约0.5kg
        weight += 0.5;
      } else if (mergedEstimationResult.itemType === '平板电脑') {
        // 平板包装通常增加约0.4kg
        weight += 0.4;
      } else {
        // 其他物品，增加20%的重量作为包装
        weight *= 1.2;
      }
    }
    
    // 添加物品类型分类函数
    /**
     * 根据物品类型确定物流产品类别
     * @param {string} itemType - 物品类型
     * @returns {string} - 物流产品类别（普货、带电、服装）
     */
    function determineShippingCategory(itemType) {
      // 电子产品通常使用带电产品线
      const electronicItems = ['手机', '笔记本电脑', '平板电脑', '相机', '电子产品', '电子设备'];
      // 服装类产品使用服装专线
      const clothingItems = ['服装', 'T恤', '衬衫', '裤子', '外套', '羽绒服', '鞋子'];
      
      if (electronicItems.includes(itemType)) {
        return '带电';
      } else if (clothingItems.includes(itemType)) {
        return '服装';
      } else {
        return '普货';
      }
    }

    // 在查询物流选项前添加产品类别判断
    // 如果有重量和目的地，查询物流选项
    let dbContext = '';
    let shippingCategory = '';

    if (mergedEstimationResult && mergedEstimationResult.itemType) {
      shippingCategory = determineShippingCategory(mergedEstimationResult.itemType);
    }

    if (weight > 0 && destinationCountry) {
      try {
        // 获取支持的物流选项
        const shippingOptions = await getShippingOptions(destinationCountry);
        
        if (shippingOptions && shippingOptions.length > 0) {
          dbContext += `\n该国家支持的物流选项:\n`;
          
          // 根据物品类型筛选合适的物流产品
          let filteredOptions = shippingOptions;
          if (shippingCategory) {
            // 根据物品类别筛选产品
            if (shippingCategory === '带电') {
              filteredOptions = shippingOptions.filter(option => 
                option.product_name.includes('带电') || option.product_name.includes('电子')
              );
              // 如果没有找到带电产品，使用所有选项
              if (filteredOptions.length === 0) filteredOptions = shippingOptions;
            } else if (shippingCategory === '服装') {
              filteredOptions = shippingOptions.filter(option => 
                option.product_name.includes('服装') || option.product_name.includes('衣物')
              );
              // 如果没有找到服装产品，使用所有选项
              if (filteredOptions.length === 0) filteredOptions = shippingOptions;
            } else {
              // 普货，排除带电和服装专线
              filteredOptions = shippingOptions.filter(option => 
                !option.product_name.includes('带电') && !option.product_name.includes('服装')
              );
              // 如果过滤后没有选项，使用所有选项
              if (filteredOptions.length === 0) filteredOptions = shippingOptions;
            }
          }
          
          filteredOptions.forEach(option => {
            dbContext += `- ${option.product_name}\n`;
          });
          
          // 获取具体价格
          dbContext += `\n根据估算重量(${weight.toFixed(2)}kg)查询到的物流价格:\n`;
          
          for (const option of filteredOptions) {
            try {
              const rate = await getShippingRate(destinationCountry, weight, option.product_id);
              if (rate) {
                dbContext += `- ${rate.name}: 价格${rate.totalPrice}CNY, 时效${rate.deliveryTime}\n`;
              }
            } catch (err) {
              console.error(`获取${option.product_name}价格出错:`, err);
            }
          }
          
          // 添加物品分类信息
          dbContext += `\n物品分类: ${shippingCategory}类物品\n`;
        }
      } catch (err) {
        console.error('获取数据库信息出错:', err);
      }
    }

    // 构建系统提示
    const systemPrompt = `你是菜鸟物流价格查询助手，帮助用户查询最合适的物流方案。

以下是当前查询的物流信息：
- 物品类型: ${mergedEstimationResult ? mergedEstimationResult.itemType || context.itemType || '未指定' : context.itemType || '未指定'}
- 物品品牌: ${mergedEstimationResult && mergedEstimationResult.brand ? mergedEstimationResult.brand : '未指定'}
- 物品型号: ${mergedEstimationResult && mergedEstimationResult.model ? mergedEstimationResult.model : '未指定'}
- 估算重量: ${weight > 0 ? weight.toFixed(2) : '未知'}kg${weight > 0 ? ' (包含包装)' : ''}
- 目的地国家: ${destinationCountry || '未指定'}

${context.results ? `查询结果包含以下物流选项:
${formatResults(context.results)}` : ''}

${dbContext ? `从数据库获取的额外信息:
${dbContext}` : ''}

请根据以上信息回答用户的问题。如果用户询问的信息不在上下文中，尝试使用数据库提供的信息回答。

重要提示：
1. 只询问一次所需信息，不要重复询问相同的问题
2. 如果用户已经提供了某项信息，不要再询问该信息
3. 保持回答简洁明了

如果用户没有提供足够的信息（如物品具体型号或重量），请礼貌地询问更多细节，以便提供更准确的物流建议。
如果用户没有指定目的地国家，请一定要询问用户想要将物品寄送到哪个国家，这对于提供准确的物流方案和价格至关重要。

在回答中，请务必展示你的思考过程：
1. 先说明你估算的物品重量（包括包装）
2. 解释你如何根据物品类型选择合适的物流产品（普通货物、带电产品或服装）
3. 然后推荐最合适的物流方案，包括最经济和最快的选择

回答要简洁、专业，并给出具体的物流建议。
不要再询问用户物品的重量，我已经根据物品类型和型号估算了重量（包括包装）。`;

    // 构建消息历史
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // 添加历史对话（最多3轮）
    const recentHistory = history.slice(-6);
    if (recentHistory.length > 0) {
      messages.push(...recentHistory);
    }
    
    // 添加当前问题
    messages.push({ role: 'user', content: question });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API错误:', data.error);
      return `抱歉，我遇到了问题：${data.error.message || '未知错误'}`;
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('调用OpenAI API出错:', error);
    return `抱歉，我遇到了问题：${error.message}`;
  }
}

/**
 * 格式化查询结果为文本
 * @param {Array} results - 查询结果数组
 * @returns {string} - 格式化后的文本
 */
function formatResults(results) {
  if (!results || results.length === 0) {
    return '无可用物流选项';
  }
  
  // 按价格排序
  const sortedByPrice = [...results].sort((a, b) => 
    parseFloat(a.totalPrice) - parseFloat(b.totalPrice)
  );
  
  // 按时效排序
  const sortedByTime = [...results].sort((a, b) => {
    const timeA = parseDeliveryTime(a.deliveryTime);
    const timeB = parseDeliveryTime(b.deliveryTime);
    return timeA.min - timeB.min;
  });
  
  let text = '';
  
  // 最便宜选项
  if (sortedByPrice.length > 0) {
    const cheapest = sortedByPrice[0];
    text += `最经济方案: ${cheapest.name}, 时效: ${cheapest.deliveryTime}, 价格: ${cheapest.totalPrice}CNY\n`;
  }
  
  // 最快选项
  if (sortedByTime.length > 0) {
    const fastest = sortedByTime[0];
    text += `最快方案: ${fastest.name}, 时效: ${fastest.deliveryTime}, 价格: ${fastest.totalPrice}CNY\n`;
  }
  
  // 所有选项
  text += '\n所有可用选项:\n';
  results.forEach(option => {
    text += `- ${option.name}: 时效${option.deliveryTime}, 价格${option.totalPrice}CNY\n`;
  });
  
  return text;
}

/**
 * 解析配送时间
 * @param {string} deliveryTime - 配送时间字符串
 * @returns {object} - 最小和最大天数
 */
function parseDeliveryTime(deliveryTime) {
  const matches = deliveryTime.match(/(\d+)[-\s]*(\d+)\s*CD/i);
  if (matches) {
    return {
      min: parseInt(matches[1]),
      max: parseInt(matches[2])
    };
  }
  return { min: 0, max: 0 };
}

module.exports = { askAI }; 