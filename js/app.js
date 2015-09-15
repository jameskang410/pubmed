//just using angular for visualization/demo purposes
var app = angular.module('pubMedApp', []);

app.controller('ViewController', ['$scope', function($scope) {

	//basically just calling search terms from user input
	$scope.search = function(searchTerm, searchTerm2) {
		$scope.articles = getArticleDetails(searchTerm, searchTerm2);
		$scope.metaSearch = metaSearch;
		console.log(metaSearch);

		//showing the hidden results area
		$scope.resultsOn = true;
	}
}]);

//will be filled via getIdString()
var metaSearch;

//input: article IDs as string
//output: JSON with all appropriate article data
function getArticleDetails(searchTerm, searchTerm2) {

	//if searching 1 term
	if (searchTerm2 === undefined) {
		var idString = getIdString(searchTerm);
	}
	//if searching 2 terms
	else {
		var idString = getIdString(searchTerm, searchTerm2);
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
			//creating an array of all authors
			//if there's a speed issue with the code, it's prob here (O(n^2))
			var authorArray = [];
			for (j = 0; j < articleJSON[i]["authors"].length; j++) {
				authorArray.push(articleJSON[i]["authors"][j]["name"]);
			}

			//creating link
			var link = 'http://www.ncbi.nlm.nih.gov/pubmed/' + i;

			//using unshift() instead of push() 
			//because the articles are iterated in reverse order
			articleArray.unshift({ "id" : i,
							    "title" : articleJSON[i]["title"],
							    "link" : link,
								"authors" : authorArray,
								"authorsString" : authorArray.join(", "),
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
function getIdString(searchTerm, searchTerm2) {

	//if searching only 1 term
	if (searchTerm2 === undefined || searchTerm2 === "") {
		searchTerm2 = "";
	}
	//if searching 2 terms
	else {
		searchTerm2 += '[MAJR]';
	}

	//currently set to return 50 results and articles from the past 4 years (365 * 4 days)
	//50 is still pretty slow, but 100 was really slow
	var baseLink = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&reldate=1460&retmax=50&term=';
	var fullLink = baseLink + searchTerm + '[MAJR]+AND+' + searchTerm2 + '&retmode=json';

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

