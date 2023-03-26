//const fetch = require('node-fetch'); // oddly enough you don't need it for other functions but for this one yes 


// this format if you want to control the schedule at the netlify.toml level :

exports.handler = async function(event, context) {

/*     await fetch("https://edgy-jarvis-bot.netlify.app", {  // needed to keep the server up if >24h ??
        method: "POST", 
    });  */

  
   await fetch("https://api.netlify.com/build_hooks/64207d88f7a7885f7126a521", {
        method: "POST", 
    });  

    return {
        statusCode: 200,
    };
};


//"0 0 * * *" every day at 12:00 AM https://crontab.cronhub.io/ or @daily @hourly @weekly @monthly
//"* * * * *" every minute
// 0 0 */72 * * every 72h
// https://docs.netlify.com/functions/scheduled-functions/ 