<?php
$startTime = microtime(true) / 1000;
$xid = $_REQUEST['xid'];
$api_key = "5ae2e3f221c38a28845f05b6dfcb929e3d59f12d3afce65a63819f9a";
$endpoint = "https://api.opentripmap.com/0.1/en/places/xid/" . $xid . "?apikey=" . $api_key;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $endpoint);
$result = curl_exec($ch);
curl_close($ch);

$output['place'] = json_decode($result, true);
$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
