<script>
  /** @module circle-geom/geom */
  import Circle from 'ol/geom/circle'
  import geometry from '../../mixin/geometry'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import { constant } from '../../util/minilo'
  import { hasGeometry } from '../../util/assert'

  /**
   * @vueProps
   */
  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => value.length === 2,
    },
    radius: {
      type: Number,
      default: 0,
    },
  }

  /**
   * @vueComputed
   */
  const computed = {
    type: constant(GEOMETRY_TYPE.POINT),
  }

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @return {ol.geom.Circle}
     * @protected
     */
    createGeometry () {
      return new Circle(this.toViewProj(this.coordinates), this.radius)
    },
    /**
     * @return {ol.Coordinate}
     */
    getCoordinates () {
      hasGeometry(this)
      return this.$geometry.getCenter()
    },
    /**
     * @param {ol.Coordinate} coordinate
     */
    setCoordinates (coordinate) {
      hasGeometry(this)
      this.$geometry.setCenter(coordinate)
    },
  }

  const watch = {
    radius (value) {
      if (!this.$geometry) return

      if (value !== this.$geometry.getRadius()) {
        this.$geometry.setRadius(value)
      }
    },
  }

  /**
   * @alias module:circle-geom/geom
   * @title vl-geom-circle
   * @vueProto
   */
  export default {
    name: 'vl-geom-circle',
    mixins: [geometry],
    props,
    computed,
    methods,
    watch,
  }
</script>