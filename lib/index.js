var request = require('request');

var contextRoot = '/chatbot/';
var sentenceRegex = /[?\.!]/;
var processSentencePath = '/processSentence';
var createSentencePath = '/createSentence';

function ChatboxClient(h, p) {
    
    var hostname = h;
    var port = p;
    
    var buildHostname = function () {
        var host = 'http://' + hostname;
        
        if (port && port != 80) {
            host = host + ':' + port;
        }
        
        return host + contextRoot;
    };
    
    var splitSentences = function (sentences) {
        return sentences.split(sentenceRegex).filter(function (el) {
            if (el.trim().length > 0){
                return el;
            }
        });
    };
    
    var callProcessSentence = function (profile, sentence, callback) {
        var host = buildHostname() + profile + processSentencePath;
        
        var requestBody = '{"sentence" : "'  +  sentence + '"}';
        
        request.post({
          headers: {'content-type' : 'application/json'},
          url:     host,
          body:    requestBody   
        }, 
        function (error, response, body) {
            if(!error && response.statusCode == 200) {
                callback(body);
            } else {
                console.log('Processing goofed. Error: ' + response.statusCode);
            } 
        });
    };
    
    this.getWord = function (profile, word, callback) {
        var host = buildHostname() + profile + '/' + word;
        request.get(host, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                callback(body);
            } else {
                console.log('It goofed. Error: ' + response.statusCode);
            } 
        });
    };
    
    this.processSentence = function (profile, sentence, callback, noSplit) {
        var sentences = [];
        var resultData = {
          callsMade : 0  
        };
        var i = 0;
        
        if (!noSplit) {
            sentences = splitSentences(sentence);
        } else {
            sentences = [sentence];
        }
        
        var processCallback = function (data) {
            i++;
            resultData.callsMade++;

            if (i < sentences.length) {
                callProcessSentence(profile, sentences[i], processCallback);
            } else {
                callback(resultData);
            } 
        };
        
        callProcessSentence(profile, sentences[i], processCallback);
        
    };
    
    this.deleteProfile = function (profile, callback) {
        var host = buildHostname() + profile + '/';
        request.delete(host, function (error, response, body) {
            if(!error && response.statusCode == 200) {
                callback('delete successful');
            } else {
                console.log('Delete goofed. Error: ' + response.statusCode);
            } 
        });
    };
    
    this.createSentence = function (options, callback) {
        var profile, keyword, max;
        
        if (typeof(options) === 'string'){
            profile = options;
        } else if (typeof(options) === 'object') {
            profile = options.profile;
            
            if (options.keyword) {
                keyword = options.keyword;
            }
            
            if (options.max) {
                max = options.max;
            }
        }
        
        var host = buildHostname() + profile + createSentencePath + '?';
        
        if (keyword) {
            host = host + '&keyword=' + keyword;
        }
        
        if (max) {
            host = host + '&max=' + max;
        }
        
        request.get(host, function (error, response, body) {
            if(!error && response.statusCode == 200) {
                callback(body);
            } else {
                console.log('It goofed. Error: ' + response.statusCode);
            } 
        });
    };
}
           
module.exports = ChatboxClient;