const OuBlock = require('./OuBlock.js');
var path = require('path');
var AppUtils = require('websocket_p2pnet').AppUtils;

class NoteBook{
  constructor() {
    //创建配置参数目录
    this.configPath = path.join(__dirname,'webConfig.json')
    //第一次实例化appUtils工具 需要传入配置参数文件的路径
    this.appUtils = AppUtils.getSingle(this.configPath)
    //区块文件保存路径
    this.dataPath = path.join(__dirname, 'NoteBookData.json')
    //调用方法,得到区块列表
    this.blockList = this.loadList4Disk(this.dataPath)
    //根据配置参数,设置挖矿难度字符串
    this.mineDiffCultStr = this.setMineDiffcultStr(this.appUtils.webConfig.mineDiffcultLevel)
    console.log(this)

    // 创世hash
    this.firstPreHash = '0000000000000000000000000000000000000000000000000000000000000000'


    this.check()
  }

  /**
   * 从文件中读取区块列表,并返回
   * @param {string} dataPath  文件的路径
   */
  loadList4Disk(dataPath) {
    let ouBlockArray = []
    //调用工具中的读文件方法
    var jsonList = this.appUtils.fileOpe.loadJsonObjFromDisk(dataPath);
    if (jsonList && jsonList instanceof Array && jsonList.length>0) {
      jsonList.forEach( (obj) => {// 遍历读出的列表
        ouBlockArray.push(OuBlock.json2OuBlock(obj)) //转换为oublock对象并push进数组
      })
    }
    return ouBlockArray //返回数组
  }

  /**
   * 根据难度数字生成难度字符串
   * @param {number} diffLevel 挖矿难度数字
   */
  setMineDiffcultStr(diffLevel){
    var str = ''
    diffLevel =  parseInt(diffLevel)
     for( let i = 0; i <diffLevel; i++){
       str += '0'
     }
     return str
  }

  /**
   * 单个区块的内容
   * nounce  --- 工作量证明
   * content --- 内容
   * prehash --- 上一个区块的hash
   * hash   ---   算出的hash值 --- 必须要符合难度
   * timespan ---  当前时间戳
   */

  /**
   * 创世区块
   * @param {string} content - 内容
   */
  addGenesis(content){
    if (this.blockList.length > 0) {
      throw new Error('创世区块前面不能有区块~~~！');
    }
    return this.addblock(content, this.firstPreHash)
  }

  /**
   * 创建普通区块
   * @param {string} content 内容 
   */
  addNormalBlock(content){
    if(this.blockList.length <= 0){
      throw new Error('普通区块前面必须有区块~~~！'); 
    }
    let preBlock = this.blockList[this.blockList.length - 1]
    return this.addblock(content, preBlock.hash)
  }

    /**
   * 新增区块
   * @param {*} content - 挖矿的内容
   * @param {*} preHash - 上一个区块的hsah值
   */
  addblock(content, preHash){
    let mineResult = this.mine(content, preHash);
    let block = new OuBlock(this.blockList.length + 1, content, mineResult.nounce, mineResult.hash, preHash, Date.now())
    //将区块存入blockList
    this.blockList.push(block)
    //存入硬盘
    this.saveList2Disk()

    return block
  }

  /**
   * 挖矿
   * @param {*} content - 挖矿的内容
   * @param {*} preHash - 上一个区块的hsah值
   */
  mine(content, preHash){
    let logStr = ''
    let resultObj = {}
    var nounce = -1 
    let culHash = ''
    for(; nounce < Number.MAX_SAFE_INTEGER; nounce++){
      culHash = this.appUtils.HashOpe.sha256(nounce + content + preHash)
      if(culHash.startsWith(this.mineDiffCultStr)){
        resultObj.nounce = nounce
        resultObj.hash = culHash
        logStr += `[ 挖矿成功!!]nounce==${nounce}culHash===${culHash}`
        break
      }
      logStr += `挖矿失败++${nounce}`
    }
    if (!resultObj.hash) { 
      throw new Error('挖矿失败：' + nounce);
    }
    return resultObj;
  } 

  /**
   * 存入硬盘方法
   */
  saveList2Disk(){
      console.log(this.dataPath);
      this.appUtils.fileOpe.save2Disk(this.dataPath, this.blockList);
  }

  /**
   * 校验区块链的方法
   */
  check(){
    let resArr = []

    let curBlock = null; //当前区块
    let preBlock = null; //上一个区块
    let culHash = null; //当前hash
    let preHash = null; // 上一个hash
    for( var i = 0; i < this.blockList.length; i++){
      curBlock = this.blockList[i]
      preBlock = (i == 0) ? null : this.blockList[i - 1]
      preHash = (i == 0) ? this.firstPreHash : preBlock.hash
      culHash = this.appUtils.HashOpe.sha256(curBlock.nounce + curBlock.content + preHash)
      console.log(culHash)
      if( culHash != curBlock.hash ){
        console.log(curBlock.hash+'==========')
        console.log(culHash+'--------------')
        resArr.push(`第[${i}] 处的hash值被篡改了`)
      }
      if( preHash != curBlock.preHash ){
        resArr.push(`第[${i}] 处的preHash值被篡改了`)
      }
    }

    console.log('校验结果：');
    console.log(resArr);
    return { isOk: (resArr.length == 0).toString(), resArr };
  }


    /**
   * 0.0 使用 单例模式 获取 唯一一个 实例
   */
  static getSingle() { 
    if (!this.singleNoteBookObj) { 
      this.singleNoteBookObj = new NoteBook();
    }

    return this.singleNoteBookObj;
  }
}

// 1. 在原型中 保存 NoteBook 的 单例 (唯一的一个实例)
NoteBook.prototype.singleNoteBookObj = null;

module.exports = NoteBook;