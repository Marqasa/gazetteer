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

function setFeature(feature) {
  var feature = L.geoJson(feature).addTo(map);
  map.flyToBounds(feature.getBounds(), { duration: 2 });
}

function setInfo(data) {
  var capital = data.capital;
  var population = data.population;
  var currency = data.currencies[0].name;
  $("#info-capital").text(capital);
  $("#info-population").text(population);
  $("#info-currency").text(currency);
  $("#accordionExample").show();
}

function setWeather(weather) {
  $("#weather-desc").text(weather.weather[0].main);
  $("#weather-temp").text(weather.main.temp + " °C");
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

function requestWeather(city) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "weather",
      city: city,
    },
    success: function (result) {
      setWeather(result.weather);
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
      requestWeather(result.info.capital);
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
