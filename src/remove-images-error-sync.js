const { request, gql } = require('graphql-request');
const getImagesOfShopifyProduct = require('./helper/get-images-of-shopify-product')
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

    const shopifyProductImagesQuery = gql`
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

    const { products: { data: strapiProducts } } = await request(strapiEndpoind, strapiProductQuery);

    request(endpoint, magentoProductQuery).then(async ({ products: { items } }) => {
        const result = items
            .filter(({ __typename }) => __typename === 'ConfigurableProduct');

        for (const item of result) {

            const { variants, image, sku, configurable_options } = item;
            /**
             * images
             */
            const images = [];
            configurable_options.sort((a, b) => {
                if (a.position < b.position) return -1;
                if (a.position > b.position) return 1;
                return 0;
            });


            images.push({ altText: "", src: image.url.replace(/cache\/\w*\//g, '').replace('https://static.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/') });
            for (const { product, attributes } of variants) {
                let shopifyVariantOptions = [];
                for (const configurable_option of configurable_options) {
                    shopifyVariantOptions.push(attributes.filter(attribute => attribute.code === configurable_option.attribute_code).shift());
                }

                const { media_gallery } = product;

                const sortMediaGallery = media_gallery.filter(media => !media.disabled && media.__typename !== "ProductVideo" && media.label != 'dimension').sort((a, b) => {
                    if (a.position < b.position) return -1;
                    if (a.position > b.position) return 1;
                    return 0;
                });
                for (const media of sortMediaGallery) {
                    images.push({ altText: shopifyVariantOptions.map(({ label }) => label).join(' / '), src: media.url.replace(/cache\/\w*\//g, '').replace('https://static.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/') });
                }
            }
            let shopifyProduct = strapiProducts.find(product => product.attributes.sku === sku);
            let productShopifyImages = await getImagesOfShopifyProduct(shopifyProduct.attributes.shopify_id);

            console.log(sku);
            console.log(productShopifyImages.length);
            console.log(images.length);
            if (productShopifyImages.length > 0 && productShopifyImages.length !== images.length) {
                console.log(sku);
                console.log(productShopifyImages.length);
                console.log(images.length);


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
        }


    })
}

migrateImages();