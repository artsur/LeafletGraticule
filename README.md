LeafletGraticule
===========================

Create a Canvas as ImageOverlay to draw the Lat/Lon Graticule,

and show the grid tick label at the edges of the map.


### Usage example

```javascript
L.latlngGraticule({
    showLabel: true,
    dashArray: [5, 5],
    zoomInterval: [
        {start: 2, end: 3, interval: 30},
        {start: 4, end: 4, interval: 10},
        {start: 5, end: 7, interval: 5},
        {start: 8, end: 10, interval: 1}
    ]
}).addTo(map);
```


### Options
- **showLabel**: Show the grid tick label at the edges of the map. Default `true`
- **opacity**: Opacity of the Graticule and Label. Default `1`
- **weight**: The width of the graticule lines. Default `0.8`
- **color**: The color of the graticule lines. Default `#aaa`
- **font**: Font Style for the tick label. Default `12px Verdana`
- **fontColor**: Color of the tick label. Default `#aaa`
- **dashArray**: Used to achieve dashed lines. Default `[0,0]`
- **sides**: Used to name sides of the world. Default `['N', 'S', 'E', 'W']`
- **showSides**: Show sides. In other coordinates will be shown with sign. Default `true`
- **showDegree**: Show degree sign. Default `true`
- **zoomInterval**: Use different intervals in different zoom levels. You can set for both latitude and longitude lines as the example, or set different intervals for latitude and longitude like below:
```javascript
  zoomInterval: {
    latitude: [
      {start: 4, end: 6, interval: 5},
      {start: 7, end: 20, interval: 1}
    ],
    longitude: [
      {start: 4, end: 6, interval: 10},
      {start: 7, end: 20, interval: 2}
    ]
  }
```
- ***Default***:
```javascript
  zoomInterval: [
    {start: 0, end: 1, interval: 60},
    {start: 2, end: 3, interval: 30},
    {start: 4, end: 4, interval: 10},
    {start: 5, end: 6, interval: 5},
    {start: 7, end: 7, interval: 2.5},
    {start: 8, end: 8, interval: 1},
    {start: 9, end: 9, interval: 0.5},
    {start: 10, end: 10, interval: 0.25},
    {start: 11, end: 11, interval: 0.1},
    {start: 12, end: 12, interval: 0.05},
    {start: 13, end: 13, interval: 0.025},
    {start: 14, end: 14, interval: 0.01},
    {start: 15, end: 15, interval: 0.005},
    {start: 16, end: 16, interval: 0.0025},
    {start: 17, end: 22, interval: 0.001}
  ]
```

#### Special Options
Some of the projections (like Lambert) is no straight line, set those options to draw a polyline graticule.
- **lngLineCurved**: Interval of polyline. Deafult `0`
- **latLineCurved**: Interval of polyline. Deafult `0`

Check out the [Lambert projection example](https://cloudybay.github.io/leaflet.latlng-graticule/example/lambert.html).
