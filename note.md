FB.api(
  '/me/accounts',
  'GET',
  {"access_token":"{access_token}"},
  function(response) {
      // Insert your code here
  }
);

software developer page ID= 664350253617976
apiTesting PAgeID = 303635619493795

curl -i -X GET \
 "https://graph.facebook.com/v19.0/303635619493795?fields=instagram_business_account&access_token=EAAPp4TFQKyUBO7k6OzmV2zIuqhjLWfsprPWLo8e6G34TpKJMrusFQ9zouf0feSRVtoRpimhs2TmSL2hyZChUdv6ZAZBPJo6fNZCZArWsSe2IFMDZC9O9EfG6P1eypUwzNsWf3XPjKovvC4HfUO42LnTOkGVWHYQMl0DYdaMJrS00KZAgKlxmRB94pLZAJTlYVDyawh8vhyGUVzeZCVmZCVEf4jxeWzPjx1Ir8zfAZDZD"


FB.api(
  '/303635619493795',
  'GET',
  {"fields":"instagram_business_account","access_token":"{access_token}"},
  function(response) {
      // Insert your code here
  }
);
output= {
  "instagram_business_account": {
    "id": "17841403285826638"
  },
  "id": "303635619493795"
}

Instagram business account ID = 17841403285826638


FB.api(
  '/17841403285826638/media',
  'GET',
  {"access_token":"{access_token}"},
  function(response) {
      // Insert your code here
  }
);
curl -i -X GET \
 "https://graph.facebook.com/v19.0/17841403285826638/media?access_token=EAAPp4TFQKyUBO7k6OzmV2zIuqhjLWfsprPWLo8e6G34TpKJMrusFQ9zouf0feSRVtoRpimhs2TmSL2hyZChUdv6ZAZBPJo6fNZCZArWsSe2IFMDZC9O9EfG6P1eypUwzNsWf3XPjKovvC4HfUO42LnTOkGVWHYQMl0DYdaMJrS00KZAgKlxmRB94pLZAJTlYVDyawh8vhyGUVzeZCVmZCVEf4jxeWzPjx1Ir8zfAZDZD"

 Output = {
  "data": [
    {
      "id": "17935377290833839"
    },
    {
      "id": "18049826206635493"
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUlltb1BfSVBOek5Yemg1Wk9nRGRhOHEzSzBGeHdFWWtNNThzekd5TmZAPX0liUDFMUEllUkdldGFXSkEwTVppeVppMHEzd3NyMGxZAZA0JBbHhKbXJnTHVn",
      "after": "QVFIUnZADRmxTd0gyWGxfUUN4d1VYbDB5S3RGMnQ3QjdjdU44OWFobndzZA0RwRFY5SkN5ekI0dVN0cDNhcHVkeXRLNl9rejNNU1BfRlN6X1N4YzdUcVhmM0pR"
    },
    "next": "https://graph.facebook.com/v19.0/17841403285826638/media?access_token=EAAPp4TFQKyUBO7k6OzmV2zIuqhjLWfsprPWLo8e6G34TpKJMrusFQ9zouf0feSRVtoRpimhs2TmSL2hyZChUdv6ZAZBPJo6fNZCZArWsSe2IFMDZC9O9EfG6P1eypUwzNsWf3XPjKovvC4HfUO42LnTOkGVWHYQMl0DYdaMJrS00KZAgKlxmRB94pLZAJTlYVDyawh8vhyGUVzeZCVmZCVEf4jxeWzPjx1Ir8zfAZDZD&pretty=0&limit=25&after=QVFIUnZADRmxTd0gyWGxfUUN4d1VYbDB5S3RGMnQ3QjdjdU44OWFobndzZA0RwRFY5SkN5ekI0dVN0cDNhcHVkeXRLNl9rejNNU1BfRlN6X1N4YzdUcVhmM0pR"
  }
}

