// 检查Excel文件内容
const XLSX = require('xlsx');
const path = require('path');

// Excel文件路径
const excelPath = path.resolve(__dirname, 'logictic company excels', '菜鸟国际_cleaned.xlsx');

// 读取Excel文件
console.log('正在读取Excel文件...');
const workbook = XLSX.readFile(excelPath);

// 获取所有工作表
console.log('工作表列表:', workbook.SheetNames);

// 遍历每个工作表
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n检查工作表: ${sheetName}`);
  const worksheet = workbook.Sheets[sheetName];
  
  // 将工作表转换为JSON
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`该工作表有 ${data.length} 行数据`);
  
  if (data.length > 0) {
    // 打印第一行数据的所有列名
    console.log('列名:', Object.keys(data[0]));
    
    // 打印前3行数据
    console.log('前3行数据:');
    for (let i = 0; i < Math.min(3, data.length); i++) {
      console.log(`行 ${i+1}:`, data[i]);
    }
  }
}); 