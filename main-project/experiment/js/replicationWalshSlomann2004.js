// -------- helper functions ----------
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
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
// Shows slides. We're using jQuery here - the **$** is the jQuery selector function, which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
  // Hide all slides
  $(".slide").hide();
  // Show just the slide we want to show
  $("#"+id).show();
}
function negate(explanation) {
  return "it is not the case that " + explanation;
}
function resolveCorefs(response, name) {
	response = response.replace(name.Name, pronoun("they"));
  // todo: use nlp tools like https://github.com/desmond-ong/colorMeText
	// todo: fix her(pos) vs her(obj) ambiguity and name(subj) vs name(obj) ambiguity
	return(response);
}

// -------- items ----------
var stories = _.shuffle([
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
        pastPerfect: pronoun("they") + " had difficulty concentrating",
        negationPastPerfect: pronoun("they") + " didn't have difficulty concentrating"
      },
      {
        gerund: "insomnia",
        pastPerfect: pronoun("they") + " had insomnia",
        negationPastPerfect: pronoun("they") + " didn't have insomnia"
      }
    ]
  },
  {
    label: "fitness",
    cause: {
      gerund: "jogging regularly",
      pastPerfect: "jogged regularly",
      negationPastPerfect: "did not jog regularly"
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
        pastPerfect: pronoun("they") + " lost weight",
        negationPastPerfect: pronoun("they") + " did not lose weight"
      }
    ]
  }
])
var qtypes = ["probability", "explanation", "probability", "probability", "probability", "probability"];
function setCauses(story) {
  var causes = $(".causalStatements").empty();
  $(causes).append($("<p>", {text: "Here are some facts:"}));
  for (var i=0; i<2; i++) {
    causes.append(
      $("<li>", {
        text: story.cause.gerund.capitalize() +
              " causes " +
              story.effects[i].gerund + 
              "."
      })
    );
  }
  $("#trial").prepend(causes);
}

