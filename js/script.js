let map;
let feature;
let country;
let changed = false;
let markerGroup;

$(window).on("load", function () {
  preLoad();
  loadMap();
  addPopupListener();
  loadSelect();
  getLocation();
});

function preLoad() {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(100)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
}

function loadMap() {
  map = L.map("map", {
    tap: false,
    minZoom: 1,
    maxZoom: 16,
  }).setView([0, 0], 2);

  L.tileLayer.provider("Stamen.Watercolor").addTo(map);
  L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      ext: "png",
    }
  ).addTo(map);

  markerGroup = L.layerGroup().addTo(map);
}

function addPopupListener() {
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
}

function loadSelect() {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "select",
    },
    success: function (result) {
      setSelect(result.select);
    },

    error: function (request, status, error) {},
  });
}

function getLocation() {
  $.get(
    "https://ipinfo.io",
    function (data) {
      if (!changed) {
        country = data.country;
        $("#country").val(country);
        $("#country").trigger("change");
      }
    },
    "jsonp"
  );
}

function requestPlace(id, marker) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "place",
      id: id,
    },
    success: function (result) {
      setPlace(result.place, marker);
    },

    error: function (request, status, error) {},
  });
}

function requestPlaces(bounds, kinds) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "places",
      kinds: kinds,
      lonMin: bounds._southWest.lng,
      lonMax: bounds._northEast.lng,
      latMin: bounds._southWest.lat,
      latMax: bounds._northEast.lat,
    },
    success: function (result) {
      setPlaces(result.places, kinds);
    },

    error: function (request, status, error) {},
  });
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

function requestAirports(iso) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "airports",
      iso: iso,
    },
    success: function (result) {
      setAirports(result.airports);
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

function requestNews(name) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "news",
      name: name,
    },
    success: function (result) {
      setNews(result.news);
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

function requestWebcams(iso) {
  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "webcams",
      iso: iso,
    },
    success: function (result) {
      setWebcams(result.webcams);
    },

    error: function (request, status, error) {},
  });
}

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

function setSelect(select) {
  $.each(select, function (k, v) {
    var o = new Option(v, k);
    $(o).html(v);
    $("#country").append(o);
  });
}

function setFeature(data) {
  if (feature) {
    feature.clearLayers();
  }
  feature = L.geoJson(data).addTo(map);
  var bounds = feature.getBounds();
  map.fitBounds(bounds, { duration: 2 });

  var center = bounds.getCenter();

  requestWeather(center);

  requestPlaces(bounds, "architecture");
  requestPlaces(bounds, "cultural");
  requestPlaces(bounds, "historic");
  requestPlaces(bounds, "industrial_facilities");
  requestPlaces(bounds, "natural");
  requestPlaces(bounds, "religion");
}

function setPlace(place, marker) {
  const preview = place.preview
    ? '<p><img class="popup-image" src="' +
      place.preview.source +
      '" alt="' +
      place.name +
      '"/></p>'
    : "";
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
    })
      .addTo(map)
      .on("click", function (e) {
        var win = window.open(
          "http://www.google.com/search?q=" + a.name,
          "_blank"
        );
        if (win) {
          win.focus();
        }
      });

    markerGroup.addLayer(marker);
  });
}

function setWebcams(webcams) {
  $.each(webcams.result.webcams, function (i, w) {
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
        '" width="200" height="200">' +
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
    })
      .addTo(map)
      .bindPopup(popup);

    markerGroup.addLayer(marker);
  });
}

function setPlaces(places, kinds) {
  $.each(places.features, function (i, p) {
    let color = "white";
    let shape = "circle";
    let prefix = "";
    let icon = "";

    switch (kinds) {
      case "architecture":
        color = "brown";
        shape = "square";
        prefix = "fas";
        icon = "fa-gopuram";
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
      case "industrial_facilities":
        color = "yellow";
        shape = "square";
        prefix = "fas";
        icon = "fa-history";
        break;
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
    }

    let markerIcon = L.ExtraMarkers.icon({
      prefix: prefix,
      icon: icon,
      shape: shape,
      markerColor: color,
    });

    let marker = L.marker(
      [p.geometry.coordinates[1], p.geometry.coordinates[0]],
      {
        placeId: p.properties.xid,
        placeRequested: false,
        title: p.properties.name,
        icon: markerIcon,
      }
    )
      .addTo(map)
      .on("click", function (e) {
        if (!e.target.options.placeRequested) {
          e.target.options.placeRequested = true;
          requestPlace(e.target.options.placeId, e.target);
        }
      });

    markerGroup.addLayer(marker);
  });
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

function setCurrency(result, currency) {
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

  const code1 = currency.code;
  const code2 = code1 === "USD" ? "EUR" : "USD";
  const code3 = code1 === "GBP" ? "EUR" : "GBP";
  const code4 = code1 === "CAD" ? "EUR" : "CAD";
  const code5 = code1 === "INR" ? "EUR" : "INR";

  const name1 =
    code1 in currencies
      ? currencies[code1].name
      : currency.name.replace(/\b\w/g, (l) => l.toUpperCase());
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
      : news.articles[0].title.substr(0, 50) + "...";
  const title2 =
    news.articles[1].title.length < 50
      ? news.articles[1].title
      : news.articles[1].title.substr(0, 50) + "...";
  const title3 =
    news.articles[2].title.length < 50
      ? news.articles[2].title
      : news.articles[2].title.substr(0, 50) + "...";
  const title4 =
    news.articles[3].title.length < 50
      ? news.articles[3].title
      : news.articles[3].title.substr(0, 50) + "...";
  const title5 =
    news.articles[4].title.length < 50
      ? news.articles[4].title
      : news.articles[4].title.substr(0, 50) + "...";

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

function setInfo(info) {
  $("#info-flag").attr("src", info.flag);

  $("#info1-name").text("Capital:");
  $("#info1-value").text(info.capital);

  $("#info2-name").text("Region:");
  $("#info2-value").text(info.region);

  const population = fnum(info.population);
  $("#info3-name").text("Population:");
  $("#info3-value").text(population);

  let languages = info.languages[0].name;

  if (info.languages[1]) {
    languages += "/" + info.languages[1].name;
  }

  $("#info4-name").text("Languages:");
  $("#info4-value").text(languages);

  $("#info5-name").text("Capital:");
  $("#info5-value").text(info.languages[0].name);
}

$("#country").change(function () {
  changed = true;
  markerGroup.clearLayers();

  $.ajax({
    url: "php/main.php",
    type: "POST",
    dataType: "json",
    data: {
      type: "feature",
      country: $("#country").val(),
    },

    success: function (result) {
      country = result.feature.properties.iso_a2;
      setFeature(result.feature);
      requestAirports(country);
      requestInfo(country);
      requestWebcams(country);
      requestNews(result.feature.properties.name);
      requestWiki(result.feature.properties.name);
    },

    error: function (request, status, error) {},
  });
});
