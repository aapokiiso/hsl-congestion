# hsl-congestion

Estimating Helsinki public transport congestion based on stop times.

## How does it work? 

There's a separate script, [hsl-congestion-recorder](https://github.com/aapokiiso/hsl-congestion-recorder), 
tracking trams through the HSL Realtime API. Every time a tram 
opens or closes it's doors, the event is registered to a database. 

This service calculates a congestion rate from the door status events. 
First, it calculates how long the doors were open at the last stop. 
Then, how long they were open at the previous stop, and the previous,
until it has the stop times for all the stops on the trip.

Next it sums up the stop times, but divides each stop time with the 
amount of stops that have come after it. Full weight is given only
to the latest stop, half weight to the 2nd to latest, third weight to the next, etc.

Lastly it divides the resulting number with the average stop time 
for the corresponding part of the trip (ie. which stops have been passed), 
based on all previous trips on the route. This results in a nice ratio, where: 
- 0.0 means the tram is empty.
- 0.5 means the tram is half as full as usual.
- 1.0 means the tram has average congestion.
- 2.0 means the tram has double the average congestion and is probably quite full.
- etc.

## Demo

1. Find the GTFS ID of any active tram trip. 

    Easiest is to go to https://api.digitransit.fi/graphiql/hsl.

    For example, for trams arriving at Kampintori from the direction 
    of the central railway station, you can do:
    ```
    {
        stop(id:"HSL:1040409") {
            stoptimesWithoutPatterns {
                trip {
                    gtfsId
                }
            }
        }
    }
    ```
    
    Pick one of the returned trip GTFS IDs.

2. Request the congestion rate endpoint with the trip GTFS ID.

    The endpoint is https://hsl-tram-congestion.appspot.com/trips/:tripId/congestionRate.
    
    For example, 
    ```
    $ curl https://hsl-tram-congestion.appspot.com/trips/HSL:1007_20190820_Ti_2_2101/congestionRate
    0.5287651445469622
    ```
    
    The returned number, ~0.52, ie. half of normal congestion,
    is the live congestion rate for the specified trip!

## Contributing

1. Clone this repository to your local machine.
2. Run `npm install`
3. Start the development server with `PORT=3000 npm run dev`. If you want to 
   run it in a different port number you can change the `PORT` argument freely.
