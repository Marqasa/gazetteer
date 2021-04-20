<?php
$startTime = microtime(true) / 1000;
$file = file_get_contents('../data/countryBorders.geo.json');
$borders = json_decode($file, true);
$country = $_REQUEST['country'];

if ($country == "") {
    $lat = $_REQUEST['lat'];
    $lng = $_REQUEST['lng'];
    $endpoint = 'http://api.geonames.org/countryCodeJSON?lat=' . $lat . '&lng=' . $lng . '&username=marqasa';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    $result = curl_exec($ch);
    curl_close($ch);
    $decode = json_decode($result, true);
    $country = $decode['countryCode'];
}

$output;

foreach ($borders['features'] as $feature) {
    if ($feature['properties']['iso_a2'] == $country) {
        $output['feature'] = $feature;
        break;
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
