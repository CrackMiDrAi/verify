
const DoubleSlashReg = /(\/)\/+/g;
const BlackSlashReg = /(\\)\\+/g;



class TerminalFileClass {
  constructor(params) {
    this.name = params.name;
    this.isDir = params.isDir;
    this.files = this.isDir && params.files ? params.files : null;
    this.parent = params.parent;
  }
}

export class TerminalFileManager {
  constructor() {
    this.currentPathClass = null;
    this.files = [
      /* {
        name,
        isDir, // True or False
        files: [ // file ], // No need if this is not a folder, set to a empty array if there's no file in it.
      } */
    ];

    // XXX: Test data please delete after debug
    this.initFileJson([
      {
        name: 'images',
        isDir: true,
        files: [
          {
            name: 'boot.img',
            isDir: false,
          },
          {
            name: 'twrp.img',
            isDir: false,
          },
        ]
      },
      {
        name: 'docs',
        isDir: true,
        files: [
          {
            name: 'test',
            isDir: true,
            files: [
              {
                name: 'about.md',
                isDir: false,
              },
              {
                name: 'CHANGELOG.md',
                isDir: false,
              },
              {
                name: 'nice',
                isDir: true,
                files: []
              },
            ]
          },
          {
            name: 'README.md',
            isDir: false,
          },
        ]
      },
      {
        name: 'nice_boat.avi',
        isDir: false,
      }
    ]);
  }

  get currentPathText() {
    if (this.currentPathClass === null || this.currentPathClass === this) return '/';
    else return this.getClassPath(this.currentPathClass);
  }

  initFileJson(fileArr) {
    const result = [];
    for (const file of fileArr) {
      result.push(createFileClass(file));
    }
    this.files = [ ...result ];
  }

  getClassByPath(_path) {
    if (!_path) return this.currentPathClass || this;

    const searchingFile = (filename, fileArr) => {
      for (const file of fileArr) {
        if (file.name === filename) return file;
      }
      return null;
    };

    const path = _path.replace(DoubleSlashReg, '$1').replace(BlackSlashReg, '/');
    const pathArr = path.split('/');
    const startPos = pathArr[0] === '' ? 0 : pathArr[0] === '..' ? 1 : 2; // 0=root, 1=parent, 2=current

    if (path === '/' || (path === '..' && !this.currentPathClass.parent)) {
      this.currentPathClass = null;
      return this;
    }

    if (pathArr.length === 0) return this.currentPathClass || this;
    else if (pathArr.length === 1) {
      if (startPos === 1 && this.currentPathClass) return this.currentPathClass.parent;
      else if (startPos === 0) return this.currentPathClass || this;
    }
    if (startPos === 1) return this.currentPathClass || this;

    let result = (
      startPos === 1 ? this.currentPathClass.parent :
        startPos === 2 && this.currentPathClass ? this.currentPathClass : this
    );

    for (const pathSub of pathArr) {
      if (pathSub === '' || pathSub === '..') continue;
      result = searchingFile(pathSub, result.files);
    }

    return result;
  }

  getClassPath(fileClass) {
    const buildPathText = (fileClass) => {
      if (fileClass === null || fileClass === this) return '';
      else return buildPathText(fileClass.parent) + '/' + fileClass.name;
    };
    return buildPathText(fileClass);
  }

  cd (path) {
    this.currentPathClass = this.getClassByPath(path);
    return this.currentPathClass;
  }

  ls(path) {
    const dir = this.getClassByPath(path);
    if (!dir) {
      throw 'Dir not exist';
    }

    return dir.files;
  }
}

const createFileClass = (fileJson, parent = null) => {
  const fileClass = new TerminalFileClass({
    name: fileJson.name,
    isDir: fileJson.isDir,
    files: fileJson.isDir ? [] : null,
    parent: parent,
  });

  if (fileJson.isDir && fileJson.files && fileJson.files.length > 0) {
    const children = [];
    for (const subFile of fileJson.files) {
      children.push(createFileClass(subFile, fileClass));
    }
    fileClass.files = children;
  }

  return fileClass;
};
