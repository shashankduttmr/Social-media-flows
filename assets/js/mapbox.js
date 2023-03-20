mapboxgl.accessToken = x;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
    center: data1.geometry.coordinates, // starting position [lng, lat]
    zoom: 15 // starting zoom
});

const marker = new mapboxgl.Marker()
.setLngLat(data1.geometry.coordinates)
.addTo(map);