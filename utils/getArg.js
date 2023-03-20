const getArg = (arg) => {
  const textArr = arg.split(" ");
  if (textArr.length > 1) {
    textArr.shift();
    return textArr.join(" ");
  } else {
    return "noArg";
  }
};

module.exports = getArg;
