const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const Container = require('../Container');

describe('Класс Container', () => {
  let containerInstance;
  let defaultContainer;
  beforeEach(() => {
    containerInstance = new Container({
      baseImage: 'ubuntu', architecture: 'arm', version: 15.1, id: crypto.randomUUID(),
    });
    defaultContainer = new Container({ });
  });

  describe('Конструктор класса', () => {
    it('имеет нужные поля', () => {
      expect(containerInstance.baseImage).toBe('mongo');
      expect(containerInstance.architecture).toBe('arm');
      expect(containerInstance.version).toBe('15.1');
    });
  });

  describe('Свойство baseImage', () => {
    it('использует образ node по умолчанию', () => {
      const defaultImage = 'node';
      expect(defaultContainer.baseImage).toBe(defaultImage);
    });

    it('позволяет задавать базовый образ контейнера', () => {
      const image = 'postgres';
      defaultContainer.baseImage = image;
      expect(defaultContainer.baseImage).toBe(image);
    });
  });

  describe('Свойство architecture', () => {
    it('использует архитектуру x86-64 по умолчанию', () => {
      const defaultArchitecture = 'x86-64';
      expect(defaultContainer.architecture).toBe(defaultArchitecture);
    });
  });

  describe('Метод getInfo', () => {
    it('возвращает описание контейнера', () => {
      defaultContainer.baseImage = 'ubuntu';
      defaultContainer.architecture = 'arm';

      expect(defaultContainer.getInfo()).toBe('BASE IMAGE: ubuntu, ARCH: arm');
    });
  });

  describe('Метод version', () => {
    it('геттер возвращает версию контейнера по умолчанию', () => {
      expect(defaultContainer.version).toBe('1.0');
    });

    it('сеттер позволяет установить версию контейнера', () => {
      defaultContainer.version = 1.1;
      expect(typeof defaultContainer.version).toBe('string');
      expect(defaultContainer.version).toBe('1.1');
    });
  });

  describe('Метод writeContainerLog', () => {
    beforeEach(async () => {
      await containerInstance.writeContainerLog();
    });

    it('создаёт папку /logs/containers на одном уровне с папкой /spec', async () => {
      const logsFolderExists = existsSync(path.join(__dirname, '../logs'));
      const containersFolderExists = existsSync(path.join(__dirname, '../logs/containers'));

      expect(logsFolderExists).toEqual(true);
      expect(containersFolderExists).toBe(true);
    });

    it('записывает логи контейнера, добавляя новые строки', async () => {
      const logPath = path.join(__dirname, '../logs/containers', `${containerInstance.baseImage}-${containerInstance.version}.txt`);
      const logs = await fs.readFile(logPath, { encoding: 'utf-8' });
      const lastContainerLog = logs.split(os.EOL).at(-2);

      expect(lastContainerLog).toBe('BASE IMAGE: ubuntu, ARCH: arm');
    });
  });

  it('не использует синхронные методы из модуля fs', () => {
    expect(containerInstance.writeContainerLog.toString()).not.toContain('mkdirSync');
    expect(containerInstance.writeContainerLog.toString()).not.toContain('appendFileSync');
    expect(containerInstance.writeContainerLog.toString()).not.toContain('writeFileSync');
  });
});
