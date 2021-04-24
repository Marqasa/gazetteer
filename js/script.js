// Map
let map;

// Feature Groups
let airportsCuster;
let webcamsCluster;
let landmarksGroup;

// Cluster Groups
let naturalCluster;
let religionCluster;
let culturalCluster;
let historicCluster;
let industrialCluster;
let architectureCluster;

// Globals
let currency_code;
let currency_name;
let feature;
let polygons;
let countryChange = false;

// Generic AJAX request
function ajaxRequest(url, data, success) {
  $.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    data: data,
    success: success,
    error: function (request, status, error) {},
  });
}

// On page load
$(window).on("load", function () {
  // Tiles
  const watercolor = L.tileLayer.provider("Stamen.Watercolor"),
    satellite = L.tileLayer.provider("Esri.WorldImagery"),
    labels = L.tileLayer.provider("Stamen.TonerHybrid");

  // Marker clusters
  airportsCuster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "black",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  webcamsCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "white",
        icon: "fa-number",
        iconColor: "#000",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  naturalCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "green-dark",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  religionCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "purple",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  culturalCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "cyan",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  historicCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "orange",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  industrialCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "yellow",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  architectureCluster = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.ExtraMarkers.icon({
        shape: "square",
        markerColor: "brown",
        icon: "fa-number",
        iconColor: "#fff",
        number: cluster.getChildCount(),
      });
    },
    showCoverageOnHover: false,
  });

  landmarksGroup = L.featureGroup([
    naturalCluster,
    religionCluster,
    culturalCluster,
    historicCluster,
    industrialCluster,
    architectureCluster,
  ]);

  // Maps
  map = L.map("map", {
    tap: false,
    minZoom: 1,
    maxZoom: 16,
    layers: [
      watercolor,
      labels,
      airportsCuster,
      webcamsCluster,
      landmarksGroup,
    ],
  }).setView([40, 0], 3);

  var maps = {
    Watercolor: watercolor,
    Satellite: satellite,
  };

  // Overlays
  var overlays = {
    Labels: labels,
    Airports: airportsCuster,
    Webcams: webcamsCluster,
    Landmarks: landmarksGroup,
  };

  // Map control
  L.control.layers(maps, overlays).addTo(map);

  // Populate select
  const url = "php/select.php";

  const success = function (result) {
    $.each(result.select, function (k, v) {
      var o = new Option(v, k);
      $(o).html(v);
      $("#country").append(o);
    });
  };

  ajaxRequest(url, {}, success);

  // Remove Preloader
  if ($("#preloader").length) {
    $("#preloader")
      .delay(100)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }

  // Add Popup Listener
  document.querySelector(".leaflet-popup-pane").addEventListener(
    "load",
    function (event) {
      var tagName = event.target.tagName,
        popup = map._popup;

      if (tagName === "IMG" && popup && !popup._updated) {
        popup._updated = true;
        popup.update();
      }
    },
    true
  );

  // Get location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const url = "php/borders.php";
      const data = {
        country: "",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const success = function (result) {
        if (!countryChange) {
          setFeature(result);
        }
      };

      ajaxRequest(url, data, success);
    });
  }
});

//===-----------------------------------------------------------------------===
// Request and set data
//===-----------------------------------------------------------------------===
$("#country").change(function () {
  countryChange = true;
  airportsCuster.clearLayers();
  webcamsCluster.clearLayers();
  naturalCluster.clearLayers();
  religionCluster.clearLayers();
  culturalCluster.clearLayers();
  historicCluster.clearLayers();
  industrialCluster.clearLayers();
  architectureCluster.clearLayers();

  const url = "php/borders.php";
  const data = { country: $("#country").val() };

  const success = function (result) {
    setFeature(result);
  };

  ajaxRequest(url, data, success);
});

