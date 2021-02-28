<?php

$startTime = microtime(true) / 1000;
$output;

function curlRequest($endpoint)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

switch ($_REQUEST['type']) {
    case 'feature':
        $country = $_REQUEST['country'];
        $file = file_get_contents('../data/borders/' . $country . '.json');
        $feature = json_decode($file, true);
        $output['feature'] = $feature;
        break;
    case 'info':
        $iso = $_REQUEST['iso'];
        $endpoint = "https://restcountries.eu/rest/v2/alpha/" . $iso;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['info'] = $decode;
        break;
    case 'weather':
        $city = $_REQUEST['city'];
        $weatherKey = 'a686f31ef51e4b3f3ed3a24cc811378d';
        $endpoint = 'api.openweathermap.org/data/2.5/weather?q=' . $city . '&units=metric&appid=' . $weatherKey;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['weather'] = $decode;
        break;
    default:
        return;
}

// $iso = $feature['properties']['iso_a2'];
// $endpoint = "https://restcountries.eu/rest/v2/alpha/" . $iso;

// $ch1 = curl_init();
// curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
// curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch1, CURLOPT_URL, $endpoint);
// $result1 = curl_exec($ch1);
// curl_close($ch1);

// $decode1 = json_decode($result1, true);

// $capital = $decode1['capital'];
// $weatherKey = 'a686f31ef51e4b3f3ed3a24cc811378d';
// $weatherEndpoint = 'api.openweathermap.org/data/2.5/weather?q=' . $capital . '&units=metric&appid=' . $weatherKey;


// $ch2 = curl_init();
// curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
// curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch2, CURLOPT_URL, $weatherEndpoint);
// $result2 = curl_exec($ch2);
// curl_close($ch2);

// $decode2 = json_decode($result2, true);

$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
// $output['data'] = $decode1;
// $output['weather'] = $decode2;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
