//just using angular for visualization/demo purposes
var app = angular.module('pubMedApp', []);

app.controller('ViewController', ['$scope', function($scope) {

	//basically just calling in searches from user input (searchTerm)
	$scope.search = function(searchTerm) {
		$scope.articles = getArticleDetails(searchTerm);
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
function getArticleDetails(searchTerm) {
	
	var idString = getIdString(searchTerm);
	var fullDetailLink = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + idString + '&retmode=json';

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
			var authorArray = [];
			for (j = 0; j < articleJSON[i]["authors"].length; j++) {
				authorArray.push(articleJSON[i]["authors"][j]["name"]);
			}

			//creating link
			var link = 'http://www.ncbi.nlm.nih.gov/pubmed/' + i;

			//using unshift() instead of push() 
			//because the articles are in reverse order
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
function getIdString(searchTerm) {
	
	//currently set to return 50 - even 100 was really slow
	var baseLink = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmax=50&term=';
	

	var fullLink = baseLink + searchTerm + '[MAJR]&retmode=json';

	var idString = "";
	$.ajax({
		url: fullLink,
		async: false,
		dataType: 'json',
		success: function(data) {
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

