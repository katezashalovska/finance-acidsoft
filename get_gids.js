const fetch = require('node-fetch');

async function extract() {
    const res = await fetch('https://docs.google.com/spreadsheets/d/1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA/htmlview');
    const text = await res.text();
    // find all gids
    const matches = text.match(/gid=([0-9]+).*?>([^<]+)</g);
    if (matches) {
       console.log(matches.slice(0, 20));
    } else {
       console.log("No sheet names found easily.");
    }
}
extract();
