const geolib = require('geolib');
const fs = require('fs');

fs.readFile('/Users/aapokiiso/workspace/hsl-congestion/vehicle-28677151.csv', 'utf8', (err, data) => {
    if (err) {
        throw err;
    }

    const rowStrs = data.split(/\r|\n/);
    const rows = rowStrs
        .filter(str => str.length > 0) // Omit empty rows
        .map(str => str.split(','))
        .sort((rowA, rowB) => {
            const timestampA = rowA[0];
            const timestampB = rowB[0];

            return timestampA == timestampB ? 0 : timestampA > timestampB ? 1 : -1;
        })
        .map((row, i, rows) => {
            let distance = 0;
            if (i > 0) {
                const prevRow = rows[i-1];
                distance = geolib.getDistance({latitude: row[1], longitude: row[2]}, {latitude: prevRow[1], longitude: prevRow[2]});
            }
            row[3] = distance;
            return row;
        });

    console.log(rows);
});