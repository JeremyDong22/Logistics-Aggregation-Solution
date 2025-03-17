DROP VIEW IF EXISTS all_rates;

CREATE VIEW all_rates AS
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_STD r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_STD_BAT r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_CLOTHES r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_EXP r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_EXP_BAT r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates__CN_GLO_STD_SEL r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM "菜鸟国际快递_标准_带电精选" r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_SAV r
JOIN products p ON r.product_id = p.product_id

UNION ALL
SELECT 
    r."Country Name",
    r."Delivery Time",
    r."Weight Range",
    r."Unit Cost (CNY/KG)",
    r."Base Cost (CNY/ITEM)",
    r.product_id,
    p.service_provider,
    p.product_name
FROM rates_CN_GLO_SAV_BAT r
JOIN products p ON r.product_id = p.product_id; 