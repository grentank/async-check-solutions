const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const Server = require('../Server');
const Container = require('../Container');

describe('Класс Server', () => {
  const containerInstanceNode = new Container({ baseImage: 'node', architecture: 'x86-64', version: 18.14, id: crypto.randomUUID() });
  const containerInstancePostges = new Container({ baseImage: 'postgres', architecture: 'x86-64', version: 15.1, id: crypto.randomUUID() });
  const containerInstancePyhton = new Container({ baseImage: 'python', architecture: 'x86-64', version: 3.9, id: crypto.randomUUID() });
  const containerInstanceGo = new Container({ baseImage: 'go', architecture: 'x86-64', version: 1.20, id: crypto.randomUUID() });
  const containerInstanceMongo = new Container({ baseImage: 'mongo', architecture: 'x86-64', version: 6.0, id: crypto.randomUUID() });

  const serverInstance = new Server({
    status: 'offline',
    os: 'ubuntu',
    cpu: 'amd',
    cores: 8,
    allContainers: [
      containerInstanceNode,
      containerInstancePostges,
      containerInstancePyhton,
      containerInstanceGo,
    ],
  });

  describe('Метод startServer', () => {
    beforeEach(() => {
      serverInstance.startServer();
    });

    it('запускает сервер, меняя его статус', () => {
      const status = 'online';
      expect(serverInstance.status).toBe(status);
    });
  });

  describe('Метод stopServer', () => {
    serverInstance.stopServer();

    it('останавливает сервер, меняя его статус', () => {
      const status = 'offline';
      expect(serverInstance.status).toBe(status);
    });
  });

  it('не позволяет переопределять статус сервера вручную', () => {
    serverInstance.startServer();

    serverInstance.status = 'offline';
    expect(serverInstance.status).toBe('online');
  });

  describe('Метод addContainer', () => {
    it('добавляет новый контейнер на сервер', () => {
      serverInstance.addContainer(containerInstanceMongo);

      expect(serverInstance.allContainers).toEqual([
        containerInstanceNode,
        containerInstancePostges,
        containerInstancePyhton,
        containerInstanceGo,
        containerInstanceMongo,
      ]);
    });
  });

  describe('Метод delContainer', () => {
    it('удаляет контейнер с сервера по его идентификатору', () => {
      const { id } = containerInstancePyhton;

      serverInstance.delContainer(id);

      expect(serverInstance.allContainers).toEqual([
        containerInstanceNode,
        containerInstancePostges,
        containerInstanceGo,
        containerInstanceMongo,
      ]);
    });
  });

  describe('Метод writeServerLog', () => {
    beforeEach(async () => {
      await serverInstance.writeServerLog();
    });

    it('создаёт папку /logs/servers на одном уровне с папкой /spec', async () => {
      const logsFolder = (await fs.readdir(path.join('.'))).find(folder => folder === 'logs');
      const serversFolder = (await fs.readdir(path.join('.', logsFolder))).find(folder => folder === 'servers');

      expect(logsFolder).toEqual(logsFolder);
      expect(serversFolder).toEqual(serversFolder);
    });

    it('записывает логи сервера в файл', async () => {
      const logFolder = path.join(__dirname, '..', 'logs', 'servers', `${serverInstance.os}-${serverInstance.cpu}.txt`);
      const logs = await fs.readFile(logFolder, { encoding: 'utf-8' });
      const lastServerLog = logs.split(os.EOL).at(-2);

      expect(lastServerLog).toBe(`OS: ${serverInstance.os}, CPU: ${serverInstance.cpu}, CORES: ${serverInstance.cores}, CONTAINERS: ${JSON.stringify(serverInstance.allContainers)}`);
    });
  });

  it('не использует синхронные методы из модуля fs', () => {
    expect(serverInstance.writeServerLog.toString()).not.toContain('mkdirSync');
    expect(serverInstance.writeServerLog.toString()).not.toContain('appendFileSync');
    expect(serverInstance.writeServerLog.toString()).not.toContain('writeFileSync');
  });
});
