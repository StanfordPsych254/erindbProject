#!/usr/bin/python

import cgi, cgitb 
import json
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
print json.dumps(output)
