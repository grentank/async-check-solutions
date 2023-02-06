const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const Server = require('../Server');
const Container = require('../Container');

describe('Класс Server', () => {
  const containerInstanceNode = new Container({ baseImage: 'node', architecture: 'x86-64', version: 18.14 });
  const containerInstancePostges = new Container({ baseImage: 'postgres', architecture: 'x86-64', version: 15.1 });
  const containerInstancePyhton = new Container({ baseImage: 'python', architecture: 'x86-64', version: 3.9 });
  const containerInstanceGo = new Container({ baseImage: 'go', architecture: 'x86-64', version: 1.20 });
  const containerInstanceMongo = new Container({ baseImage: 'mongo', architecture: 'x86-64', version: 6.0 });

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
    beforeEach(() => {
      serverInstance.stopServer();
    });


    it('Функционал остановки сервера, меняется статус', () => {
      const status = 'offline';
      expect(serverInstance.stopServer()).toBe(status);
    });
  });

  describe('Защита от переопределения статуса сервера вручную', () => {
    serverInstance.startServer();

    serverInstance.status = 'offline';
    expect(serverInstance.status).toBe('online');
  });

  describe('Добавление нового контейнера', () => {
    serverInstance.addContainer(containerInstanceMongo);

    expect(serverInstance.allContainers).toEqual([
      containerInstanceNode,
      containerInstancePostges,
      containerInstancePyhton,
      containerInstanceGo,
      containerInstanceMongo
    ]);
  });

  describe('Удаление контейнера', () => {
    serverInstance.delContainer('python');

    expect(serverInstance.allContainers).toEqual([
      containerInstanceNode,
      containerInstancePostges,
      containerInstanceGo,
      containerInstanceMongo
    ]);
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

      expect(lastServerLog).toBe('OS: ubuntu, CPU: amd, CORES: 8, CONTAINERS: [{"baseImage":"node","architecture":"x86-64"},{"baseImage":"postgres","architecture":"x86-64"},{"baseImage":"go","architecture":"x86-64"},{"baseImage":"mongo","architecture":"x86-64"}]');
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