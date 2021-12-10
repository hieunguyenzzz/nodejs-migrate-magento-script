const {request, gql} = require('graphql-request');

const strapiEndpoind = 'https://strapi.mobelaris.com/graphql';

const testMigrate = async function() {
    const queryProductOnStrapi = gql`
    {
        products {
        data {    
            attributes {
            sku
            }
        }
        }
    }
`;
    const {products: {data: strapiProducts}} = await request(strapiEndpoind, queryProductOnStrapi);
    console.log(strapiProducts.map(product => product.attributes.sku));
};

testMigrate();