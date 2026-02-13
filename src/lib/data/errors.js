export class DataLayerNotImplementedError extends Error {
  constructor(message) {
    super(message);
    this.name = "DataLayerNotImplementedError";
  }
}
