'use strict'

//add models require
let addon = require('../build/Release/addon')

//add functions from routes
function serial(req, res, next){
  //console.log('serial request');
  let cicles = Number(req.params.cicles)
  if(isNaN(cicles)){
    res
      .status(500)
      .send({message:'ingrese un número adecuado de ciclos a iterar'})
  }
  else{
    let obj = addon.serial(cicles)
    if(isNaN(obj.pi) || isNaN(obj.time)){
      res
        .status(500)
        .send({message:'Error al aproximar Pi'})
    }
    else{
      res
      .status(200)
      .send({
        "pi" : obj.pi,
        "timeTaken" : obj.time,
        "cpus" : 1,
        "cicles" : cicles
      })
    }
  }
  next()
}

function parallel(req, res, next){
  //console.log('parallel request');
  let cicles = Number(req.params.cicles)
  if(isNaN(cicles)){
    res
      .status(500)
      .send({message:'ingrese un número adecuado de ciclos a iterar'})
  }
  else{
    let obj = addon.parallel(cicles)
    if(isNaN(obj.pi) || isNaN(obj.time) || isNaN(obj.cpus)){
      res
        .status(500)
        .send({message:'Error al aproximar Pi'})
    }
    else{
      res
      .status(200)
      .send({
        "pi" : obj.pi,
        "timeTaken" : obj.time,
        "cpus" : obj.cpus,
        "cicles" : cicles
      })
    }
  }
  next()
}

function multi_parallel(req, res, next){

    let x = new Array();
    let n = [10000000,100000000,1000000000,2000000000]
    for (var i = 0; i < n.length; i++) {
        for (var j = 0; j < 10; j++) {
          let obj = addon.parallel(n[i])
          x.push(obj)
          console.log(obj)
        }
    }
    res
    .status(200)
    .send(
        JSON.parse(JSON.stringify(x))
    )
    next()
}

function multi_serial(req, res, next){

    let x = new Array();
    let n = [10000000,100000000,1000000000,2000000000]
    for (var i = 0; i < n.length; i++) {
        for (var j = 0; j < 10; j++) {
          let obj = addon.serial(n[i])
          obj.cicles = n[i]
          x.push(obj)
          console.log(obj)
        }
    }
    res
    .status(200)
    .send(
        JSON.parse(JSON.stringify(x))
    )
    next()
}

function multi(req, res, next){
    let x = new Array();
    let n = [10000000,100000000,1000000000,2000000000]
    for (var i = 0; i < n.length; i++) {
        for (var j = 0; j < 10; j++) {
          let obj = addon.serial(n[i])
          obj.cicles = n[i]
          obj.cpus = 1
          x.push(obj)
          console.log(obj)
        }
    }
    let y = new Array();
    for (let i = 0; i < n.length; i++) {
        for (let j = 0; j < 10; j++) {
          let obj = addon.parallel(n[i])
          obj.cicles = n[i]
          y.push(obj)
          console.log(obj)
        }
    }
    var result = new Object();
    for (let i = 0; i < x.length; i++) {
        if(x[i].cicles==10000000){
            result.medSerial1 += x[i].time / x[i].cicles
        }
        if(x[i].cicles==100000000){
            result.medSerial2 += x[i].time / x[i].cicles
        }
        if(x[i].cicles==1000000000){
            result.medSerial3 += x[i].time / x[i].cicles
        }
        if(x[i].cicles==2000000000){
            result.medSerial4 += x[i].time / x[i].cicles
        }
    }

    for (let i = 0; i < y.length; i++) {
        if(y[i].cicles==10000000){
            result.medParallel1 += y[i].time / y[i].cicles
        }
        if(y[i].cicles==100000000){
            result.medParallel2 += y[i].time / y[i].cicles
        }
        if(y[i].cicles==1000000000){
            result.medParallel3 += y[i].time / y[i].cicles
        }
        if(y[i].cicles==2000000000){
            result.medParallel4 += y[i].time / y[i].cicles
        }
    }

    result.speedUp1 = result.medSerial1 / result.medParallel1
    result.speedUp2 = result.medSerial2 / result.medParallel2
    result.speedUp3 = result.medSerial3 / result.medParallel3
    result.speedUp4 = result.medSerial4 / result.medParallel4

    result.improvement1 = 100*(1 - result.medParallel1 / result.medSerial1)
    result.improvement2 = 100*(1 - result.medParallel2 / result.medSerial2)
    result.improvement3 = 100*(1 - result.medParallel3 / result.medSerial3)
    result.improvement4 = 100*(1 - result.medParallel4 / result.medSerial4)

    result.push(x)
    result.push(y)

    res
    .status(200)
    .send(
        JSON.parse(JSON.stringify(result))
    )
    next()

}

module.exports = {
  serial,
  parallel,
  multi_serial,
  multi_parallel,
  multi
}
