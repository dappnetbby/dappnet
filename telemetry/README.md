telemetry
=========

This is an extremely minimal telemetry solution for Dappnet.

I didn't even really want to have telemetry or analytics to begin with. But to be fair, by users sending us data, it's literally the easiest way to track bugs/features/usage in order to improve the product.

A lot of other solutions to telemetry (like OpenTelemetry, Grafana, even Google Analytics) are extremely complex. The reality is that we only need to collect like 10 possible statistics, which have a number of unique dimensions. This can probably be covered by like 50 lines of code in a server, which writes to an SQL database. For now, this will be the solution.

## Data model.

Data is ingested into an SQLite database.

