const { request, gql } = require('graphql-request');

const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';

const shopifyProductImagesQuery = gql `
        query getProduct($id: ID!){
            product(id: $id) {
                tags
            }
        }
    `;
async function getTagsOfProducts(id) {
    const { product: { tags } } = await request(shopifyEndpoint, shopifyProductImagesQuery, { id });
    return tags;
}

module.exports = getTagsOfProducts;