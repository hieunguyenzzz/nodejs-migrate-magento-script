const { request, gql } = require('graphql-request');

const endpoint = 'https://www.mobelaris.com/graphql';
const shopifyEndpoint = 'https://mobelaris-shop.myshopify.com/admin/api/2022-04/graphql.json';
const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

const shopifyHeader = {
    'X-Shopify-Access-Token': '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',
}

const magentoCategoriesQuery = gql `
    query categories{
        categoryList(filters: {ids: {in: ["3", "76", "19", "37", "58", "13", "138", "81", "194"]}}) {
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

const shopifyCreateCollection = gql `
    mutation CollectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
        userErrors { field, message }
        collection {
            id
            title
            descriptionHtml
            handle
            sortOrder
            ruleSet {
            appliedDisjunctively
            rules {
                column
                relation
                condition
                }
            }
        }
        }
    }
`;

request(endpoint, magentoCategoriesQuery).then(async({ categoryList }) => {
    let createCategories = [];
    for (const { name, description, children }
        of categoryList) {
        const createCollectionData = {
            input: {
                title: name,
                descriptionHtml: description ? description : '',
                ruleSet: {
                    appliedDisjunctively: false,
                    rules: {
                        "column": "TAG",
                        "relation": "EQUALS",
                        "condition": name
                    }
                }
            }
        };
        createCategories.push(createCollectionData);
        for (const { name: childName, description: childDescription }
            of children) {
            const createCollectionData = {
                input: {
                    title: childName,
                    descriptionHtml: childDescription ? childDescription : '',
                    ruleSet: {
                        appliedDisjunctively: false,
                        rules: {
                            "column": "TAG",
                            "relation": "EQUALS",
                            "condition": childName
                        }
                    }
                }
            };

            createCategories.push(createCollectionData);
        }
    }

    for (const item of createCategories) {
        console.log(item.input.title);
        try {
            await request(shopifyEndpoint, shopifyCreateCollection, item, shopifyHeader);
        } catch (error) {
            console.log(error);
        }
    }

});