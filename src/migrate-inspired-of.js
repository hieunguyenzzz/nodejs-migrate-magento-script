const { request, gql } = require('graphql-request');
const getTagsOfProduct = require('./helper/get-tag-of-shopify-product');

const migrateInspiredOf = async function() {
    const endpoint = 'https://www.mobelaris.com/graphql';
    const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
    const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

    const strapiProductQuery = gql `
    {
        products(pagination: {page:1, pageSize:999}) {
            data {    
                id
                attributes {                    
                    shopify_id                    
                }
            }
        }
    }
    `;

    const shopifyProductUpdateQuery = gql `
        mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
            product {
                metafields(first: 100) {
                    edges {
                            node {
                                id
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
            }
        }
    `;

    const allInspiredOf = [
        {
            "name": "A and P Castiglioni"
        },
        {
            "name": "Alvar Aalto"
        },
        {
            "name": "Anna Castelli Ferrieri"
        },
        {
            "name": "Arne Jacobsen"
        },
        {
            "name": "August Thonet"
        },
        {
            "name": "Bertjan Pot"
        },
        {
            "name": " Børge Mogensen"
        },
        {
            "name": "Carlo Mollino"
        },
        {
            "name": "Charles Eames"
        },
        {
            "name": "Christian Dell"
        },
        {
            "name": "Draga Obradovic & Aurel K. Basedow"
        },
        {
            "name": "Ebbe Gehl & Søren Nissen  "
        },
        {
            "name": "Eero Aarnio"
        },
        {
            "name": "Eero Saarinen"
        },
        {
            "name": "Eileen Gray"
        },
        {
            "name": "Erik Buch"
        },
        {
            "name": "Fabricius and Kastholm"
        },
        {
            "name": "Finn Juhl"
        },
        {
            "name": "Florence Knoll"
        },
        {
            "name": "Gabriele & Oscar Buratti"
        },
        {
            "name": "George Nelson"
        },
        {
            "name": "Gino Sarfatti"
        },
        {
            "name": "Grant Featherston"
        },
        {
            "name": "Greta Grossman"
        },
        {
            "name": "Hans J. Wegner"
        },
        {
            "name": "Harry Bertoia"
        },
        {
            "name": "Isamu Noguchi"
        },
        {
            "name": "Jean Prouvé"
        },
        {
            "name": "Jens Risom"
        },
        {
            "name": "Jo Hammerborg"
        },
        {
            "name": "Juha Ilmari Leiviskä"
        },
        {
            "name": "Jørn Oberg Utzon"
        },
        {
            "name": "Kai Kristiansen"
        },
        {
            "name": "Le Corbusier"
        },
        {
            "name": "Marcel Breuer"
        },
        {
            "name": "Mariano Fortuny y Madrazo"
        },
        {
            "name": "Mark Stam"
        },
        {
            "name": "Michael Thonet"
        },
        {
            "name": "Mies Van Der Rohe"
        },
        {
            "name": "Mobelaris"
        },
        {
            "name": "Nicolaj Nøddesbo & Tommy Hyldahl"
        },
        {
            "name": "Paulo Rizzatto"
        },
        {
            "name": "Pierre Paulin"
        },
        {
            "name": "Philippe Starck"
        },
        {
            "name": "Poul Christiansen"
        },
        {
            "name": "Poul Henningsen"
        },
        {
            "name": "Poul Kjærholm"
        },
        {
            "name": "Poul Volther"
        },
        {
            "name": "Robert Dudley Best"
        },
        {
            "name": "Serge Mouille"
        },
        {
            "name": "Sigurd Ressell"
        },
        {
            "name": "Sori Yanagi"
        },
        {
            "name": "Xavier Pauchard"
        },
        {
            "name": "Verner Panton"
        },
        {
            "name": "Vico Magistretti"
        },
        {
            "name": "Warren Platner"
        },
        {
            "name": "Wilhelm Wagenfeld"
        },
        {
            "name": "Bernard Schottlander"
        },
        {
            "name": "Bernard-Albin Gras"
        },
        {
            "name": "Shin and Tomoko Azumi"
        },
        {
            "name": "Mario Bellini"
        }
    ];

    const { products: { data: strapiProducts } } = await request(strapiEndpoind, strapiProductQuery);
    for (const { attributes: { shopify_id } }
        of strapiProducts) {
        console.log(shopify_id);
        const tags = await getTagsOfProduct(shopify_id);
        console.log(tags);
        const inspiredOf = allInspiredOf.find(designer => tags.find(tag => tag === designer.name));
        const inspiredMetafield = {
            "description": "inspired-of",
            "key": "inspired-of",
            "namespace": "global",
            "type": "single_line_text_field",
            "value": inspiredOf && inspiredOf.name !== 'Mobelaris' ? inspiredOf.name : 'Designer Icons'
        };
        console.log(inspiredMetafield);
        await request(shopifyEndpoint, shopifyProductUpdateQuery, { input: { id: shopify_id, metafields: [inspiredMetafield] } })
    };
}

migrateInspiredOf();