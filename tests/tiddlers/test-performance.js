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

		function stats(filter) {
			$tw.wiki.clearGlobalCache();
			var start = Date.now();
			var results = $tw.wiki.filterTiddlers(filter);
			return {time: Date.now() - start, records: results.length};
		}

		it("works",function() {
			const generators = [
				"[kin[TableOfContents]]",
				"[kin:::2[TableOfContents]]",
				"[kin[Filters]]",
				"[kin::to:2[Filters]]",
				"[kin:list[$:/tags/SideBarSegment]]",
			];
			const filters = [
				"[all[tiddlers+shadows]kin[TableOfContents]]",
				"[all[tiddlers+shadows]kin:::2[TableOfContents]]",
				"[all[tiddlers+shadows]kin[Filters]]",
				"[all[tiddlers+shadows]kin::to:2[Filters]]",
				"[all[tiddlers+shadows]kin:list[$:/tags/SideBarSegment]]",
			];
			var results = [...generators, ...filters].reduce(function (results, filter) {
				results[filter] = stats(filter);
				return results;
			}, {});
			console.table(results);
		});
	});
	}
})();
