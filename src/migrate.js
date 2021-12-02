const {request, gql} = require('graphql-request');
var cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: 'dfgbpib38', 
    api_key: '981445167859451', 
    api_secret: 'HHsF8v0hZnVL9uDs1tg6WJg4QFU',
    secure: true
  });

const endpoint = 'https://www.mobelaris.com/graphql';
const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';

const query = gql`
{
	products(filter:{sku: {eq: "XS-W03"}}, currentPage:1, pageSize: 10){
    items {
      __typename
      
                      id
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
                              image {
                                url
                                label
                              }
                              price_range {
                                maximum_price {
                                  final_price {
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
request(endpoint, query).then(({products: {items}}) => {
    for (const item of items) {
        const {configurable_options} = item;
        for (const configurable_option of configurable_options) {            
            const {values} = configurable_option;
            for (const value of values) {
                let name = value.label;
                let url = value.swatch_data.value;
                if (url.indexOf('/') !== -1) {
                    url = 'https://static.mobelaris.com/media/attribute/swatch/swatch_image/110x90' + url;
                    cloudinary.uploader.upload(url, {public_id: "swatchs/" + name.toLocaleLowerCase().replaceAll(' - ', '-').replaceAll(' ', '-')},
                        function(error, result) {console.log(result, error); });
                }
            }
        }
    }
});
request(endpoint, query).then(({products: {items}}) => {
    
    for (const item of items) {
        const {variants, name, url_key, configurable_options, heading_1, heading_2, description, desc_image, description_image_2, short_description_1, short_description_2} = item;

        /**
         * images
         */
        const images = [];
       
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
            options.push(configurable_option.label);            
        }
        

        /**
         * variants build
         */
        const shopifyVariants = [];
        for (const {product, attributes} of variants) {
            const {heading_1, heading_2, desc_image, description_image_2, short_description_1, short_description_2} = product;
            const metafields = [
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
                    "value": '<img src=\'https://static.mobelaris.com/media/catalog/product/' + desc_image + '\'>'
                },
                {
                    "description": "description-image-2",                    
                    "key": "description-image-2",
                    "namespace": "global",
                    "type": "single_line_text_field",
                    "value": '<img src=\'https://static.mobelaris.com/media/catalog/product/' + description_image_2 + '\'>'
                },
                {
                    "description": "short-description-1",
                    
                    "key": "short-description-1",
                    "namespace": "global",
                    "type": "multi_line_text_field",
                    "value": short_description_1.replace('Mobelaris', 'Designer Icons')
                },
                {
                    "description": "short-description-2",
                    
                    "key": "short-description-2",
                    "namespace": "global",
                    "type": "multi_line_text_field",
                    "value": short_description_2.replace('Mobelaris', 'Designer Icons')
                }
            ];
            let shopifyVariantOptions = [];
            for (const configurable_option of configurable_options) {
                shopifyVariantOptions.push(attributes.filter(attribute => attribute.code === configurable_option.attribute_code).shift());
            }
            
            const {media_gallery} = product; 
            
            const sortMediaGallery = media_gallery.filter(media => !media.disabled && media.__typename !== "ProductVideo" ).sort((a,b) => {
                if ( a.position < b.position) return -1;
                if ( a.position > b.position) return 1;
                return 0;
            }); 
            for (const media of sortMediaGallery) {
                images.push({altText: shopifyVariantOptions.map(({label}) => label).join(' / '), src: media.url.replace(/cache\/\w*\//g, '').replace('https://static.mobelaris.com/', 'https://res.cloudinary.com/dfgbpib38/image/upload/e_trim/')});
            }

            const shopifyVariant = {
                title: product.name,
                options: shopifyVariantOptions.map(({label}) => label),
                metafields,
                price: product.price_range.maximum_price.final_price.value
            };

            shopifyVariants.push(shopifyVariant);
        }

        const input = {
            title: item.name,
            handle: item.url_key,               
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
                    }
                }
            }
        `;
        
        /**
         * create product and upload images
         */
        request(shopifyEndpoint, createProductShopifyQuery, {input}).then(async ({errors ,productCreate }) => {
            const {product} = productCreate;
            const {id} = product;
            
            // image 
            let i =1;
            const query = gql`
                mutation productAppendImages($input: ProductAppendImagesInput!) {
                    productAppendImages(input: $input) {
                        userErrors {
                            field
                            message
                        }
                    
                    }
                }
            `;
            console.log(id);
            // console.log(images.length);
            // console.log(images);
            while(i < images.length) {                
                if (i % 10  === 0) {
                    try {
                        console.log(i);
                        await request(shopifyEndpoint, query, {input: {id, images: images.slice(i - 10, i)}});                    
                    } catch (error) {
                        continue;
                    }                    
                }

                if (++i === images.length) {
                  console.log(i);
                  await request(shopifyEndpoint, query, {input: {id, images: images.slice(i - 10, i)}});                
                }
            }
        });
    }
});