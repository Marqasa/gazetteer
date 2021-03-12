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
    case 'select':
        $file = file_get_contents('../data/countryBorders.geo.json');
        $borders = json_decode($file, true);
        $select = [];

        foreach ($borders['features'] as $feature) {
            $select[$feature['properties']['iso_a2']] = $feature['properties']['name'];
        }

        asort($select);
        $output['select'] = $select;
        break;
    case 'feature':
        $country = $_REQUEST['country'];
        $file = file_get_contents('../data/countryBorders.geo.json');
        $borders = json_decode($file, true);

        foreach ($borders['features'] as $feature) {
            if ($feature['properties']['iso_a2'] == $country) {
                $output['feature'] = $feature;
                break;
            }
        }

        break;
    case 'place':
        $id = $_REQUEST['id'];
        $api_key = "5ae2e3f221c38a28845f05b6dfcb929e3d59f12d3afce65a63819f9a";
        $endpoint = "https://api.opentripmap.com/0.1/en/places/xid/" . $id . "?apikey=" . $api_key;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['place'] = $decode;
        break;
    case 'places':
        $kinds = $_REQUEST['kinds'];
        $lon_min = $_REQUEST['lonMin'];
        $lon_max = $_REQUEST['lonMax'];
        $lat_min = $_REQUEST['latMin'];
        $lat_max = $_REQUEST['latMax'];
        $api_key = "5ae2e3f221c38a28845f05b6dfcb929e3d59f12d3afce65a63819f9a";
        $endpoint = "https://api.opentripmap.com/0.1/en/places/bbox?lon_min=" . $lon_min . "&lon_max=" . $lon_max . "&lat_min=" . $lat_min . "&lat_max=" . $lat_max . "&kinds=" . $kinds . "&limit=10&apikey=" . $api_key;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['places'] = $decode;
        break;
    case 'info':
        $iso = $_REQUEST['iso'];
        $endpoint = "https://restcountries.eu/rest/v2/alpha/" . $iso;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['info'] = $decode;
        break;
    case 'weather':
        $lat = $_REQUEST['lat'];
        $lng = $_REQUEST['lng'];
        $appid = 'a686f31ef51e4b3f3ed3a24cc811378d';
        $endpoint = 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $lat . '&lon=' . $lng . '&exclude=minutely,hourly,alerts&units=metric&appid=' . $appid;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['weather'] = $decode;
        break;
    case 'currency':
        $app_id = "e3dcd947ba064c148ee3a7942d89329c";
        $endpoint = 'https://openexchangerates.org/api/latest.json?app_id=' . $app_id;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['currency'] = $decode;
        break;
    case 'wiki':
        $query = urlEncode($_REQUEST['name']);
        $endpoint = 'http://api.geonames.org/wikipediaSearchJSON?q=' . $query . '&maxRows=5&username=marqasa';
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['wiki'] = $decode;
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
