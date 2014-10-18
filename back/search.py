import os
from werkzeug.wrappers import Request, Response
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, BadRequest
from TwitterSearch import *
from oauth import OAUTH
import urllib2
import xml.dom
import string
import random
from jinja2 import Environment, FileSystemLoader
from BeautifulSoup import BeautifulSoup

STOP_WORDS = []
f = open('stop_words.txt')
for l in f:
   STOP_WORDS.append(l.strip())
   STOP_WORDS.append(string.join(l.split("'"), ""))
STOP_WORDS = set(STOP_WORDS)

def isMeaningful(word):
   return not (word.lower() in STOP_WORDS or word.startswith('@') or word.startswith('#'))

def recursiveStrip(tweet):
   soup = BeautifulSoup(unicode(tweet))
   return ''.join([e for e in soup.recursiveChildGenerator() if isinstance(e,unicode)])

def getRandQuery(tweet):
   words = tweet.split()
   goodWords = filter(isMeaningful, words)
   return random.choice(words if len(words) == 0 else goodWords)

class SearchService(object):
   def get_query(self, request):
      while True:
         try:
            query = request.args['query']
         except:
            return BadRequest('include a query, dingus')
         contents = urllib2.urlopen(self.twitterBaseURL + query).read()
         soup = BeautifulSoup(contents)
         tweets = soup.findAll("p", { "class" : "js-tweet-text tweet-text" })
         tweets = map(recursiveStrip, tweets)
         tweets = map(lambda tweet : {'text': tweet, 'query': getRandQuery(tweet)}, tweets)
         tweets = filter(lambda tweet : tweet['query'].isalpha(), tweets)
         return self.render_template('results.txt', results=tweets)

   """
   dispatch requests to appropriate functions above
   """
   def __init__(self):
      template_path = os.path.join(os.path.dirname(__file__), 'templates')
      self.jinja_env = Environment(loader=FileSystemLoader(template_path),
                           autoescape=True)
      self.url_map = Map([
         Rule('/', endpoint='otherwise'),
         Rule('/query', endpoint="query"),
      ])
      self.twitterBaseURL = 'https://twitter.com/search?q='

   def render_template(self, template_name, **context):
      t = self.jinja_env.get_template(template_name)
      return Response(t.render(context), mimetype='text/plain')

   def wsgi_app(self, environ, start_response):
      request = Request(environ);
      response = self.dispatch_request(request);
      return response(environ, start_response);

   def __call__(self, environ, start_response):
      return self.wsgi_app(environ, start_response)

   def dispatch_request(self, request):
      adapter = self.url_map.bind_to_environ(request.environ)
      try:
         endpoint, values = adapter.match()
         return getattr(self, 'get_' + endpoint)(request, **values)
      except HTTPException, e:
         return e

   def get_otherwise(self, request):
      return Response('lol wut u doin')
