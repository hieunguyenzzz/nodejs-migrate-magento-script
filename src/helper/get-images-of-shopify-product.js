const { request, gql } = require('graphql-request');
const endpoint = 'https://www.mobelaris.com/graphql';

const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';

const shopifyProductImagesQuery = gql `
        query getProduct($id: ID!){
            product(id: $id) {
                images(first: 200) {
                  edges {
                    node {
                      id
                    }
                  }
                }
            }
        }
    `;

async function getImagesOfShopifyProduct(id) {
    const { product: { images: { edges } } } = await request(shopifyEndpoint, shopifyProductImagesQuery, { id });
    return edges.map(({ node }) => node.id);

}

module.exports = getImagesOfShopifyProduct;