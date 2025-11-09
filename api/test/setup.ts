import { ReadableStream } from "node:stream/web";
import { Blob } from "buffer";
import { MessagePort } from "worker_threads";

if (typeof globalThis.ReadableStream === "undefined") {
  (globalThis as unknown as { ReadableStream: typeof ReadableStream }).ReadableStream = ReadableStream;
}

if (typeof globalThis.Blob === "undefined") {
  (globalThis as unknown as { Blob: typeof Blob }).Blob = Blob;
}

(() => {
  if (typeof globalThis.File !== "undefined") {
    return;
  }

  class PolyfillFile extends Blob {
    readonly name: string;
    readonly lastModified: number;

    constructor(fileBits: unknown[], fileName: string, options: { lastModified?: number; type?: string } = {}) {
      super([], { type: options.type });
      this.name = fileName;
      this.lastModified = options.lastModified ?? Date.now();
      // Retain reference to original bits for potential inspection.
      Object.defineProperty(this, "_bits", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: fileBits,
      });
    }
  }

  (globalThis as unknown as { File: typeof PolyfillFile }).File = PolyfillFile;
})();

if (typeof globalThis.MessagePort === "undefined") {
  (globalThis as unknown as { MessagePort: typeof MessagePort }).MessagePort = MessagePort;
}

if (typeof globalThis.DOMException === "undefined") {
  class PolyfillDOMException extends Error {
    readonly name: string;

    constructor(message?: string, name = "DOMException") {
      super(message);
      this.name = name;
    }
  }

  (globalThis as unknown as { DOMException: typeof PolyfillDOMException }).DOMException =
    PolyfillDOMException;
}

