import localForage from 'localforage'
// 该库的方法全部采用异步，返回Promise对象
export function setLocalForage(key, data, cb, cb2) {
  localForage.setItem(key, data).then((value) => {
    if (cb) cb(value)
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function getLocalForage(key, cb) {
  localForage.getItem(key, (err, value) => {
    cb(err, value)
  })
}

export function removeLocalForage(key, cb, cb2) {
  localForage.removeItem(key).then(function() {
    if (cb) cb()
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function clearLocalForage(cb, cb2) {
  // 清空IndexedDB
  localForage.clear().then(function() {
    if (cb) cb()
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function lengthLocalForage(cb) {
  // IndexedDB的长度
  localForage.length().then(
    numberOfKeys => {
      if (cb) cb(numberOfKeys)
      console.log(numberOfKeys)
    }).catch(function(err) {
    console.log(err)
  })
}

export function iteratorLocalForage() {
  // 遍历IndexedDB
  localForage.iterate(function(value, key, iterationNumber) {
    console.log([key, value])
  }).then(function() {
    console.log('Iteration has completed')
  }).catch(function(err) {
    console.log(err)
  })
}

export function support() {
  // 判断是否支持IndexedDB
  const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || null
  if (indexedDB) {
    return true
  } else {
    return false
  }
}
