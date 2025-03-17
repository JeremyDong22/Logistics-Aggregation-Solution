// 创建新的数据库文件
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.resolve(__dirname, 'cainiao_logistics.db');

// 如果数据库文件已存在，则删除
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('已删除旧的数据库文件');
}

// 创建新的数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('已创建新的数据库:', dbPath);
  
  // 创建表并添加示例数据
  createTables();
});

// 创建表结构
function createTables() {
  // 创建国家表
  db.serialize(() => {
    // 创建产品表
    db.run(`
      CREATE TABLE products (
        product_id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        description TEXT
      )
    `, (err) => {
      if (err) {
        console.error('创建产品表出错:', err);
        return;
      }
      console.log('已创建产品表');
      
      // 插入产品数据
      const products = [
        { id: 'dhl', name: 'DHL国际快递', description: '全球知名快递服务，速度快' },
        { id: 'fedex', name: 'FedEx国际快递', description: '美国联邦快递，服务可靠' },
        { id: 'ups', name: 'UPS国际快递', description: '美国联合包裹，全球配送' },
        { id: 'ems', name: 'EMS国际快递', description: '中国邮政特快专递，覆盖广' },
        { id: 'cne', name: '菜鸟经济', description: '经济实惠的国际物流选择' },
        { id: 'cns', name: '菜鸟标准', description: '性价比高的标准物流服务' },
        { id: 'cnp', name: '菜鸟优先', description: '优先配送的高端物流服务' }
      ];
      
      const insertProduct = db.prepare('INSERT INTO products VALUES (?, ?, ?)');
      products.forEach(product => {
        insertProduct.run(product.id, product.name, product.description);
      });
      insertProduct.finalize();
      console.log('已插入产品数据');
    });
    
    // 创建费率表
    db.run(`
      CREATE TABLE all_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "Country Name" TEXT NOT NULL,
        product_id TEXT NOT NULL,
        min_weight REAL NOT NULL,
        max_weight REAL NOT NULL,
        base_price REAL NOT NULL,
        per_kg_price REAL NOT NULL,
        delivery_time TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(product_id)
      )
    `, (err) => {
      if (err) {
        console.error('创建费率表出错:', err);
        return;
      }
      console.log('已创建费率表');
      
      // 插入费率数据
      const rates = [
        // 美国
        { country: '美国', product_id: 'dhl', min_weight: 0.1, max_weight: 30, base_price: 120, per_kg_price: 45, delivery_time: '3-5CD' },
        { country: '美国', product_id: 'fedex', min_weight: 0.1, max_weight: 30, base_price: 130, per_kg_price: 48, delivery_time: '3-6CD' },
        { country: '美国', product_id: 'ups', min_weight: 0.1, max_weight: 30, base_price: 125, per_kg_price: 47, delivery_time: '4-6CD' },
        { country: '美国', product_id: 'ems', min_weight: 0.1, max_weight: 30, base_price: 100, per_kg_price: 40, delivery_time: '7-10CD' },
        { country: '美国', product_id: 'cne', min_weight: 0.1, max_weight: 30, base_price: 80, per_kg_price: 35, delivery_time: '10-15CD' },
        { country: '美国', product_id: 'cns', min_weight: 0.1, max_weight: 30, base_price: 90, per_kg_price: 38, delivery_time: '8-12CD' },
        { country: '美国', product_id: 'cnp', min_weight: 0.1, max_weight: 30, base_price: 110, per_kg_price: 42, delivery_time: '5-8CD' },
        
        // 英国
        { country: '英国', product_id: 'dhl', min_weight: 0.1, max_weight: 30, base_price: 130, per_kg_price: 50, delivery_time: '3-5CD' },
        { country: '英国', product_id: 'fedex', min_weight: 0.1, max_weight: 30, base_price: 140, per_kg_price: 52, delivery_time: '3-6CD' },
        { country: '英国', product_id: 'ups', min_weight: 0.1, max_weight: 30, base_price: 135, per_kg_price: 51, delivery_time: '4-6CD' },
        { country: '英国', product_id: 'ems', min_weight: 0.1, max_weight: 30, base_price: 110, per_kg_price: 45, delivery_time: '7-10CD' },
        { country: '英国', product_id: 'cne', min_weight: 0.1, max_weight: 30, base_price: 85, per_kg_price: 38, delivery_time: '10-15CD' },
        { country: '英国', product_id: 'cns', min_weight: 0.1, max_weight: 30, base_price: 95, per_kg_price: 42, delivery_time: '8-12CD' },
        { country: '英国', product_id: 'cnp', min_weight: 0.1, max_weight: 30, base_price: 115, per_kg_price: 48, delivery_time: '5-8CD' },
        
        // 澳大利亚
        { country: '澳大利亚', product_id: 'dhl', min_weight: 0.1, max_weight: 30, base_price: 140, per_kg_price: 55, delivery_time: '4-6CD' },
        { country: '澳大利亚', product_id: 'fedex', min_weight: 0.1, max_weight: 30, base_price: 150, per_kg_price: 58, delivery_time: '4-7CD' },
        { country: '澳大利亚', product_id: 'ups', min_weight: 0.1, max_weight: 30, base_price: 145, per_kg_price: 56, delivery_time: '5-7CD' },
        { country: '澳大利亚', product_id: 'ems', min_weight: 0.1, max_weight: 30, base_price: 120, per_kg_price: 50, delivery_time: '8-12CD' },
        { country: '澳大利亚', product_id: 'cne', min_weight: 0.1, max_weight: 30, base_price: 90, per_kg_price: 42, delivery_time: '12-18CD' },
        { country: '澳大利亚', product_id: 'cns', min_weight: 0.1, max_weight: 30, base_price: 100, per_kg_price: 46, delivery_time: '10-15CD' },
        { country: '澳大利亚', product_id: 'cnp', min_weight: 0.1, max_weight: 30, base_price: 125, per_kg_price: 52, delivery_time: '6-10CD' },
        
        // 日本
        { country: '日本', product_id: 'dhl', min_weight: 0.1, max_weight: 30, base_price: 110, per_kg_price: 40, delivery_time: '2-4CD' },
        { country: '日本', product_id: 'fedex', min_weight: 0.1, max_weight: 30, base_price: 120, per_kg_price: 42, delivery_time: '2-5CD' },
        { country: '日本', product_id: 'ups', min_weight: 0.1, max_weight: 30, base_price: 115, per_kg_price: 41, delivery_time: '3-5CD' },
        { country: '日本', product_id: 'ems', min_weight: 0.1, max_weight: 30, base_price: 90, per_kg_price: 35, delivery_time: '5-8CD' },
        { country: '日本', product_id: 'cne', min_weight: 0.1, max_weight: 30, base_price: 70, per_kg_price: 30, delivery_time: '7-12CD' },
        { country: '日本', product_id: 'cns', min_weight: 0.1, max_weight: 30, base_price: 80, per_kg_price: 32, delivery_time: '6-10CD' },
        { country: '日本', product_id: 'cnp', min_weight: 0.1, max_weight: 30, base_price: 100, per_kg_price: 38, delivery_time: '4-7CD' }
      ];
      
      const insertRate = db.prepare('INSERT INTO all_rates ("Country Name", product_id, min_weight, max_weight, base_price, per_kg_price, delivery_time) VALUES (?, ?, ?, ?, ?, ?, ?)');
      rates.forEach(rate => {
        insertRate.run(rate.country, rate.product_id, rate.min_weight, rate.max_weight, rate.base_price, rate.per_kg_price, rate.delivery_time);
      });
      insertRate.finalize();
      console.log('已插入费率数据');
      
      // 关闭数据库连接
      db.close((err) => {
        if (err) {
          console.error('关闭数据库连接出错:', err);
          return;
        }
        console.log('数据库创建完成，连接已关闭');
      });
    });
  });
} 