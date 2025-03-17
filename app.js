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
            const response = await fetch('/api/countries');
            const data = await response.json();
            
            if (data.countries && data.countries.length > 0) {
                const countrySelect = document.getElementById('country');
                const defaultOption = countrySelect.querySelector('option[disabled]');
                
                // 清空现有选项
                countrySelect.innerHTML = '';
                countrySelect.appendChild(defaultOption);
                
                // 添加国家选项
                data.countries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country;
                    option.textContent = country;
                    countrySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('加载国家列表出错:', error);
        }
    }
    
    // 从数据库查询物流选项
    async function queryShippingOptionsFromDB(itemType, weight, country) {
        try {
            // 显示加载中
            resultsContainer.classList.add('d-none');
            noResults.classList.add('d-none');
            
            // 调用API
            const response = await fetch('/api/query-db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemType, weight, country })
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('查询出错:', data.error);
                noResults.classList.remove('d-none');
                return;
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
                updateMessage(loadingId, `抱歉，我遇到了问题：${data.error}`);
            } else {
                updateMessage(loadingId, data.answer);
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
        // 清空之前的结果
        resultsTable.innerHTML = '';
        cheapestOption.innerHTML = '';
        fastestOption.innerHTML = '';
        
        // 显示查询信息
        const itemTypeText = getItemTypeText(itemType);
        queryInfo.textContent = `查询物品：${itemTypeText}，重量：${weight} kg，目的地：${country}`;
        
        if (results.length === 0) {
            // 没有找到结果
            resultsContainer.classList.add('d-none');
            noResults.classList.remove('d-none');
            return;
        }
        
        // 显示结果容器
        resultsContainer.classList.remove('d-none');
        noResults.classList.add('d-none');
        
        // 按总价排序
        const sortedByPrice = [...results].sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice));
        
        // 按时效排序
        const sortedByTime = [...results].sort((a, b) => {
            const timeA = parseDeliveryTime(a.deliveryTime);
            const timeB = parseDeliveryTime(b.deliveryTime);
            return timeA.min - timeB.min;
        });
        
        // 显示最便宜的选项
        if (sortedByPrice.length > 0) {
            const cheapest = sortedByPrice[0];
            cheapestOption.innerHTML = `
                <h5>${cheapest.name}</h5>
                <p class="delivery-time">预计 ${cheapest.deliveryTime} 送达</p>
                <p>重量区间: ${cheapest.weightRange}</p>
                <p>单价: ${cheapest.unitPrice} CNY/KG</p>
                <p>基础费: ${cheapest.basePrice} CNY</p>
                <p class="price-tag">总价: ${cheapest.totalPrice} CNY</p>
            `;
        }
        
        // 显示最快的选项
        if (sortedByTime.length > 0) {
            const fastest = sortedByTime[0];
            fastestOption.innerHTML = `
                <h5>${fastest.name}</h5>
                <p class="delivery-time">预计 ${fastest.deliveryTime} 送达</p>
                <p>重量区间: ${fastest.weightRange}</p>
                <p>单价: ${fastest.unitPrice} CNY/KG</p>
                <p>基础费: ${fastest.basePrice} CNY</p>
                <p class="price-tag">总价: ${fastest.totalPrice} CNY</p>
            `;
        }
        
        // 填充结果表格
        results.forEach(option => {
            const row = document.createElement('tr');
            
            // 判断是否是最便宜或最快的选项
            const isCheapest = sortedByPrice.length > 0 && option.name === sortedByPrice[0].name && option.weightRange === sortedByPrice[0].weightRange;
            const isFastest = sortedByTime.length > 0 && option.name === sortedByTime[0].name && option.weightRange === sortedByTime[0].weightRange;
            
            if (isCheapest || isFastest) {
                row.classList.add('highlight');
            }
            
            row.innerHTML = `
                <td>${option.name}</td>
                <td>${option.deliveryTime}</td>
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
        const matches = deliveryTime.match(/(\d+)-(\d+)CD/);
        if (matches) {
            return {
                min: parseInt(matches[1]),
                max: parseInt(matches[2])
            };
        }
        return { min: 0, max: 0 };
    }
}); 