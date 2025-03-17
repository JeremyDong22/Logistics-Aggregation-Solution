// 测试数据库连接
const { getShippingOptions, getShippingRate, getSupportedCountries } = require('./db');

async function testDatabase() {
  try {
    console.log('测试获取支持的国家...');
    const countries = await getSupportedCountries();
    console.log('支持的国家:', countries);

    if (countries && countries.length > 0) {
      const testCountry = countries[0];
      console.log(`\n测试获取${testCountry}的物流选项...`);
      const options = await getShippingOptions(testCountry);
      console.log(`${testCountry}的物流选项:`, options);

      if (options && options.length > 0) {
        const testOption = options[0];
        console.log(`\n测试获取${testCountry}的${testOption.product_name}价格(重量1kg)...`);
        const rate = await getShippingRate(testCountry, 1, testOption.product_id);
        console.log(`价格信息:`, rate);
      }
    }

    console.log('\n数据库测试完成!');
  } catch (error) {
    console.error('测试数据库时出错:', error);
  }
}

testDatabase(); 