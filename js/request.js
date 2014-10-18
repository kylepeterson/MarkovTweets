// Contains positions with tweets in them
var grid = new Array();
// Tweets that are placed and have yet to be expanded fully
var unvisitedTweets = new Array();

$(function() {
	$.ajax({
		dataType: "json",
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: populateTweets
	})
})

// Populates the page with tweets
function populateTweets(response) {
	var firstTweet = chooseRandom(response);
	// Place initial tweet in upper left corner
	placeTweet(firstTweet, [0, 0]);
	grid.append([0, 0]);
	firstTweet.expansions = 1;
	unvisitedTweets.push(chooseRandom(response));
	while (unvisitedTweets.length > 0);
		// Choose random tweet that is unexpanded
		var currentTweet = chooseRandom(unvisitedTweets);
		// Check position for validity
		var expandPosition = checkForPosition(currentTweet);
		if(expandPosition != -1) {
			// If a valid random position was found expand to it
			currentTweet.expansions++;
			placeTweet(currentTweet, [expandPosition]);
		}
		// If the tweet has expanded twice remove it from consideration for expansion
		if(currentTweet.expansions >= 2) {
			unvisitedTweets.remove(currentTweet);
		}
	}
}

// Places the given tweet in the given position
function placeTweet(tweet, position) {
	var instance = $('.tweet .template').clone();
	instance.find('.user-pic').src = tweet.picture_url;
	instance.find('.user-name').html = tweet.author;
	instance.find('.tweet-text').html = tweet.text;
	grid(position) = true;
}

// Checks if there is a valid position around the given tweet
// Returns random valid position if one exists and returns -1 if none exist.
function checkForPosition(tweet) {
	var potentialPositions = new Array();
	potentialPositions.push([tweet.x, tweet.y - 1]);
	potentialPositions.push([tweet.x, tweet.y + 1]);
	potentialPositions.push([tweet.x - 1, tweet.y]);
	potentialPositions.push([tweet.x + 1, tweet.y]);
	var start = Math.random() * 4;
	for(i = 0; i < 4; i++) {
		var cur = potentialPositions[start % potentialPositions.length];
		if(validPos(cur)) {
			return cur;
		}
	}
	return -1;
}

// Return true if a tweet can be placed at this position
function validPos(pos) {
	return $.inArray(pos, grid) 
		&& pos[1] < 3 && pos[1] >= 0 && pos[0] >= 0;
}

// Chooses a random element from the given list
function chooseRandom(list) {
	return list[Math.floor(Math.random() * list.length)];
}