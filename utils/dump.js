const request = require('request');
const fs = require('fs');

const tram9Endpoint = 'http://api.digitransit.fi/realtime/vehicle-positions/v1/hfp/journey/+/+/1009/';
const dumpFilename = '/Users/aapokiiso/workspace/hsl-congestion/tram9-dump.csv';

request(tram9Endpoint, (err, response, body) => {
    if (!err && response && response.statusCode == 200) {
        let json;
        try {
            json = JSON.parse(body);
        } catch (e) {}

        if (json) {
            let csvRows = '';
            for (let item in json) {
                if (json.hasOwnProperty(item)) {
                    const rowData = json[item]['VP'];
                    const vehicle = rowData.veh;
                    const lat = rowData.lat;
                    const lng = rowData.long;
                    const timestamp = rowData.tsi;
                    csvRows += `${vehicle},${timestamp},${lat},${lng}\n`;
                }
            }
            fs.appendFile(dumpFilename, csvRows);
        }
    }
});