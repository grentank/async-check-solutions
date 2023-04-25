const fs = require('fs').promises;

module.exports = class Container {
  #version;

  constructor({
    baseImage = 'node', architecture = 'x86-64', version = '1.0', id,
  }) {
    this.baseImage = baseImage;
    this.architecture = architecture;
    this.#version = version.toString();
    this.id = id;
  }

  getInfo() {
    return `BASE IMAGE: ${this.baseImage}, ARCH: ${this.architecture}`;
  }

  get version() {
    return this.#version;
  }

  set version(value) {
    this.#version = value.toString();
  }

  async writeContainerLog() {
    try {
      await fs.mkdir('./logs/containers', { recursive: true });
    } catch (error) {
      console.log(error);
    } finally {
      await fs.appendFile(`./logs/containers/${this.baseImage}-${this.version}.txt`, `${this.getInfo()}\n`, 'utf8');
    }
  }
};
