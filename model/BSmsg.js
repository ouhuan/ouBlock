class BSMsg { 
  constructor(state,content) { 
    this.state = state;
    this.content = content;
  }
}

// 提供"枚举"对象，标示服务端操作结果
BSMsg.StateType = {
  Ok: 1,
  Fail: 2
};

module.exports = BSMsg;