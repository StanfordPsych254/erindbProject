// helper functions
function rep(obj, n) {
  return new Array(nBlocks).fill("block");
}
var startTime = (new Date()).getTime();
function time() {
  var now = (new Date()).getTime();
  return now - startTime;
}

// experiment structure
var experiment = {
  /// experiment slides
  instructions: function() {
    $("#instructions").show();
  },
  block: function() {
    var story = {};
    var blockStates = [];
  },
  /// experiment functions
  /// (to get from one slide to the next or to skip ahead)
  nextBlock: function() {
    var state = experimentStates.shift();
    experiment[state]();
  },
  next: function() {
    experiment.nextBlock();
  },
  skip: function(n) {
    for (var i=0; i<n; i++) {
      experiment.next();
    }
  }
};

// run experiment
var nBlocks = 6;
var experimentStates = ["instructions"].concat(
      rep("block", nBlocks)
    ).concat(["finished"]);

$(document).ready(function() {
  experiment.next();
})