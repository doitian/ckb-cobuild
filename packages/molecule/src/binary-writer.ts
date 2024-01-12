const EMPTY_BUFFER = new Uint8Array();

export class BinaryWriter {
  blocks: Uint8Array[] = [];
  length: number = 0;

  push(block: Uint8Array) {
    this.blocks.push(block);
    this.length += block.length;
  }

  getResultBuffer() {
    if (this.blocks.length > 1) {
      const flat = new Uint8Array(this.length);
      this.blocks.reduce((offset, block) => {
        flat.set(block, offset);
        return offset + block.length;
      }, 0);
      this.blocks = [flat];
      return flat;
    }

    return this.blocks[0] ?? EMPTY_BUFFER;
  }
}

export default BinaryWriter;
