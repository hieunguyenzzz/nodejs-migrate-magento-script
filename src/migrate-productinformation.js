const { request, gql } = require('graphql-request');

const endpoint = 'https://mobelaris.hieunguyen.dev/graphql';
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
                            product_information
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

request(endpoint, magentoProductQuery).then(async ({ products: { items } }) => {
    const {products: {data: strapiProducts}} = await request(strapiEndpoind, strapiProductsQuery);

    for (const {variants, sku, __typename} of items) {
        if (__typename !== 'ConfigurableProduct') continue;
        const strapiProduct = strapiProducts.find(i => i.attributes.sku === sku);
        console.log(sku);
        if (!strapiProduct) {
            // console.log(sku + ' is not found');
        } else {
            const {attributes: {variants: strapiVariants}} = strapiProduct;
            for (let {product} of variants) {
                const {sku: variantSku, product_information} = product;
                const strapiData = strapiVariants.find(i => i.sku === variantSku);
                if (strapiData && product_information) {
                    const productInformationMetafield = {
                        "description": "product-information",
                        "key": "product-information",
                        "namespace": "global",
                        "type": "multi_line_text_field",
                        "value": product_information
                    };
                    try {
                        await request(shopifyEndpoint, shopifyProductUpdateQuery, {input: {id: strapiData.shopify_id, metafields: [productInformationMetafield]}} )
                    } catch (error) {
                        console.log(error);
                    }

                }
            }
        }
    }
})