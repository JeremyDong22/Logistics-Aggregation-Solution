// 解析重量范围的函数
function parseWeightRange(rangeStr) {
    const matches = rangeStr.match(/(\d+(?:\.\d+)?)<W≤(\d+(?:\.\d+)?)KG/);
    if (matches) {
        return {
            min: parseFloat(matches[1]),
            max: parseFloat(matches[2])
        };
    }
    return { min: 0, max: 0 };
}

// 物流价格数据
const shippingData = {
    // 普通物品服务
    normal: {
        // 标准服务
        standard: {
            name: "菜鸟国际快递-标准-普货",
            deliveryTime: "10-15CD",
            countries: {
                // 美国
                USA: [
                    {
                        weightRange: "0<W≤0.1KG",
                        unitPrice: 0,
                        basePrice: 76
                    },
                    {
                        weightRange: "0.1<W≤0.3KG",
                        unitPrice: 0,
                        basePrice: 84
                    },
                    {
                        weightRange: "0.3<W≤0.5KG",
                        unitPrice: 0,
                        basePrice: 92
                    },
                    {
                        weightRange: "0.5<W≤1KG",
                        unitPrice: 0,
                        basePrice: 108
                    },
                    {
                        weightRange: "1<W≤1.5KG",
                        unitPrice: 0,
                        basePrice: 124
                    },
                    {
                        weightRange: "1.5<W≤2KG",
                        unitPrice: 0,
                        basePrice: 140
                    },
                    {
                        weightRange: "2<W≤3KG",
                        unitPrice: 60,
                        basePrice: 20
                    },
                    {
                        weightRange: "3<W≤30KG",
                        unitPrice: 58,
                        basePrice: 26
                    }
                ],
                // 英国
                UK: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 52,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 54,
                        basePrice: 25
                    }
                ],
                // 澳大利亚
                Australia: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 50,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 52,
                        basePrice: 25
                    }
                ],
                // 加拿大
                Canada: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 54,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 56,
                        basePrice: 25
                    }
                ],
                // 日本
                Japan: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 45,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 47,
                        basePrice: 25
                    }
                ],
                // 德国
                Germany: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 53,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 55,
                        basePrice: 25
                    }
                ],
                // 法国
                France: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 54,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 56,
                        basePrice: 25
                    }
                ],
                // 巴西
                Brazil: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 65,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 67,
                        basePrice: 25
                    }
                ],
                // 智利
                Chile: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 66,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 68,
                        basePrice: 25
                    }
                ],
                // 意大利
                Italy: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 55,
                        basePrice: 25.0
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 57,
                        basePrice: 25.0
                    }
                ]
            }
        },
        // 快线服务
        express: {
            name: "菜鸟国际快递-快线-普货",
            deliveryTime: "5-9CD",
            countries: {
                // 美国
                USA: [
                    {
                        weightRange: "0<W≤0.1KG",
                        unitPrice: 0,
                        basePrice: 102
                    },
                    {
                        weightRange: "0.1<W≤0.3KG",
                        unitPrice: 0,
                        basePrice: 110
                    },
                    {
                        weightRange: "0.3<W≤0.5KG",
                        unitPrice: 0,
                        basePrice: 118
                    },
                    {
                        weightRange: "0.5<W≤1KG",
                        unitPrice: 0,
                        basePrice: 134
                    },
                    {
                        weightRange: "1<W≤1.5KG",
                        unitPrice: 0,
                        basePrice: 150
                    },
                    {
                        weightRange: "1.5<W≤2KG",
                        unitPrice: 0,
                        basePrice: 166
                    },
                    {
                        weightRange: "2<W≤3KG",
                        unitPrice: 76,
                        basePrice: 20
                    },
                    {
                        weightRange: "3<W≤30KG",
                        unitPrice: 74,
                        basePrice: 26
                    }
                ],
                // 英国
                UK: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 68,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 70,
                        basePrice: 25
                    }
                ],
                // 澳大利亚
                Australia: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 66,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 68,
                        basePrice: 25
                    }
                ],
                // 加拿大
                Canada: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 70,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 72,
                        basePrice: 25
                    }
                ],
                // 日本
                Japan: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 61,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 63,
                        basePrice: 25
                    }
                ],
                // 德国
                Germany: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 69,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 71,
                        basePrice: 25
                    }
                ],
                // 法国
                France: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 70,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 72,
                        basePrice: 25
                    }
                ],
                // 巴西
                Brazil: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 81,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 83,
                        basePrice: 25
                    }
                ],
                // 智利
                Chile: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 82,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 84,
                        basePrice: 25
                    }
                ],
                // 意大利
                Italy: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 71,
                        basePrice: 25.0
                    },
                    {
                        weightRange: "2<W≤30KG",
                        unitPrice: 73,
                        basePrice: 25.0
                    }
                ]
            }
        }
    },
    
    // 含电池物品服务
    battery: {
        // 标准服务
        standard: {
            name: "菜鸟国际快递-标准-带电",
            deliveryTime: "10-15CD",
            countries: {
                // 美国
                USA: [
                    {
                        weightRange: "0<W≤0.1KG",
                        unitPrice: 0,
                        basePrice: 112
                    },
                    {
                        weightRange: "0.1<W≤0.3KG",
                        unitPrice: 0,
                        basePrice: 120
                    },
                    {
                        weightRange: "0.3<W≤0.5KG",
                        unitPrice: 0,
                        basePrice: 128
                    },
                    {
                        weightRange: "0.5<W≤1KG",
                        unitPrice: 0,
                        basePrice: 144
                    },
                    {
                        weightRange: "1<W≤1.5KG",
                        unitPrice: 0,
                        basePrice: 160
                    },
                    {
                        weightRange: "1.5<W≤2KG",
                        unitPrice: 0,
                        basePrice: 176
                    },
                    {
                        weightRange: "2<W≤3KG",
                        unitPrice: 76,
                        basePrice: 20
                    },
                    {
                        weightRange: "3<W≤5KG",
                        unitPrice: 74,
                        basePrice: 26
                    }
                ],
                // 英国
                UK: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 68,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 70,
                        basePrice: 25
                    }
                ],
                // 澳大利亚
                Australia: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 66,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 68,
                        basePrice: 25
                    }
                ],
                // 加拿大
                Canada: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 70,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 72,
                        basePrice: 25
                    }
                ],
                // 日本
                Japan: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 61,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 63,
                        basePrice: 25
                    }
                ],
                // 德国
                Germany: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 69,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 71,
                        basePrice: 25
                    }
                ],
                // 法国
                France: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 70,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 72,
                        basePrice: 25
                    }
                ],
                // 巴西
                Brazil: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 81,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 83,
                        basePrice: 25
                    }
                ],
                // 智利
                Chile: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 82,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 84,
                        basePrice: 25
                    }
                ],
                // 意大利
                Italy: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 72,
                        basePrice: 25.0
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 74,
                        basePrice: 25.0
                    }
                ]
            }
        },
        // 快线服务
        express: {
            name: "菜鸟国际快递-快线-带电",
            deliveryTime: "5-9CD",
            countries: {
                // 美国
                USA: [
                    {
                        weightRange: "0<W≤0.1KG",
                        unitPrice: 0,
                        basePrice: 138
                    },
                    {
                        weightRange: "0.1<W≤0.3KG",
                        unitPrice: 0,
                        basePrice: 146
                    },
                    {
                        weightRange: "0.3<W≤0.5KG",
                        unitPrice: 0,
                        basePrice: 154
                    },
                    {
                        weightRange: "0.5<W≤1KG",
                        unitPrice: 0,
                        basePrice: 170
                    },
                    {
                        weightRange: "1<W≤1.5KG",
                        unitPrice: 0,
                        basePrice: 186
                    },
                    {
                        weightRange: "1.5<W≤2KG",
                        unitPrice: 0,
                        basePrice: 202
                    },
                    {
                        weightRange: "2<W≤3KG",
                        unitPrice: 92,
                        basePrice: 20
                    },
                    {
                        weightRange: "3<W≤5KG",
                        unitPrice: 90,
                        basePrice: 26
                    }
                ],
                // 英国
                UK: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 84,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 86,
                        basePrice: 25
                    }
                ],
                // 澳大利亚
                Australia: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 82,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 84,
                        basePrice: 25
                    }
                ],
                // 加拿大
                Canada: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 86,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 88,
                        basePrice: 25
                    }
                ],
                // 日本
                Japan: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 77,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 79,
                        basePrice: 25
                    }
                ],
                // 德国
                Germany: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 85,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 87,
                        basePrice: 25
                    }
                ],
                // 法国
                France: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 86,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 88,
                        basePrice: 25
                    }
                ],
                // 巴西
                Brazil: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 97,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 99,
                        basePrice: 25
                    }
                ],
                // 智利
                Chile: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 98,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 100,
                        basePrice: 25
                    }
                ],
                // 意大利
                Italy: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 88,
                        basePrice: 25.0
                    },
                    {
                        weightRange: "2<W≤5KG",
                        unitPrice: 90,
                        basePrice: 25.0
                    }
                ]
            }
        }
    },
    
    // 服装专线
    clothes: {
        // 标准服务
        standard: {
            name: "菜鸟国际快递-服装专线",
            deliveryTime: "12-18CD",
            countries: {
                // 美国
                USA: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 48,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 50,
                        basePrice: 25
                    }
                ],
                // 英国
                UK: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 46,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 48,
                        basePrice: 25
                    }
                ],
                // 澳大利亚
                Australia: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 44,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 46,
                        basePrice: 25
                    }
                ],
                // 加拿大
                Canada: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 48,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 50,
                        basePrice: 25
                    }
                ],
                // 日本
                Japan: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 39,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 41,
                        basePrice: 25
                    }
                ],
                // 德国
                Germany: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 47,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 49,
                        basePrice: 25
                    }
                ],
                // 法国
                France: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 48,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 50,
                        basePrice: 25
                    }
                ],
                // 巴西
                Brazil: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 59,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 61,
                        basePrice: 25
                    }
                ],
                // 智利
                Chile: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 60,
                        basePrice: 25
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 62,
                        basePrice: 25
                    }
                ],
                // 意大利
                Italy: [
                    {
                        weightRange: "0<W≤2KG",
                        unitPrice: 49,
                        basePrice: 25.0
                    },
                    {
                        weightRange: "2<W≤20KG",
                        unitPrice: 51,
                        basePrice: 25.0
                    }
                ]
            }
        }
    }
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 