function requestPlace(xid, marker) {
  const url = "php/place.php";
  const data = { type: "place", xid: xid };
  const success = function (result) {
    setPlace(result.place, marker);
  };

  ajaxRequest(url, data, success);
}

//===-----------------------------------------------------------------------===
// Display Data
//===-----------------------------------------------------------------------===
function fnum(x) {
  if (isNaN(x)) return x;

  if (x < 9999) {
    return x;
  }

  if (x < 1000000) {
    return Math.round(x / 1000) + " thousand";
  }

  if (x < 10000000) {
    return (x / 1000000).toFixed(2) + " million";
  }

  if (x < 1000000000) {
    return Math.round(x / 1000000) + " million";
  }

  if (x < 1000000000000) {
    return Math.round(x / 1000000000) + " billion";
  }

  return "1T+";
}

function getOrdinalNum(n) {
  return (
    n +
    (n > 0
      ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
      : "")
  );
}

function setFeature(result) {
  $("#country").val(result.feature.properties.iso_a2);

  if (feature) {
    feature.clearLayers();
  }

  polygons = result.feature.geometry.coordinates;
  feature = L.geoJson(result.feature, {
    color: "#1560BD",
    fill: false,
  }).addTo(map);

  const bounds = feature.getBounds();
  const center = bounds.getCenter();

  map.fitBounds(bounds);

  // Request info
  const infoUrl = "php/info.php";
  const infoData = {
    iso: result.feature.properties.iso_a2,
    name: result.feature.properties.name,
    lat: center.lat,
    lng: center.lng,
  };
  const infoSuccess = function (result) {
    $.each(result.info, function (i, o) {
      if (o == null) return;
      if (o.capital) {
        setInfo(o);
      } else if (o.current) {
        setWeather(o);
      } else if (o.base) {
        setCurrency(o);
      } else if (o.articles) {
        setNews(o);
      } else if (o.geonames) {
        setWiki(o);
      }
    });
  };

  ajaxRequest(infoUrl, infoData, infoSuccess);

  // Request markers
  const markersUrl = "php/markers.php";
  const markersData = {
    iso: result.feature.properties.iso_a2,
    lonMin: bounds._southWest.lng,
    lonMax: bounds._northEast.lng,
    latMin: bounds._southWest.lat,
    latMax: bounds._northEast.lat,
  };
  const markersSuccess = function (result) {
    $.each(result.markers, function (i, o) {
      if (o == null) return;
      if (o.meta) {
        setAirports(o);
      } else if (o.result) {
        setWebcams(o);
      } else if (o.features) {
        setPlaces(o);
      }
    });
  };

  ajaxRequest(markersUrl, markersData, markersSuccess);
}

function setPlace(place, marker) {
  let img = new Image();
  let preview = "";

  if (place.preview) {
    img.src = place.preview.source;
    img.alt = place.name;
    preview =
      '<p><img class="popup-image" src="' +
      img.src +
      '" alt="' +
      img.alt +
      '"/></p>';
  }

  const name = "<p><b>" + place.name + "</b></p>";
  const extracts = place.wikipedia_extracts
    ? place.wikipedia_extracts.html
    : "";
  const wiki = place.wikipedia
    ? '<p><a href="' + place.wikipedia + '" target="_blank">Wikipedia</a></p>'
    : "";

  var popup = L.popup({
    maxWidth: 200,
    maxHeight: 400,
    autoPanPadding: [50, 10],
    className: "popup",
  }).setContent(preview + name + extracts + wiki);

  marker.bindPopup(popup).openPopup();
}

function setAirports(airports) {
  $.each(airports.data, function (i, a) {
    if (!pointInPolygons([a.longitude, a.latitude])) {
      return;
    }

    let markerIcon = L.ExtraMarkers.icon({
      prefix: "fas",
      icon: "fa-plane",
      iconColor: "white",
      shape: "circle",
      markerColor: "black",
    });

    let marker = L.marker([a.latitude, a.longitude], {
      title: a.name,
      icon: markerIcon,
    }).on("click", function (e) {
      var win = window.open(
        "https://www.google.com/search?q=" + a.name,
        "_blank"
      );
      if (win) {
        win.focus();
      }
    });

    airportsCuster.addLayer(marker);
  });
}

