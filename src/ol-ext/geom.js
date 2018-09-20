import pointOnFeature from '@turf/point-on-feature'
import GeometryCollection from 'ol/geom/GeometryCollection'
import LineString from 'ol/geom/LineString'
import MultiLineString from 'ol/geom/MultiLineString'
import MultiPoint from 'ol/geom/MultiPoint'
import MultiPolygon from 'ol/geom/MultiPolygon'
import Point from 'ol/geom/Point'
import Polygon from 'ol/geom/Polygon'
import Circle from 'ol/geom/Circle'
// import { GEOMETRY_TYPE, WGS84_SPHERE } from './consts'
import { GEOMETRY_TYPE } from './consts'

/**
 * @param {number|number[]} lonOrCoordinates
 * @param {number} [lat]
 * @return {ol.geom.Point}
 */
export function createPointGeom (lonOrCoordinates, lat) {
  const coordinates = Array.isArray(lonOrCoordinates)
    ? lonOrCoordinates
    : [lonOrCoordinates, lat]

  return new Point(coordinates)
}

/**
 * @param {Array<number[]>} points
 * @returns {ol.geom.LineString}
 */
export function createLineGeom (points) {
  return new LineString(points)
}

/**
 * @param {Array<Array<number[]>>} rings
 * @returns {ol.geom.Polygon}
 */
export function createPolygonGeom (rings) {
  return new Polygon(rings)
}

/**
 * @param {Array<number[]>} points
 * @returns {ol.geom.MultiPoint}
 */
export function createMultiPointGeom (points) {
  return new MultiPoint(points)
}

/**
 * @param {Array<Array<number[]>>} lines
 * @returns {ol.geom.MultiLineString}
 */
export function createMultiLineGeom (lines) {
  return new MultiLineString(lines)
}

/**
 * @param {Array<Array<Array<number[]>>>} polygons
 * @returns {ol.geom.MultiPolygon}
 */
export function createMultiPolygonGeom (polygons) {
  return new MultiPolygon(polygons)
}

/**
 * @param {ol.geom.Geometry[]} geoms
 * @returns {ol.geom.GeometryCollection}
 */
export function createGeomCollection (geoms) {
  return new GeometryCollection(geoms)
}

/**
 * @param {ol.Coordinate|number[]} center
 * @param {number} radius
 * @return {ol.geom.Polygon}
 */
export function createCircularPolygon (center, radius) {
  // return Polygon.circular(WGS84_SPHERE, center, radius)
  return Polygon.circular(center, radius)
}

/**
 * @param {ol.geom.Geometry|GeoJSONGeometry} geom
 * @return {boolean}
 * @throws {Error}
 */
export function isMultiGeom (geom) {
  let multiTypes = [
    GEOMETRY_TYPE.MULTI_POINT,
    GEOMETRY_TYPE.MULTI_LINE_STRING,
    GEOMETRY_TYPE.MULTI_POLYGON,
    GEOMETRY_TYPE.GEOMETRY_COLLECTION,
  ]

  return multiTypes.includes(geom.type || geom.getType())
}

/**
 * @param {ol.geom.Geometry|GeoJSONGeometry} geom
 * @return {ol.geom.SimpleGeometry|GeoJSONGeometry}
 * @throws {Error}
 */
export function toSimpleGeom (geom) {
  if (geom instanceof Circle) {
    geom = createPointGeom(geom.getCenter())
  }

  const type = geom.type || geom.getType()
  const complexTypes = [
    GEOMETRY_TYPE.GEOMETRY_COLLECTION,
  ]

  if (complexTypes.includes(type) === false) {
    return geom
  }

  return (geom.geometries || geom.getGeometries())[0]
}

/**
 * @param {ol.geom.Geometry|GeoJSONGeometry} geom
 * @return {ol.Coordinate|undefined}
 */
export function findPointOnSurface (geom) {
  const simpleGeom = toSimpleGeom(geom)
  const pointFeature = pointOnFeature({
    type: simpleGeom.type || simpleGeom.getType(),
    coordinates: simpleGeom.coordinates || simpleGeom.getCoordinates(),
  })

  if (pointFeature && pointFeature.geometry) {
    return pointFeature.geometry.coordinates
  }
}
