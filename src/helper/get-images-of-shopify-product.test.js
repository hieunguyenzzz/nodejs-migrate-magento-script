const getImagesOfShopifyProduct = require('./get-images-of-shopify-product');

test('get images of gid://shopify/Product/6954673569978', async () => {
    const expected = [
        "gid://shopify/ProductImage/30292472791226",
        "gid://shopify/ProductImage/30292472823994",
        "gid://shopify/ProductImage/30292472856762",
        "gid://shopify/ProductImage/30292472889530",
        "gid://shopify/ProductImage/30292472922298",
        "gid://shopify/ProductImage/30292472955066",
        "gid://shopify/ProductImage/30292472987834",
        "gid://shopify/ProductImage/30292473053370",
    ];

    expect(await getImagesOfShopifyProduct('gid://shopify/Product/6954673569978')).toEqual(expected);
})