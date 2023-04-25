const fs = require('fs').promises;

module.exports = class Server {
  #status;

  constructor({
    status = 'offline', os, cpu, cores, allContainers,
  }) {
    this.#status = status;
    this.os = os;
    this.cpu = cpu;
    this.cores = cores;
    this.allContainers = allContainers;
  }

  startServer() {
    this.#status = 'online';
  }

  stopServer() {
    this.#status = 'offline';
  }

  get status() {
    return this.#status;
  }

  set status(value) {
  }

  addContainer(container) {
    this.allContainers.push(container);
  }

  delContainer(containerId) {
    this.allContainers = this.allContainers.filter((container) => container.id !== containerId);
  }

  getInfo() {
    return `OS: ${this.os}, CPU: ${this.cpu}, CORES: ${this.cores}, CONTAINERS: ${JSON.stringify(this.allContainers)}`;
  }

  async writeServerLog() {
    try {
      await fs.mkdir('./logs/servers', { recursive: true });
    } catch (error) {
      console.log(error);
    } finally {
      await fs.appendFile(`./logs/servers/${this.os}-${this.cpu}.txt`, `${this.getInfo()}\n`, 'utf8');
    }
  }
};
