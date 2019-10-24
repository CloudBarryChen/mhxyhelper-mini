// pages/find/find.js
var absData = require('../../data/AbilityModel.js');
var bbData = require('../../data/BBModel.js');
var bbsData = require('../../data/bbsModel.js');
// console.log(bbData)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [],
    selectedAbs: [],
    BB: [],
    newAbs: [],
    resBB: [],
    showAbs: [],

    array: [],

    index: 0,
    selectedBB: ''
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    if (e.detail.value) {
      var BBs = this.data.array;
      var selectedBB = BBs.find((item, index) => {
        return index == e.detail.value;
      })
      // console.log(selectedBB);
    } else {
      var selectedBB = '';
    }

    this.setData({
      index: e.detail.value,
      selectedBB: selectedBB
    }, () => {
      // console.log(this.data.index)
      // console.log(this.data.selectedBB)
    })
  },

  getImgs: function() {
    var arr = [''];
    // console.log(bbData);
    bbsData.bbsModel.forEach((item) => {
      arr.push(item.name)
    })
    // console.log(bbData);
    wx.getStorage({
      key: 'bbdata',
      success: (res) => {
        if (Array.isArray(res.data)) {
          var newbbData = res.data.concat(bbData.BBModel)
          // console.log(newbbData)
          this.setData({
            imgs: absData.AbilityModel,
            BB: newbbData,
            array: arr,
          })
        }
      },
      fail: (res) => {
        // console.log(res)
        var newbbData = bbData.BBModel
        // console.log(newbbData)
        this.setData({
          imgs: absData.AbilityModel,
          BB: newbbData,
          array: arr,
        })
      },
    })

  },

  //显示已选择的技能的图标
  showAbs: function() {
    var newAbs = this.getAbsIcons(this.data.selectedAbs);
    // console.log(newAbs)
    // console.log(this.data.selectedAbs)

    this.setData({
      showAbs: newAbs
    })

  },

  //保存数据到本地
  storeData: function() {
    var arr = [];
    var selectedBB = this.data.selectedBB;
    var abs = this.data.selectedAbs;
    var abBlank = abs.some((item) => {
      return item === '空'
    })
    if (!abBlank) {
      arr.push({
        name: selectedBB,
        abilities: abs,
      })
      // console.log(arr)
      wx.getStorage({
        key: 'bbdata',
        success: (res) => {
          // console.log(res.data)
          if (Array.isArray(res.data)) {
            var newArr = arr.concat(res.data);
            // console.log(newArr);
            wx.setStorage({
              key: 'bbdata',
              data: newArr,
              success: () => {
                var newbbData = newArr.concat(bbData.BBModel)
                this.setData({
                  BB: newbbData,
                }, () => {
                  wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                  })
                })
              }
            })
          }

        },
        fail: () => {
          var newArr = arr;
          // console.log(newArr);
          wx.setStorage({
            key: 'bbdata',
            data: newArr,
            success: () => {
              var newbbData = newArr.concat(bbData.BBModel)
              this.setData({
                BB: newbbData,
              }, () => {
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                })
              })
            }
          })
        },
        complete: () => {
          this.clearAbsHandler()
        }
      })
    } else {
      wx.showToast({
        title: '技能不能缺省！',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //提交数据
  submitHandler: function() {
    if (this.data.selectedBB && this.data.selectedAbs.length !== 0) {
      wx.showModal({
        title: '提示',
        content: '确定要提交到数据库？请注意技能是否正确',
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
            this.storeData();
          } else if (res.cancel) {
            wx.showToast({
              title: '提交取消',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '宝宝名字和技能不能为空！',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //删除技能
  deleteHandler: function(e) {

    var newID = e.target.dataset.newid;
    if (newID >= 0) {
      // console.log(newID);
      var sbs = this.data.selectedAbs;

      sbs.splice(newID, 1);
      // console.log(sbs);
      this.setData({
        selectedAbs: sbs
      }, () => {
        this.searchShow(this.getAbs());
        this.showAbs()
      })
    }
  },

  //清空技能
  clearAbsHandler: function() {
    this.setData({
      selectedAbs: [],
      resBB: [],
      showAbs: []
    }, () => {
      this.searchShow(this.getAbs());
      this.showAbs();
      wx.showToast({
        title: '清空成功',
        icon: 'none',
        duration: 1000
      })
    })
  },

  //选择技能
  selectedHandler: function(e) {
    // console.log(e.target)
    // console.log(this.data.selectedAbs)
    if (e.target.dataset.name) {
      var selectAb = e.target.dataset.name;
      // console.log(selectAb)
      // var existAb = this.data.selectedAbs || [];
      var existAb = this.data.selectedAbs || [];

      existAb.push(selectAb)

      this.setData({
        selectedAbs: existAb
      }, () => {
        // console.log(this.data.selectedAbs)
        // console.log(1)
        // console.log(this.getAbs());
        this.searchShow(this.getAbs());
        this.showAbs()
      })
    }

  },

  //技能检查
  checkAbs: function(existAbs, checkAbs, existName, checkName) {
    if (checkName === '' && checkAbs.length === 0) {
      return false;
    }
    if (checkName !== existName && checkName !== '') {
      return false;
    }
    for (let i = 0; i < checkAbs.length; i++) {

      if ((checkAbs[i] !== existAbs[i || 0]) && (checkAbs[i] !== '空')) {
        return false;
      }
    }
    return true;
  },

  //宝宝筛选
  dataFilter: function(obj) {
    // console.log(obj);
    return this.data.BB.filter((item) => {
      return this.checkAbs(item.abilities, obj.abs, item.name, obj.name);
    })
  },

  //筛选数据 事件委托
  searchShow: function(obj) {

    var res = this.dataFilter(obj);

    // console.log('res:', res)

    res.forEach(element => {

      var newAbs = this.getAbsIcons(element.abilities);

      element['newAbs'] = newAbs;
    });
    console.log(res)
    this.setData({
      resBB: res,
    }, () => {
      // console.log(this.data.resBB);
    })
  },

  getAbsIcon: function(abs) {
    return this.data.imgs.find((item) => {
      return item.name === abs;
    })
  },

  //返回带图片url的技能数组
  getAbsIcons: function(abs) {
    // console.log(this.data.newAbs);
    var newAbs = [];
    abs.forEach((item) => {
      var ab = this.getAbsIcon(item);
      // console.log(ab)
      newAbs.push(ab)
      // console.log(this)
    })
    return newAbs;
  },

  //获取选中的技能
  getAbs: function() {
    var abs = this.data.selectedAbs;
    // console.log(abs)
    var name = '';

    return {
      abs,
      name
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getImgs();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})