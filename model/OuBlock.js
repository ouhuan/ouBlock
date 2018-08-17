/**
 * 区块类,用于保存区块的信息
 */
class OuBlock {
  /**
   * 
   * @param {number} id - 用与保存当前区块的id
   * @param {string} content - 保存当前区块的内容 
   * @param {number} nounce - 工作量证明
   * @param {string } hash - 算出来的hash值
   * @param {string} preHash - 上一个区块的 hash 值
   * @param {string} timespan - 时间戳 
   */
  constructor(id, content, nounce, hash, preHash, timespan) {
    this.id = id;
    this.content = content;
    this.nounce = nounce;
    this.hash = hash;
    this.preHash = preHash;
    this.timespan = timespan;
  }
  
  /**
   * 
   * @param {object} jsonObj 传入一个json对象,转换成oublock对象
   */
  static json2OuBlock(jsonObj){
    let newBlock = new OuBlock()
    newBlock.content = jsonObj.content
    newBlock.nounce = jsonObj.nounce
    newBlock.hash = jsonObj.hash
    newBlock.preHash = jsonObj.preHash
    newBlock.timespan = jsonObj.timespan
    return newBlock
  }
}

module.exports = OuBlock