function setWebcams(webcams) {
  $.each(webcams.result.webcams, function (i, w) {
    if (!pointInPolygons([w.location.longitude, w.location.latitude])) {
      return;
    }

    let markerIcon = L.ExtraMarkers.icon({
      prefix: "fas",
      icon: "fa-video",
      iconColor: "black",
      shape: "circle",
      markerColor: "white",
    });

    const video = w.player.live.available
      ? w.player.live.embed
      : w.player.day.available
      ? w.player.day.embed
      : w.player.month.available
      ? w.player.month.embed
      : w.player.year.available
      ? w.player.year.embed
      : w.player.lifetime.available
      ? w.player.lifetime.embed
      : "";

    var popup = L.popup({
      minWidth: 200,
      maxWidth: 200,
      maxHeight: 400,
      autoPanPadding: [50, 10],
      className: "popup",
    }).setContent(
      '<iframe src="' +
        video +
        '" width="200" height="200" allow="fullscreen">' +
        "</iframe>" +
        "<br><br>" +
        "<b>" +
        w.title +
        "</b><br>" +
        "<p>" +
        w.location.city +
        ", " +
        w.location.region +
        "</p>" +
        '<a href="' +
        w.location.wikipedia +
        '" target="_blank">Wikipedia</a>'
    );

    let marker = L.marker([w.location.latitude, w.location.longitude], {
      title: w.title,
      icon: markerIcon,
    }).bindPopup(popup);

    webcamsCluster.addLayer(marker);
  });
}

