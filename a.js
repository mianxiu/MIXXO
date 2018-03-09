
const fs = require('fs')
const dirSync = require('./dirSync')
const markdown = require('./markdown')

'use strict';

// TODO
// 

// 配置文件
let config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

//清空public essay文件夹
dirSync.rmdirSyncloop(config._publicEssayPath)




/** 
 * md转html
 * 路径默认是config.json的_essayPath
 * 参数是文件名 
 * @param {*} _postFile 
 */
function converHtml(_postFile) {

  // 读取传入的文本
  let _readData = fs.readFileSync(config._postEssayPath + _postFile, 'utf-8').split(/^---;$/m) //array

  // 0.创建以日期+标题的文件夹
  // 输出文件夹路径
  let outPutPath = './public/essay/' + _readData[0].match(/^date:.*/m)[0].split(/:/)[1] + '/' + _readData[0].match(/^title:.*/m)[0].split(/:/)[1]
  let _imagePath = './source/_post/_image/' + _postFile
  let _imageUrl = outPutPath.replace(/\/public/, '')

  // 创建文件夹
  dirSync.createDirs(outPutPath)
  dirSync.createDirs(_imagePath)


  // match tags
  let T = markdown.frontMatter(_readData[0],_postFile)
  let M = markdown.cover(_readData[1],_postFile)

  // 3.写入文件
  fs.writeFileSync(outPutPath + '/' + 'context.html', T + M)
  fs.writeFileSync(outPutPath + '/index.html', fs.readFileSync('./source/_layout/essayIndex.layout', 'utf-8'))



  // 复制图片
  // 循环对比post对比
  if (fs.existsSync(_imagePath)) {
    dirSync.loop(_imagePath, 'file').forEach(img => {
      let outImgPath = outPutPath + '/' + _postFile + '_' + img.split('/')[5]
      if (img !== null) {
        fs.writeFileSync(outImgPath, fs.readFileSync(img, Buffer))
      }
    })
  }
}


// 4.遍历post目录，输出文件
fs.readdirSync(config._postEssayPath).forEach(e => {
  if (!fs.statSync(config._postEssayPath + e).isDirectory()) {
    converHtml(e)
  }
})




function pages() {
  // 遍历文件获取路径
  let pageNumLi = ''
  let publicEssayFilePath = []
  dirSync.loop(config._publicEssayPath, 'file').forEach(e => {
    // !/\.\/public\/essay\/(index\.html|page.*)/g.test(e) && 
    if (/.*context\.html/.test(e)) {
      publicEssayFilePath.push(e)
    }
  })

  // 按最新日期翻转
  publicEssayFilePath.reverse()

  let pageNum = 1;
  let pageLiNum = 10;
  let LI = ''
  let li = ''
  let r
  let h, s, p
  h = /<h3.*/
  s = /<span.*/gm
  p = /<p.*/m
  for (let i = 0; i < publicEssayFilePath.length; i++) {
    // 获取tag
    r = fs.readFileSync(publicEssayFilePath[i], 'utf-8')
    // 写入tag
    li += r.match(h)[0] + '\r\n'
      + r.match(s)[0] + '\r\n'
      + r.match(s)[1] + '\r\n'
     // + r.match(p)[0]

    // 拼接<li>
    LI = li.replace(/<h3>/gm, '</li>\r\n<li>\r\n<h3>')
    // 按每页大小写入
    // 让分页从1计数
    if (i + 1 > pageLiNum * pageNum - 1 || i + 1 == publicEssayFilePath.length) {
      dirSync.createDirs('./public/essay/pages/' + pageNum + '/')
      fs.writeFileSync('./public/essay/pages/' + pageNum + '/index.html', LI.slice(5) + '</li>')
      pageNum += 1
      li = ''
      if (pageNum - 1 > 1) {
        pageNumLi += '<li>' + (pageNum - 1) + '</li>'
      }
    }
  }

  // 写入essay index.html
  let essayLayout = fs.readFileSync('./source/_layout/essay.layout', 'utf-8')
  let essayPage = fs.readFileSync('./public/essay/pages/1/index.html', 'utf-8')
  let essayResult = essayLayout.replace(/<%-page-%>/, essayPage).replace(/<%-pageNum-%>/, pageNumLi)
  fs.writeFileSync('./public/essay/index.html',essayResult)

}
pages()


function copyImage() {
  // 对比_essay和_image文件夹，得到多余的image文件夹
  let _imageElementArray = dirSync.loop('./source/_post/_image', 'dir')

  dirSync.loop(config._postEssayPath, 'file').forEach(E => {
    for (let i = 0; i < _imageElementArray.length; i++) {
      // 对比写入数组
      if (E.split('/')[5] === _imageElementArray[i].split('/')[4]) {
        // 删除匹配到的元素
        _imageElementArray.splice(i, 1)
      }
    }
  })


  // 重命名文件夹,合并文件夹
  _imageElementArray.forEach(fromPath => {

    let toPath = './source/_post/_image/_' + fromPath.split('/')[4]
    if (!/\_.*/.test(fromPath.split('/')[4])) {
      if (fs.existsSync(toPath)) {
        // 剪切文件  
        dirSync.loop(fromPath, 'file').forEach(e => {
          let fileName = e.split('/')[5]
          fs.existsSync(toPath + '/_' + fileName) ?
            fs.renameSync(e, toPath + '/_' + fileName) :
            fs.renameSync(e, toPath + '/' + fileName)
        })
      } else if (dirSync.loop(fromPath, 'file').length !== 0) {
        fs.renameSync(fromPath, toPath)
      }
      // 删除原文件夹
      if (fs.existsSync(fromPath) && dirSync.loop(fromPath, 'file').length === 0) {
        fs.rmdirSync(fromPath)
      }
    }
  })

}
copyImage()