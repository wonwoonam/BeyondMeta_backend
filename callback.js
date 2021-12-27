const addSum = function(a, b, callback){
    setTimeout(function(){
        if(typeof a != 'number' || typeof b != 'number'){
            callback('a,b must be numbers');
        }
        callback(undefined, a+b)
    }, 3000);
}

let callback = (error, sum) => {
    if (error) console.log({error});
    console.log({sum})
}

addSum(10,20, callback)