module.exports = {
  checkUser(user) {
    return !user ? true : false;
  },
  checkCommand(command) {
    command.content !== ""
      ? command.content
      : console.log("Could not find that command, skipping.");
  }
};
