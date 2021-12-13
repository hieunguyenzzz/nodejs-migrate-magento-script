const { request, gql } = require('graphql-request');

const endpoint = 'https://www.mobelaris.com/graphql';
const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

const magentoProductQuery = gql `
    {
        products(filter:{category_id: {in: ["2"]}}, currentPage:1, pageSize: 9999){
            items {
                __typename            
                id
                sku                        
        
                ... on ConfigurableProduct{                                
                    variants {
                        product {   
                            sku                 
                            promotion
                            price_range {
                            maximum_price {
                                final_price {                                  
                                    value
                                }  
                                regular_price {
                                  value
                                }                              
                            }
                            minimum_price {
                                final_price {                                  
                                    value
                                }
                                regular_price {
                                  value
                                }                             
                            }
                        }                                     
                    
                    }
                    
                }
                }
            }
        }
    }
`;

const strapiProductsQuery = gql `
    {
        products(pagination: {page: 1, pageSize: 9999}) {
        data {
            id
            attributes {
            title
            sku
            shopify_id
            variants(pagination: {page: 1, pageSize: 50}) {
                sku
                shopify_id
            }
            }
        }
        }
    }
`;

const shopifyProductUpdateQuery = gql `
        mutation productVariantUpdate($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {            
            userErrors {
              field
              message
            }
          }
        }
    `;

/**
 * migrate price of all the product's variants on strapi instance
 */
request(endpoint, magentoProductQuery).then(async ({ products: { items } }) => {
    const {products: {data: strapiProducts}} = await request(strapiEndpoind, strapiProductsQuery);
    for (const {variants, sku} of items) {
        const strapiProduct = strapiProducts.find(i => i.attributes.sku === sku);
        if (!strapiProduct) {
            // console.log(sku + ' is not found');
        } else {
            console.log(sku);
            const {attributes: {variants: strapiVariants}} = strapiProduct;
            for (let {product} of variants) {
                const {sku: variantSku, price_range} = product;
                const strapiData = strapiVariants.find(i => i.sku === variantSku);
                const price = price_range.minimum_price ? price_range.minimum_price.final_price.value : (price_range.maximum_price ? price_range.maximum_price.final_price.value : false)
                const compareAtPrice = price_range.minimum_price ? price_range.minimum_price.regular_price.value : (price_range.maximum_price ? price_range.maximum_price.regular_price.value : false)
                if (strapiData && price) {
                    const {shopify_id} = strapiData;
                    console.log('updating ' + shopify_id + ' price ' + price_range.minimum_price.final_price.value)
                    await request(shopifyEndpoint, shopifyProductUpdateQuery, {input: {id: shopify_id, price: price_range.minimum_price.final_price.value, compareAtPrice}} )
                } else {
                    console.log(variantSku + ' shopify not found or price not exist');
                }
            }

        }
    }
})