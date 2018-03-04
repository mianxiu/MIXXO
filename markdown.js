/**
 * 
 * @param {*} fromTags 
 * @param {*} imageTag 图片名前缀，页面图片不会因为缓存错误
 */
function frontMatter(fromTags,imageTag) {
  //读取文件
  //标签匹配正则
  let reg = [

    [/^banner:.*/m, ['<div class="_banner" style="background-image:url('+ imageTag + '_', ');"></div>']],
    [/^title:.*/m, ['<h3>', '</h3>']],
    [/^date:.*/m, ['<span class="_date">', '</span>']],
    [/^tags:.*/m, ['<span class="_tags">', '</span>']],
    [/^updated:.*/m, ['<span class="_updated">', '</span>']]
  ]

  let m = ''
  // 1.开头匹配标签
  for (let i = 0; i < reg.length - 1; i++) {
    if (fromTags.match(reg[i][0]) !== null) {
      let p = fromTags.match(reg[i][0])[0].split(/:/)[1] + reg[i][1][1] + '\r\n'
      if (i == 0) {
        m += reg[i][1][0] + p
      } else {
        m += reg[i][1][0] + p
      }
    }
  }
  return m
}


/**
 * 类似markdown语法
 * image: [image:(1.jpg)]
 * link: [text](url)
 * youtube: [youtube:(Short Url,like:https://youtu.be/SAbcHKKXIrw or SAbcHKKXIrw)]
 * @param {*} fromText 
 * @param {*} imageTag 图片名前缀，页面图片不会因为缓存错误
 */
function cover(fromText,imageTag) {
  let result = ''

  
  let img, link,youtube
  img = /\!\[\]\(.+?\)|\!\[.+?\]\(.+?\)/
  link = /\[.+?\]\(.+?\)/
  youtube = /\[youtube:\(.+?\)\]/g
  fromText.split(/\r\n/).forEach(e => {
    // 匹配image标签
    if (img.test(e)) {
      // result += '<img style="width:100%;" src="' + imageTag + '_' + e.match(img)[0].slice(8, -2) + '">\r\n'
      let m;
      let toImg = function(e){
          if(img.test(e)){
            let s = imageTag + '_' + e.match(img)[0].match(/\(.+\)/)[0].slice(1,-1)
            let alt = e.match(img)[0].match(/\[.+\]/)
            console.log(alt)
            if(alt !== null){
              m = e.replace(img, '<img style="" src="' + s + '"'+ 'alt="'+ alt[0].slice(1,-1) +'">')
            }else{
              m = e.replace(img, '<img style="" src="' + s + '">')

            }
            // console.log(r)  
            toImg(m)
          }
      }       
      toImg(e)
        result += '<p>'+ m + '</p>\r\n' 
      
    }
    // 匹配link标签
    
    else if (link.test(e)) {
      let r;
      let toLink = function(e){
          if(link.test(e)){
            let s = e.match(link)[0].slice(1,-1).split('](')
            r = e.replace(link,'<a href="' + s[1] + '" target="_blank">'+ s[0] + '</a>')
            // console.log(r)  
            toLink(r)
          }
      }       
        toLink(e)
        result += '<p>'+ r + '</p>\r\n' 
    }
    else if(youtube.test(e)){
      let y = e.match(youtube)[0].slice(-13,-2)
      console.log(y)
      result += '<iframe class="_iframe" width="680" height="384" src="https://www.youtube-nocookie.com/embed/' + y +'?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
    }
    // 其他文本加<p>
    else if (e !== '' && (!img.test(e)))
      result += '<p>' + e + '</p>\r\n'
  })

  return result
}


exports.frontMatter = frontMatter
exports.cover = cover