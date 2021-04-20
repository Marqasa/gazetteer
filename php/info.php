<?php

function get_handle($endpoint)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    return $ch;
}

$startTime = microtime(true) / 1000;
$iso = $_REQUEST['iso'];
$name = urlEncode('"' . $_REQUEST['name'] . '"');
$lat = $_REQUEST['lat'];
$lng = $_REQUEST['lng'];

// Info
$info = get_handle("https://restcountries.eu/rest/v2/alpha/" . $iso);

// Weather
$weatherId = 'a686f31ef51e4b3f3ed3a24cc811378d';
$weather = get_handle('https://api.openweathermap.org/data/2.5/onecall?lat=' . $lat . '&lon=' . $lng . '&exclude=minutely,hourly,alerts&units=metric&appid=' . $weatherId);

// Currency
$currencyId = "e3dcd947ba064c148ee3a7942d89329c";
$currency = get_handle('https://openexchangerates.org/api/latest.json?app_id=' . $currencyId);

// News
$newsId = '05d7dd167a6a42f48f770c5b2e2cf5b1';
$date = new DateTime("-1 month");
$fdate = $date->format("YY-MM-DD");
$news = get_handle('https://newsapi.org/v2/everything?from=' . $fdate . '&qInTitle=' . $name . '&sortBy=popularity&apiKey=' . $newsId);

// Wiki
$wiki = get_handle('http://api.geonames.org/wikipediaSearchJSON?q=' . $name . '&maxRows=5&username=marqasa');

$handles = array();
array_push($handles, $info);
array_push($handles, $weather);
array_push($handles, $currency);
array_push($handles, $news);
array_push($handles, $wiki);

// Build multi-handle
$mh = curl_multi_init();

foreach ($handles as $ch) {
    curl_multi_add_handle($mh, $ch);
}

// Execute handles
do {
    curl_multi_exec($mh, $running);
    curl_multi_select($mh);
} while ($running > 0);

// Get results and remove handles
$results = array();

foreach ($handles as $ch) {
    array_push($results, curl_multi_getcontent($ch));
    curl_multi_remove_handle($mh, $ch);
}

// Close multi-handle
curl_multi_close($mh);

// Decode results
$decodes = array();

foreach ($results as $result) {
    array_push($decodes, json_decode($result, true));
}

$output['info'] = $decodes;
$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
