/*\
title: test-filters.js
type: application/javascript
tags: [[$:/tags/test-spec]]

Plugin tests

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

describe("Plugin tests", function() {

	var wiki = new $tw.Wiki();
	wiki.addTiddler({
		title: "A",
		tags: ["B"],
		list: "C"
	});
	wiki.addTiddler({
		title: "B",
		tags: ["C"],
	});
	wiki.addTiddler({
		title: "C",
		tags: ["A"],
		list: ["E"]
	});
	wiki.addTiddler({
		title: "D",
		tags: ["B"],
	});
	wiki.addTiddler({
		title: "E",
		tags: ["D"],
	});
	wiki.addTiddler({
		title: "F",
		tags: ["E"],
	});
	wiki.addTiddler({
		title: "G",
		tags: ["D"],
	});

	it("works",function() {
		expect(wiki.filterTiddlers("[kin[A]sort[title]]").join(",")).toBe("A,B,C,D,E,F,G");
		expect(wiki.filterTiddlers("[kin::from[A]sort[title]]").join(",")).toBe("A,B,C");
		expect(wiki.filterTiddlers("[kin::to[A]sort[title]]").join(",")).toBe("A,B,C,D,E,F,G");
		expect(wiki.filterTiddlers("[kin[A]!kin::to[D]sort[title]]").join(",")).toBe("A,B,C");
		expect(wiki.filterTiddlers("[kin::from:2[F]sort[title]]").join(",")).toBe("D,E,F");
		expect(wiki.filterTiddlers("[kin:list[C]sort[title]]").join(",")).toBe("A,C,E");
	});

	it("handles shadow tiddlers",function() {
		expect($tw.wiki.filterTiddlers("[all[shadows]kin[$:/tags/SideBar]sort[title]]").join(",")).toBe(
			"$:/core/ui/SideBar/More,$:/core/ui/SideBar/Open,$:/core/ui/SideBar/Recent,$:/core/ui/SideBar/Tools,$:/tags/SideBar"
		);
	});
});

})();
