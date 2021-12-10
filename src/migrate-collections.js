const { request, gql } = require('graphql-request');

const endpoint = 'https://www.mobelaris.com/graphql';
const shopifyEndpoint = 'https://fa0c9131669a0764ca4bceb70c4f687a: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@designer-editions-shop.myshopify.com/admin/api/2021-07/graphql.json';
const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

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

const shopifyCreateCollection = gql`
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

request(endpoint, magentoCategoriesQuery).then(async ({ categoryList }) => {
    let createCategories = [];
    for (const { name, description, children } of categoryList) {
        const createCollectionData = {
            input: {
                title: name,
                descriptionHtml: description,
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
        for (const { name: childName, description: childDescription } of children) {
            const createCollectionData = {
                input: {
                    title: childName,
                    descriptionHtml: childDescription,
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
        console.log(item);
        try {
            await request(shopifyEndpoint, shopifyCreateCollection, item);
        } catch (error) {
            console.log(error);
        }                    
    }
    
});