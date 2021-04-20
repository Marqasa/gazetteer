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
$lonMin = $_REQUEST['lonMin'];
$lonMax = $_REQUEST['lonMax'];
$latMin = $_REQUEST['latMin'];
$latMax = $_REQUEST['latMax'];

// Airports
$token = "test_NIhpnvoFfBFSqaj-JcRevV9uEliiVKqa9-rsrcDb0i5";
$airports = curl_init();

curl_setopt_array($airports, [
    CURLOPT_URL => "https://api.duffel.com/air/airports?iata_country_code=" . $iso,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_HTTPHEADER => [
        "Accept-Encoding: gzip",
        "Accept: application/json",
        "Content-Type: application/json",
        "Duffel-Version: beta",
        "Authorization: Bearer " . $token,
    ],
]);

// Webcams
$webcamsId = 'oDMHnb9KjCOwlV3YcIdJDBKWYsp4ra4L';
$webcams = get_handle("https://api.windy.com/api/webcams/v2/list/country=" . $iso . "/orderby=popularity/limit=50?show=webcams:location,image,player&key=" . $webcamsId);

// Places
$placesId = "5ae2e3f221c38a28845f05b6dfcb929e3d59f12d3afce65a63819f9a";
$places = get_handle("https://api.opentripmap.com/0.1/en/places/bbox?lon_min=" . $lonMin . "&lon_max=" . $lonMax . "&lat_min=" . $latMin . "&lat_max=" . $latMax . "&limit=200&apikey=" . $placesId);

$handles = array();
array_push($handles, $airports);
array_push($handles, $webcams);
array_push($handles, $places);

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

$output['markers'] = $decodes;
$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
