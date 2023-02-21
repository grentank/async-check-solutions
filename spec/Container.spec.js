const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');
const os = require('os');
const Container = require('../Container');

describe('Класс Container', () => {
  const containerInstance = new Container();

  describe('Свойство baseImage', () => {
    it('использует образ node по умолчанию', () => {
      const defaultImage = 'node';
      expect(containerInstance.baseImage).toBe(defaultImage);
    });

    it('позволяет задавать базовый образ контейнера', () => {
      const image = 'postgres';
      containerInstance.baseImage = image;
      expect(containerInstance.baseImage).toBe(image);
    });
  });

  describe('Свойство architecture', () => {
    it('использует архитектуру x86-64 по умолчанию', () => {
      const defaultArchitecture = 'x86-64';
      expect(containerInstance.architecture).toBe(defaultArchitecture);
    });
  });

  describe('Метод getInfo', () => {
    it('возвращает описание контейнера', () => {
      containerInstance.baseImage = 'ubuntu';
      containerInstance.architecture = 'arm';

      expect(containerInstance.getInfo()).toBe('BASE IMAGE: ubuntu, ARCH: arm');
    });
  });

  describe('Метод version', () => {
    it('геттер возвращает версию контейнера', () => {
      expect(containerInstance.version).toBe('1.0');
    });

    it('сеттер позволяет установить версию контейнера', () => {
      containerInstance.version = 1.1;
      expect(typeof containerInstance.version).toBe('string');
      expect(containerInstance.version).toBe('1.1');
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

    it('записывает логи контейнера', async () => {
      const logFolder = path.join(__dirname, '../logs/containers', `${containerInstance.baseImage}-${containerInstance.version}.txt`);
      const logs = await fs.readFile(logFolder, { encoding: 'utf-8' });
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
