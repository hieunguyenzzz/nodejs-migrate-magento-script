const { request, gql } = require('graphql-request');
const wait = require('./helper/wait');
const bundleArray = require('./helper/bundle-array');

const migrateImages = async function() {
    const endpoint = 'https://www.mobelaris.com/graphql';
    const shopifyEndpoint = 'https://mobelaris-shop.myshopify.com/admin/api/2022-04/graphql.json';
    const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';
    const shopifyHeader = {
        'X-Shopify-Access-Token': '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',
    }

    const strapiProductQuery = gql `
    {
        products(pagination: {page:1, pageSize:999}) {
            data {    
                id
                attributes {
                    sku
                    shopify_id
                    images(pagination: {page: 1, pageSize: 250}) {
                        originalSrc
                        shopify_id
                        altText
                    }
                }
            }
        }
    }
    `;

    const magentoProductQuery = gql `
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
                                sku                  
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

    request(endpoint, magentoProductQuery).then(async({ products: { items } }) => {
        const result = items
            .filter(({ __typename }) => __typename === 'ConfigurableProduct');


        for (const item of result) {
            const { variants, image, sku, configurable_options } = item;

            //if (strapiProducts.data.map(p => p.attributes.sku).includes(sku)) continue;

            let shopifyProduct = strapiProducts.find(product => product.attributes.sku == sku);
            if (!shopifyProduct) continue;

            const shopifyDeleteImagesQuery = gql `
                    mutation productDeleteImages($id: ID!, $imageIds: [ID!]!) {
                        productDeleteImages(id: $id, imageIds: $imageIds) {                        
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `;

            const shopifyImagesQuery = gql `
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

            const strapiProductImagesDeleteQuery = gql `
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

            const { product: { images: { edges: shopifyImages } } } = await request(shopifyEndpoint, shopifyImagesQuery, { id: shopifyProduct.attributes.shopify_id }, shopifyHeader);
            await request(shopifyEndpoint, shopifyDeleteImagesQuery, { id: shopifyProduct.attributes.shopify_id, imageIds: shopifyImages.map(({ node }) => node.id) }, shopifyHeader);
            await request(strapiEndpoind, strapiProductImagesDeleteQuery, { id: shopifyProduct.id, data: { "images": [] } });


            /**
             * images
             */
            const images = [];
            configurable_options.sort((a, b) => {
                if (a.position < b.position) return -1;
                if (a.position > b.position) return 1;
                return 0;
            });


            images.push({ altText: "", src: image.url.replace(/cache\/\w*\//g, '').replace('https://www.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/') });

            for (const { product, attributes }
                of variants) {
                let shopifyVariantOptions = [];
                for (const configurable_option of configurable_options) {
                    shopifyVariantOptions.push(attributes.filter(attribute => attribute.code === configurable_option.attribute_code).shift());
                }

                const { media_gallery } = product;

                const sortMediaGallery = media_gallery.filter(media => !media.disabled && media.__typename !== "ProductVideo" && media?.label?.toLowerCase() != 'dimension').sort((a, b) => {
                    if (a.position < b.position) return -1;
                    if (a.position > b.position) return 1;
                    return 0;
                });
                for (const media of sortMediaGallery) {
                    images.push({ altText: product.sku, src: media.url.replace(/cache\/\w*\//g, '').replace('https://www.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/') });
                }
            }



            /**
             * upload images to shopify
             */

            const updateImageQuery = gql `
                    mutation productAppendImages($input: ProductAppendImagesInput!) {
                        productAppendImages(input: $input) {
                            newImages {
                              id
                            }
                            userErrors {
                                field
                                message
                            }
                            product {
                                id
                                title
                                
                                images(first: 249)  {
                                    edges {
                                    node {
                                        id
                                        altText
                                        originalSrc                            
                                    }
                                    }
                              }
                                
                            }
                        }
                    }
                `;
            const updateStrapiProductImageQuery = gql `
                mutation updateProduct($id: ID!, $data: ProductInput!) {
                    updateProduct(id:$id, data: $data) {
                    data {
                        attributes {
                        title
                        }
                    }
                    }
                }
            `;
            let i = 1;



            // const filterImages = images.filter(image => !shopifyProduct.attributes.images.filter(i => i.originalSrc === image.src).length);
            const filterImages = images;

            let updateImagesError = false;
            let hasImportImages = [];
            console.log(filterImages.length);
            const arrayBundle = bundleArray(filterImages);
            for (const data of arrayBundle) {
                do {
                    wait(3);
                    console.log(data);
                    try {
                        const { productAppendImages: { userErrors, newImages } } = await request(shopifyEndpoint, updateImageQuery, { input: { id: shopifyProduct.attributes.shopify_id, images: data } }, shopifyHeader);
                        if (userErrors.length > 0) {
                            await request(shopifyEndpoint, shopifyDeleteImagesQuery, { id: shopifyProduct.attributes.shopify_id, imageIds: newImages }, shopifyHeader);
                            console.log(userErrors);
                            continue;
                        }
                        hasImportImages = hasImportImages.concat(data);
                        break;
                    } catch (error) {
                        console.log(error);
                    }
                } while (true);
            }

            if (filterImages.length && !updateImagesError) {
                console.log('-----importing------');
                await request(strapiEndpoind, updateStrapiProductImageQuery, { id: shopifyProduct.id, data: { "images": shopifyProduct.attributes.images.concat(hasImportImages.map(i => ({ altText: i.altText, originalSrc: i.src }))) } })
            }

            if (updateImagesError) {


                const shopifyImagesQuery = gql `
                        query getProduct($id: ID!){
                            product(id: $id) {
                                images (first: 150) {
                                    edges {
                                        node {
                                            id                                            
                                        }
                                    }
                                }
                            }
                        }
                `;

                const strapiProductImagesDeleteQuery = gql `
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

                const { product: { images: { edges: images } } } = await request(shopifyEndpoint, shopifyImagesQuery, { id: shopifyProduct.attributes.shopify_id }, shopifyHeader);
                await request(shopifyEndpoint, shopifyDeleteImagesQuery, { id: shopifyProduct.attributes.shopify_id, imageIds: images.map(({ node }) => node.id) }, shopifyHeader);
                await request(strapiEndpoind, strapiProductImagesDeleteQuery, { id: shopifyProduct.id, data: { "images": [] } });

            }

        }


    })
}

migrateImages();