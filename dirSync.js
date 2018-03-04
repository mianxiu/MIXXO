const fs = require('fs')

 /** 遍历所有文件/文件夹返回数组
  * path 路径
  * returnType 'file' 'dir'
  * @param {*} path 
  * @param {*} returnType 
  */
function loop(path,returnType){
  if(returnType==null){
    console.log('returnType[file][dir]')
  }
  var filesPathAarry = []
  let dirLoop = function (path){
    fs.readdirSync(path).forEach(e=>{
      if(fs.statSync(path + '/' + e).isDirectory()){
       dirLoop(path + '/' + e)
       if(returnType === 'dir'){
        filesPathAarry.push(path + '/' + e)     
      }
      }else{
        if(returnType === 'file'){
          filesPathAarry.push(path + '/' + e)
        }
      }
    })
  }
  dirLoop(path)
  return filesPathAarry
}


/**
 *清空子目录&文件
 * @param {*} path 
 */
function rmdirSyncloop(path){
  //清空public essay文件夹
  loop(path,'file').forEach(e=>{
    fs.unlinkSync(e)
})
  loop(path,'dir').forEach(e=>{
    fs.rmdirSync(e)
  })
}




/**
 * 创建文件夹函数
 * @param {*} path 
 */
function createDirs(path) {
  let _p = path.split(/\//)
  let dir = ''
  for (let i = 0; i < _p.length; i++) {
      dir += _p[i] + '/'
    if(!fs.existsSync(dir)){
      fs.mkdirSync(dir)
    }
  }
}


exports.loop = loop
exports.rmdirSyncloop = rmdirSyncloop
exports.createDirs = createDirs