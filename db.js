const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 使用内存数据库，适合Vercel部署
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('已连接到内存数据库');
    // 初始化数据库
    initializeDatabase();
  }
});

// 初始化数据库表和数据
function initializeDatabase() {
  db.serialize(() => {
    // 创建产品表
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        product_id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        service_provider TEXT
      )
    `, (err) => {
      if (err) {
        console.error('创建产品表出错:', err);
        return;
      }
      console.log('已创建产品表');
      
      // 插入产品数据
      const products = [
        { id: 'CN_GLO_STD', name: '菜鸟国际快递-标准-普货', provider: '菜鸟' },
        { id: 'CN_GLO_STD_BAT', name: '菜鸟国际快递-标准-带电', provider: '菜鸟' },
        { id: 'CN_GLO_EXP', name: '菜鸟国际快递-快线-普货', provider: '菜鸟' },
        { id: 'CN_GLO_EXP_BAT', name: '菜鸟国际快递-快线-带电', provider: '菜鸟' },
        { id: 'CN_GLO_SAV', name: '菜鸟国际快递-简易-普货', provider: '菜鸟' },
        { id: 'CN_GLO_CLOTHES', name: '菜鸟国际快递-服装专线', provider: '菜鸟' }
      ];
      
      const insertProduct = db.prepare('INSERT OR REPLACE INTO products VALUES (?, ?, ?)');
      products.forEach(product => {
        insertProduct.run(product.id, product.name, product.provider);
      });
      insertProduct.finalize();
      console.log('已插入产品数据');
    });
    
    // 创建费率表
    db.run(`
      CREATE TABLE IF NOT EXISTS all_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "Country Name" TEXT NOT NULL,
        product_id TEXT NOT NULL,
        min_weight REAL NOT NULL,
        max_weight REAL NOT NULL,
        unit_cost REAL NOT NULL,
        base_cost REAL NOT NULL,
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
        { country: '美国', product_id: 'CN_GLO_STD', min_weight: 0.1, max_weight: 30, base_cost: 80, unit_cost: 35, delivery_time: '10-15 CD' },
        { country: '美国', product_id: 'CN_GLO_STD_BAT', min_weight: 0.1, max_weight: 30, base_cost: 90, unit_cost: 38, delivery_time: '10-15 CD' },
        { country: '美国', product_id: 'CN_GLO_EXP', min_weight: 0.1, max_weight: 30, base_cost: 120, unit_cost: 45, delivery_time: '5-9 CD' },
        { country: '美国', product_id: 'CN_GLO_EXP_BAT', min_weight: 0.1, max_weight: 30, base_cost: 130, unit_cost: 48, delivery_time: '5-9 CD' },
        { country: '美国', product_id: 'CN_GLO_SAV', min_weight: 0.1, max_weight: 30, base_cost: 60, unit_cost: 30, delivery_time: '15-20 CD' },
        { country: '美国', product_id: 'CN_GLO_CLOTHES', min_weight: 0.1, max_weight: 30, base_cost: 75, unit_cost: 33, delivery_time: '10-15 CD' },
        
        // 英国
        { country: '英国', product_id: 'CN_GLO_STD', min_weight: 0.1, max_weight: 30, base_cost: 85, unit_cost: 38, delivery_time: '10-15 CD' },
        { country: '英国', product_id: 'CN_GLO_STD_BAT', min_weight: 0.1, max_weight: 30, base_cost: 95, unit_cost: 42, delivery_time: '10-15 CD' },
        { country: '英国', product_id: 'CN_GLO_EXP', min_weight: 0.1, max_weight: 30, base_cost: 130, unit_cost: 50, delivery_time: '5-9 CD' },
        { country: '英国', product_id: 'CN_GLO_EXP_BAT', min_weight: 0.1, max_weight: 30, base_cost: 140, unit_cost: 52, delivery_time: '5-9 CD' },
        { country: '英国', product_id: 'CN_GLO_SAV', min_weight: 0.1, max_weight: 30, base_cost: 65, unit_cost: 32, delivery_time: '15-20 CD' },
        { country: '英国', product_id: 'CN_GLO_CLOTHES', min_weight: 0.1, max_weight: 30, base_cost: 80, unit_cost: 36, delivery_time: '10-15 CD' },
        
        // 日本
        { country: '日本', product_id: 'CN_GLO_STD', min_weight: 0.1, max_weight: 30, base_cost: 70, unit_cost: 30, delivery_time: '7-12 CD' },
        { country: '日本', product_id: 'CN_GLO_STD_BAT', min_weight: 0.1, max_weight: 30, base_cost: 80, unit_cost: 32, delivery_time: '7-12 CD' },
        { country: '日本', product_id: 'CN_GLO_EXP', min_weight: 0.1, max_weight: 30, base_cost: 110, unit_cost: 40, delivery_time: '4-7 CD' },
        { country: '日本', product_id: 'CN_GLO_EXP_BAT', min_weight: 0.1, max_weight: 30, base_cost: 120, unit_cost: 42, delivery_time: '4-7 CD' },
        { country: '日本', product_id: 'CN_GLO_SAV', min_weight: 0.1, max_weight: 30, base_cost: 55, unit_cost: 25, delivery_time: '10-15 CD' },
        { country: '日本', product_id: 'CN_GLO_CLOTHES', min_weight: 0.1, max_weight: 30, base_cost: 65, unit_cost: 28, delivery_time: '7-12 CD' },
        
        // 澳大利亚
        { country: '澳大利亚', product_id: 'CN_GLO_STD', min_weight: 0.1, max_weight: 30, base_cost: 90, unit_cost: 42, delivery_time: '12-18 CD' },
        { country: '澳大利亚', product_id: 'CN_GLO_STD_BAT', min_weight: 0.1, max_weight: 30, base_cost: 100, unit_cost: 46, delivery_time: '12-18 CD' },
        { country: '澳大利亚', product_id: 'CN_GLO_EXP', min_weight: 0.1, max_weight: 30, base_cost: 140, unit_cost: 55, delivery_time: '6-10 CD' },
        { country: '澳大利亚', product_id: 'CN_GLO_EXP_BAT', min_weight: 0.1, max_weight: 30, base_cost: 150, unit_cost: 58, delivery_time: '6-10 CD' },
        { country: '澳大利亚', product_id: 'CN_GLO_SAV', min_weight: 0.1, max_weight: 30, base_cost: 75, unit_cost: 38, delivery_time: '15-22 CD' },
        { country: '澳大利亚', product_id: 'CN_GLO_CLOTHES', min_weight: 0.1, max_weight: 30, base_cost: 85, unit_cost: 40, delivery_time: '12-18 CD' }
      ];
      
      const insertRate = db.prepare('INSERT INTO all_rates ("Country Name", product_id, min_weight, max_weight, unit_cost, base_cost, delivery_time) VALUES (?, ?, ?, ?, ?, ?, ?)');
      rates.forEach(rate => {
        insertRate.run(rate.country, rate.product_id, rate.min_weight, rate.max_weight, rate.unit_cost, rate.base_cost, rate.delivery_time);
      });
      insertRate.finalize();
      console.log('已插入费率数据');
    });
  });
}

