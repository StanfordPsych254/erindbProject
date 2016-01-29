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

var block = {
  nqns: 5,
  question: function() {
    block.qnum++;
    experiment.next = block.question;
    if (block.qnum == block.nqns) {
      experiment.next = experiment.nextBlock;
    }
    showSlide("probability");
    var name = names.shift();
    setPronouns(name.gender);
  }
};

// -------- experiment structure ----------
var experiment = {
  /// experiment slides
  instructions: function() {
    showSlide("instructions");
    $(".start").click(function() {
      $(this).unbind("click");
      experiment.next();
    })
  },
  block: function() {
    block.story = stories.shift();
    block.qnum = -1;
    $(".block .causalStatements").remove();
    var causes = $("<ul>", {class: "causalStatements"});
    $(causes).append($("<p>", {text: "Here are some facts:"}));
    for (var i=0; i<2; i++) {
      causes.append(
        $("<li>", {
          text: block.story.cause.gerund +
                " causes " +
                block.story.effects[i].gerund
        })
      );
    }
    $(".block").prepend(causes);
    block.question();
  },
  finished: function() {
    showSlide("finished");
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

// -------- run experiment ----------
var nBlocks = stories.length;
var experimentStates = ["instructions"].concat(
      rep("block", nBlocks)
    ).concat(["finished"]);

$(document).ready(function() {
  experiment.next();
})