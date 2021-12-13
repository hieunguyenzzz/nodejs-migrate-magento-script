const getTagsOfProduct = require('./get-tag-of-shopify-product');

test('get tags of gid://shopify/Product/6958949925050', async() => {
    const expected = ["Dining Chairs",
        "Hans J. Wegner",
        "Lounge Chair"
    ];

    expect(await getTagsOfProduct('gid://shopify/Product/6958949925050')).toEqual(expected);
})