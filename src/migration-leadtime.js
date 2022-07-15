const axios = require('axios').default;
const { request, gql } = require('graphql-request');

const endpoint = 'https://mobelaris.hieunguyen.dev/graphql';
const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-10/graphql.json';
const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

const migrateLeadtime = async function() {
    //const response = await axios.get('https://www.mobelaris.com/en/stockonwater/ajax/getstock/?product_id=3905')


    const query = gql `
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
                            lead_time
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

    const shopifyMetafieldUpdateQuery = gql `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
          }
        }
      }
    `;

    const { products: { items } } = await request(endpoint, query);
    const { products: { data: strapiProducts } } = await request(strapiEndpoind, strapiProductsQuery);

    for (const item of items) {

        const { __typename, sku, variants } = item;
        if (__typename !== 'ConfigurableProduct') {
            continue;
        }
        if (sku !== 'KS076-L-Left') {
            continue;
        }
        const strapiProduct = strapiProducts.find(i => i.attributes.sku === sku);
        if (!strapiProduct) continue;
        const { attributes: { variants: strapiVariants } } = strapiProduct;
        for (const variant of variants) {
            const { product: { sku: variantSku, lead_time } } = variant;
            const strapiProductVariant = strapiVariants.find(i => i.sku === variantSku);

            const leadtimeMetafield = {
                "key": "leading-time",
                "ownerId": strapiProductVariant.shopify_id,
                "namespace": "global",
                "type": "single_line_text_field",
                "value": lead_time.trim()
            };
            try {
                console.log(lead_time);
                console.log(strapiProductVariant.shopify_id);
                const { metafieldsSet: { userErrors } } = await request(shopifyEndpoint, shopifyMetafieldUpdateQuery, { metafields: [leadtimeMetafield] })
            } catch (error) {
                console.log(error);
            }
        }
    }
}
migrateLeadtime();