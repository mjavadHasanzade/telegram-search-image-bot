const getMessageType = (message) => {
  var keys = Object.keys(message);
  var messageType = keys.pop();
  if (messageType === "entities") return "text";
  return messageType;
};
  
module.exports = getMessageType;
