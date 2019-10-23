// pages/find/find.js
var absData = require('../../data/AbilityModel.js');
var bbData = require('../../data/BBModel.js');
var bbsData = require('../../data/bbsModel.js');

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
      console.log(this.data.index)
      console.log(this.data.selectedBB)
    })
  },

  getImgs: function() {
    var arr = [''];
    // console.log(bbData);
    bbsData.bbsModel.forEach((item) => {
      arr.push(item.name)
    })
    wx.getStorage({
      key: 'bbdata',
      success: (res) => {
        var newbbData = res.data.concat(bbData.BBModel)
        console.log(newbbData)
        this.setData({
          imgs: absData.AbilityModel,
          BB: newbbData,
          array: arr,
        })
      },
    })

  },

  showAbs: function() {
    var newAbs = this.getAbsIcons(this.data.selectedAbs);
    // console.log(newAbs)
    // console.log(this.data.selectedAbs)

    this.setData({
      showAbs: newAbs
    })

  },
  storeData: function() {


    var arr = [];
    var selectedBB = this.data.selectedBB;
    var abs = this.data.selectedAbs;
    arr.push({
      name: selectedBB,
      abilities: abs,
    })

    wx.getStorage({
      key: 'bbdata',
      success: (res) => {
        // console.log(res.data)
        var newArr = arr.concat(res.data);
        console.log(newArr);
        wx.setStorage({
          key: 'bbdata',
          data: newArr,
          success: () => {
            var newbbData = newArr.concat(bbData.BBModel)
            this.setData({
              BB: newbbData,
            })
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })


  },
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
  deleteHandler: function(e) {

    var newID = e.target.dataset.newid;
    if (newID >= 0) {
      console.log(newID);
      var sbs = this.data.selectedAbs;

      sbs.splice(newID, 1);
      console.log(sbs);
      this.setData({
        selectedAbs: sbs
      }, () => {
        this.searchShow(this.getAbs());
        this.showAbs()
      })
    }
  },

  clearAbsHandler: function() {
    this.setData({
      selectedAbs: []
    }, () => {
      this.searchShow(this.getAbs());
      this.showAbs()
    })
  },

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