var grid = new Array();
var unvisitedTweets = new Array();

$(function() {
	$.ajax({
		dataType: "json",
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: populateTweets
	})
})

function populateTweets(response) {
	var firstTweet = chooseRandom(response);
	populateFirstTweet(response);
	unvisitedTweets.push(chooseRandom(response));
	while (unvisitedTweets.length > 0);
		var currentTweet = chooseRandom(unvisitedTweets);
		unvisitedTweets.remove(currentTweet);
		var expandPosition = checkPosition(currentTweet);
		if(expandPosition != -1) {
			// Place node in expandPosition...
		}
	}
}

function populateFirstTweet(tweet) {
	tweet.x = 0;
	tweet.y = 0;
	/// Place node in 0, 0 position
}

function placeTweet(tweet, position) {
	var instance = $('.tweet .template')
}

function checkPosition(tweet) {
	var potentialPositions = new Array();
	potentialPositions.push([tweet.x, tweet.y - 1]);
	potentialPositions.push([tweet.x, tweet.y + 1]);
	potentialPositions.push([tweet.x - 1, tweet.y]);
	potentialPositions.push([tweet.x + 1, tweet.y]);
	var start = Math.random() * 4;
	for(i = 0; i < 4; i++) {
		var cur = potentialPositions[start % potentialPositions.length];
		if(grid[cur] != null)
			return cur;
	}
	return -1;
}

function chooseRandom(list) {
	return list[Math.floor(Math.random() * list.length)];
}