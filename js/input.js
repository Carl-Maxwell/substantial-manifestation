Input = {
  aliases: {},
  
  alias: function(alias, keys) {
    Input[alias] = function() {
      return Input.isDown(alias);
    };

    Input.aliases[alias] = keys;
  },

  isDown: function(alias) {
    if (alias in Input.aliases) {
      return Input.aliases[alias].some((key) => {return Keyboard.isDown(key);})
    }
  },
}
