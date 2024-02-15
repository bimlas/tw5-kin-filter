/*\
title: $:/plugins/bimlas/kin-filter/kin.js
type: application/javascript
module-type: filteroperator

Finds out where a tiddler originates from and what other tiddlers originate from it

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: true */
	"use strict";

	function collectTitlesRecursively(baseTitle,options) {
		var cacheName = "kin-filter-" + baseTitle + "-" + options.fieldName + "-",
			results = [];

		/* Copy of findListingsOfTiddler, but it's searching in shadows as well. */
		function findListingsOfTiddler(targetTitle,fieldName) {
			fieldName = fieldName || "list";
			var listings = options.wiki.getGlobalCache("kin-filter-listings-" + fieldName,function() {
				var listings = Object.create(null);
				options.wiki.eachTiddlerPlusShadows(function(tiddler,title) {
					var list = $tw.utils.parseStringArray(tiddler.fields[fieldName]);
					if(list) {
						for(var i = 0; i < list.length; i++) {
							var listItem = list[i],
								listing = listings[listItem] || [];
							if (listing.indexOf(title) === -1) {
								listing.push(title);
							}
							listings[listItem] = listing;
						}
					}
				});
				return listings;
			});
			return listings[targetTitle] || [];
		}

		function addToResultsIfNotFoundAlready(alreadyFound,title,depth) {
			if($tw.utils.hop(alreadyFound,title)) {
				return false;
			}
			alreadyFound[title] = depth;
			return true
		}

		function collectTitlesPointingFrom(results,title,currentDepth) {
			if(addToResultsIfNotFoundAlready(results,title,currentDepth)) {
				currentDepth += 1;
				var tiddler = options.wiki.getTiddler(title);
				if(tiddler) {
					$tw.utils.each(tiddler.getFieldList(options.fieldName),function(targetTitle) {
						collectTitlesPointingFrom(results,targetTitle,currentDepth);
					});
				}
			}
		}

		function collectTitlesPointingTo(results,title,currentDepth) {
			if(addToResultsIfNotFoundAlready(results,title,currentDepth)) {
				currentDepth += 1;
				$tw.utils.each(findListingsOfTiddler(title,options.fieldName),function(targetTitle) {
					collectTitlesPointingTo(results,targetTitle,currentDepth);
				});
			}
		}

		function getResultsInGivenDepth(cachedData) {
			if(options.depth) {
				var results = [];
				$tw.utils.each(cachedData,function(value,key){
					if(value <= options.depth) {
						results.push(key);
					}
				});
				return results;
			} else {
				return Object.keys(cachedData);
			}
		}

		if((options.direction === "from") || (options.direction === "with")) {
			var resultsFrom = $tw.wiki.getGlobalCache(cacheName + "from",function() {
				var titlesPointingFromBase = {}
				collectTitlesPointingFrom(titlesPointingFromBase,baseTitle,0);
				return titlesPointingFromBase;
			});
			$tw.utils.pushTop(results,getResultsInGivenDepth(resultsFrom));
		}
		if((options.direction === "to") || (options.direction === "with")) {
			var resultsTo = $tw.wiki.getGlobalCache(cacheName + "to",function() {
				var titlesPointingToBase = {}
				collectTitlesPointingTo(titlesPointingToBase,baseTitle,0);
				return titlesPointingToBase;
			});
			$tw.utils.pushTop(results,getResultsInGivenDepth(resultsTo));
		}
		return results;
	}

	/*
	Export our filter function
	*/
	exports.kin = function(source,operator,options) {
		var results = [],
			needsExclusion = operator.prefix === "!",
                        suffixes = operator.suffixes || [],
			filterOptions = {
				wiki: options.wiki,
				fieldName: (suffixes[0] && suffixes[0][0]) || "tags",
				direction: (suffixes[1] && suffixes[1][0]) || "with",
				depth: Number((suffixes[2] && suffixes[2][0]) || 0),
			};

		if((operator.operand === "") && (needsExclusion)) {
			return [];
		}

		if(operator.operand !== "") {
			var baseTitle = operator.operand,
				foundTitles = collectTitlesRecursively(baseTitle,filterOptions);

			source(function(tiddler,title) {
				if(needsExclusion === (foundTitles.indexOf(title) === -1)) {
					results.push(title);
				}
			});
		} else {
			source(function(tiddler,title) {
				results = $tw.utils.pushTop(results,collectTitlesRecursively(title,filterOptions));
			});
		}

		return results;
	}
})();
