const fs = require('fs').promises;

module.exports = class Cleaner {
  static async removeFile(path) {
    try {
      await fs.unlink(path);
      return true;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  static async removeFolder(path) {
    try {
      await fs.rmdir(path, { recursive: true });
      return true;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
};