// -------- drawing functions ----------
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
function drawSlider() {
  experiment.state.sliderValue = -1;
  $("#sliderContainer").remove();
  var sliderContainer = $("<div>", {id: "sliderContainer"});
  $(sliderContainer).append($("<div>", {text: "extremely unlikely", class: "left"}));
  $(sliderContainer).append($("<div>", {text: "extremely likely", class: "right"}));
  $(sliderContainer).append($("<div>", {id: "slider"}));
  $(".response").append(sliderContainer);
  $(".ui-slider-handle").hide();
  $("#slider").slider({
    min: 0,
    max: 1,
    step: 0.01,
    slide: function(event, ui) {
      $(".ui-slider-handle").show();
      experiment.state.sliderValue = ui.value;
      experiment.data.events.push({
        type: "slider",
        time: time(),
        value: ui.value
      })
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
  // log data to send to mturk here
  data: {
    trials: [],
    events: [],
    randomSeed: aRandomSeed,
  },
  // store state information here
  state: {
    trialnum: -1,
    responsenum: -1,
    blocknum: -1,
    blockN: -1,
    qnum: -1,
    storyLabel: "",
    story: {},
    sliderValue: -1,
    name: "",
    gender: "",
    next: function() {
      experiment.nextBlock();
    }
  },
  // first slide (instructions)
  instructions: function() {
    showSlide("instructions");
    $(".start").click(function() {
      $(this).unbind("click");
      experiment.state.next();
    })
  },
  // run at start of block
  block: function() {
    experiment.state.blocknum++;
    experiment.state.blockN = 6;
    experiment.state.qnum = -1;
    var story = stories.shift();
    experiment.state.story = story;
    experiment.state.story.effects = _.shuffle(story.effects);
    experiment.state.storyLabel = story.label;
    setCauses(story);
    experiment.question();
  },
  // run at start of trial (once for every response)
  question: function() {
    experiment.state.qnum++;
    var qtype = qtypes[experiment.state.qnum];
    experiment.state.qtype = qtype;
    var story = experiment.state.story;
    experiment.state.next = function() {
      var responseValid = experiment.logResponse(qtype);
      if (responseValid) {
        (experiment.state.qnum == experiment.state.blockN - 1) ?
              experiment.nextBlock() :
              experiment.question();
      } else {
        responseError(qtype)
      }
    }
    $(".err").hide();
    showSlide("trial");
    var name;
    if (experiment.state.qnum != 2) {
      $(".response").empty();
      name = names.shift();
      experiment.state.name = name;
    } else {
      name = experiment.state.name;
    }
    var prompt;
    switch(experiment.state.qnum) {
      case 0:
        prompt = $("<p>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + ".",
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      case 1:
        prompt = $("<p>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect,
                "but",
                story.effects[1].negationPastPerfect + ".",
                "Why?"
              ].join(" ")
        });
        break;
      case 2:
        prompt = $("<p>", {
          class: "prompt",
          html: [
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      case 3:
        prompt = $("<p>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + 
                " and you don't know whether " +
                experiment.state.explanation + ".",
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      case 4:
        prompt = $("<p>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + 
                " and " +
                negate(experiment.state.explanation) + ".",
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      case 5:
        prompt = $("<p>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + 
                " and " +
                experiment.state.explanation + ".",
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      default:
        console.log("error 235: you shouldn't have gotten here. qnum=" +
              experiment.state.qnum);
    }
    $(".response").append(prompt);
    if (qtype == "probability") {
      drawSlider();
    } else {
      var explanationResponse = $("<p>", {html: "Because <input type='text' size='35' id='explanation'></input>."});
      $(".response").append(explanationResponse);
    }
    setPronouns(name.gender);
    experiment.state.trialStartTime = time();
  },
  logResponse: function(qtype) {
    var responseTime = time();
    switch(qtype) {
      case "probability":
        var response = experiment.state.sliderValue;
        if (response>=0 & response <=1) {
          experiment.data.trials.push({
            response: response,
            time: responseTime,
            rt: responseTime - experiment.state.trialStartTime,
            qtype: qtype,
            story: experiment.state.storyLabel,
            name: experiment.state.name,
            trialnum: experiment.state.trialnum,
            qnum: experiment.state.qnum,
            blocknum: experiment.state.blocknum
          });
          return true;
        } else {
          return false;
        }
        break;
      case "explanation":
      	var response = $("#explanation").val();
      	experiment.state.explanation = resolveCorefs(response, experiment.state.name);
      	if (response.length > 0) {
      		// log response
      		experiment.data.trials.push({
      			response: response,
      			time: responseTime,
	            rt: responseTime - experiment.state.trialStartTime,
	            qtype: qtype,
	            story: experiment.state.storyLabel,
	            name: experiment.state.name,
	            trialnum: experiment.state.trialnum,
	            qnum: experiment.state.qnum,
	            blocknum: experiment.state.blocknum
      		})
      		return true;
      	} else {
      		return false;
      	}
        break;
      default:
        console.log("error 7654: qtype=" + qtype);
    }
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

var slideLeftMargin = parseFloat($(".slide").css("margin-left")) +
      parseFloat($(".slide").css("padding-left"))

document.onmousemove = function(e) {
  x = (e.pageX - slideLeftMargin) / $(".slide").width();
  y = e.pageY / $(".slide").height();
};
$(document).click(function(e) {
  experiment.data.events.push({
        type: "click",
        x: x,
        y: y,
        time: time()
  });
});
$(document).keyup(function(e){
  experiment.data.events.push({
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
    experiment.data.events.push({
          type: "click",
          x: x,
          y: y,
          time: time()
    });
    experiment.next();
  });
  mouseLoggerId = setInterval(function(e) {
    experiment.data.events.push({
          type: "position",
          x: x,
          y: y,
          time: time()
    });
  }, 50);
});