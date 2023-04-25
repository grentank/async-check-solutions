const path = require('path');
const fs = require('fs/promises');
const Cleaner = require('../Cleaner');

describe('Класс Cleaner', () => {
  it('не использует синхронные методы из модуля fs', () => {
    expect(Cleaner.removeFile.toString()).not.toContain('unlinkSync');
    expect(Cleaner.removeFolder.toString()).not.toContain('rmdirSync');
  });

  describe('Функционал удаления файла или папки', () => {
    it('Статический метод для удаления файла', async () => {
      const containersLog = (await fs.readdir(path.join(__dirname, '../logs/containers')))[0];
      const serversLog = (await fs.readdir(path.join(__dirname, '../logs/servers')))[0];

      expect(await Cleaner.removeFile(path.join(__dirname, '../logs/containers', containersLog))).toBe(true);
      expect(await Cleaner.removeFile(path.join(__dirname, '../logs/servers', serversLog))).toBe(true);

      expect((await fs.readdir(path.join(__dirname, '../logs/containers'))).length).toBe(containersLog.length - 1);
      expect((await fs.readdir(path.join(__dirname, '../logs/servers'))).length).toBe(serversLog.length - 1);
    });

    it('Статический метод для удаления папки', async () => {
      const logsFolder = path.join(__dirname, '../logs');

      expect(await Cleaner.removeFolder(path.join(logsFolder, 'containers'))).toBe(true);
      expect(await Cleaner.removeFolder(path.join(logsFolder, 'servers'))).toBe(true);
      expect(await Cleaner.removeFolder(path.join(logsFolder))).toBe(true);
    });
  });
});
