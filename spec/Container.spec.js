const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const Container = require('../Container');

describe('Класс Container', () => {
  const containerInstance = new Container();

  describe('Базовый образ контейнера', () => {
    it('Если базовый образ не передан, то используется образ по-умолчанию', () => {
      const defaultImage = 'node';
      expect(containerInstance.baseImage).toBe(defaultImage);
    });

    it('Возможность задать базовый образ контейнера', () => {
      const image = 'postgres';
      containerInstance.baseImage = image;
      expect(containerInstance.baseImage).toBe(image);
    });
  });

  describe('Арихитектура контейнера', () => {
    it('Архитектура по-умолчанию', () => {
      const defaultArchitecture = 'x86-64';
      expect(containerInstance.architecture).toBe(defaultArchitecture);
    });
  });

  describe('Информация о контейнере', () => {
    it('Получение описания контейнера', () => {
      containerInstance.baseImage = 'ubuntu';
      containerInstance.architecture = 'arm';

      expect(containerInstance.getInfo()).toBe('BASE IMAGE: ubuntu, ARCH: arm');
    });

    it('Получение версии контейнера (getter)', () => {
      expect(containerInstance.version).toBe('1.0');
    });

    it('Установка версии контейнера (setter)', () => {
      containerInstance.version = 1.1;
      expect(typeof containerInstance.version).toBe('string');
      expect(containerInstance.version).toBe('1.1');
    });
  });

  describe('Логи контейнера', () => {
    beforeEach(async () => {
      await containerInstance.writeContainerLog();
    });

    it('Создаётся папка /logs/containers на одном уровне с папкой /spec', async () => {
      const logsFolder = (await fs.readdir(path.join('.'))).find(folder => folder === 'logs');
      const containersFolder = (await fs.readdir(path.join('.', logsFolder))).find(folder => folder === 'containers');

      expect(logsFolder).toEqual(logsFolder);
      expect(containersFolder).toEqual(containersFolder);
    })

    it('Запись лога контейнера', async () => {
      const logFolder = path.join(__dirname, '..', 'logs', 'containers', `${containerInstance.baseImage}-${containerInstance.version}.txt`);
      const logs = await fs.readFile(logFolder, { encoding: 'utf-8' });
      const lastContainerLog = logs.split(os.EOL).at(-2);

      expect(lastContainerLog).toBe('BASE IMAGE: ubuntu, ARCH: arm');
    });
  })

  describe('Использование асинхронных методов в классе Container', () => {
    it('Нет вызова синхронных функций из модуля fs', () => {
      expect(containerInstance.writeContainerLog.toString()).not.toContain('mkdirSync');
      expect(containerInstance.writeContainerLog.toString()).not.toContain('appendFileSync');
      expect(containerInstance.writeContainerLog.toString()).not.toContain('writeFileSync');
    });
  })
})
