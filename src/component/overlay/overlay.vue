<template>
  <div :id="[$options.name, id].join('-')" :class="$options.name" style="display: none">
    <div>
      <slot :id="id" :position="position" :offset="offset" :positioning="positioning"/>
    </div>
  </div>
</template>

<script>
  /**
   * @module overlay/overlay
   */
  import Overlay from 'ol/Overlay'
  import { Observable } from 'rxjs'
  import { merge as mergeObs } from 'rxjs/observable'
  import uuid from 'uuid/v4'
  import olCmp from '../../mixin/ol-cmp'
  import projTransforms from '../../mixin/proj-transforms'
  import useMapCmp from '../../mixin/use-map-cmp'
  import { OVERLAY_POSITIONING } from '../../ol-ext/consts'
  import observableFromOlChangeEvent from '../../rx-ext/from-ol-change-event'
  import { hasOverlay } from '../../util/assert'

  const props = {
    id: {
      type: [String, Number],
      default: () => uuid(),
    },
    offset: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2,
    },
    /**
     * Coordinates in the map view projection.
     * @type {number[]}
     */
    position: {
      type: Array,
      validator: value => value.length === 2,
      required: true,
    },
    positioning: {
      type: String,
      default: OVERLAY_POSITIONING.TOP_LEFT,
      validator: value => Object.values(OVERLAY_POSITIONING).includes(value),
    },
    stopEvent: {
      type: Boolean,
      default: true,
    },
    insertFirst: {
      type: Boolean,
      default: true,
    },
    autoPan: {
      type: Boolean,
      default: false,
    },
    autoPanMargin: {
      type: Number,
      default: 20,
    },
    autoPanAnimation: Object,
  }

  /**
   * @vueComputed
   */
  const computed = {
    positionViewProj () {
      if (this.rev && this.$overlay) {
        return this.$overlay.getPosition()
      }
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:overlay/overlay# */{
    /**
     * @return {ol.Overlay}
     * @protected
     */
    createOlObject () {
      return new Overlay({
        id: this.id,
        offset: this.offset,
        position: this.pointToViewProj(this.position),
        positioning: this.positioning,
        stopEvent: this.stopEvent,
        insertFirst: this.insertFirst,
        autoPan: this.autoPan,
        autoPanMargin: this.autoPanMargin,
        autoPanAnimation: this.autoPanAnimation,
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      hasOverlay(this)

      this.$overlay.setElement(this.$el.children[0])
      this.$overlaysContainer && this.$overlaysContainer.addOverlay(this.$overlay)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      hasOverlay(this)

      this.unsubscribeAll()
      this.$overlay.setElement(undefined)
      this.$overlaysContainer && this.$overlaysContainer.removeOverlay(this.$overlay)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToOverlayChanges()
    },
  }

  const watch = {
    offset (value) {
      if (this.$overlay) {
        this.$overlay.setOffset(value)
      }
    },
    position (value) {
      if (this.$overlay) {
        this.$overlay.setPosition(this.pointToViewProj(value))
      }
    },
    positioning (value) {
      if (this.$overlay) {
        this.$overlay.setPositioning(value)
      }
    },
    resolvedDataProjection () {
      if (this.$overlay) {
        this.$overlay.setPosition(this.pointToViewProj(this.position))
      }
    },
  }

  /**
   * @alias module:overlay/overlay
   * @title vl-overlay
   * @vueProto
   */
  export default {
    name: 'vl-overlay',
    mixins: [olCmp, useMapCmp, projTransforms],
    props,
    computed,
    methods,
    watch,
    created () {
      Object.defineProperties(this, /** @lends module:overlay/overlay# */{
        /**
         * @type {ol.Overlay|undefined}
         */
        $overlay: {
          enumerable: true,
          get: () => this.$olObject,
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map,
        },
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view,
        },
        $overlaysContainer: {
          enumerable: true,
          get: () => this.$services && this.$services.overlaysContainer,
        },
      })
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToOverlayChanges () {
    hasOverlay(this)

    const ft = 100
    const changes = Observable::mergeObs(
      observableFromOlChangeEvent(this.$overlay, 'position', true, ft,
        () => this.pointToDataProj(this.$overlay.getPosition())),
      observableFromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning',
      ], true, ft)
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
