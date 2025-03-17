document.addEventListener('DOMContentLoaded', function() {
    // 获取表单和结果容器
    const queryForm = document.getElementById('queryForm');
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    const resultsTable = document.getElementById('resultsTable');
    const queryInfo = document.getElementById('queryInfo');
    const cheapestOption = document.getElementById('cheapestOption');
    const fastestOption = document.getElementById('fastestOption');
    
    // 聊天相关元素
    const chatMessages = document.getElementById('chatMessages');
    const userQuestion = document.getElementById('userQuestion');
    const askButton = document.getElementById('askButton');
    
    // 存储当前查询结果
    let currentResults = [];
    
    // 初始化时加载国家列表
    loadCountries();
    
    // 监听表单提交事件
    queryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取用户输入
        const itemType = document.getElementById('itemType').value;
        const weight = parseFloat(document.getElementById('weight').value);
        const country = document.getElementById('country').value;
        
        // 查询价格
        queryShippingOptionsFromDB(itemType, weight, country);
    });
    
    // 监听AI助手按钮点击事件
    askButton.addEventListener('click', function() {
        askAI();
    });
    
    // 监听输入框回车事件
    userQuestion.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            askAI();
        }
    });
    
    // 从数据库加载国家列表
    async function loadCountries() {
        try {
            console.log('正在从服务器加载国家列表...');
            const countrySelect = document.getElementById('country');
            const defaultOption = countrySelect.querySelector('option[disabled]');
            
            // 显示加载中提示
            countrySelect.innerHTML = '';
            countrySelect.appendChild(defaultOption);
            const loadingOption = document.createElement('option');
            loadingOption.textContent = '加载中...';
            loadingOption.disabled = true;
            countrySelect.appendChild(loadingOption);
            
            let data;
            
            try {
                // 首先尝试从服务器 API 获取国家列表
                const response = await fetch('/api/countries');
                data = await response.json();
            } catch (apiError) {
                console.log('从 API 加载国家列表失败，尝试从静态 JSON 文件加载...', apiError);
                // 如果 API 请求失败，尝试从静态 JSON 文件加载
                const baseUrl = window.location.href.endsWith('/') ? window.location.href : window.location.href + '/';
                const jsonUrl = new URL('countries.json', baseUrl).href;
                console.log('尝试从以下URL加载国家列表:', jsonUrl);
                try {
                    const response = await fetch(jsonUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const jsonData = await response.json();
                    console.log('成功加载国家列表JSON:', jsonData.length, '个国家');
                    data = { countries: jsonData };
                } catch (jsonError) {
                    console.error('从静态JSON文件加载国家列表失败:', jsonError);
                    throw jsonError;
                }
            }
            
            // 清空加载提示
            countrySelect.innerHTML = '';
            countrySelect.appendChild(defaultOption);
            
            if (data.countries && data.countries.length > 0) {
                console.log(`成功加载 ${data.countries.length} 个国家`);
                
                // 按字母顺序排序国家
                const sortedCountries = data.countries.sort();
                
                // 添加国家选项
                sortedCountries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country;
                    option.textContent = country;
                    countrySelect.appendChild(option);
                });
            } else {
                console.error('服务器返回的国家列表为空');
                const errorOption = document.createElement('option');
                errorOption.textContent = '加载国家列表失败';
                errorOption.disabled = true;
                countrySelect.appendChild(errorOption);
            }
        } catch (error) {
            console.error('加载国家列表出错:', error);
            
            // 显示错误提示
            const countrySelect = document.getElementById('country');
            countrySelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '请选择目的地国家';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            countrySelect.appendChild(defaultOption);
            
            const errorOption = document.createElement('option');
            errorOption.textContent = '加载国家列表失败，请刷新页面重试';
            errorOption.disabled = true;
            countrySelect.appendChild(errorOption);
        }
    }
    
    // 从数据库查询物流选项
    async function queryShippingOptionsFromDB(itemType, weight, country) {
        try {
            // 显示加载中
            resultsContainer.classList.add('d-none');
            noResults.classList.add('d-none');
            
            let data;
            
            try {
                // 首先尝试从服务器 API 获取数据
                const response = await fetch('/api/query-db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ itemType, weight, country })
                });
                
                data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
            } catch (apiError) {
                console.log('从 API 加载数据失败，尝试从静态 JSON 文件加载...', apiError);
                
                // 如果 API 请求失败，尝试从静态 JSON 文件加载
                const baseUrl = window.location.href.endsWith('/') ? window.location.href : window.location.href + '/';
                
                // 首先尝试加载美国的详细物流费率数据
                const usJsonUrl = new URL('us_shipping_rates.json', baseUrl).href;
                console.log('尝试从以下URL加载美国物流费率:', usJsonUrl);
                
                try {
                    const response = await fetch(usJsonUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const usRates = await response.json();
                    console.log('成功加载美国物流费率JSON');
                    
                    // 检查是否是美国的查询
                    if (country === '美国' || country.toLowerCase() === 'usa' || country.toLowerCase() === 'united states') {
                        console.log('检测到美国查询，使用详细物流费率数据');
                        
                        // 找到最接近的重量
                        const weights = Object.keys(usRates.sample_rates).map(Number).sort((a, b) => a - b);
                        console.log(`可用重量区间: ${weights.join(', ')}`);
                        
                        let closestWeight = weights[0];
                        
                        for (const w of weights) {
                            if (w <= weight) {
                                closestWeight = w;
                            } else {
                                break;
                            }
                        }
                        console.log(`选择的最接近重量: ${closestWeight}`);
                        
                        // 获取对应的物流选项
                        const sampleRates = usRates.sample_rates[closestWeight];
                        if (sampleRates) {
                            // 将对象转换为数组
                            const options = Object.values(sampleRates).map(rate => ({
                                product_id: rate.product_id,
                                name: usRates.products[rate.product_id].name,
                                deliveryTime: rate.delivery_time,
                                weightRange: `${rate.min_weight}-${rate.max_weight}kg`,
                                unitPrice: rate.unit_cost.toString(),
                                basePrice: rate.base_cost.toString(),
                                totalPrice: rate.total_price.toString()
                            }));
                            
                            console.log(`找到 ${options.length} 个物流选项`);
                            
                            data = {
                                results: options
                            };
                            
                            // 存储当前结果并显示
                            currentResults = data.results || [];
                            displayResults(currentResults, itemType, weight, country);
                            return;
                        }
                    }
                    
                    // 如果不是美国或没有找到匹配的费率，继续尝试使用通用物流费率文件
                    throw new Error('不是美国查询或未找到匹配的费率');
                } catch (usJsonError) {
                    console.log('从美国物流费率JSON加载失败，尝试通用物流费率文件:', usJsonError);
                    
                    // 尝试加载通用物流费率文件
                    const jsonUrl = new URL('shipping_rates.json', baseUrl).href;
                    console.log('尝试从以下URL加载通用物流费率:', jsonUrl);
                    
                    try {
                        const response = await fetch(jsonUrl);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const allRates = await response.json();
                        console.log('成功加载物流费率JSON，包含', Object.keys(allRates).length, '个国家的数据');
                        
                        // 从静态 JSON 文件中提取相关数据
                        if (allRates[country]) {
                            console.log(`找到国家 ${country} 的数据，包含 ${Object.keys(allRates[country]).length} 个重量区间`);
                            
                            // 找到最接近的重量
                            const weights = Object.keys(allRates[country]).map(Number).sort((a, b) => a - b);
                            console.log(`可用重量区间: ${weights.join(', ')}`);
                            
                            let closestWeight = weights[0];
                            
                            for (const w of weights) {
                                if (w <= weight) {
                                    closestWeight = w;
                                } else {
                                    break;
                                }
                            }
                            console.log(`选择的最接近重量: ${closestWeight}`);
                            
                            // 获取对应的物流选项
                            const itemTypeKey = itemType === 'battery' ? 'battery' : 'normal';
                            console.log(`查询物品类型: ${itemTypeKey}`);
                            
                            if (allRates[country][closestWeight] && allRates[country][closestWeight][itemTypeKey]) {
                                const options = allRates[country][closestWeight][itemTypeKey];
                                console.log(`找到 ${options.length} 个物流选项`);
                                
                                data = {
                                    results: options
                                };
                            } else {
                                console.log(`未找到匹配的物流选项，国家=${country}, 重量=${closestWeight}, 物品类型=${itemTypeKey}`);
                                console.log('可用的物品类型:', Object.keys(allRates[country][closestWeight] || {}));
                                
                                // 尝试使用任何可用的物品类型
                                const availableTypes = Object.keys(allRates[country][closestWeight] || {});
                                if (availableTypes.length > 0) {
                                    const options = allRates[country][closestWeight][availableTypes[0]];
                                    console.log(`使用备选物品类型 ${availableTypes[0]}，找到 ${options.length} 个物流选项`);
                                    
                                    data = {
                                        results: options
                                    };
                                } else {
                                    throw new Error(`未找到匹配的物流选项，国家=${country}, 重量=${closestWeight}`);
                                }
                            }
                        } else {
                            console.log(`未找到国家 ${country} 的数据，可用国家: ${Object.keys(allRates).slice(0, 10).join(', ')}...`);
                            throw new Error('未找到该国家的物流费率');
                        }
                    } catch (jsonError) {
                        console.error('从静态JSON文件加载物流费率失败:', jsonError);
                        
                        // 创建示例数据作为备用方案
                        console.log('创建示例数据作为备用方案');
                        
                        // 创建一些示例物流选项，确保格式与数据库返回的完全一致
                        const exampleOptions = [
                            {
                                product_id: "CN_GLO_STD",
                                name: "菜鸟国际标准",
                                deliveryTime: "7-15",
                                weightRange: "0-30kg",
                                unitPrice: "130.00",
                                basePrice: "0.00",
                                totalPrice: (130 * weight).toFixed(2)
                            },
                            {
                                product_id: "CN_GLO_EXP",
                                name: "菜鸟国际快速",
                                deliveryTime: "5-10",
                                weightRange: "0-30kg",
                                unitPrice: "180.00",
                                basePrice: "0.00",
                                totalPrice: (180 * weight).toFixed(2)
                            }
                        ];
                        
                        console.log('创建的示例数据:', JSON.stringify(exampleOptions, null, 2));
                        
                        data = {
                            results: exampleOptions
                        };
                    }
                }
            }
            
            // 存储当前结果
            currentResults = data.results || [];
            
            // 显示结果
            displayResults(currentResults, itemType, weight, country);
        } catch (error) {
            console.error('查询物流选项出错:', error);
            noResults.classList.remove('d-none');
        }
    }
    
    // 向AI助手提问
    async function askAI() {
        const question = userQuestion.value.trim();
        if (!question) return;
        
        // 清空输入框
        userQuestion.value = '';
        
        // 显示用户问题
        addMessage('user', question);
        
        // 显示加载中
        const loadingId = addMessage('assistant', '正在思考...');
        
        try {
            // 获取当前查询信息
            const itemType = document.getElementById('itemType').value;
            const weight = document.getElementById('weight').value;
            const country = document.getElementById('country').value;
            
            // 构建上下文
            const context = {
                itemType: getItemTypeText(itemType),
                weight: weight,
                country: country,
                results: currentResults.length > 0 ? currentResults : null
            };
            
            try {
                // 调用API
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question, context })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                updateMessage(loadingId, data.answer);
            } catch (apiError) {
                console.log('AI API调用失败，显示友好的错误信息');
                
                // 在GitHub Pages环境中，显示友好的错误信息
                let friendlyMessage = "抱歉，AI助手功能在GitHub Pages环境中不可用。";
                
                if (window.location.hostname.includes('github.io')) {
                    friendlyMessage += " 这是因为GitHub Pages只支持静态内容，不能运行服务器端代码。如果您需要使用AI助手功能，请在本地运行此应用。";
                } else {
                    friendlyMessage += " 错误信息: " + apiError.message;
                }
                
                updateMessage(loadingId, friendlyMessage);
            }
        } catch (error) {
            console.error('AI助手错误:', error);
            updateMessage(loadingId, `抱歉，我遇到了问题：${error.message}`);
        }
    }
    
    // 添加消息到聊天窗口
    function addMessage(role, content) {
        const messageId = 'msg-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'text-end mb-2' : 'mb-2';
        messageDiv.id = messageId;
        
        const bubble = document.createElement('div');
        bubble.className = role === 'user' ? 'bg-primary text-white p-2 rounded d-inline-block' : 'bg-light p-2 rounded d-inline-block';
        bubble.textContent = content;
        
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageId;
    }
    
    // 更新消息内容
    function updateMessage(messageId, content) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            const bubble = messageDiv.firstChild;
            bubble.textContent = content;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // 显示结果函数
    function displayResults(results, itemType, weight, country) {
        console.log('显示结果，数据:', JSON.stringify(results, null, 2));
        console.log('查询条件:', { itemType, weight, country });
        
        // 清空之前的结果
        resultsTable.innerHTML = '';
        cheapestOption.innerHTML = '';
        fastestOption.innerHTML = '';
        
        // 显示查询信息
        const itemTypeText = getItemTypeText(itemType);
        queryInfo.textContent = `查询物品：${itemTypeText}，重量：${weight} kg，目的地：${country}`;
        
        if (!results || results.length === 0) {
            // 没有找到结果
            console.log('未找到结果，显示无结果提示');
            resultsContainer.classList.add('d-none');
            noResults.classList.remove('d-none');
            return;
        }
        
        console.log(`找到 ${results.length} 个结果，显示结果容器`);
        
        // 显示结果容器
        resultsContainer.classList.remove('d-none');
        noResults.classList.add('d-none');
        
        // 按总价排序
        const sortedByPrice = [...results].sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice));
        console.log('按价格排序后的第一个结果:', sortedByPrice.length > 0 ? sortedByPrice[0].name : '无');
        
        // 按时效排序
        const sortedByTime = [...results].sort((a, b) => {
            const timeA = parseDeliveryTime(a.deliveryTime);
            const timeB = parseDeliveryTime(b.deliveryTime);
            return timeA.min - timeB.min;
        });
        console.log('按时效排序后的第一个结果:', sortedByTime.length > 0 ? sortedByTime[0].name : '无');
        
        // 显示最便宜的选项
        if (sortedByPrice.length > 0) {
            const cheapest = sortedByPrice[0];
            console.log('显示最便宜选项:', cheapest.name);
            cheapestOption.innerHTML = `
                <h5>${cheapest.name}</h5>
                <p class="delivery-time">预计 ${cheapest.deliveryTime} 天送达</p>
                <p>重量区间: ${cheapest.weightRange}</p>
                <p>单价: ${cheapest.unitPrice} CNY/KG</p>
                <p>基础费: ${cheapest.basePrice} CNY</p>
                <p class="price-tag">总价: ${cheapest.totalPrice} CNY</p>
            `;
        }
        
        // 显示最快的选项
        if (sortedByTime.length > 0) {
            const fastest = sortedByTime[0];
            console.log('显示最快选项:', fastest.name);
            fastestOption.innerHTML = `
                <h5>${fastest.name}</h5>
                <p class="delivery-time">预计 ${fastest.deliveryTime} 天送达</p>
                <p>重量区间: ${fastest.weightRange}</p>
                <p>单价: ${fastest.unitPrice} CNY/KG</p>
                <p>基础费: ${fastest.basePrice} CNY</p>
                <p class="price-tag">总价: ${fastest.totalPrice} CNY</p>
            `;
        }
        
        // 填充结果表格
        console.log('填充结果表格，共 ${results.length} 行');
        results.forEach((option, index) => {
            console.log(`处理第 ${index+1} 个选项:`, option.name);
            const row = document.createElement('tr');
            
            // 判断是否是最便宜或最快的选项
            const isCheapest = sortedByPrice.length > 0 && option.name === sortedByPrice[0].name;
            const isFastest = sortedByTime.length > 0 && option.name === sortedByTime[0].name;
            
            if (isCheapest || isFastest) {
                row.classList.add('highlight');
            }
            
            row.innerHTML = `
                <td>${option.name}</td>
                <td>${option.deliveryTime} 天</td>
                <td>${option.weightRange}</td>
                <td>${option.unitPrice}</td>
                <td>${option.basePrice}</td>
                <td class="fw-bold">${option.totalPrice}</td>
            `;
            
            resultsTable.appendChild(row);
        });
    }
    
    // 获取物品类型文本
    function getItemTypeText(itemType) {
        switch (itemType) {
            case 'normal':
                return '普通物品';
            case 'battery':
                return '含电池物品';
            case 'clothes':
                return '服装';
            case 'all':
                return '所有物品';
            default:
                return '未知类型';
        }
    }
    
    // 解析时效
    function parseDeliveryTime(deliveryTime) {
        console.log('解析时效:', deliveryTime);
        
        // 尝试匹配 "X-YCD" 格式
        let matches = deliveryTime.match(/(\d+)-(\d+)CD/);
        if (matches) {
            console.log('匹配到 X-YCD 格式');
            return {
                min: parseInt(matches[1]),
                max: parseInt(matches[2])
            };
        }
        
        // 尝试匹配 "X-Y" 格式
        matches = deliveryTime.match(/(\d+)-(\d+)/);
        if (matches) {
            console.log('匹配到 X-Y 格式');
            return {
                min: parseInt(matches[1]),
                max: parseInt(matches[2])
            };
        }
        
        // 尝试匹配单个数字
        matches = deliveryTime.match(/(\d+)/);
        if (matches) {
            console.log('匹配到单个数字格式');
            const num = parseInt(matches[1]);
            return {
                min: num,
                max: num
            };
        }
        
        console.log('无法解析时效格式，使用默认值');
        return { min: 0, max: 0 };
    }
}); 