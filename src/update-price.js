const { request, gql } = require('graphql-request');

const updatePrice = async function() {
    const endpoint = 'https://www.mobelaris.com/graphql';
    const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
    const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

    const magentoProductQuery = gql`
    {
        products(
          filter: { category_id: { in: ["2"] } }
          currentPage: 1
          pageSize: 9999
        ) {
          items {
            __typename
            id
            lead_time
            url_key      
            price_range {
              maximum_price {
                regular_price {
                  currency
                  value
                }
                final_price {
                  currency
                  value
                }
              }
      
              minimum_price {
                regular_price {
                  currency
                  value
                }
                final_price {
                  currency
                  value
                }
              }
            }
            promotion
            ... on ConfigurableProduct {        
              lead_time
              variants {
                product {
                  sku            
                  price_range {
                    maximum_price {
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
}