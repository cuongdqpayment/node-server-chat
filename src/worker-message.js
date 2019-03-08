/**
 * Worker by Cuong.dq
 * This is Worker in MidleWare JavaScript to: 
 * 1. receive Message from multi threads of Clients in Javascript/Anglular/Ionic...
 * 2. forward received Message to Main Threed
 * 
 */
this.addEventListener('message', function (e) {
    postMessage(e.data); //forward origin 
});