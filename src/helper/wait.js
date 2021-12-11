function wait(second) {
    var waitTill = new Date(new Date().getTime() + second * 1000);
    while(waitTill > new Date()){}
}


module.exports = wait;