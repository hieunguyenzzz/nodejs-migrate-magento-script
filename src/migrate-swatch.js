const { request, gql } = require('graphql-request');
const { v2: cloudinary } = require("cloudinary");
const { Translate } = require('@google-cloud/translate').v2;

// Instantiates a client
const translate = new Translate({ projectId: 'euphoric-diode-268217', key: "AIzaSyAMTppcd4CP3KV5g5T3Uz_x6FaFnq21Zng" });

async function quickStart(text) {
    return text;
    // The text to translate

    // The target language
    const target = 'sv';

    // Translates some text into Russian
    const [translation] = await translate.translate(text, target);
    return translation;
}


const migrateSwatch = async function() {
    var cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: 'dfgbpib38',
        api_key: '981445167859451',
        api_secret: 'HHsF8v0hZnVL9uDs1tg6WJg4QFU',
        secure: true
    });

    const endpoint = 'https://www.mobelaris.com/graphql';

    const query = gql `
    {
        products(filter:{category_id: {in: ["2"]}}, currentPage:1, pageSize: 9999){
        items {
          __typename          
          id
          sku
          name
          url_key                          
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
          }
        }
      }
    }
    `;
    let allTheName = [];
    let allTheLabel = [];
    request(endpoint, query).then(async({ products: { items } }) => {

        const data = items.filter(({ __typename }) => __typename === 'ConfigurableProduct');
        for (const item of data) {
            const { configurable_options, sku, url_key } = item;
            for (const configurable_option of configurable_options) {
                const { values, label } = configurable_option;
                allTheLabel.push(label);
                for (const value of values) {
                    if (!value.swatch_data) continue;
                    let name = value.label;
                    let url = value.swatch_data.value;
                    allTheName.push(name);
                    console.log(url);
                    if (url.indexOf('/') !== -1) {

                        url = 'https://static.mobelaris.com/media/attribute/swatch/swatch_image/110x90' + url;

                        const newName = await quickStart(name.trim().toLocaleLowerCase().replace(' / ', '-').replace('  ', '-').replace(' - ', '-').replace(' ', '-').replace(' - ', '-').replace(' ', '-').replace(' - ', '-').replace(' ', '-').replace('mobelaris', 'designereditions').trim());
                        console.log("swatchs/" + url_key.replace('mobelaris', 'designericons') + '/' + newName);

                        cloudinary.uploader.upload(url, { public_id: "swatchs/" + url_key.replace('mobelaris', 'designericons') + '/' + newName, format: 'png' },
                            function(error, result) {});
                    }
                }
            }
        }
        allTheName.filter(onlyUnique).forEach(item => console.log(item));
        // allTheLabel.filter(onlyUnique).forEach(item => console.log(item));
        // console.log(JSON.stringify(allTheName.filter(onlyUnique)));
    });

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }



}

migrateSwatch();