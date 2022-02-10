const app = getApp()
let leftHeight = 0
let rightHeight = 0
Page({
  data: {
    leftList: [],
    rightList: [],

    isLoad: false,
    page: 1,
    limit: 10,
    total: 0,

    triggered: false,
    Texts: ["没有更多数据了~", "上拉加载更多", "正在加载中..."]
  },

  onLoad () {
    this.getListData()
  },
  //用户下拉动作
  onScrollRefresh () {
    this.setData({
      leftList: [],
      rightList: [],
    }, () => {
      leftHeight = 0
      rightHeight = 0
      this.getListData()
    })
    setTimeout(() => {
      this.setData({
        triggered: false,
      })
    }, 1500);
  },
  handleScrollLower () {
    console.log('scorrll滑到底')
    if (!this.data.isLoad && (this.data.page * this.data.limit < this.data.total)) {
      this.getListData(this.data.page + 1)
    }
  },
  getListData (page = 1) {
    this.setData({
      isLoad: true
    })
    let url = `https://api.wmdb.tv/api/v1/top?type=Imdb&skip=${page}&limit=${this.data.limit}&lang=Cn`
    wx.request({
      url: url,
      data: {},
      header: { 'content-type': 'application/json' },
      method: 'GET',
      success: async (result) => {
        console.log(result)
        if (result.statusCode === 200) {
          let listArr = result.data.map(val => {
            return val.data[0]
          })
          console.log('listArr', listArr)
          let leftList = this.data.leftList
          let rightList = this.data.rightList
          for (let i = 0; i < listArr.length; i++) {
            // debugger
            console.log('this.leftHeight', leftHeight, rightHeight)
            leftHeight <= rightHeight ? leftList.push(listArr[i]) : rightList.push(listArr[i]); //判断两边高度，来觉得添加到那边
            await this.getBoxHeight(leftList, rightList);
          }

          this.setData({
            isLoad: false,
            total: 500,
            page: page + 1
          })
        }
        else {
          this.setData({
            isLoad: false
          })
        }
      },
      fail: (err) => {
        console.log('err', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
        this.setData({
          isLoad: false
        })  
      },
      complete: () => {

      }
    });
  },
  //获取左右两边高度
  getBoxHeight (leftList, rightList) {
    return new Promise((resolve) => {
      this.setData({
        leftList,
        rightList
      }, async () => {
        let query = wx.createSelectorQuery().in(this)
        // debugger
        query.select('#left').boundingClientRect();
        query.select('#right').boundingClientRect();
        //selectQuery的exec方法后，节点信息会在callback中返回
        query.exec((res) => {
          if (res[0]) {
            leftHeight = res[0].height; //获取左边列表的高度
            rightHeight = res[1].height; //获取右边列表的高度
          }
          resolve();
        });

      })
    })
  }
})
