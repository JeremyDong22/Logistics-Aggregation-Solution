const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.resolve(__dirname, 'cainiao_logistics.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('已连接到数据库:', dbPath);
  }
});

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