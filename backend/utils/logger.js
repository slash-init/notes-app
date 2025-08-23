const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

module.exports = { info, error }

//it's a simple utility for logging messages in backend app
//info function logs regular messages using console.log
//error function logs error messages using console.error
//both functions accept any number of arguments(...params)
