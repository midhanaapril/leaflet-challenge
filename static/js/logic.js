//tile layers for the backgrounds of the map 
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//grayscale 
var grayscale =  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//watercolor 
var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

//topography 
var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let basemaps = {
    "Gray Scale": grayscale,
    "Water Color": watercolor,
    Topography: topo,
    Default: defaultMap
}; 

// map object 
var myMap = L.map("map", {
    center: [36.7783, -119.4179], 
    zoom: 3, 
    layers: [defaultMap, grayscale, watercolor,topo]
}); 

defaultMap.addTo(myMap); 


//retrieve data for tectonic plates and draw on map 
let tectonicplates = new L.layerGroup(); 

//call API for tectonic plates 
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    
    //load data using geoJSON to add tectonic plates 
    L.geoJson(plateData,{
        color:"yellow", 
        weight: 1
    }).addTo(tectonicplates);
});

tectonicplates.addTo(myMap);

//Earthquakes 
let earthquakes = new L.layerGroup(); 
//call API for earthquakes 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(function(earthquakeData){
    //function to determine the color of the circle 
    function dataColor(depth){
        if (depth > 90)
            return "red"; 
        else if (depth>70)
            return "#fc4903";
        else if (depth >50) 
            return "#fc8403";
        else if (depth >30)
            return "#fcad03"; 
        else if (depth>10) 
            return "#cafc03";
        else
            return "green"; 
    }
    //function to determine radius size based on magnitude 
    function radiusSize(mag){
        if (mag == 0 )
            return 1; //0 mag eathquake will show up 
        else
            return mag*4; 
    }

    function dataStyle(feature)
    {
        return {
            opacity: 0.3, 
            fillOpacity: .4, 
            fillColor: dataColor(feature.geometry.coordinates[2]),
            color: "000000", 
            radius: radiusSize(feature.properties.mag),
            weight: 0.5, 
            stroke: true
        }
    }

    //geoJSON 
    L.geoJson(earthquakeData, {
        //create circles on map 
        pointToLayer: function(feature, latLng) {
            return L.circleMarker(latLng);
        },
        style: dataStyle,
        //pop ups 
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b> <br>
                            Depth: <b>${feature.geometry.coordinates[2]}</b> <br>
                            Location: <b>${feature.properties.place}<b>`)
        }
    }).addTo(earthquakes);
    
});

earthquakes.addTo(myMap);

let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthuake Data": earthquakes
}; 


//layer control 
L.control
    .layers(basemaps, overlays)
    .addTo(myMap); 


//legend 
let legend = L.control({
    position: "bottomright"
}); 

legend.onAdd = function() {
    //div for th elegend to appear 
    let div = L.DomUtil.create("div", "info legend"); 

    let intervals = [-10, 10, 30, 50, 70, 90];
    let colors = ["green", "#cafc03", "#fcad03", "#fc8403", "#fc4903", "red"]; 

    //loop through intervals & colors 
    for (var i = 0; i < intervals.length; i++) {
        div.innerHTML += "<i style='background: "
            +colors[i]
            +"'></i>"
            + intervals[i]
            + (intervals[i +1] ? "km -" + intervals[i+1] + "km<br>" : "+"); 
    }

    return div; 
}; 

legend.addTo(myMap);