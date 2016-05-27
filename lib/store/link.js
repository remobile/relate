export default class Link {
  constructor (nodes) {
    // nodes can be an array of nodes or a single one
    this.nodes = nodes;
  }

  get () {
    return this.nodes;
  }
}
