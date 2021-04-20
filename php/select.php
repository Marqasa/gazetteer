<?php
$startTime = microtime(true) / 1000;
$file = file_get_contents('../data/countryBorders.geo.json');
$borders = json_decode($file, true);
$select = [];

foreach ($borders['features'] as $feature) {
    $select[$feature['properties']['iso_a2']] = $feature['properties']['name'];
}

asort($select);

$output['select'] = $select;
$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
