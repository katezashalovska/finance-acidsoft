const fetch = require('node-fetch');

async function getSheets() {
    const spreadsheetId = '1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA';
    // fetch spreadsheet metadata to get sheet names and GIDs
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        console.log(text.substring(0, 500));
        // Actually gviz doesn't give sheet metadata. Let's try downloading the CSV or just look at the script output.
    } catch (e) {
        console.error(e);
    }
}

getSheets();
