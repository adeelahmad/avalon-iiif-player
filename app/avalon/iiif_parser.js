/** Class representing parsing functionality of an IIIF Manifest */
export default class IIIFParser {
  /**
   * Build a manifest map helper object for parsing
   * @param {Object} manifest - Manifest object
   * @returns {Object} A generated helper map object with information about current manifest
   */
  buildManifestMap (manifest) {
    let obj = {
      hasCanvases: false,
      hasMultipleCanvases: false,
      hasSequences: false,
      isAudio: false,
      isVideo: false
    }

    obj.hasSequences = !!manifest.sequences
    if (obj.hasSequences === true) {
      obj.hasCanvases = !!manifest.sequences[0].canvases
      if (obj.hasCanvases === true) {
        obj.hasMultipleCanvases = manifest.sequences[0].canvases.length > 1
      }
    }
    return obj
  }

  /**
   * Generate a structure nested list link
   * @param {Object} member - A member object
   * @returns {string} - HTML string for the anchor link
   */
  buildStructureLink (member) {
    let members = member.members
    let id = members[0].id
    let structureLink = '#'

    if (this.getMediaFragment(id) !== undefined) {
      let mediaFragment = this.getMediaFragment(id)
      let canvasIndex = this.getCanvasIndex(id)
      let canvasHash = (canvasIndex !== '') ? `/canvas/${canvasIndex}` : ''

      structureLink = `<a data-turbolinks='false' data-target="#" href="#avalon/time/${mediaFragment.start},${mediaFragment.stop}/quality/Medium${canvasHash}" class="media-structure-uri" >${member.label}</a>`
    }
    return structureLink
  }

  /**
   * Parse what type of content the file is
   * @param {object} contentItem - The content item for which to find type
   * @returns {string} 'Audio' or 'Video' text (for now)
   */
  determinePlayerType (contentItem) {
    let playerType = ''
    let body = lookForBody(contentItem)

    if (body[0].type === 'Choice') {
      playerType = body[0].items[0].type
    }
    return playerType

    function lookForBody (obj) {
      if (obj.body) {
        return obj.body
      } else if (obj.items) {
        return lookForBody(obj.items[0])
      }
    }
  }

  /**
   * Parse canvasId URI for the canvas index
   * @param {string} canvasId - key in manifest
   * @returns {string} canvasIndex - URI canvas index
   */
  getCanvasIndex (canvasId = '') {
    let canvasPos = canvasId.indexOf('canvas')
    let canvasIndex = ''

    if (canvasPos > -1) {
      canvasIndex = canvasId.slice(canvasId.indexOf('/', canvasPos) + 1, canvasId.indexOf('#', canvasPos))
    }
    return canvasIndex
  }

  /**
   * Get a manifest's content array
   * @param {Object} manifest - A json manifest
   * @returns {Object} The first element in content array
   */
  getFirstContentItem (manifest, manifestMap) {
    let firstContent = {}

    // No sequences, go right to content key
    if (!manifestMap.hasSequences) {
      firstContent = manifest.content

      // Has sequences and canvases
    } else if (manifestMap.hasSequences && manifestMap.hasCanvases) {
      firstContent = manifest.sequences[0].canvases[0].content
    }
    return firstContent[0]
  }

  /**
   * Takes a uri with a media fragment that looks like #=120,134 and returns an object
   * with start/stop in seconds and the duration in milliseconds
   * @param {string} uri - Uri value
   * @return {Object}
   */
  getMediaFragment (uri) {
    if (uri !== undefined) {
      const fragment = uri.split('#t=')[1]
      if (fragment !== undefined) {
        const splitFragment = fragment.split(',')
        return { 'start': splitFragment[0],
          'stop': splitFragment[1] }
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }
}
