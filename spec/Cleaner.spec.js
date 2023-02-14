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
      const containersLog = (await fs.readdir(path.join('logs', 'containers')))[0];
      const serversLog = (await fs.readdir(path.join('logs', 'servers')))[0];

      expect(Cleaner.removeFile(path.join('logs', 'containers', containersLog))).toBeTruthy();
      expect(Cleaner.removeFile(path.join('logs', 'servers', serversLog))).toBeTruthy();
    });

    it('Статический метод для удаления папки', async () => {
      const logsFolder = (await fs.readdir(path.join(__dirname, '..'))).find(folder => folder === 'logs');

      expect(Cleaner.removeFolder(path.join(logsFolder, 'containers'))).toBeTruthy();
      expect(Cleaner.removeFolder(path.join(logsFolder, 'servers'))).toBeTruthy();
      expect(Cleaner.removeFolder(path.join(logsFolder))).toBeTruthy();
    });
  });
});
