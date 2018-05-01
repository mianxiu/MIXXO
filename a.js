
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
  let T = markdown.frontMatter(_readData[0], _postFile)
  let M = markdown.cover(_readData[1], _postFile)

  // 3.写入文件
  fs.writeFileSync(outPutPath + '/' + 'context.html', T + '<div class="essay-context">' + M + '</div>')
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

// 分页
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
  let b, h, s, p
  b = /<div class="_banner" style="background-image:url\(.+?\)/gm
  h = /<h3.*/
  s = /<span.*/gm
  p = /<p.*/m //摘要
  for (let i = 0; i < publicEssayFilePath.length; i++) {
    // 获取tag
    r = fs.readFileSync(publicEssayFilePath[i], 'utf-8')
    // 写入tag
    if (b.test(r)) {
      // 预览图
      li += '<div class="preview-img" style="background-image:url\(\'' + publicEssayFilePath[i].replace(/context\.html|\.\/public/g, '') + r.match(b)[0].replace(/<div class="_banner" style="background-image:url\(\'/gm, '') + '"></div>'
        + '<span>'
        + r.match(s)[0] + '\r\n'
        + r.match(s)[1] + '\r\n'
        + r.match(h)[0] + '\r\n'
        //+'<span class="summary">' + r.match(p)[0] + '</span>\r\n'
        + '</span>'
    } else {
      li += '<div>'
        + r.match(s)[0] + '\r\n'
        + r.match(s)[1] + '\r\n'
        + r.match(h)[0] + '\r\n'
        // +'<span class="summary">' + r.match(p)[0] + '</span>\r\n'
        + '</div>'
    }



    // 拼接<li>
    LI = li.replace(/<div/gm, '</li>\r\n<li>\r\n<div')
    // 按每页大小写入
    // 让分页从1计\

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
  fs.writeFileSync('./public/essay/index.html', essayResult)

}
pages()

// 复制文章图片
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

// 复制music
function pushMusic() {

  let musicAry = dirSync.loop('./source/_post/_music', 'file')
  let musicAryMtimeMs = []
  let playListAry = []
  musicAry.forEach(e => {
    // 写入歌曲的修改日期时间戳
    let ms = fs.statSync(e).mtimeMs
    musicAryMtimeMs.push(ms)

    let fileName = e.split('/')[4].slice(0, -4)
    let writePath = './public/music/' + fileName + '.mp3'
    playListAry.push('<li>' + fileName + '</li>')

    if (!fs.existsSync(writePath)) {
      fs.writeFileSync(writePath, fs.readFileSync(e))
    }
  })

  // 根据修改日期排序
  let playListContext = ''
  let sortMusicAryMtimeMs = musicAryMtimeMs
  let copyPlayListAry = playListAry
  let sortPlayList = function () {
    if (sortMusicAryMtimeMs.length > 0) {
      let index = sortMusicAryMtimeMs.indexOf(Math.max(...sortMusicAryMtimeMs))
      playListContext += playListAry[index] + '\r\n'
      // 删除最大值
      sortMusicAryMtimeMs.splice(index, 1)
      copyPlayListAry.splice(index, 1)

      sortPlayList()
    }
  }
  sortPlayList()

  let r = fs.readFileSync('./source/_layout/index.layout', 'utf-8').replace(/<%-playList-%>/mg, playListContext)
  fs.writeFileSync('./public/index.html', r)

}
pushMusic()

// gallery
function pushGallery() {
  const _gallery_path = './source/_post/_gallery'
  const _gallery_toPath = './public/gallery'
  let dir = dirSync.loop(_gallery_path, 'dir')
  let file = dirSync.loop(_gallery_path, 'file')

  dirSync.rmdirSyncloop(_gallery_toPath)

  // 复制
  const layout_dataTag = /<%-dataTag-%>/gm
  const layout_title = /<%-galleryTitle-%>/gm
  const layout_description = /<%-galleryDescription-%>/gm
  const layout_tag = /<%-galleryTag-%>/gm
  const layout_num = /<%-galleryNum-%>/gm
  const layout_banner = /<%-galleryPreview-%>/gm

  let gallery_context = ''
  dir.forEach(formPath => {
    let birthtime = fs.statSync(formPath).birthtime
    let year = birthtime.getFullYear()
    let month = birthtime.getMonth() + 1 < 10 ? '0' + (birthtime.getMonth() + 1) : birthtime.getMonth() + 1
    let date = birthtime.getDate()

    let dir_name = formPath.split('/')[4]
    let dir_path = _gallery_toPath + '/' + year + '/' + month + '/' + date + '/' + dir_name + '/'

    dirSync.createDirs(dir_path)
    // 复制图片
    dirSync.loop(formPath, 'file').forEach(e => {
      if(!/info\.json/gm.test(e)){
        fs.writeFileSync(dir_path + e.split('/').pop(), fs.readFileSync(e))
      }
    })

    // 读取info
    let info = JSON.parse(fs.readFileSync(formPath + '/info.json', 'utf-8'))
    let layout = fs.readFileSync('./source/_layout/gallery.layout', 'utf-8')
    let galleryTag = ''
    info.tag.split(/#/).forEach(e=>{
      galleryTag += e !=='' ? '<span class="gallery-tag"><em>#</em>'+ e + '</span>' : e 
    })

    gallery_context += layout.replace(layout_dataTag, info.tag)
      .replace(layout_title, dir_name)
      .replace(layout_description, info.description)
      .replace(layout_tag,galleryTag)
      .replace(layout_num, 12)
      .replace(layout_banner, dir_path.replace(/\.\/public/, '.') + info.banner)
  })

  fs.writeFileSync( _gallery_toPath + '/index.html','<div id="gallery"><div class="gallery-toggle-tags" data-toggle-tag=""></div>'+gallery_context+'</div>')
}
pushGallery()