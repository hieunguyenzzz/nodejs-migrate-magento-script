/**
 * return array of 
 * @param  images 
 */
function bundleArray(images) {
    const result = [];
    let i = 0;
    while(i < images.length) {
        if (i > 0 && i % 10 === 0) {
            result.push(images.slice(i - 10, i));
        }

        if (++i === images.length) {
            result.push(images.slice(i > 10 ? i - (i % 10) : 0));
        }
    }

    return result;
}

module.exports = bundleArray;