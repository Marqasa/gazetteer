var days = ["Sun", "Mon", "Tues", "Weds", "Thurs", "Fri", "Sat"];
var currencies = {
  USD: {
    name: "US Dollar",
  },
  CAD: {
    name: "Canadian Dollar",
  },
  EUR: {
    name: "Euro",
  },
  GBP: {
    name: "British Pound",
  },
  INR: {
    name: "Indian Rupee",
  },
};

$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(100)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});

var map = L.map("map", {
  minZoom: 1,
  maxZoom: 10,
}).setView([0, 0], 2);

L.tileLayer.provider("Stamen.Watercolor").addTo(map);

function setInfo(info) {
  $("#info-flag").attr("src", info.flag);

  $("#info1-name").text("Capital:");
  $("#info1-value").text(info.capital);

  $("#info2-name").text("Region:");
  $("#info2-value").text(info.region);

  $("#info3-name").text("Population:");
  $("#info3-value").text(info.population);

  let languages = info.languages[0].name;

  if (info.languages[1]) {
    languages += "/" + info.languages[1].name;
  }

  $("#info4-name").text("Languages:");
  $("#info4-value").text(languages);

  $("#info5-name").text("Capital:");
  $("#info5-value").text(info.languages[0].name);

  $("#accordionExample").show();
}

function getOrdinalNum(n) {
  return (
    n +
    (n > 0
      ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
      : "")
  );
}

function setWeather(data) {
  var date = new Date();

  var date1 = getOrdinalNum(date.getDate());
  var date2 = getOrdinalNum(date.getDate() + 1);
  var date3 = getOrdinalNum(date.getDate() + 2);
  var date4 = getOrdinalNum(date.getDate() + 3);
  var date5 = getOrdinalNum(date.getDate() + 4);

  var day1 = days[date.getDay() % 7];
  var day2 = days[(date.getDay() + 1) % 7];
  var day3 = days[(date.getDay() + 2) % 7];
  var day4 = days[(date.getDay() + 3) % 7];
  var day5 = days[(date.getDay() + 4) % 7];

  var icon1 = data.current.weather[0].icon;
  var icon2 = data.daily[0].weather[0].icon;
  var icon3 = data.daily[1].weather[0].icon;
  var icon4 = data.daily[2].weather[0].icon;
  var icon5 = data.daily[3].weather[0].icon;

  $("#date1").text(day1 + " " + date1 + ":");
  $("#icon1").attr(
    "src",
    "http://openweathermap.org/img/wn/" + icon1 + "@2x.png"
  );
  $("#temp1").text(data.current.temp + "°");

  $("#date2").text(day2 + " " + date2 + ":");
  $("#icon2").attr(
    "src",
    "http://openweathermap.org/img/wn/" + icon2 + "@2x.png"
  );
  $("#temp2").text(data.daily[0].temp.day + "°");

  $("#date3").text(day3 + " " + date3 + ":");
  $("#icon3").attr(
    "src",
    "http://openweathermap.org/img/wn/" + icon3 + "@2x.png"
  );
  $("#temp3").text(data.daily[1].temp.day + "°");

  $("#date4").text(day4 + " " + date4 + ":");
  $("#icon4").attr(
    "src",
    "http://openweathermap.org/img/wn/" + icon4 + "@2x.png"
  );
  $("#temp4").text(data.daily[2].temp.day + "°");

  $("#date5").text(day5 + " " + date5 + ":");
  $("#icon5").attr(
    "src",
    "http://openweathermap.org/img/wn/" + icon5 + "@2x.png"
  );
  $("#temp5").text(data.daily[3].temp.day + "°");
}

function setCurrency(result, currency) {
  const code1 = currency.code;
  const code2 = code1 === "USD" ? "EUR" : "USD";
  const code3 = code1 === "GBP" ? "EUR" : "GBP";
  const code4 = code1 === "CAD" ? "EUR" : "CAD";
  const code5 = code1 === "INR" ? "EUR" : "INR";

  currency.name.replace(/\b\w/g, (l) => l.toUpperCase());

  const name1 = code1 in currencies ? currencies[code1].name : currency.name;
  const name2 = currencies[code2].name;
  const name3 = currencies[code3].name;
  const name4 = currencies[code4].name;
  const name5 = currencies[code5].name;

  const base = result.rates[code1];

  const rate1 = "1.00";
  const rate2 = (result.rates[code2] / base).toFixed(2);
  const rate3 = (result.rates[code3] / base).toFixed(2);
  const rate4 = (result.rates[code4] / base).toFixed(2);
  const rate5 = (result.rates[code5] / base).toFixed(2);

  $("#cur1-name").text(name1);
  $("#cur1-value").text("1.00");
  $("#cur1-code").text(code1);

  $("#cur2-name").text(name2);
  $("#cur2-value").text(rate2);
  $("#cur2-code").text(code2);

  $("#cur3-name").text(name3);
  $("#cur3-value").text(rate3);
  $("#cur3-code").text(code3);

  $("#cur4-name").text(name4);
  $("#cur4-value").text(rate4);
  $("#cur4-code").text(code4);

  $("#cur5-name").text(name5);
  $("#cur5-value").text(rate5);
  $("#cur5-code").text(code5);
}

