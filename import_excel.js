// 导入菜鸟国际Excel数据并创建数据库
const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.resolve(__dirname, 'cainiao_logistics.db');

// Excel文件路径
const excelPath = path.resolve(__dirname, 'logictic company excels', '菜鸟国际_cleaned.xlsx');

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
  
  // 读取Excel文件
  readExcelAndCreateDB();
});

// 读取Excel并创建数据库
async function readExcelAndCreateDB() {
  try {
    console.log('正在读取Excel文件...');
    const workbook = XLSX.readFile(excelPath);
    
    // 获取产品目录工作表
    const productSheet = workbook.Sheets['报价总目录'];
    const products = XLSX.utils.sheet_to_json(productSheet);
    
    console.log(`已读取${products.length}个产品`);
    
    // 创建数据库表
    await createTables();
    
    // 插入产品数据
    await insertProducts(products);
    
    // 处理每个产品的价格表
    const priceData = [];
    
    // 跳过第一个工作表（产品目录），处理其余工作表
    for (let i = 1; i < workbook.SheetNames.length; i++) {
      const sheetName = workbook.SheetNames[i];
      console.log(`处理工作表: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // 找到对应的产品ID
      const product = products.find(p => p.product_name === sheetName);
      const productId = product ? product.product_id : generateProductId(sheetName);
      
      // 处理价格数据
      data.forEach(row => {
        priceData.push({
          country: row['Country Name'],
          productId: productId,
          deliveryTime: row['Delivery Time'],
          weightRange: row['Weight Range'],
          unitCost: row['Unit Cost (CNY/KG)'],
          baseCost: row['Base Cost (CNY/ITEM)']
        });
      });
    }
    
    // 插入价格数据
    await insertPriceData(priceData);
    
    console.log('数据导入完成!');
    
    // 关闭数据库连接
    db.close(err => {
      if (err) {
        console.error('关闭数据库连接时出错:', err);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  } catch (error) {
    console.error('读取Excel或创建数据库时出错:', error);
  }
}

// 创建数据库表
function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 创建产品表
      db.run(`
        CREATE TABLE products (
          product_id TEXT PRIMARY KEY,
          product_name TEXT NOT NULL,
          service_provider TEXT
        )
      `, (err) => {
        if (err) {
          console.error('创建产品表出错:', err);
          reject(err);
          return;
        }
        console.log('已创建产品表');
      });
      
      // 创建费率表
      db.run(`
        CREATE TABLE all_rates (
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
          reject(err);
          return;
        }
        console.log('已创建费率表');
        resolve();
      });
    });
  });
}

// 生成产品ID
function generateProductId(productName) {
  // 简单地使用产品名称的前几个字符作为ID
  const id = productName
    .replace(/[^\w\s]/g, '') // 移除特殊字符
    .replace(/\s+/g, '_')    // 空格替换为下划线
    .toLowerCase()
    .substring(0, 20);       // 取前20个字符
  
  return id;
}

// 插入产品数据
function insertProducts(products) {
  return new Promise((resolve, reject) => {
    const insertProduct = db.prepare('INSERT INTO products (product_id, product_name, service_provider) VALUES (?, ?, ?)');
    
    products.forEach(product => {
      insertProduct.run(
        product.product_id,
        product.product_name,
        product.serviceProvider,
        (err) => {
          if (err) console.error(`插入产品 ${product.product_name} 时出错:`, err);
        }
      );
    });
    
    insertProduct.finalize(err => {
      if (err) {
        console.error('插入产品数据时出错:', err);
        reject(err);
      } else {
        console.log(`已插入${products.length}个产品数据`);
        resolve();
      }
    });
  });
}

// 插入价格数据
function insertPriceData(priceData) {
  return new Promise((resolve, reject) => {
    const insertRate = db.prepare(`
      INSERT INTO all_rates 
      ("Country Name", product_id, min_weight, max_weight, unit_cost, base_cost, delivery_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    let insertCount = 0;
    
    priceData.forEach(item => {
      try {
        // 解析重量范围
        const weightRange = item.weightRange;
        const matches = weightRange.match(/(\d+(?:\.\d+)?)<W≤(\d+(?:\.\d+)?)KG/);
        
        if (!matches) {
          console.warn(`无法解析重量范围: ${weightRange}`);
          return;
        }
        
        const minWeight = parseFloat(matches[1]);
        const maxWeight = parseFloat(matches[2]);
        
        // 插入数据
        insertRate.run(
          item.country,
          item.productId,
          minWeight,
          maxWeight,
          item.unitCost,
          item.baseCost,
          item.deliveryTime,
          (err) => {
            if (err) {
              console.error(`插入价格数据时出错:`, err);
            } else {
              insertCount++;
            }
          }
        );
      } catch (error) {
        console.error('处理价格数据时出错:', error, item);
      }
    });
    
    insertRate.finalize(err => {
      if (err) {
        console.error('插入价格数据时出错:', err);
        reject(err);
      } else {
        console.log(`已插入${insertCount}条价格数据`);
        resolve();
      }
    });
  });
} 