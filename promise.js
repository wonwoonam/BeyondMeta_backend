const { resolve } = require("path")

const addSum = (a, b) => {
    return new Promise((resolve, reject)=> {
        setTimeout(function(){
            if(typeof a != 'number' || typeof b != 'number'){
                reject('a,b must be numbers');
            }
            resolve(a+b)
        }, 3000);
    })
}

addSum(10,30)
    .then(sum => console.log({sum}))
    .catch(error => console.log({error}))