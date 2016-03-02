// -------- helper functions & utilities ----------
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

// -------- nlp tools ----------
var nlp = {
  negate: function(explanation) {
    // todo: make this better using nlp tools
    if (experiment.state.parsedResponse != "NA") {
      var parse = JSON.parse(experiment.state.parsedResponse.replace(/u?'/g, '"').replace(/\n/g, ''));
      var root = parse.sentences[0]['basic-dependencies'].filter(function(x) {return x.dep=='ROOT'})[0];
      var aux = parse.sentences[0]['basic-dependencies'].filter(function(x) {return x.dep=='aux' & x.governor==root.dependent});
      var cc = parse.sentences[0]['basic-dependencies'].filter(function(x) {return x.dep=='cc' & x.governor==root.dependent}); //for when they give two sub-clauses
      var tokens = parse.sentences[0].tokens;
      if (cc.length > 0) {
        return "it is not the case that " + nlp.abstractPronouns(explanation); 
      } else if (aux.length > 0) {
        var negation = [];
        for (var i=0; i<tokens.length; i++) {
          if (tokens[i+1].word == experiment.state.explanationName) {
            negation.push('<span class=\'name\'>{{}}</span>');
          } else if (toekns[i+1].pos.startswith('PRP')) {
            // get dep to verb: obj? subj? poss?
            // find dependendencies for that word as dependent and get type
            var dependencies = parse.sentences[0]['basic-dependencies'].filter(function(x) {return x.dependent==(i+1)});
            var depTypes = dependencies.map(function(x) {return x.dep;});
            if (depType.indexOf('nsubj')>=0 | depType.indexOf('nsubjpass')>=0) {
              negation.push(pronoun('they'));
            } else if (depType.indexOf('nmod:poss')>=0) {
              negation.push(pronoun('their'));
            } else if (depType.indexOf('dobj')>=0) {
              negation.push(pronoun('them'));
            } else {
              negation.push(toekns[i].word)
            }
          } else if ((i+1)==parseInt(aux[0].dependent)) {
            negation.push('was');
            negation.push('not');
          } else {
            negation.push(tokens[i].word)
          }
        }
        return negation.join(' ').replace(' n\'t', 'n\'t')
              .replace(' \'s', '\'s')
              .replace(/\b(his|hers)\b/g, pronoun('theirs'));
      } else {
        var negation = [];
        for (var i=0; i<tokens.length; i++) {
          if (false) {
            var a = 1;
          } else if ((i+1)==parseInt(root.dependent)) {
            negation.push('did');
            negation.push('not');
            negation.push(tokens[i].lemma);
          } else {
            negation.push(tokens[i].word)
          }
        }
        return negation.join(' ').replace(' n\'t', 'n\'t')
              .replace(' \'s', '\'s')
              .replace(/\b(his|hers)\b/g, pronoun('theirs'));
      }
    } else {
      return "it is not the case that " + nlp.abstractPronouns(explanation); 
    }
  },
  abstractPronouns: function(explanation) {
    var name = experiment.state.explanationName;
    if (experiment.state.parsedResponse != "NA") {
      var parse = JSON.parse(experiment.state.parsedResponse.replace(/u?'/g, '"').replace(/\n/g, ''));
        var negation = [];
        for (var i=0; i<tokens.length; i++) {
          if (tokens[i+1].word == experiment.state.explanationName) {
            negation.push('<span class=\'name\'>{{}}</span>');
          } else if (toekns[i+1].pos.startswith('PRP')) {
            // get dep to verb: obj? subj? poss?
            // find dependendencies for that word as dependent and get type
            var dependencies = parse.sentences[0]['basic-dependencies'].filter(function(x) {return x.dependent==(i+1)});
            var depTypes = dependencies.map(function(x) {return x.dep;});
            if (depType.indexOf('nsubj')>=0 | depType.indexOf('nsubjpass')>=0) {
              negation.push(pronoun('they'));
            } else if (depType.indexOf('nmod:poss')>=0) {
              negation.push(pronoun('their'));
            } else if (depType.indexOf('dobj')>=0) {
              negation.push(pronoun('them'));
            } else {
              negation.push(toekns[i].word)
            }
          } else if ((i+1)==parseInt(aux[0].dependent)) {
            negation.push('was');
            negation.push('not');
          } else {
            negation.push(tokens[i].word)
          }
        }
        return negation.join(' ').replace(' n\'t', 'n\'t')
              .replace(' \'s', '\'s');
      var a = 1;
    } else {
      return explanation.toLowerCase().replace(/\b(he|she)\b/g, pronoun('they'))
            .replace(/\b(he|she)'s\b/g, pronoun('they')+'\'s')
            .replace(/\b(him|her)\b/g, pronoun('them'))
            .replace(/\b(his|her)\b/g, pronoun('their'))
            .replace(/\b(his|hers)\b/g, pronoun('theirs'))
            .replace((new RegExp(experiment.state.explanationName.Name.toLowerCase(), 'g')), '<span class=\'name\'>{{}}</span>')
    }
  },
  getParse: function(response, name) {
    var text = $("#explanation").val();
    $.post( 'http://erindb.me/cgi-bin/nlp.py',
            {'text': text, 'annotators': 'parse,depparse,lemma'})
      .done(function(data) {
        console.log('i posted and stuff happened.');
        console.log('the response: ' + data);
        experiment.state.parsedResponse = data;
      });

      // todo: use nlp tools like https://github.com/desmond-ong/colorMeText
      // todo: fix her(pos) vs her(obj) ambiguity and name(subj) vs name(obj) ambiguity
      return(response);
  }
}

// -------- drawing functions ----------
function setCauses() {
  var causes = $(".causalStatements").empty();
  $(causes).append($("<p>", {text: "Here are some facts:"}));
  for (var i=0; i<2; i++) {
    causes.append(
      $("<li>", {
        text: experiment.state.story.cause.gerund.capitalize() +
              " causes " +
              experiment.state.story.effects[i].gerund + 
              "."
      })
    );
  }
}
function setPronouns(gender) {
  $(".name").html(experiment.state.name.Name);
  switch(gender) {
    case "male":
      $(".their").html("his");
      $(".they").html("he");
      $(".them").html("him");
      $(".theirs").html("his");
      break;
    case "female":
      $(".their").html("her");
      $(".they").html("she");
      $(".them").html("her");
      $(".theirs").html("hers");
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
        //"That's probably a reasonable response, but our parser can't handle it.",
        //"Please try to phrase your response in a simpler way.",
        //"And make sure you write *something*!",
        //"Thank you for your patience!"
        "Please write something in the blank space provided"].join(" "));
      break;
    default:
      console.log("13245: whoops. your qtype=" + qtype);
  }
  $(".err").show();
}

// -------- experiment structure ----------
var experiment = {
  qtypes: ["probability", "explanation", "probability", "probability", "probability", "probability"],
  nQnsPerBlock: 6,
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
    storyLabel: "NA",
    story: {},
    sliderValue: -1,
    name: "NA",
    gender: "NA",
    next: function() {
      experiment.nextBlock();
    },
    parsedResponse: "NA"
  },
  stories: _.shuffle([
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
      label: "coffee",
      cause: {
        gerund: "drinking coffee",
        pastPerfect: "drank coffee",
        negationPastPerfect: "didn't drink coffee"
      },
      effects: [
        {
          gerund: "staying up late",
          pastPerfect: pronoun("they") + " stayed up late",
          negationPastPerfect: pronoun("they") + " didn't stay up late"
        },
        {
          gerund: "a person to be more focused",
          pastPerfect: pronoun("they") + " was more focused",
          negationPastPerfect: pronoun("they") + " wasn't more focused"
        }
      ]
    },
    {
      label: "beach",
      cause: {
        gerund: "going to the beach on a sunny day",
        pastPerfect: "went to the beach on a sunny day",
        negationPastPerfect: "didn't go to the beach on a sunny day"
      },
      effects: [
        {
          gerund: "a person to get a suntan",
          pastPerfect: pronoun("they") + " got a suntan",
          negationPastPerfect: pronoun("they") + " didn't get a suntan"
        },
        {
          gerund: "a person to see surfers",
          pastPerfect: pronoun("they") + " saw surfers",
          negationPastPerfect: pronoun("they") + " didn't see surfers"
        }
      ]
    },
    {
      label: "reading",
      cause: {
        gerund: "reading for a very long stretch of time",
        pastPerfect: "read for a very long stretch of time",
        negationPastPerfect: "didn't read for a very long stretch of time"
      },
      effects: [
        {
          gerund: "a person to get a headache",
          pastPerfect: pronoun("they") + " got a headache",
          negationPastPerfect: pronoun("they") + " didn't get a headache"
        },
        {
          gerund: "a person's vocabulary to increase",
          pastPerfect: pronoun("their") + " vocabulary increased",
          negationPastPerfect: pronoun("their") + " vocabulary didn't increase"
        }
      ]
    },
    {
      label: "cooking",
      cause: {
        gerund: "joining a cooking meetup group",
        pastPerfect: "joined a cooking meetup group",
        negationPastPerfect: "didn't join a cooking meetup group"
      },
      effects: [
        {
          gerund: "a person to make friends",
          pastPerfect: pronoun("they") + " made friends",
          negationPastPerfect:  pronoun("they") + " didn't make friends"
        },
        {
          gerund: "a person to get better at cooking",
          pastPerfect: pronoun("they") + " got better at cooking",
          negationPastPerfect:  pronoun("they") + " didn't get better at cooking"
        }
      ]
    },
    {
      label: "painting",
      cause: {
        gerund: "taking a painting class",
        pastPerfect: "took a painting class",
        negationPastPerfect: "didn't take a painting class"
      },
      effects: [
        {
          gerund: "a person to get paint on their clothes",
          pastPerfect: pronoun("they") + " got paint on " + pronoun("their") + " clothes",
          negationPastPerfect: pronoun("they") + " didn't get paint on " + pronoun("their") + " clothes",
        },
        {
          gerund: "a person to improve their painting skills",
          pastPerfect: pronoun("they") + " improved " + pronoun("their") + " painting skills",
          negationPastPerfect: pronoun("they") + " didn't improve " + pronoun("their") + " painting skills",
        }
      ]
    },
    {
      label: "guitar",
      cause: {
        gerund: "practicing guitar a lot",
        pastPerfect: "practiced guitar a lot",
        negationPastPerfect: "didn't practice guitar a lot"
      },
      effects: [
        {
          gerund: "a person to start writing their own songs",
          pastPerfect: pronoun("they") + " starting writing " + pronoun("their") + " own songs",
          negationPastPerfect: pronoun("they") + " didn't start writing " + pronoun("their") + " own songs"
        },
        {
          gerund: "a person's fingers to get calloused",
          pastPerfect: pronoun("their") + " fingers got calloused",
          negationPastPerfect: pronoun("their") + " fingers didn't get calloused"
        }
      ]
    },
    {
      label: "Japan",
      cause: {
        gerund: "flying from the US to Japan",
        pastPerfect: "flew from the US to Japan",
        negationPastPerfect: "didn't fly from the US to Japan"
      },
      effects: [
        {
          gerund: "jetlag",
          pastPerfect: pronoun("they") + " experienced jetlag",
          negationPastPerfect: pronoun("they") + " didn't experience jetlag"
        },
        {
          gerund: "a person to hear more Japanese",
          pastPerfect: pronoun("they") + " heard more Japanese",
          negationPastPerfect: pronoun("they") + " didn't hear more Japanese"
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
  ]),
  progress: function() {
    var totalNQns = nBlocks * experiment.nQnsPerBlock + 1;
    var nQns = experiment.state.blocknum * experiment.nQnsPerBlock + experiment.state.qnum + 1;
    $('.bar').css('width', ( (nQns / totalNQns)*100 + "%"));
  },
  setState: function(type) {
    experiment.state.trialStartTime = time();
    experiment.progress();
    if (type=="block") {
      experiment.state.explanation = "NA";
      experiment.state.blocknum++;
      experiment.state.blockN = experiment.nQnsPerBlock;
      experiment.state.qnum = -1;
      experiment.state.story = experiment.stories.shift();
      experiment.state.story.effects = _.shuffle(experiment.state.story.effects);
      experiment.state.storyLabel = experiment.state.story.label;
    } else if (type=="question") {
      experiment.state.qnum++;
      experiment.state.qtype = experiment.qtypes[experiment.state.qnum];
    } else {
      console.log("error 345: you shouldn't have gotten here. type=" + type);
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
    experiment.setState("block");
    showSlide("story");
    setCauses();
    experiment.state.next = experiment.nextTrial;
    experiment.question();
  },
  // run at start of trial (once for every response)
  question: function() {
    $(".err").hide();
    experiment.setState("question");
    showSlide("trial");
    var story = experiment.state.story;
    experiment.state.next = function() {
      var responseValid = experiment.logResponse(experiment.state.qtype);
      if (responseValid) {
        (experiment.state.qnum == experiment.state.blockN - 1) ?
              experiment.nextBlock() :
              experiment.question();
      } else {
        responseError(experiment.state.qtype)
      }
    }
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
        $(".ungrammatical").remove();
        prompt = $("<h3>", {
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
        experiment.state.explanation = 'NA'
        experiment.state.explanationName = name;
        prompt = $("<h3>", {
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
        prompt = $("<h3>", {
          class: "prompt",
          html: [
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      case 3:
        $('#ungrammatical').prop('checked', false);
        prompt = $("<h3>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + 
                " and you don't know whether " +
                nlp.abstractPronouns(experiment.state.explanation) + ".",
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        $("#trial").append(
          $("<p>", {
            html: "<input type='checkbox' id='ungrammatical'></input>" +
                  "Please check this box if you notice something strange about the way this question is worded.",
            class: "ungrammatical"
          })
        );
        break;
      case 4:
        $('#ungrammatical').prop('checked', false);
        prompt = $("<h3>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + 
                " and " +
                nlp.negate(experiment.state.explanation) + ".",
                "How likely is it that",
                story.effects[0].pastPerfect + "?"
              ].join(" ")
        });
        break;
      case 5:
        $('#ungrammatical').prop('checked', false);
        prompt = $("<h3>", {
          class: "prompt",
          html: [
                name.Name,
                story.cause.pastPerfect + 
                " and " +
                nlp.abstractPronouns(experiment.state.explanation) + ".",
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
    if (experiment.state.qtype == "probability") {
      drawSlider();
    } else {
      var explanationResponse = $("<p>", {html: "Because <input type='text' size='35' id='explanation'></input>."});
      $(".response").append(explanationResponse);
    }
    setPronouns(name.gender, name);
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
            name: experiment.state.name.Name,
            gender: experiment.state.name.gender,
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
        var ungrammatical = $('#ungrammatical').prop('checked');
        var response = $("#explanation").val();
        experiment.state.explanation = nlp.getParse(response, experiment.state.name);
        if (response.length > 0) {
          // log response
          experiment.data.trials.push({
            response: response,
            time: responseTime,
              rt: responseTime - experiment.state.trialStartTime,
              qtype: qtype,
              story: experiment.state.storyLabel,
              name: experiment.state.name.Name,
              gender: experiment.state.name.gender,
              trialnum: experiment.state.trialnum,
              qnum: experiment.state.qnum,
              blocknum: experiment.state.blocknum
          })
          experiment.data.trials.push({
            response: ungrammatical,
            time: responseTime,
              rt: responseTime - experiment.state.trialStartTime,
              qtype: 'ungrammatical',
              story: experiment.state.storyLabel,
              name: experiment.state.name.Name,
              gender: experiment.state.name.gender,
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
  demographic: function() {
    showSlide("demographic");
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
  nextTrial: function() {
    var responseTime = time();
    experiment.data.trials.push({
          response: "NA",
          time: responseTime,
          rt: responseTime - experiment.state.trialStartTime,
          qtype: "readStories",
          story: experiment.state.storyLabel,
          name: "NA",
          trialnum: experiment.state.trialnum,
          qnum: experiment.state.qnum,
          blocknum: experiment.state.blocknum
        });
  },
  skip: function(n) {
    for (var i=0; i<n; i++) {
      experiment.state.next();
    }
  }
};

// -------- run experiment ----------
var nBlocks = experiment.stories.length;
var experimentStates = ["instructions"].concat(
      rep("block", nBlocks)
    ).concat(["demographic", "finished"]);

$(document).ready(function() {
  experiment.state.next();
})

// -------- record all the events ----------
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