function setWiki(wiki) {
  $("#wiki-link0").text(wiki.geonames[0].title);
  $("#wiki-link0").attr("href", "http://" + wiki.geonames[0].wikipediaUrl);
  $("#wiki-link1").text(wiki.geonames[1].title);
  $("#wiki-link1").attr("href", "http://" + wiki.geonames[1].wikipediaUrl);
  $("#wiki-link2").text(wiki.geonames[2].title);
  $("#wiki-link2").attr("href", "http://" + wiki.geonames[2].wikipediaUrl);
  $("#wiki-link3").text(wiki.geonames[3].title);
  $("#wiki-link3").attr("href", "http://" + wiki.geonames[3].wikipediaUrl);
  $("#wiki-link4").text(wiki.geonames[4].title);
  $("#wiki-link4").attr("href", "http://" + wiki.geonames[4].wikipediaUrl);
}

function requestWeather(center) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "weather",
      lat: center.lat,
      lng: center.lng,
    },
    success: function (result) {
      setWeather(result.weather);
    },

    error: function (request, status, error) {},
  });
}

function requestCurrency(currency) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "currency",
    },
    success: function (result) {
      setCurrency(result.currency, currency);
    },

    error: function (request, status, error) {},
  });
}

function requestInfo(iso) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "info",
      iso: iso,
    },
    success: function (result) {
      setInfo(result.info);
      requestCurrency(result.info.currencies[0]);
    },

    error: function (request, status, error) {},
  });
}

function requestWiki(name) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "wiki",
      name: name,
    },
    success: function (result) {
      setWiki(result.wiki);
    },

    error: function (request, status, error) {},
  });
}

// Set and fly to bounds
function setFeature(feature) {
  var feature = L.geoJson(feature).addTo(map);
  var bounds = feature.getBounds();
  var center = bounds.getCenter();
  map.flyToBounds(bounds, { duration: 2 });

  requestWeather(center);
}

// Get new coords from country
$("#country").change(function () {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "feature",
      country: $("#country").val(),
    },

    success: function (result) {
      setFeature(result.feature);
      requestInfo(result.feature.properties.iso_a2);
      requestWiki(result.feature.properties.name);
      //   setInfo(result.data);
      //   setWeather(result.weather);
    },

    error: function (request, status, error) {},
  });
});

$("#country").val("United Kingdom");
$("#country").trigger("change");

// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(setMapView);
// }

// var southWest = L.latLng(54, -5),
//   northEast = L.latLng(50.8, 0),
//   bounds = L.latLngBounds(southWest, northEast);

// map.fitBounds(bounds);

// function setMapView(position) {
//   map.setView([position.coords.latitude, position.coords.longitude], 7);
// }

// var geojsonFeature = {
//   type: "Feature",
//   properties: {
//     name: "Coors Field",
//     amenity: "Baseball Stadium",
//     popupContent: "This is where the Rockies play!",
//   },
//   geometry: {
//     type: "Point",
//     coordinates: [-0.09, 51.505],
//   },
// };

// L.geoJSON(geojsonFeature).addTo(map);

// var marker = L.marker([51.5, -0.09]).addTo(mymap);

// var circle = L.circle([51.508, -0.11], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(mymap);

// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(mymap);

// var popup = L.popup()
//     .setLatLng([51.5, -0.09])
//     .setContent("I am a standalone popup.")
//     .openOn(mymap);

// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon.");

// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(mymap);
// }

// mymap.on('click', onMapClick);

// mymap.on('click', onMapClick);

// L.tileLayer(
//   "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
//   {
//     attribution:
//       'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: "mapbox/streets-v11",
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken:
//       "pk.eyJ1IjoibWFycWFzYSIsImEiOiJja2xnbnFlb20yYWxpMnZzOGd0MmE1NHYwIn0.a-3P2Kczq52NUd85d1K3bA",
//   }
// ).addTo(mymap);
