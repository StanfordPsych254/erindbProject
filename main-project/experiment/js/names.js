 var names = function() {
  var male_names = _.shuffle([
    "Michael", "Christopher", "Matthew", "Joshua", "Jacob", "Nicholas",
    "Andrew", "Daniel", "Tyler", "Joseph", "Brandon", "David", "James",
    "Ryan", "John", "Zach", "Justin", "Will", "Anthony", "Robert", "Austin",
    "Alexander", "Kyle", "Kevin", "Thomas", "Cody", "Jordan", "Eric", "Benjamin",
    "Aaron", "Christian", "Samuel", "Dylan", "Steven", "Brian", "Jose",
    "Timothy", "Nathan", "Adam", "Rick", "Patrick", "Charles", "Sean",
    "Jason", "Cameron", "Jeremy", "Mark", "Juan", "Travis", "Jeff", "Ethan",
    "Caleb", "Luis", "Jared", "Logan", "Hunter", "Trevor", "Evan", "Paul", "Kenneth",
    "Connor", "Dustin", "Noah", "Carlos", "Devin", "Gabriel", "Ian", "Greg",
    "Derek", "Corey", "Scott", "Bradley"
  ]);
  var female_names = _.shuffle([
    "Jessica", "Ashley", "Emily", "Sarah",
    "Samantha", "Amanda", "Brittany", "Elizabeth", "Megan", "Hannah", "Kayla",
    "Lauren", "Stephanie", "Rachel", "Jennifer", "Nicole", "Alexis", "Victoria",
    "Amber", "Alyssa", "Courtney", "Rebecca", "Danielle", "Jasmine", "Brianna",
    "Katherine", "Alexandra", "Madison", "Morgan", "Melissa", "Michelle", "Kelsey",
    "Chelsea", "Anna", "Kim", "Tiffany", "Olivia", "Mary", "Christina", "Allison",
    "Abigail", "Heather", "Haley", "Maria", "Kaitlyn", "Laura", "Erin", "Andrea",
    "Natalie", "Brooke", "Julia", "Emma", "Vanessa", "Erica", "Kelly", "Kristen",
    "Marissa", "Amy", "Crystal", "Paige", "Cassandra", "Gabrielle", "Katie",
    "Lindsey", "Destiny", "Kathryn", "Jacqueline", "Shannon", "Jenna", "Angela",
    "Savannah", "Miranda"
  ]);
  var names = []
  for (var i=0; i<female_names.length; i++) {
    names.push({
      "gender": "female",
      "nompron": "she",
      "genpron": "her",
      "objpron": "her",
      "Name": female_names.pop()
    });
  }
  for (var i=0; i<male_names.length; i++) {
    names.push({
      "gender": "male",
      "nompron": "he",
      "genpron": "his",
      "objpron": "him",
      "Name": male_names.pop()
    });
  }
  return names;
}()