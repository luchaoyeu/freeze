// pages/comment/comment.js
const db=wx.cloud.database({
  env:"web-clude-01-souby"
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieid:0,    //电影的id
    detail:{} ,     //电影的详细信息
    content:'' ,     //评论的初始值
    score:2    ,        //初始值5
    images:[] ,             //保存用户选中的图片
    fileIds:[]
  },
  submit:function(){
    //1.一次上传九张图片
    wx.showLoading({
      title: '评论中',
    });
    console.log(this.data.content+"_"+this.data.score);
    //2.上传图片到云存储
    //3.创建promise数组
    let promiseArr=[];
    //4.创建循环9次
    for(let i=0;i<this.data.images.length;i++){
      //5.创建promise  push数组中
      promiseArr.push(new Promise((resolve,reject)=>{
      //5.1获取当前上传的图片
      var item=this.data.images[i];
      //5.2创建正则表达式分析文件后缀  .jpg  .png
      let suffix=/\.\w+s/.exec(item)[0];
      //5.3 上传图片
        wx.cloud.uploadFile({
          cloudPath:new Date().getTime()+suffix,  //上传至云端的路径
          filePath:item,   //小程序临时路径
          success:res=>{
            console.log(res.fileID);
            //将当前文件id保存data
            var ids=this.data.fileIds.concat(res.fileID);
            this.setData({
              fileIds:ids
            })
            //5.4   上传图片到云存储
           //5.5追加任务；列表
          },
          faill:err=>{
            console.log(err);
          }
        })
      
      //5.6失败显示出错信息
      }));
    }
    //一次性将图片  fileID保存到集合中[集合中一条记录]
    Promise.all(promiseArr).then(res=>{
      //6.1添加数据
      db.database("comment").add({
      data:{
        content:this.data.content,    //评论内容
        score:this.data.score,  //评论分数
        moveid:this.data.movieid,   //电影id
        fileIds:this.data.fileIds   //上传图片id
      }
    }).then(res=>{
      wx.hideLoading();
      wx.showToast({
        title:'评价成功',
      })
    }).catch(err=>{
      wx.hideLoading();
      wx.showToast({
        title: '评价失败',
    })
    })
    })
    },
    
  uploadImg:function(){
    //上传图片
    wx.chooseImage({
      count:9,
      sizeType:["original","compressed"],   //原图  压缩图
      sourceType:["ablum","camera"],     //来源  相册相机
      success: res=> {               //选择 成功
        const temFiles=res.tempFilePaths;
        //预览  将用户选中图片保存好
        this.setData({
          images:temFiles
        })
      },
    })
  },
    
  onScoreChange:function(e){
    this.setData({
      score:e.detail
    })
  },
  onContentChange:function(e){

    //获取用户输入框的内容
    this.setData({
      content:e.detail
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
 

  onLoad: function (options) {
    //1.接收电影列表传递参数id并且保存data
    //console.log(options.id);
    this.setData({
      movieid:options.id
    });
    //2.提示数据加载框
    wx.showLoading({
      title: '加载中',
    });
    //3.调用云函数，将电影传递给云函数
    wx.cloud.callFunction({
      name:"getDetail2",    //云函数名称
      data:{movieid:options.id}
    }).then(res=>{
      //4.获取云函数返回数据并且保存data
      console.log(res.result);
       //4.1将字符串转js 为 obj
       var obj=JSON.parse(res.result);
       //4.2保存data
       this.setData({
         detail:obj
       })
      //5.隐藏加载框
      wx.hideLoading();
    }).catch(err=>{
      wx.hideLoading();
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})