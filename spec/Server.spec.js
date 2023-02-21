const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const Server = require('../Server');
const Container = require('../Container');

describe('Класс Server', () => {
  const containerInstanceNode = new Container({ baseImage: 'node', architecture: 'x86-64', version: 18.14, id: crypto.randomUUID() });
  const containerInstancePostgres = new Container({ baseImage: 'postgres', architecture: 'x86-64', version: 15.1, id: crypto.randomUUID() });
  const containerInstancePython = new Container({ baseImage: 'python', architecture: 'x86-64', version: 3.9, id: crypto.randomUUID() });
  const containerInstanceGo = new Container({ baseImage: 'go', architecture: 'x86-64', version: 1.20, id: crypto.randomUUID() });
  const containerInstanceMongo = new Container({ baseImage: 'mongo', architecture: 'x86-64', version: 6.0, id: crypto.randomUUID() });

  const serverInstance = new Server({
    status: 'offline',
    os: 'ubuntu',
    cpu: 'amd',
    cores: 8,
    allContainers: [
      containerInstanceNode,
      containerInstancePostgres,
      containerInstancePython,
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
    beforeEach(() => {
      serverInstance.stopServer();
    });

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
        containerInstancePostgres,
        containerInstancePython,
        containerInstanceGo,
        containerInstanceMongo,
      ]);
    });
  });

  describe('Метод delContainer', () => {
    it('удаляет контейнер с сервера по его идентификатору', () => {
      const { id } = containerInstancePython;

      serverInstance.delContainer(id);

      expect(serverInstance.allContainers).toEqual([
        containerInstanceNode,
        containerInstancePostgres,
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
      const logsFolderExists = existsSync(path.join(__dirname, '../logs'));
      const serversFolderExists = existsSync(path.join(__dirname, '../logs/servers'));

      expect(logsFolderExists).toBe(true);
      expect(serversFolderExists).toBe(true);
    });

    it('записывает логи сервера в файл', async () => {
      const logFolder = path.join(__dirname, '../logs/servers', `${serverInstance.os}-${serverInstance.cpu}.txt`);
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
