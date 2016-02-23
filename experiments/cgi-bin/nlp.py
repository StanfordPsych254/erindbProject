#!/usr/bin/python

import cgi, cgitb 
cgitb.enable()  # for troubleshooting

#the cgi library gets vars from html
data = cgi.FieldStorage()

from pycorenlp import StanfordCoreNLP
nlp = StanfordCoreNLP('http://localhost:9000')

text = data['text'].value
annotators = data['annotators'].value

output = nlp.annotate(text, properties={'annotators': annotators, 'outputFormat': 'json'})

#this is the actual output
print "Content-Type: text/html\n"
print "The text data is: " + data["text"].value
print "<br />"
print "The annotator data is: " + data["annotators"].value
print "<br />"
print output
