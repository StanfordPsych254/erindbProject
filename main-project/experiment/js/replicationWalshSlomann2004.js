// -------- helper functions ----------
function rep(obj, n) {
  return new Array(nBlocks).fill("block");
}
var startTime = (new Date()).getTime();
function time() {
  var now = (new Date()).getTime();
  return now - startTime;
}
function pronoun(genderNeutral) {
  return "<span class='" + genderNeutral + "'>" +
        genderNeutral + "</span>";
}
function setPronouns(gender) {
  switch(gender) {
    case "male":
      $(".their").html("his");
      $(".they").html("he");
      $(".them").html("him");
      break;
    case "female":
      $(".their").html("her");
      $(".they").html("she");
      $(".them").html("her");
      break;
    default:
      console.log("error 234: check gender");
  }
}
// Shows slides. We're using jQuery here - the **$** is the jQuery selector function, which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
  // Hide all slides
  $(".slide").hide();
  // Show just the slide we want to show
  $("#"+id).show();
}

// -------- items ----------
var stories = [
  {
    label: "insomnia",
    cause: {
      gerund: "worrying",
      pastPerfect: "was worried",
      negationPastPerfect: "wasn't worried"
    },
    effects: [
      {
        gerund: "difficulty in concentrating",
        pastPerfect: "had difficulty concentrating",
        negationPastPerfect: "didn't have difficulty concentrating"
      },
      {
        gerund: "insomnia",
        pastPerfect: "had insomnia",
        negationPastPerfect: "didn't have insomnia"
      }
    ]
  },
  {
    label: "fitness",
    cause: {
      gerund: "jogging regularly",
      pastPerfect: "jogged regularly"
    },
    effects: [
      {
        gerund: "a person to increase their fitness level",
        pastPerfect: pronoun("their") + " fitness level increased",
        negationPastPerfect: pronoun("their") +
              " fitness level did not increase"
      },
      {
        gerund: "a person to lose weight",
        pastPerfect: "lost weight",
        negationPastPerfect: "did not lose weight"
      }
    ]
  }
]
var qtypes = ["probability", "explanation", "probability", "probability", "probability", "probability"];
function setCauses(story) {
  var causes = $(".causalStatements").empty();
  $(causes).append($("<p>", {text: "Here are some facts:"}));
  for (var i=0; i<2; i++) {
    causes.append(
      $("<li>", {
        text: story.cause.gerund +
              " causes " +
              story.effects[i].gerund
      })
    );
  }
  $("#trial").prepend(causes);
}
function drawSlider() {
  $(".response").empty();
  $(".response").append($("<div>", {id: "slider"}));
  $(".ui-slider-handle").hide();
  $("#slider").slider({
    min: 0,
    max: 1,
    step: 0.01,
    slide: function() {
      $(".ui-slider-handle").show();
    }
  });
}
function responseError(qtype) {
  switch(qtype) {
    case "probability":
      var flickerOffId;
      var cycleLength = 1000;
      var flashLength = 500;
      var flickerOnId = setInterval(function() {
          $("#slider").css({"border-color": "red"});
          $(".sliderReference").css({color: "red"});
      }, cycleLength);
      setTimeout(function() {
        flickerOffId = setInterval(function() {
          $("#slider").css({"border-color": "#cccccc"});
          $(".sliderReference").css({color: "black"});
        }, cycleLength);
      }, flashLength);
      $("#slider").click(function() {
        $(".sliderReference").css({color: "black"});
        $("#slider").css({"border-color": "#cccccc"});
        clearInterval(flickerOffId);
        clearInterval(flickerOnId);
      })
      $(".err").html("To answer, click on the <span class='sliderReference'>slider</span> above.");
      break;
    case "explanation":
      $(".err").html([
        "That's probably a reasonable response, but our parser can't handle it.",
        "Please try to phrase your response in a simpler way.",
        "And make sure you write *something*!",
        "Thank you for your patience!"].join(" "));
      break;
    default:
      console.log("13245: whoops. your qtype=" + qtype);
  }
  $(".err").show();
}

// -------- experiment structure ----------
var experiment = {
  state: {
    trialnum: -1,
    responsenum: -1,
    blocknum: -1,
    blockN: -1,
    qnum: -1,
    storyLabel: "",
    name: "",
    gender: "",
    next: function() {
      experiment.nextBlock();
    }
  },
  /// experiment slides
  instructions: function() {
    showSlide("instructions");
    $(".start").click(function() {
      $(this).unbind("click");
      experiment.state.next();
    })
  },
  block: function() {
    experiment.state.blocknum++;
    experiment.state.blockN = 5;
    experiment.state.qnum = -1;
    var story = stories.shift();
    experiment.state.story = story.label;
    setCauses(story);
    experiment.question();
  },
  question: function() {
    $(".err").hide();
    experiment.state.qnum++;
    var qtype = qtypes[experiment.state.qnum];
    experiment.state.qtype = qtype;

    experiment.state.next = function() {
      var responseValid = experiment.logResponse(qtype);
      if (responseValid) {
        return experiment.question();
      } else {
        responseError(qtype)
      }
    };
    if (experiment.state.qnum == experiment.state.blockN - 1) {
      experiment.state.next = function() {
        var responseValid = experiment.logResponse(qtype);
        if (responseValid) {
          return experiment.nextBlock();
        } else {
          responseError(qtype)
        }
      }
    }
    showSlide("trial");
    switch(experiment.state.qnum) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      default:
        console.log("error 235: you shouldn't have gotten here. qnum=" +
              experiment.state.qnum);
    }
    drawSlider();
    var name = names.shift();
    setPronouns(name.gender);
  },
  logResponse: function(qtype) {
    return false;
  },
  finished: function() {
    clearInterval(mouseLoggerId);
    showSlide("finished");
  },
  /// experiment functions
  /// (to get from one slide to the next or to skip ahead)
  nextBlock: function() {
    var state = experimentStates.shift();
    experiment[state]();
  },
  skip: function(n) {
    for (var i=0; i<n; i++) {
      experiment.state.next();
    }
  }
};

// -------- run experiment ----------
var nBlocks = stories.length;
var experimentStates = ["instructions"].concat(
      rep("block", nBlocks)
    ).concat(["finished"]);

$(document).ready(function() {
  experiment.state.next();
})

///// record all the events
var x = 0;
var y = 0;
var events = [];

var slideLeftMargin = parseFloat($(".slide").css("margin-left")) +
      parseFloat($(".slide").css("padding-left"))

document.onmousemove = function(e) {
  x = (e.pageX - slideLeftMargin) / $(".slide").width();
  y = e.pageY / $(".slide").height();
};
$(document).click(function(e) {
  events.push({
        type: "click",
        x: x,
        y: y,
        time: time()
  });
});
$(document).keyup(function(e){
  events.push({
        type: "keyup",
        keyCode: e.keyCode,
        key: String.fromCharCode(e.keyCode),
        time: time()
  });
});
var mouseLoggerId;
$(document).ready(function() {
  $(".continue").click(function() {
    $(this).unbind("click");
    this.blur();
    events.push({
          type: "click",
          x: x,
          y: y,
          time: time()
    });
    experiment.next();
  });
  mouseLoggerId = setInterval(function(e) {
    events.push({
          type: "position",
          x: x,
          y: y,
          time: time()
    });
  }, 50);
});