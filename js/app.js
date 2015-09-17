//just using angular for visualization/demo purposes
var app = angular.module('pubMedApp', []);

app.controller('ViewController', ['$scope', function($scope) {

	//basically just calling search terms from user input
	$scope.search = function(searchTerm, searchTerm2, searchTerm3) {
		$scope.articles = getArticleDetails(searchTerm, searchTerm2, searchTerm3);
		$scope.metaSearch = metaSearch;

		//showing the hidden results area
		$scope.resultsOn = true;
	}
}]);

//will be filled via getIdString()
var metaSearch;

//input: article IDs as string
//output: JSON with all appropriate article data
function getArticleDetails(searchTerm, searchTerm2, searchTerm3) {

	//if searching 2 terms
	if (searchTerm3 === undefined) {
		var idString = getIdString(searchTerm, searchTerm2);
	}
	//if searching 3 terms
	else {
		var idString = getIdString(searchTerm, searchTerm2, searchTerm3);
	}

	var fullDetailLink = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' 
							+ idString + '&retmode=json';

	var articleJSON;

	$.ajax({
		url: fullDetailLink,
		async: false,
		dataType: 'json',
		success: function(data) {
			articleJSON = data.result;
		}
	});

	var articleArray = [];

	for (i in articleJSON) {

		//one part of the JSON is "uids" which just lists all of the IDS
		//skipping this
		if (i === "uids") {
		}

		else {

			//creating link
			var link = 'http://www.ncbi.nlm.nih.gov/pubmed/' + i;

			//using unshift() instead of push() 
			//because the articles are iterated in reverse order
			articleArray.unshift({ "id" : i,
							    "title" : articleJSON[i]["title"],
							    "link" : link,
								"source" : articleJSON[i]["source"],
								"pubdate" : articleJSON[i]["pubdate"],
								"volume" : articleJSON[i]["volume"],
								"issue" : articleJSON[i]["issue"],
								"pages" : articleJSON[i]["pages"],
							});
		}
	}
	return articleArray;
}

//helper function for getArticleDetails()
//input: search term
//output: IDs as string and JSON with search details
function getIdString(searchTerm, searchTerm2, searchTerm3) {

	//if searching only 2 terms
	if (searchTerm3 === undefined || searchTerm3 === "") {
		searchTerm3 = "";
	}
	//if searching 3 terms
	else {
		searchTerm3 += '[TIAB]';
	}

	//reldate=1460 - only returning articles from past 2 years (365 * 2 = 730)
	//retmax=20 - returning anything more than 20 results is still pretty slow
	//english[LANG] - only returning articles in english
	//[TIAB] - Searching based on title/abstract
	var baseLink = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&datetype=pdat&reldate=730&retmax=20&term=english[LANG]+';
	var fullLink = baseLink + searchTerm + '[MAJR]+AND+' + searchTerm2 + '[TIAB]+AND+' + searchTerm3 + '&retmode=json';

	console.log(fullLink);

	var idString = "";

	$.ajax({
		url: fullLink,
		async: false,
		dataType: 'json',
		success: function(data) {
			//calling helper function to get string of IDs
			idString = parseId(data);

			//also getting some other search info
			metaSearch = {"queryTranslation" : data.esearchresult.querytranslation,
						  "totalResults" : data.esearchresult.count};
		}
	});

	return idString;
}

//helper function for getIdString()
//input: JSON with IDs
//output: IDs as string (comma-delimited)
function parseId(data) {

	var idArray = data.esearchresult.idlist;
	
	var idString = "";
	for (i = 0; i < idArray.length; i++) {
		idString += idArray[i] + ",";
	}

	return idString;
}

