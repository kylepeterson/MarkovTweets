// Contains positions with tweets in them
var idToPos = {};
var grid = [];
// Tweets that are placed and have yet to be expanded fully
var unvisitedTweets = new Array();
var currentID = 0;

$(function() {
	console.log("program begin");
	fillGrid();
	$.ajax({
		type: "GET",
		url: "http://localhost:5005/query",
		data: "query=disruption",
		contentType: "application/json; charset=utf-8",
		success: placeFirstTweet
	})
})

function fillGrid() {
	for (var i = 0; i < 10; i++) {
		var row = [];
		for(var j = 0; j < 3; j++) {
			row.push(0);
		}
		grid.push(row);
	}
}

function placeFirstTweet(response) {
	console.log("placeFirstTweet entered");
	var results = JSON.parse(response).results;
	var firstTweet = chooseRandom(results);
	// Place initial tweet in upper left corner
	placeTweet(firstTweet, [0, 0]);
	firstTweet.id = currentID++;
	idToPos[firstTweet.id] = [0, 0];
	grid[0][0] = firstTweet.id;
	gridChanged();
	firstTweet.expansions = 0;
	unvisitedTweets.push(firstTweet);
	// Closure in order to pass in two parameters to populateTweets
	function beginPopulating(response) {
		populateTweets(response, firstTweet);
	}
	$.ajax ({
		type: "GET",
		url: "http://localhost:5005/query",
		contentType: "application/json; charset=utf-8",
		data: "query=" + firstTweet.query,
		success: beginPopulating
	});
}

// Populates the page with tweets
function populateTweets(response, parentTweet) {
	console.log("populateTweets entered");
	var results = JSON.parse(response).results;
	//while (unvisitedTweets.length > 0);
	// Choose random tweet that is unexpanded
	var tweetToPlace = chooseRandom(results);
	// Check position for validity
	var expandPosition = checkForPosition(parentTweet);
	if(expandPosition != -1) {
		// If a valid random position was found expand to it
		tweetToPlace.id = currentID++;
		// If first expansion instantiate new expansions field
		if(!parentTweet.expansions) {
			parentTweet.expansions = 0;
		}
		parentTweet.expansions++;
		placeTweet(tweetToPlace, expandPosition);
		unvisitedTweets.push(tweetToPlace);
		idToPos[tweetToPlace.id] = expandPosition;
		if (expandPosition[1] > grid.length) {
			fillGrid();
		}
		grid[expandPosition[0]][expandPosition[1]] = tweetToPlace.id;
		gridChanged();
	}
	// If the tweet has expanded twice remove it from consideration for expansion
	if(parentTweet.expansions >= 2) {
		var index = unvisitedTweets.indexOf(parentTweet);
		unvisitedTweets.splice(index, 1);

	}
	var nextParentTweet = chooseRandom(unvisitedTweets);
	// Closure in order to pass two parameters to recursive function
	function populateNext(nextResponse) {
		populateTweets(nextResponse, nextParentTweet);
	}
	$.ajax ({
		type: "GET",
		url: "http://localhost:5005/query",
		contentType: "application/json; charset=utf-8",
		data: "query=" + nextParentTweet.query,
		success: populateNext
	});
}


// Places the given tweet in the given position
function placeTweet(tweet, position) {
	console.log("placeTweet entered");
	// Place new tweet on page
	console.log(tweet);
	console.log(position);
}

// Checks if there is a valid position around the given tweet
// Returns random valid position if one exists and returns -1 if none exist.
function checkForPosition(tweet) {
	var tweetID = tweet.id;
	var currentPosition = idToPos[tweetID];
	var x = currentPosition[0];
	var y = currentPosition[1];
	var potentialPositions = new Array();
	potentialPositions.push([x, y - 1]);
	potentialPositions.push([x, y + 1]);
	potentialPositions.push([x - 1, y]);
	potentialPositions.push([x + 1, y]);
	var start = Math.floor(Math.random() * 4);
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
	if(!pos) {
		return false
	}
	var x = pos[0];
	var y = pos[1];
	return pos[1] < 3 && pos[1] >= 0 && pos[0] >= 0 && grid[x][y] == 0 
}

// called everytime the grid is changed
function gridChanged() {

}

// Chooses a random element from the given list
function chooseRandom(list) {
	return list[Math.floor(Math.random() * list.length)];
}
