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

function get_airports($iso)
{
    $token = "test_NIhpnvoFfBFSqaj-JcRevV9uEliiVKqa9-rsrcDb0i5";

    $curl = curl_init();

    curl_setopt_array($curl, [
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

    $response = curl_exec($curl);
    $data = json_decode($response, true);

    curl_close($curl);

    return $data;
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
        $endpoint = "https://api.opentripmap.com/0.1/en/places/bbox?lon_min=" . $lon_min . "&lon_max=" . $lon_max . "&lat_min=" . $lat_min . "&lat_max=" . $lat_max . "&kinds=" . $kinds . "&limit=25&apikey=" . $api_key;
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
    case 'webcams':
        $iso = $_REQUEST['iso'];
        $api_key = 'oDMHnb9KjCOwlV3YcIdJDBKWYsp4ra4L';
        $endpoint = "https://api.windy.com/api/webcams/v2/list/country=" . $iso . "/orderby=popularity/limit=50?show=webcams:location,image,player&key=" . $api_key;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['webcams'] = $decode;
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
    case 'airports':
        $iso = $_REQUEST['iso'];
        $output['airports'] = get_airports($iso);
        break;
    case 'currency':
        $app_id = "e3dcd947ba064c148ee3a7942d89329c";
        $endpoint = 'https://openexchangerates.org/api/latest.json?app_id=' . $app_id;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['currency'] = $decode;
        break;
    case 'news':
        $api_key = '05d7dd167a6a42f48f770c5b2e2cf5b1';
        $query = urlEncode('"' . $_REQUEST['name'] . '"');
        $dt2 = new DateTime("-1 month");
        $date = $dt2->format("YY-MM-DD");
        $endpoint = 'https://newsapi.org/v2/everything?from=' . $date . '&qInTitle=' . $query . '&sortBy=popularity&apiKey=' . $api_key;
        $result = curlRequest($endpoint);
        $decode = json_decode($result, true);
        $output['news'] = $decode;
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

$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
