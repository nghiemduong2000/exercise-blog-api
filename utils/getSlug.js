const cleanAccents = require("./cleanAccents");

const getSlug = (str) => {
  return cleanAccents(str)
    .toLowerCase()
    .replace(/\(|\)|&|:|,/g, "")
    .replace(/  /g, " ")
    .replace(/\s|'/g, "-");
};

module.exports = getSlug;
