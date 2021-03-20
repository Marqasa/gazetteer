<?php

$startTime = microtime(true) / 1000;
$airport_token = "";
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

function get_handle($endpoint)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    return $ch;
}

// Info
function get_info($iso)
{
    $endpoint = "https://restcountries.eu/rest/v2/alpha/" . $iso;
    return get_handle($endpoint);
}

function get_weather($lat, $lng)
{
    $appid = 'a686f31ef51e4b3f3ed3a24cc811378d';
    $endpoint = 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $lat . '&lon=' . $lng . '&exclude=minutely,hourly,alerts&units=metric&appid=' . $appid;
    return get_handle($endpoint);
}

function get_currency()
{
    $app_id = "e3dcd947ba064c148ee3a7942d89329c";
    $endpoint = 'https://openexchangerates.org/api/latest.json?app_id=' . $app_id;
    return get_handle($endpoint);
}

function get_news($name)
{
    $api_key = '05d7dd167a6a42f48f770c5b2e2cf5b1';
    $date = new DateTime("-1 month");
    $fdate = $date->format("YY-MM-DD");
    $endpoint = 'https://newsapi.org/v2/everything?from=' . $fdate . '&qInTitle=' . $name . '&sortBy=popularity&apiKey=' . $api_key;
    return get_handle($endpoint);
}

function get_wiki($name)
{
    $endpoint = 'http://api.geonames.org/wikipediaSearchJSON?q=' . $name . '&maxRows=5&username=marqasa';
    return get_handle($endpoint);
}

// Markers
function get_airports($iso)
{
    $token = "test_NIhpnvoFfBFSqaj-JcRevV9uEliiVKqa9-rsrcDb0i5";

    $ch = curl_init();

    curl_setopt_array($ch, [
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

    return $ch;
}

function get_webcams($iso)
{
    $api_key = 'oDMHnb9KjCOwlV3YcIdJDBKWYsp4ra4L';
    $endpoint = "https://api.windy.com/api/webcams/v2/list/country=" . $iso . "/orderby=popularity/limit=50?show=webcams:location,image,player&key=" . $api_key;
    return get_handle($endpoint);
}

function get_places($lonMin, $lonMax, $latMin, $latMax, $kind)
{
    $api_key = "5ae2e3f221c38a28845f05b6dfcb929e3d59f12d3afce65a63819f9a";
    $endpoint = "https://api.opentripmap.com/0.1/en/places/bbox?lon_min=" . $lonMin . "&lon_max=" . $lonMax . "&lat_min=" . $latMin . "&lat_max=" . $latMax . "&kinds=" . $kind . "&limit=25&apikey=" . $api_key;
    return get_handle($endpoint);
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
    case 'data':
        $iso = $_REQUEST['iso'];
        $name = urlEncode('"' . $_REQUEST['name'] . '"');
        $lat = $_REQUEST['lat'];
        $lng = $_REQUEST['lng'];
        $lonMin = $_REQUEST['lonMin'];
        $lonMax = $_REQUEST['lonMax'];
        $latMin = $_REQUEST['latMin'];
        $latMax = $_REQUEST['latMax'];

        // Info
        $handles = array();
        array_push($handles, get_info($iso));
        array_push($handles, get_weather($lat, $lng));
        array_push($handles, get_currency());
        array_push($handles, get_news($name));
        array_push($handles, get_wiki($name));

        // Markers
        array_push($handles, get_airports($iso));
        array_push($handles, get_webcams($iso));
        array_push($handles, get_places($lonMin, $lonMax, $latMin, $latMax, "architecture"));
        array_push($handles, get_places($lonMin, $lonMax, $latMin, $latMax, "cultural"));
        array_push($handles, get_places($lonMin, $lonMax, $latMin, $latMax, "historic"));
        array_push($handles, get_places($lonMin, $lonMax, $latMin, $latMax, "industrial_facilities"));
        array_push($handles, get_places($lonMin, $lonMax, $latMin, $latMax, "natural"));
        array_push($handles, get_places($lonMin, $lonMax, $latMin, $latMax, "religion"));

        // Build multi-handle
        $mh = curl_multi_init();
        foreach ($handles as $ch) {
            curl_multi_add_handle($mh, $ch);
        }

        // Execute
        $running = null;
        do {
            curl_multi_exec($mh, $running);
        } while ($running);

        // Get results and remove handles
        $results = array();
        foreach ($handles as $ch) {
            array_push($results, curl_multi_getcontent($ch));
            curl_multi_remove_handle($mh, $ch);
        }

        // Close multi-handle
        curl_multi_close($mh);

        // Decode results
        $data = array();
        foreach ($results as $result) {
            array_push($data, json_decode($result, true));
        }

        // Output data
        $output['data'] = $data;
        break;
    case 'place':
        $xid = $_REQUEST['xid'];
        $api_key = "5ae2e3f221c38a28845f05b6dfcb929e3d59f12d3afce65a63819f9a";
        $endpoint = "https://api.opentripmap.com/0.1/en/places/xid/" . $xid . "?apikey=" . $api_key;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['place'] = $decode;
        break;
    default:
        return;
}

$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
