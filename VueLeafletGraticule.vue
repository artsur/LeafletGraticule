<script>
  import * as L from 'leaflet';
  import './leaflet-graticule';
  export const VueLeafletGratitude = {
    name: "VueLeafletGraticule",
    props: {
      showLabel: {type: Boolean, default: true},
      color: {type: String, default: '#444'},
      fontColor: {type: String, default: '#444'},
      weight: {type: Number, default: 0.5},
      opacity: {type: Number, default: 0.8},
      font: {type: String, default: '12px Arial'},
      dashArray: {type: Array, default: () => [0, 0]},
      zoomInterval: {type: Array, default:() => [
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
          {start: 17, end: 22, interval: 0.001},
      ]},
      sides: {type: Array, default: () => ['N', 'S', 'E', 'W']},
      showSides: {type: Boolean, default: true},
      showDegree: {type: Boolean, default: true},
      latFormatTickLabel: {type: Function},
      lngFormatTickLabel: {type: Function},
    },
    data() {
      return {}
    },
    mounted() {
      this.graticule = L.leafletGraticule({ ...this.$options.propsData }).addTo(this.$parent.mapObject);
    },
    render() {
      return null;
    }
  };

  export default VueLeafletGratitude;
</script>