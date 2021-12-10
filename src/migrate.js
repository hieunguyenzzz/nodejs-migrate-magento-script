const {request, gql} = require('graphql-request');
const migrate = async function() {
    var cloudinary = require('cloudinary').v2;
    cloudinary.config({ 
        cloud_name: 'dfgbpib38', 
        api_key: '981445167859451', 
        api_secret: 'HHsF8v0hZnVL9uDs1tg6WJg4QFU',
        secure: true
      });
    
    const endpoint = 'https://www.mobelaris.com/graphql';
    const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
    const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';
    
    const query = gql`
    {
        products(filter:{category_id: {in: ["2"]}}, currentPage:1, pageSize: 9999){
        items {
          __typename
          
                          id
                          sku
                          name
                          heading_1
                        heading_2
                        desc_image
                        description_image_2
                        short_description_1
                        short_description_2                              
                        short_description_3
                        short_description_4
                          url_key
                          image {
                              label
                              url
                          }
                          media_gallery {
                            url
                            label
                            position
    
                          }
                          description {
                              html
                          }
                          categories {
                              name
                              id
                          }
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
                                  promotion
                                  name
                                  heading_1
                                    heading_2
                                    desc_image
                                    description_image_2
                                    short_description_1
                                    short_description_2                              
                                    short_description_3
                                    short_description_4
                                    promotion
                                  image {
                                    url
                                    label
                                  }
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
                                  media_gallery {
                                    url
                                    label
                                    position
                                    disabled
                                    __typename
                                  }
                                  url_key                                
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

    const queryProductOnStrapi = gql`
        {
            products(pagination: {page:1, pageSize:999}) {
                data {    
                        attributes {
                        sku
                    }
                }
            }
        }
    `;
    const {products: {data: strapiProducts}} = await request(strapiEndpoind, queryProductOnStrapi);


    request(endpoint, query).then(({products: {items}}) => {
        
        const data =  items.filter(({__typename}) => __typename == 'ConfigurableProduct');
            for (const item of data) {
                const {configurable_options} = item;
                    for (const configurable_option of configurable_options) {            
                        const {values} = configurable_option;            
                        for (const value of values) {
                            if (!value.swatch_data) continue;
                            let name = value.label;
                            let url = value.swatch_data.value;
                            if (url.indexOf('/') !== -1) {                        
                                url = 'https://static.mobelaris.com/media/attribute/swatch/swatch_image/110x90' + url;
                                cloudinary.uploader.upload(url, {public_id: "swatchs/" + name.toLocaleLowerCase().replace(' - ', '-').replace(' ', '-').replace(' - ', '-').replace(' ', '-').replace(' - ', '-').replace(' ', '-')},
                                    function(error, result) {});
                            }
                        }
                    }
            }                                     
    });
    
    request(endpoint, query).then(async ({products: {items}}) => {               
        const result = items
        .filter(({sku, __typename}) => __typename == 'ConfigurableProduct' && !strapiProducts.map(product => product.attributes.sku).includes(sku));
        for (const item of result) {   
            wait(3);
            const {variants, name, sku: parentSku, url_key, configurable_options, image,heading_1, heading_2, description, desc_image, description_image_2, short_description_1, short_description_2, categories} = item;
    
            /**
             * images
             */
            const images = [];
            images.push({altText: "", src: image.url});
            /**
             * promotion
             */
            const allPromotions = [
            ];
            allPromotions[1107] = "25";
            allPromotions[1176] = "30";
            allPromotions[862] = "40";
            allPromotions[915] = "50";
            allPromotions[1106] = "60";
            allPromotions[1287] = "35";
            allPromotions[6915] = "55";
    
    
            /**
             * options build
             */
            const options = [];
            configurable_options.sort((a,b) => {
                if ( a.position < b.position) return -1;
                if ( a.position > b.position) return 1;
                return 0;
            });
            for (const configurable_option of configurable_options) {
                options.push(configurable_option.label.replace('/', '-'));            
            }
            
    
            /**
             * variants build
             */
            const shopifyVariants = [];
            for (const {product, attributes} of variants) {
                const {sku, heading_1, heading_2, desc_image, description_image_2, short_description_1, short_description_2, promotion} = product;
                if (['9214BA-YY1220'].includes(sku)) continue;
                const metafields = [
                    {
                        "description": "sku",                    
                        "key": "sku",
                        "namespace": "global",
                        "type": "single_line_text_field",
                        "value": heading_1
                    },
                    {
                        "description": "heading-1",                    
                        "key": "heading-1",
                        "namespace": "global",
                        "type": "single_line_text_field",
                        "value": heading_1
                    },
                    {
                        "description": "heading-2",                    
                        "key": "heading-2",
                        "namespace": "global",
                        "type": "single_line_text_field",
                        "value": heading_2
                    },
                    {
                        "description": "description-image-1",                 
                        "key": "description-image-1",
                        "namespace": "global",
                        "type": "single_line_text_field",
                        "value": '<img src=\'https://res.cloudinary.com/dfgbpib38/image/upload/f_auto/media/catalog/product/' + desc_image + '\'>'
                    },
                    {
                        "description": "description-image-2",                    
                        "key": "description-image-2",
                        "namespace": "global",
                        "type": "single_line_text_field",
                        "value": '<img src=\'https://res.cloudinary.com/dfgbpib38/image/upload/f_auto/media/catalog/product/' + description_image_2 + '\'>'
                    },
                    {
                        "description": "short-description-1",
                        
                        "key": "short-description-1",
                        "namespace": "global",
                        "type": "multi_line_text_field",
                        "value": short_description_1 ? short_description_1.replace('Mobelaris', 'Designer Icons') : ''
                    },
                    {
                        "description": "short-description-2",
                        
                        "key": "short-description-2",
                        "namespace": "global",
                        "type": "multi_line_text_field",
                        "value": short_description_2 ? short_description_2.replace('Mobelaris', 'Designer Icons') : ''
                    }
                ];
                let shopifyVariantOptions = [];
                for (const configurable_option of configurable_options) {
                    shopifyVariantOptions.push(attributes.filter(attribute => attribute.code === configurable_option.attribute_code).shift());
                }
                
                const {media_gallery} = product; 
                
                const dimensionPhoto = media_gallery.filter(media => media.label == 'dimension').map(media => media.url.replace(/cache\/\w*\//g, '').replace('https://static.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/'));
                const sortMediaGallery = media_gallery.filter(media => !media.disabled && media.__typename !== "ProductVideo" && media.label != 'dimension' ).sort((a,b) => {
                    if ( a.position < b.position) return -1;
                    if ( a.position > b.position) return 1;
                    return 0;
                }); 
                for (const media of sortMediaGallery) {
                    images.push({altText: shopifyVariantOptions.map(({label}) => label).join(' / '), src: media.url.replace(/cache\/\w*\//g, '').replace('https://static.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/')});
                }
                
                if (dimensionPhoto.length > 0) {
                    metafields.push({
                        "description": "dimension-photo",                    
                        "key": "dimension-photo",
                        "namespace": "global",
                        "type": "single_line_text_field",
                        "value": dimensionPhoto.pop()
                    });
                }
    
                if (allPromotions[promotion]) {
                    metafields.push({
                        "description": "promotion",                    
                        "key": "promotion",
                        "namespace": "global",
                        "type": "number_integer",
                        "value": allPromotions[promotion]
                    });
                }
    
                const shopifyVariant = {
                    title: product.name,
                    sku,
                    options: shopifyVariantOptions.map(({label}) => label),
                    metafields,
                    price: product.price_range.maximum_price.regular_price.value
                };
    
                shopifyVariants.push(shopifyVariant);
            }
    
            const input = {
                title: item.name,
                handle: item.url_key,               
                tags: categories.map(category => category.name),
                options,
                descriptionHtml: description.html,
                variants: shopifyVariants
            }
    
            const createProductShopifyQuery = gql`
                mutation productCreate($input: ProductInput!) {
                    productCreate(input: $input) {
                        shop {
                            url
                        }
                        userErrors {
                            field
                            message
                        }
                        product {
                            id
                            title
                            variants(first: 50) {
                                edges {
                                node {
                                  id
                                  sku,
                                  title,
                                  price
                                }
                              }
                            }
                            
                        }
                    }
                }
            `;
            
            /**
             * create product and upload images
             */
            console.log('creating product ' + parentSku);
            const {productCreate} = await request(shopifyEndpoint, createProductShopifyQuery, {input});    
            const {product, userErrors} = productCreate;
            if (userErrors.length > 0) {  
                console.log(input);      
                console.log(userErrors);continue;
            }

            const {id, title, variants: {edges}} = product;            
            console.log(id);
            const createStrapiProductQuery =  gql`
                mutation createProduct($data: ProductInput!){
                    createProduct(data: $data) {
                        data {
                            id
                        }
                    }
                }
            `;
            const createStrapiProductQueryData = {
                title,
                shopify_id: id,
                sku: parentSku,
                variants: edges.map(({node}) => ({title: node.title, shopify_id: node.id, price: parseFloat(node.price), sku: node.sku}))
            };
            
            
            console.log('create product on strapi');
            try {
                const {createProduct: {data}} = await request(strapiEndpoind, createStrapiProductQuery, {data: createStrapiProductQueryData});
            } catch (error) {

            }        
                
                // image 
                // let i =1;
                // const query = gql`
                //     mutation productAppendImages($input: ProductAppendImagesInput!) {
                //         productAppendImages(input: $input) {
                //             userErrors {
                //                 field
                //                 message
                //             }
                //             product {
                //                 id
                //                 title
                                
                //                 images(first: 249)  {
                //                     edges {
                //                     node {
                //                         id
                //                         altText
                //                         originalSrc                            
                //                     }
                //                     }
                //               }
                                
                //             }
                //         }
                //     }
                // `;
                // console.log(id);
                // while(i < images.length) {                
                //     if (i % 10  === 0) {
                //         try {
                //             wait(5);
                //             console.log(i);
                //             const {productAppendImages} = await request(shopifyEndpoint, query, {input: {id, images: images.slice(i - 10, i)}});                    
                //             const {product: {images: {edges}}} = productAppendImages;
                //             const updateStrapiProductQuery = gql`
                //                 mutation updateProduct($id: ID!, $data: ProductInput!) {
                //                     updateProduct(id:$id, data: $data) {
                //                     data {
                //                         attributes {
                //                         title
                //                         }
                //                     }
                //                     }
                //                 }
                //             `;
                //             const updateStrapiProductQueryData = {
                //                 id: data.id,
                //                 data: {
                //                     "images": edges.map(({node}) => ({originalSrc: node.originalSrc, altText: node.altText, shopify_id: node.id}))
                //                 }
                //             };
                            
                //             //await request(strapiEndpoind, updateStrapiProductQuery, {data: createStrapiProductQueryData});
    
                //         } catch (error) {
                //             continue;
                //         }                    
                //     }
    
                //     if (++i === images.length) {                  
                //       const {productCreate} = await request(shopifyEndpoint, query, {input: {id, images: images.slice( i > 10 ? i - 10 : 0 , i)}});                                  
                //     }
                // }
            
        }
    });
}
   
function wait(second) {
    var waitTill = new Date(new Date().getTime() + second * 1000);
    while(waitTill > new Date()){}
}

migrate();


