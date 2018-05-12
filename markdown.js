/**
 * 
 * @param {*} fromTags 
 * @param {*} imageTag 图片名前缀，页面图片不会因为缓存错误
 */
function frontMatter(fromTags, imageTag) {
  //读取文件
  //标签匹配正则
  let reg = [
    [/^banner:.*/m, ['<div class="_banner" style="background-image:url(\'' + imageTag + '_', '\');"></div>']],
    [/^title:.*/m, ['<h1 class="essay-title">', '</h1>']],
    [/^date:.*/m, ['<span class="_date">', '</span>']],
    [/^tags:.*/m, ['<span class="_tags"><em>#</em>', '</span>']],
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
  let dateRegex = /\d.+\/\d.+\/\d.+?/gm
  let options = {
    year: "numeric", month: "short",
    day: "numeric"
  }
  m = m.replace(dateRegex, new Date(m.match(dateRegex)[0].replace(/\//, ',')).toLocaleTimeString('en-us', options).replace(/, 12:00:00 AM/gm, ''))
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
  let heading, h1, h2, h3, h4, h5, h6, img, link, code, youtube, p
  heading = {
    h1: '^# .+',
    h2: '^## .+',
    h3: '^### .+',
    h4: '^#### .+',
    h5: '^##### .+',
    h6: '^###### .+'
  }

  img = /\!\[\]\(.+?\)|\!\[.+?\]\(.+?\)/
  link = /\[(?!<a).+?\]\((?!<a).+?[^]]?\)(?!\])/
  footNote = {
    'fn': /\[\^.+?\](?!:)/,
    'fnref': /\[\^.+?\]:/
  }
  ul = /^\- .+\r\n/m
  ol = /^\d+\. .+\r\n/m
  del = /~~.+?~~/m
  blod = /\*\*.+?\*\*/m
  italics = /\*.+?\*/m
  blockquote = /^>.+/m
  youtube = /\[youtube:\(.+?\)\]/g
  code = /`+.+?`+/g
  codePre = /^```$/m
  p = /^(?!<[^a])[^\r\n].*/gm
  line = /^\*\*\*+$|^\-\-\-+$|^\_\_\_+$/gm

  let loop = function (text) {
    // 标题
    let _heading = function (e) {
      for (const i in heading) {
        let r = new RegExp(heading[i], 'm')
        if (r.test(e)) {
          let t = '<' + i + '>' + e.match(r)[0].replace(/^#+ +?/, '') + '</' + i + '>'
          result = e.replace(r, t)
          _heading(result)
        }
      }
    }
    _heading(text)

    // 图片
    let _toImg = function (e) {
      if (img.test(e)) {
        let i = e.match(img)[0].split('](')
        result = e.replace(img, '<img src="' + imageTag + '_' + i[1].slice(0, -1) + '" alt="' + i[0].slice(2) + '">')
        _toImg(result)
      }
    }
    _toImg(result)

    // 分隔线
    let _toLine = function (e) {
      if (line.test(e)) {
        result = e.replace(line, '<hr color="#f9f9f9">')
      }
    }
    _toLine(result)



    // 无序列表
    let _toList = function (e) {
      let _toUl = function (e) {
        if (ul.test(e)) {
          result = e.replace(ul, e.match(ul)[0].replace(/\r\n(?!(^\r\n))/m, '<%-ul-%>'))
          _toUl(result)
          //debugger  
        }
      }
      _toUl(e)

      let ulreg = /- .+?\<%\-ul\-%><%\-ul\-%>/
      let _toUlLoop = function (e) {
        if (ulreg.test(e)) {
          result = e.replace(ulreg, '<ul>' + e.match(ulreg)[0].slice(0, -8)
            .replace(/- /g, '<li>')
            .replace(/<%-ul-%>/g, '</li>')
            + '</ul>\r\n')
          _toUlLoop(result)
        }
      }
      _toUlLoop(result)
      result = result.replace(/<%-ul-%>/g, '\r\n')
    }
    _toList(result)


    
    // 脚注
    let footNum = 0;
    let _tofootNote = function (e) {
      if (footNote.fn.test(e)) {
          let reg = function (match) {
            let r = {
              '^': '\\^',
              '[': '\\[',
              ']': '\\]'
            }
            return r[match]
          }
          let a = e.match(footNote.fn)[0]
          let f = new RegExp(a.replace(/\[|\]|\^/g, reg))
          let l = e.match(/\[\^.+?\](?!:)/g).length
          let y = a.slice(2, -1)
          result = e.replace(f, '<sup class="foot-note"><a href="#fn-' + y + '" id="fnref-' + y + '">' + y + '</a></sup>')
          
          if (footNote.fnref.test(e)) {
            let b = new RegExp(e.match(footNote.fnref)[0].replace(/\[|\]|\^/g, reg) + '.+')
            let c = e.match(b)[0].split(/]:/)[0]
            let d = e.match(b)[0].split(/]:/)[1]
            let g =  c.slice(2)
            if (footNum < 1) {
              result = e.replace(b, '<ol class="fn-ol"><li id="fn-' + g + '">' + d + '<a class="fnref" href="#fnref-' + g + '">↩</a></li>')
            }
            else {
              result = e.replace(b, '<li id="fn-' + g + '">' + d + '<a class="fnref" href="#fnref-' + g + '">↩</a></li>')
            } 
          }
          footNum +=1
          _tofootNote(result)
        }
    }
    
    _tofootNote(result)
    

    // 链接
    let _toLink = function (e) {
      if (link.test(e)) {
        let i = e.match(link)[0].split('](')
        result = e.replace(link, '<a href="' + i[1].slice(0, -1) + '" target="_blank">' + i[0].slice(1) + '</a>')
        _toLink(result)
      }
    }
    _toLink(result)




    // 有序列表
    let _toList2 = function (e) {
      let _toOl = function (e) {
        if (ol.test(e)) {
          result = e.replace(ol, e.match(ol)[0].replace(/\r\n(?!(^\r\n))/m, '<%-ol-%>'))
          _toOl(result)
          //debugger  
        }
      }
      _toOl(e)

      let olreg = /\d+\. .+?\<%\-ol\-%><%\-ol\-%>/
      let _toOlLoop = function (e) {
        if (olreg.test(e)) {
          result = e.replace(olreg, '<ol>' + e.match(olreg)[0].slice(0, -8)
            .replace(/\d+\. /g, '<li>')
            .replace(/<%-ol-%>/g, '</li>')
            + '</ol>\r\n')
          _toOlLoop(result)
        }
      }
      _toOlLoop(result)
      result = result.replace(/<%-ol-%>/g, '\r\n')
    }
    _toList2(result)

    // 删除线
    let _toDel = function (e) {
      if (del.test(result)) {
        result = result.replace(del, '<s>' + result.match(del)[0].slice(2, -2) + '</s>')
        _toDel(result)
      }
    }
    _toDel(result)

    //  加粗
    let _toBold = function (e) {
      if (blod.test(result)) {
        result = result.replace(blod, '<b>' + result.match(blod)[0].slice(2, -2) + '</b>')
        _toBold(result)
      }
    }
    _toBold(result)


    // 斜体
    let _toItalics = function (e) {
      if (italics.test(result)) {
        result = result.replace(italics, '<em>' + result.match(italics)[0].slice(1, -1) + '</em>')
        _toItalics(result)
      }
    }
    _toItalics(result)

    // 引用
    let _toBlockQuote = function (e) {
      if (blockquote.test(e)) {
        result = result.replace(blockquote, '<blockquote>' + e.match(blockquote)[0].slice(1) + '</blockquote>')
        _toBlockQuote(result)
      }
    }
    _toBlockQuote(result)

    // 代码块
    let _toCodePre = function (e) {
      if (codePre.test(e)) {
        let p = e.match(/^```$/gm)
        for (let i = 1; i < p.length + 1; i++) {
          if (i % 2 !== 0) {
            result = result.replace(codePre, '<pre><code>')
          } else {
            result = result.replace(codePre, '</code></pre>')
          }
        }
      }
    }
    _toCodePre(result)


    // 代码单字
    let _toCode = function (e) {
      if (code.test(e)) {
        e.match(code).forEach(c => {
          result = result.replace(c, '<code class="code">' + c.slice(1, -1) + '</code>')
        })
      }
    }
    _toCode(result)


    // 转youtube
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
    let _toAnother = function (e) {
      let r = ''
      e.split('\r\n').forEach(el => {
        if (el !== '') {
          r += el + '<%-br-%>'
        }
      })

      let pre = /<pre><code>.+?<\/code><\/pre>/mg
      let preAry = []
      if (pre.test(r)) {
        r.match(pre).forEach(e => {
          preAry.push(e)
        })
      }


      // 转段落
      r = r.replace(new RegExp(pre), '<%-pre-%>')
      r = r.replace(/\<%-br-%\>/g, '\r\n')
      let _toP = function (e) {
        let pAry = []
        if (p.test(e)) {
          e.match(p).forEach(el => {
            pAry.push(el)
          })
          r = e.replace(p, '<%-p-%>')
        }
        //debugger
        for (let i = 0; i < pAry.length; i++) {
          r = r.replace(/\<%\-p-\%\>/m, '<p>' + pAry[i] + '</p>')
        }
      }
      _toP(r)



      preAry.forEach(e => {
        r = r.replace(/\<%-pre-%\>/, '<pre><code>'
          + e.slice(11, -13).replace(/<(?!%)/g, '&lt;')
          + '</code></pre>')
        r = r.replace(/\<%-br-%\>/g, '\r\n')
      })
      result = r
    }
    _toAnother(result)

    
  }


  loop(fromText)
  //console.log(result)
  return result

}

exports.frontMatter = frontMatter
exports.cover = cover