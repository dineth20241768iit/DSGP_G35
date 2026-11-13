# CDX API
CDX API is the wayback machine official API to look up infomation on archived sites by wayback machine. wayback machine queries follow the following format

## Queries
The most simple query and the only required param for the CDX server is the **url** param

 * http://web.archive.org/cdx/search/cdx?url=archive.org

The above query will return a portion of the index, one per row, for each 'capture' of the url "archive.org"
that is available in the archive.

The columns of each line are the fields of the cdx.
At this time, the following cdx fields are publicly available:

  `["urlkey","timestamp","original","mimetype","statuscode","digest","length"]`
  
It is possible to customize the [Field Order](#field-order) as well.

The the **url=** value should be [url encoded](http://en.wikipedia.org/wiki/Percent-encoding) if the url itself contains a query. (copied from the CDX github repo README)

## param definitions
Refer to [this](/home/dineth/Documents/IIT/Y_2/CM2603/DSGP/DSGP_G35/src/collection/index_data/ikman_lk_en_ads_sri_lanka_cars.json) for comments made next to params to understand the params. note that we can filter the index data by other parameters as well.

## Statuscode
If you dont know what that is and how its important, refer to [this](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#server_error_responses)
