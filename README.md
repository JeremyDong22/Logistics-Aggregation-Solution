# 菜鸟物流价格查询系统

这是一个基于Node.js的物流价格查询系统，可以根据物品类型、重量和目的地国家，提供最合适的物流方案建议。

## 功能特点

- 智能物品重量估算：根据物品类型、品牌和型号自动估算重量
- 自动物品分类：将物品分为普货、带电和服装三类，推荐相应的物流产品
- 多国家支持：支持美国、英国、澳大利亚、日本等多个国家的物流查询
- 智能对话：通过AI助手提供自然语言交互，询问必要信息并给出建议
- 数据库支持：使用SQLite存储物流产品和费率信息

## 技术栈

- Node.js
- Express.js
- SQLite3
- OpenAI API (GPT-3.5-turbo)

## 安装步骤

1. 克隆仓库
```
git clone https://github.com/yourusername/cainiao-logistics.git
cd cainiao-logistics
```

2. 安装依赖
```
npm install
```

3. 配置环境变量
创建`.env`文件并添加OpenAI API密钥：
```
OPENAI_API_KEY=your_openai_api_key
```

4. 创建数据库
```
node create_db.js
```

5. 启动服务器
```
node server.js
```

## 使用方法

1. 访问 http://localhost:3000 打开Web界面
2. 在聊天框中输入您的物流查询，例如：
   - "我想寄一部iPhone 14 Pro到美国"
   - "寄一台MacBook Pro到日本多少钱"
   - "发一件T恤到英国"

## 项目结构

- `server.js`: 主服务器文件
- `ai_service.js`: AI服务和物品重量估算
- `db.js`: 数据库操作函数
- `create_db.js`: 创建数据库和示例数据
- `index.html`: Web界面
- `app.js`: 前端JavaScript
- `test_ai.js`: AI服务测试脚本

## 数据库结构

- `products`: 存储物流产品信息
- `all_rates`: 存储各国家、产品的物流费率

## 许可证

MIT

## 贡献

欢迎提交问题和拉取请求！ 