function pointInPolygonNested(point, vs, start, end) {
  var x = point[0],
    y = point[1];
  var inside = false;
  if (start === undefined) start = 0;
  if (end === undefined) end = vs.length;
  var len = end - start;
  for (var i = 0, j = len - 1; i < len; j = i++) {
    var xi = vs[i + start][0],
      yi = vs[i + start][1];
    var xj = vs[j + start][0],
      yj = vs[j + start][1];
    var intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygons(point) {
  let inside = false;

  if (polygons.length > 1) {
    $.each(polygons, function (i, poly) {
      if (inside) {
        return false;
      }

      inside = pointInPolygonNested(point, poly[0]);
    });
  } else {
    inside = pointInPolygonNested(point, polygons[0]);
  }

  return inside;
}

function setPlaces(places) {
  $.each(places.features, function (i, f) {
    if (
      !pointInPolygons([f.geometry.coordinates[0], f.geometry.coordinates[1]])
    ) {
      return;
    }

    const kind = f.properties.kinds.includes("natural")
      ? "natural"
      : f.properties.kinds.includes("religion")
      ? "religion"
      : f.properties.kinds.includes("cultural")
      ? "cultural"
      : f.properties.kinds.includes("historic")
      ? "historic"
      : f.properties.kinds.includes("industrial_facilities")
      ? "industrial"
      : "architecture";

    let color = "white";
    let shape = "circle";
    let prefix = "";
    let icon = "";

    switch (kind) {
      case "natural":
        color = "green-dark";
        prefix = "fab";
        icon = "fa-canadian-maple-leaf";
        break;
      case "religion":
        color = "purple";
        shape = "penta";
        prefix = "fas";
        icon = "fa-place-of-worship";
        break;
      case "cultural":
        color = "cyan";
        shape = "penta";
        prefix = "fas";
        icon = "fa-users";
        break;
      case "historic":
        color = "orange";
        prefix = "far";
        icon = "fa-building";
        break;
      case "industrial":
        color = "yellow";
        prefix = "fas";
        icon = "fa-history";
        break;
      case "architecture":
        color = "brown";
        prefix = "fas";
        icon = "fa-gopuram";
        break;
    }

    let markerIcon = L.ExtraMarkers.icon({
      prefix: prefix,
      icon: icon,
      shape: shape,
      markerColor: color,
    });

    let marker = L.marker(
      [f.geometry.coordinates[1], f.geometry.coordinates[0]],
      {
        placeXid: f.properties.xid,
        placeRequested: false,
        title: f.properties.name,
        icon: markerIcon,
      }
    ).on("click", function (e) {
      if (!e.target.options.placeRequested) {
        e.target.options.placeRequested = true;
        requestPlace(e.target.options.placeXid, e.target);
      }
    });

    switch (kind) {
      case "natural":
        naturalCluster.addLayer(marker);
        break;
      case "religion":
        religionCluster.addLayer(marker);
        break;
      case "cultural":
        culturalCluster.addLayer(marker);
        break;
      case "historic":
        historicCluster.addLayer(marker);
        break;
      case "industrial":
        industrialCluster.addLayer(marker);
        break;
      case "architecture":
        architectureCluster.addLayer(marker);
        break;
    }
  });
}

function setWiki(wiki) {
  $("#wiki-link0").text(wiki.geonames[0].title);
  $("#wiki-link0").attr("href", "https://" + wiki.geonames[0].wikipediaUrl);
  $("#wiki-link1").text(wiki.geonames[1].title);
  $("#wiki-link1").attr("href", "https://" + wiki.geonames[1].wikipediaUrl);
  $("#wiki-link2").text(wiki.geonames[2].title);
  $("#wiki-link2").attr("href", "https://" + wiki.geonames[2].wikipediaUrl);
  $("#wiki-link3").text(wiki.geonames[3].title);
  $("#wiki-link3").attr("href", "https://" + wiki.geonames[3].wikipediaUrl);
  $("#wiki-link4").text(wiki.geonames[4].title);
  $("#wiki-link4").attr("href", "https://" + wiki.geonames[4].wikipediaUrl);
}

function setCurrency(result) {
  const currencies = {
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

  const code1 = currency_code;
  const code2 = code1 === "USD" ? "EUR" : "USD";
  const code3 = code1 === "GBP" ? "EUR" : "GBP";
  const code4 = code1 === "CAD" ? "EUR" : "CAD";
  const code5 = code1 === "INR" ? "EUR" : "INR";

  const name1 =
    code1 in currencies
      ? currencies[code1].name
      : currency_name.replace(/\b\w/g, (l) => l.toUpperCase());
  const name2 = currencies[code2].name;
  const name3 = currencies[code3].name;
  const name4 = currencies[code4].name;
  const name5 = currencies[code5].name;

  const base = result.rates[code1];

  const rate1 = "1.000";
  const rate2 = (result.rates[code2] / base).toFixed(3);
  const rate3 = (result.rates[code3] / base).toFixed(3);
  const rate4 = (result.rates[code4] / base).toFixed(3);
  const rate5 = (result.rates[code5] / base).toFixed(3);

  $("#cur1-name").text(name1);
  $("#cur1-value").text(rate1);
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

function setNews(news) {
  const title1 =
    news.articles[0].title.length < 50
      ? news.articles[0].title
      : news.articles[0].title;
  const title2 =
    news.articles[1].title.length < 50
      ? news.articles[1].title
      : news.articles[1].title;
  const title3 =
    news.articles[2].title.length < 50
      ? news.articles[2].title
      : news.articles[2].title;
  const title4 =
    news.articles[3].title.length < 50
      ? news.articles[3].title
      : news.articles[3].title;
  const title5 =
    news.articles[4].title.length < 50
      ? news.articles[4].title
      : news.articles[4].title;

  const img1 = news.articles[0].urlToImage
    ? news.articles[0].urlToImage
    : "https://s1.reutersmedia.net/resources_v2/images/rcom-default.png?w=800";
  const img2 = news.articles[1].urlToImage
    ? news.articles[1].urlToImage
    : "https://s1.reutersmedia.net/resources_v2/images/rcom-default.png?w=800";
  const img3 = news.articles[2].urlToImage
    ? news.articles[2].urlToImage
    : "https://s1.reutersmedia.net/resources_v2/images/rcom-default.png?w=800";
  const img4 = news.articles[3].urlToImage
    ? news.articles[3].urlToImage
    : "https://s1.reutersmedia.net/resources_v2/images/rcom-default.png?w=800";
  const img5 = news.articles[4].urlToImage
    ? news.articles[4].urlToImage
    : "https://s1.reutersmedia.net/resources_v2/images/rcom-default.png?w=800";

  $("#news1-title").text(title1);
  $("#news1-src").text(news.articles[0].source.name);
  $("#news1-img").attr("src", img1);
  $(".news1-link").attr("href", news.articles[0].url);

  $("#news2-title").text(title2);
  $("#news2-src").text(news.articles[1].source.name);
  $("#news2-img").attr("src", img2);
  $(".news2-link").attr("href", news.articles[1].url);

  $("#news3-title").text(title3);
  $("#news3-src").text(news.articles[2].source.name);
  $("#news3-img").attr("src", img3);
  $(".news3-link").attr("href", news.articles[2].url);

  $("#news4-title").text(title4);
  $("#news4-src").text(news.articles[3].source.name);
  $("#news4-img").attr("src", img4);
  $(".news4-link").attr("href", news.articles[3].url);

  $("#news5-title").text(title5);
  $("#news5-src").text(news.articles[4].source.name);
  $("#news5-img").attr("src", img5);
  $(".news5-link").attr("href", news.articles[4].url);
}

function setWeather(data) {
  const days = ["Sun", "Mon", "Tues", "Weds", "Thurs", "Fri", "Sat"];

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

  $("#date1").text(day1 + " " + date1);
  $("#icon1").attr(
    "src",
    "https://openweathermap.org/img/wn/" + icon1 + "@2x.png"
  );
  $("#temp1").text(data.current.temp.toFixed(2) + "°");

  $("#date2").text(day2 + " " + date2);
  $("#icon2").attr(
    "src",
    "https://openweathermap.org/img/wn/" + icon2 + "@2x.png"
  );
  $("#temp2").text(data.daily[0].temp.day.toFixed(2) + "°");

  $("#date3").text(day3 + " " + date3);
  $("#icon3").attr(
    "src",
    "https://openweathermap.org/img/wn/" + icon3 + "@2x.png"
  );
  $("#temp3").text(data.daily[1].temp.day.toFixed(2) + "°");

  $("#date4").text(day4 + " " + date4);
  $("#icon4").attr(
    "src",
    "https://openweathermap.org/img/wn/" + icon4 + "@2x.png"
  );
  $("#temp4").text(data.daily[2].temp.day.toFixed(2) + "°");

  $("#date5").text(day5 + " " + date5);
  $("#icon5").attr(
    "src",
    "https://openweathermap.org/img/wn/" + icon5 + "@2x.png"
  );
  $("#temp5").text(data.daily[3].temp.day.toFixed(2) + "°");
}

function setInfo(info) {
  currency_code = info.currencies[0].code;
  currency_name = info.currencies[0].name;

  $("#info-flag").attr("src", info.flag);

  $("#info1-name").text("Capital");
  $("#info1-value").text(info.capital);

  $("#info2-name").text("Region");
  $("#info2-value").text(info.region);

  const population = fnum(info.population);

  $("#info3-name").text("Population");
  $("#info3-value").text(population);

  let languages = info.languages[0].name;

  if (info.languages[1]) {
    languages += "/" + info.languages[1].name;
  }

  $("#info4-name").text("Languages");
  $("#info4-value").text(languages);
}
