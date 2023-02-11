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
      containerInstanceGo
    ]
  });

  describe('Запуск сервера', () => {
    beforeEach(() => {
      serverInstance.startServer();
    });

    it('Функционал запуска сервера, меняется статус', () => {
      const status = 'online';
      expect(serverInstance.status).toBe(status);
    });
  });

  describe('Остановка сервера', () => {
    serverInstance.stopServer();

    it('Функционал остановки сервера, меняется статус', () => {
      const status = 'offline';
      expect(serverInstance.stopServer()).toBe(status);
    });
  });

  describe('Защита от переопределения статуса сервера вручную', () => {
    it('Метод запуска сервера', () => {
      serverInstance.startServer();

      serverInstance.status = 'offline';
      expect(serverInstance.status).toBe('online');
    })
  });

  describe('Добавление нового контейнера', () => {
    it('Метод добавления контейнера', () => {
      serverInstance.addContainer(containerInstanceMongo);

      expect(serverInstance.allContainers).toEqual([
        containerInstanceNode,
        containerInstancePostges,
        containerInstancePyhton,
        containerInstanceGo,
        containerInstanceMongo
      ]);
    })
  });

  describe('Удаление контейнера', () => {
    it('Метод удаления контейнера', () => {
      const { id } = containerInstancePyhton;

      serverInstance.delContainer(id);

      expect(serverInstance.allContainers).toEqual([
        containerInstanceNode,
        containerInstancePostges,
        containerInstanceGo,
        containerInstanceMongo
      ]);
    })
  });

  describe('Логи сервера', () => {
    beforeEach(async () => {
      await serverInstance.writeServerLog();
    });

    it('Создаётся папка /logs/servers на одном уровне с папкой /spec', async () => {
      const logsFolder = (await fs.readdir(path.join('.'))).find(folder => folder === 'logs');
      const serversFolder = (await fs.readdir(path.join('.', logsFolder))).find(folder => folder === 'servers');

      expect(logsFolder).toEqual(logsFolder);
      expect(serversFolder).toEqual(serversFolder);
    })

    it('Запись лога сервера', async () => {
      const logFolder = path.join(__dirname, '..', 'logs', 'servers', `${serverInstance.os}-${serverInstance.cpu}.txt`);
      const logs = await fs.readFile(logFolder, { encoding: 'utf-8' });
      const lastServerLog = logs.split(os.EOL).at(-2);

      expect(lastServerLog).toBe(`OS: ${serverInstance.os}, CPU: ${serverInstance.cpu}, CORES: ${serverInstance.cores}, CONTAINERS: ${JSON.stringify(serverInstance.allContainers)}`);
    });
  });

  describe('Использование асинхронных методов в классе Server', () => {
    it('Нет вызова синхронных функций из модуля fs', () => {
      expect(serverInstance.writeServerLog.toString()).not.toContain('mkdirSync');
      expect(serverInstance.writeServerLog.toString()).not.toContain('appendFileSync');
      expect(serverInstance.writeServerLog.toString()).not.toContain('writeFileSync');
    });
  });
});