/**
 * 
 * @param {*} fromTags 
 * @param {*} imageTag 图片名前缀，页面图片不会因为缓存错误
 */
function frontMatter(fromTags, imageTag) {
  //读取文件
  //标签匹配正则
  let reg = [

    [/^banner:.*/m, ['<div class="_banner" style="background-image:url(' + imageTag + '_', ');"></div>']],
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
function cover(fromText, imageTag) {
  let result = fromText
  let heading, h1, h2, h3, h4, h5, h6, img, link,code , youtube, p
  heading = {
    h1: '^# .+',
    h2: '^## .+',
    h3: '^### .+',
    h4: '^#### .+',
    h5: '^##### .+',
    h6: '^###### .+'
  }

  img = /\!\[\]\(.+?\)|\!\[.+?\]\(.+?\)/
  link = /\[(?!<a).+?\]\((?!<a).+[^]]?\)(?!\])/
  youtube = /\[youtube:\(.+?\)\]/g
  code = /`+.+?`+/g
  codePre = /^```$/m
  p = /^(?!<[^a])[^\r\n].*/gm

  let loop = function (text) {

    let _heading = function (e) {
      for (const i in heading) {
        let r = new RegExp(heading[i], 'm')
        if (r.test(e)) {
          let t = '<' + i + '>' + e.match(r)[0].replace(/^#+ +?/, '') + '</' + i + '>\r\n'
          result = e.replace(r, t)
          _heading(result)
        }
      }
    }
    _heading(text)


    let _toImg = function (e) {
      if (img.test(e)) {
        let i = e.match(img)[0].split('](')
        result = e.replace(img, '<img src="' + imageTag + '_' + i[1].slice(0, -1) + '" alt="' + i[0].slice(2) + '">')
        _toImg(result)
      }
    }
    _toImg(result)


    let _toLink = function (e) {
      if (link.test(e)) {
        let i = e.match(link)[0].split('](')
        result = e.replace(link, '<a href="' + i[1].slice(0, -1) + '" target="_blank">' + i[0].slice(1) + '</a>')
        _toLink(result)
      }
    }
    _toLink(result)

    let _toCodePre = function (e) {
      let p = e.match(/^```$/gm)
      for(let i=1;i<p.length+1;i++){
        if(i%2 !== 0){
          result = result.replace(codePre,'<pre>')
        }else{
          result = result.replace(codePre,'</pre>')      
        }
      }     
    }
    _toCodePre(result)

    let _toCode = function (e) {
      if (code.test(e)) {
        e.match(code).forEach(c=>{         
          result = result.replace(c, '<code>' + c.slice(1,-1) + '</code>')    
        })          
      }
    }
    _toCode(result)

    

    let _toYoutube = function (e) {
      if (youtube.test(e)) {
        result = e.replace(youtube,
          '<iframe class="_youtube" width="680" height="384" src="https://www.youtube-nocookie.com/embed/'
          + e.match(youtube)[0].slice(10, -2).split('/').pop()
          + '?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>')
        _toYoutube(result)
      }
    }
    _toYoutube(result)

 // 
    let _toP = function (e) {
      let r = ''
      e.split('\r\n').forEach(el=>{
        if(el!==''){
          r += el + '<%-br-%>'
        }
      })

      let pre = /<pre>.+?<\/pre>/mg
      let preAry = []
      r.match(pre).forEach(e=>{
        preAry.push(e)
      })
      r = r.replace(new RegExp(pre),'<%-pre-%>')
      r = r.replace(/\<%-br-%\>/g,'\r\n')

      if(p.test(r)){
        r.match(p).forEach(e=>{
          if(!/^<[^a].+>/m.test(e)){
            r = r.replace(e,'<p>' + e + '</p>')
          }  
        })
      }

      preAry.forEach(e=>{
        r = r.replace(/\<%-pre-%\>/,'<pre>'
        +e.slice(5,-6).replace(/<(?!%)/g,'&lt;')
        +'</pre>')
        r = r.replace(/\<%-br-%\>/g,'\r\n')
      })
      
      console.log(preAry)
      console.log(r)
      result = r
    }
    _toP(result)
    
}


  loop(fromText)
  //console.log(result)
  return result

}

exports.frontMatter = frontMatter
exports.cover = cover