/**
 * 查询支持特定国家的所有物流产品
 * @param {string} country - 国家名称
 * @returns {Promise<Array>} - 物流产品列表
 */
function getShippingOptions(country) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT p.product_name, p.product_id
      FROM all_rates ar
      JOIN products p ON ar.product_id = p.product_id
      WHERE ar."Country Name" = ?
    `;
    
    db.all(query, [country], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * 根据国家、重量和产品ID查询物流费率
 * @param {string} country - 国家名称
 * @param {number} weight - 重量(kg)
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} - 物流费率信息
 */
function getShippingRate(country, weight, productId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT ar.*, p.product_name
      FROM all_rates ar
      JOIN products p ON ar.product_id = p.product_id
      WHERE ar."Country Name" = ? 
      AND ar.product_id = ? 
      AND ar.min_weight <= ? 
      AND ar.max_weight >= ?
    `;
    
    db.get(query, [country, productId, weight, weight], (err, rate) => {
      if (err) {
        reject(err);
      } else if (!rate) {
        resolve(null);
      } else {
        // 计算总价格 = 基础价格 + (重量 * 单位价格)
        const totalPrice = rate.base_cost + (weight * rate.unit_cost);
        
        // 返回格式化的结果
        resolve({
          name: rate.product_name,
          totalPrice: totalPrice.toFixed(2),
          deliveryTime: rate.delivery_time,
          baseCost: rate.base_cost,
          unitCost: rate.unit_cost,
          minWeight: rate.min_weight,
          maxWeight: rate.max_weight
        });
      }
    });
  });
}

/**
 * 查询所有支持的国家
 * @returns {Promise<Array>} - 国家列表
 */
function getSupportedCountries() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT "Country Name"
      FROM all_rates
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => row['Country Name']));
      }
    });
  });
}

// 关闭数据库连接
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('关闭数据库时出错:', err.message);
    } else {
      console.log('数据库连接已关闭');
    }
    process.exit(0);
  });
});

module.exports = {
  db,
  getShippingOptions,
  getShippingRate,
  getSupportedCountries
}; 