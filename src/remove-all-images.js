const { request, gql } = require('graphql-request');

const migrateImages = async function () {
    const endpoint = 'https://www.mobelaris.com/graphql';
    const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
    const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';
    const strapiProductQuery = gql`
    {
        products(pagination: {page:1, pageSize:9999}) {
            data {    
                id
                attributes {
                    sku
                    shopify_id
                    images(pagination: {page: 1, pageSize: 999}) {
                        originalSrc
                        shopify_id
                        altText
                    }
                }
            }
        }
    }
    `;

    const magentoProductQuery = gql`
        {
            products(filter:{category_id: {in: ["2"]}}, currentPage:1, pageSize: 9999){
                items {
                    __typename            
                    id
                    sku                        
                    image {
                        label
                        url
                    }
                    media_gallery {
                        url
                        label
                        position

                    }            
                    ... on ConfigurableProduct{
                        configurable_options{
                            values {
                                label
                                swatch_data {
                                  value
                                }
                            }
                            
                            position
                            attribute_code
                            label
                        }                
                        variants {
                            product {                    
                                image {
                                    url
                                    label
                                }
                            
                                media_gallery {
                                    url
                                    label
                                    position
                                    disabled
                                    __typename
                                }                                        
                            
                            }
                            attributes {
                                label
                                code
                            }
                        }
                    }
                }
            }
        }
    `;

    const { products: { data: strapiProducts } } = await request(strapiEndpoind, strapiProductQuery);

    request(endpoint, magentoProductQuery).then(async ({ products: { items } }) => {
        const result = items
            .filter(({ __typename }) => __typename == 'ConfigurableProduct');

        for (const item of result) {
            
            const { sku} = item;            
            if (!['8062BA'].includes(sku)) {
                continue;
            }
            console.log(sku);
            
            let shopifyProduct = strapiProducts.find(product => product.attributes.sku == sku);  
            if (!shopifyProduct) continue;
            const shopifyDeleteImagesQuery = gql`
                    mutation productDeleteImages($id: ID!, $imageIds: [ID!]!) {
                        productDeleteImages(id: $id, imageIds: $imageIds) {                        
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `;

                const shopifyImagesQuery = gql`
                        query getProduct($id: ID!){
                            product(id: $id) {
                                images (first: 200) {
                                    edges {
                                        node {
                                            id                                            
                                        }
                                    }
                                }
                            }
                        }
                `;

                const strapiProductImagesDeleteQuery = gql`
                    mutation updateProduct($id: ID!, $data: ProductInput!) {  
                        updateProduct(id: $id, data: $data) {
                            data {
                                attributes {
                                title
                                }
                            }
                        }
                    }
                `;

                const { product: { images: { edges: shopifyImages } } } = await request(shopifyEndpoint, shopifyImagesQuery, { id: shopifyProduct.attributes.shopify_id });                
                await request(shopifyEndpoint, shopifyDeleteImagesQuery, { id: shopifyProduct.attributes.shopify_id, imageIds: shopifyImages.map(({ node }) => node.id) });
                await request(strapiEndpoind, strapiProductImagesDeleteQuery, { id: shopifyProduct.id, data: { "images": [] } });

        }


    })
}

migrateImages();