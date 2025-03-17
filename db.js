const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 使用文件数据库，而不是内存数据库
const db = new sqlite3.Database(path.join(__dirname, 'cainiao_logistics.db'), (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('已连接到文件数据库');
    // 不需要初始化数据库，因为文件已经包含所有数据
  }
});

// 初始化数据库表和数据
function initializeDatabase() {
  // 保留此函数以防需要在未来初始化数据库
  console.log('使用现有数据库文件，无需初始化');
}

/**
 * 查询支持特定国家的所有物流产品
 * @param {string} country - 国家名称
 * @returns {Promise<Array>} - 物流产品列表
 */
function getShippingOptions(country) {
  return new Promise((resolve, reject) => {
    console.log(`正在查询支持 ${country} 的物流产品...`);
    
    const query = `
      SELECT DISTINCT p.product_name, p.product_id
      FROM all_rates ar
      JOIN products p ON ar.product_id = p.product_id
      WHERE ar."Country Name" = ?
    `;
    
    db.all(query, [country], (err, rows) => {
      if (err) {
        console.error(`查询支持 ${country} 的物流产品出错:`, err);
        reject(err);
      } else {
        console.log(`找到 ${rows.length} 个支持 ${country} 的物流产品`);
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
    console.log(`正在查询 ${country} 的产品 ${productId} 费率，重量: ${weight}kg...`);
    
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
        console.error(`查询费率出错:`, err);
        reject(err);
      } else if (!rate) {
        console.log(`未找到匹配的费率: 国家=${country}, 产品=${productId}, 重量=${weight}kg`);
        resolve(null);
      } else {
        // 计算总价格 = 基础价格 + (重量 * 单位价格)
        const totalPrice = rate.base_cost + (weight * rate.unit_cost);
        
        console.log(`找到匹配的费率: 国家=${country}, 产品=${productId}, 重量=${weight}kg, 总价=${totalPrice.toFixed(2)}元`);
        
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
    console.log('正在查询所有支持的国家...');
    
    const query = `
      SELECT DISTINCT "Country Name"
      FROM all_rates
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('查询国家列表出错:', err);
        reject(err);
      } else {
        const countries = rows.map(row => row['Country Name']);
        console.log(`找到 ${countries.length} 个支持的国家`);
        resolve(countries);
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