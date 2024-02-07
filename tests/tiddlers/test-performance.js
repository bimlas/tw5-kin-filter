/*\
title: test-performance.js
type: application/javascript
tags: [[$:/tags/test-spec]]

Plugin performance tests

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

if($tw.wiki.getTiddler("HelloThere")) {
	describe("Performance tests", function() {

		function timeOf(filter) {
			$tw.wiki.clearGlobalCache();
			var start = Date.now();
			$tw.wiki.filterTiddlers(filter);
			return Date.now() - start;
		}

		it("works",function() {
			const generators = [
				"[kin[TableOfContents]]",
			];
			const filters = [
				"[all[tiddlers+shadows]kin[TableOfContents]]",
			];
			var results = [...generators, ...filters].reduce(function (results, filter) {
				results[filter] = timeOf(filter);
				return results;
			}, {});
			console.table(results);
		});
	});
	}
})();
