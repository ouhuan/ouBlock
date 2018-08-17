var express = require('express'); // web托管服务
var bodyParser = require('body-parser'); // post数据解析成对象
var path = require('path');

var NoteBook = require('../model/NoteBook'); // 区块链账本
var BSMsg = require('../model/BSMsg'); // 浏览器服务器格式消息
var AppUtils = require('websocket_p2pnet').AppUtils; // 工具

class WebServer {
  /**
   * 初始化
   */
  constructor() {
    //服务器app
    this.app = express()
    //创建配置文件
    var configPath = path.join(__dirname, 'webConfig.json');
    this.appUtils = AppUtils.getSingle(configPath);
    // 获取 NoteBook 单例
    this.notebook = NoteBook.getSingle();
    // 设置静态资源文件夹路径
    this.staticDirPath = path.join(__dirname, '../static');

    // 注册过滤器
    this.regRequestPipe();

    // 注册url路由
    this.regRouting();
  }

  /**
   * 挂载中间件
   */
  regRequestPipe(){
    //1.1 bodyparser
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    //1.2 express 静态文件夹托管
    this.app.use(express.static(this.staticDirPath));
    //1.3 自定义日志跟踪
    this.app.use(function (req, res, next) { 
      console.log('浏览器正在请求【' + req.originalUrl + '】');
      next();
    });
  }

  /**
   * 挂载路由
   */
  regRouting(){
    this.app.get('/getNoteBookData', this.getNoteBookData);
    // this.app.post('/addGenesis',this.addGenesis);
    // this.app.post('/addNormalBlock', this.addNote);
    this.app.get('/checkNoteData',this.checkNoteData);
    // this.app.use(notFind)
  }

  // 获取所有的区块数组数据
  getNoteBookData(req, res){
    var jsonList = NoteBook.getSingle().blockList
    res.send(jsonList)
  }

  // 2.2 新增创世区块
  addGenesis(req, res){
    let body = req.body.content
    let newBlock = NoteBook.getSingle().addGenesis(content)
    let bsMsg = new BSMsg( BSMsg.StateType.ok,newBlock)
    res.send(msg)
  }

  addNormalBlock(req, res){
    let body = req.body.content
    let newBlock = NoteBook.getSingle().addNormalBlock(content)
    var bsMsg = new BSMsg(BSMsg.StateType.Ok, newBlock);
    res.send(bsMsg);
  }

  // 2.3 校验区块账本数据
  checkNoteData(req, res) {
    let result = NoteBook.getSingle().check()
    var isOk = result.length == 0 ? BSMsg.StateType.Ok : BSMsg.StateType.Fail
    var bsMsg = new BSMsg(isOk, result)
    res.send(bsMsg)
  }


  startWebServer() { 
    this.app.listen(this.appUtils.webConfig.webPort);
    console.log('网站监听已启动：' + this.appUtils.webConfig.webPort);
  }

  static getSingle(){
    if (!this.singleObj) {
      this.singleObj = new WebServer()
    }
    return this.singleObj
  }
}

WebServer.prototype.singleObj = null
let wab = WebServer.getSingle()
wab.startWebServer()