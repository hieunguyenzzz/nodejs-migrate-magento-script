const bundleArray = require('./bundle-array');

test('array has bellow 10 items', () => {
    const expected = [[1,2,3,4,5,6,7,8]];
    expect(bundleArray([1,2,3,4,5,6,7,8])).toEqual(expected)
})

test('array has 10 items', () => {
    const expected = [[1,2,3,4,5,6,7,8,9,10]];
    expect(bundleArray([1,2,3,4,5,6,7,8,9,10])).toEqual(expected)
})

test('array has more than 10 items', () => {
    const expected = [[1,2,3,4,5,6,7,8,9,10], [11,12]];
    expect(bundleArray([1,2,3,4,5,6,7,8,9,10,11,12])).toEqual(expected)
})