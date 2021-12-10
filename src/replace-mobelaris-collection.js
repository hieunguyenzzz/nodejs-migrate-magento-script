const { request, gql } = require('graphql-request');
const { mainModule } = require('process');

async function replaceMobelaris() {
    const endpoint = 'https://www.mobelaris.com/graphql';
    const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
    const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

    const shopifyCollectionQuery = gql`
    query getShopifyCollection{
        collections(first: 100) {
            edges {
            node {
                id
                title
            }
            }
        }
    }
`;

    const shopifyUpdateCollectionMutation = gql`
    mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
            userErrors {
                field
                message
            }
        }
    }
`;

    const magentoCategoriesQuery = gql`
    query categories{
        categoryList(filters: {ids: {in: ["3", "76", "19", "37", "58", "13", "138"]}}) {
        name
        description    
        children {
            description
            image
            
            name
        }
        }
    }
`;

    const shopifyCollectionData = [];
    const { collections: { edges: collections } } = await request(shopifyEndpoint, shopifyCollectionQuery);
    for ({ node: { id, title } } of collections) {
        shopifyCollectionData.push({ id, title });
    }


    request(endpoint, magentoCategoriesQuery).then(async ({ categoryList }) => {
        let updateCategories = [];
        for (const { name, description, children } of categoryList) {
            if (shopifyCollectionData.find(i => i.title == name)) {
                const updateCollectionData = {
                    input: {
                        id: shopifyCollectionData.find(i => i.title == name).id,
                        descriptionHtml: description ? description.replaceAll(' Mobelaris ', ' Designer Icons ') : '',
                    }
                };
                updateCategories.push(updateCollectionData);
            }


            for (const { name: childName, description: childDescription } of children) {
                if (shopifyCollectionData.find(i => i.title == childName)) {
                    const createCollectionData = {
                        input: {
                            id: shopifyCollectionData.find(i => i.title == childName).id,
                            descriptionHtml: childDescription ? childDescription.replaceAll(' Mobelaris ', ' Designer Icons ').replaceAll(' Mobelaris', ' Designer Icons').replaceAll('Mobelaris ', 'Designer Icons ') : '',
                        }
                    };

                    updateCategories.push(createCollectionData);
                }
            }
        }
        for (const item of updateCategories) {
            await request(shopifyEndpoint, shopifyUpdateCollectionMutation, item);
        }
    });



}

replaceMobelaris();