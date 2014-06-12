
var map;
var layergroup;
function addOsmMap(divID){
	map = L.map(divID).setView([30.67, 104.06], 13);

	// add an OpenStreetMap tile layer
	L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		//attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

}

function showNodeInfo(d){

    var ss="<table  class=\"table table-striped\">"
            +"<caption><h2>Node</h2></caption> "
            +"<tbody>"
            +"<tr>"
            +"<td>"+"Name"+"</td>"
            +"<td>"+d.name+"</td>"
            +"</tr>"
            +"<tr>"
            +"<td>"+"IP"+"</td>"
            +"<td>"+d.ip+"</td>"
            +"</tr>"
            +"</tbody>"
            +"</table>"
    document.getElementById("informationshow").innerHTML=ss;
}

function showEdgeInfo(d){
    var ss="<table  class=\"table table-striped\">"
            +"<caption><h2>Edge</h2></caption> "
            +"<tbody>"
    /*+"<tr>"
     +"<td>"+"value"+"</td>"
     +"<td>"+d.value+"</td>"
     +"</tr>"
     +"<tr>"
     +"<td>"+"source.name"+"</td>"
     +"<td>"+d.source.name+"</td>"
     +"</tr>"
     +"<tr>"
     +"<td>"+"target.name"+"</td>"
     +"<td>"+d.target.name+"</td>"
     +"</tr>"*/

    for(var p in d){
        ss += "<tr><td>"+p+"</td><td>"+d[p]+"</td></tr>";
    }
    ss += "</tbody></table>";
    document.getElementById("informationshow").innerHTML=ss;
    }

var links=[];
var nodes=[];
var svg;
var link;
var node;
var color = d3.scale.category20();
var selcetdNodes = {};
var selcetdNodeCount = 0;
var force;

var addcounter = 0;
var addcandidate = [{name:"aaaaa",group:20},
	{name:"bbbbb",group:20},
	{name:"ccccc",group:20},
	{name:"ddddd",group:20},
	{name:"eeeee",group:20},
	{name:"fffff",group:20}]

function addapoint(){
	nodes.push(addcandidate[addcounter]);
	addcounter++;
	nodes.push(addcandidate[addcounter]);
	addcounter++;
	nodes.push(addcandidate[addcounter]);
	addcounter++;
	nodes.push(addcandidate[addcounter]);
	addcounter++;
	nodes.push(addcandidate[addcounter]);
	addcounter++;
	nodes.push(addcandidate[addcounter]);
	addcounter++;
	//console.log(nodes);
}

function zoom() {
	svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function tick(force){
	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
	});
}

function start(force, jsonpath){
	d3.json(jsonpath, function(error, graph) {
		//links = graph.links;
		//nodes = graph.nodes;
		for(var i=0;i<graph.nodes.length;i++){
			nodes.push(graph.nodes[i]);
		}
		for(var i=0;i<graph.links.length;i++){
			links.push(graph.links[i]);
		}
		reallyStart();
	});


}

function reallyStart(){
	//console.log(nodes);
	force
			.start();

	var linkedByIndex = {};
	links.forEach(function(d) {
		linkedByIndex[d.source.index + "," + d.target.index] = 1;
	});
	function isConnected(a, b) {
		return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
	}

	link = link.data(links);
	link.exit().remove();
	link.enter()//.insert("line", ".node")
			.append("line")
			.attr("class", "link")
			.style("stroke-width", function(d) {return d.value;/*return Math.sqrt(d.value);*/ })
			.on("click", function(d) {
				var selectededge = d;
				svg.selectAll(".node").style("fill", function(d) {
					if(selectededge.target.name==d.name||selectededge.source.name==d.name){
						return "grey"}
					return color(d.group); });
				svg.selectAll(".link").style("stroke", function(d) { return "grey"; });
				//d3.select(this).classed("selected", true);
				d3.select(this).style("stroke", "black");

				showEdgeInfo(d)});
	node=node.data(force.nodes(), function(d){return d.name;});
	node.exit().remove();
	node
			.enter().append("circle")
			.attr("class", "node")
			.attr("r", 5)
			.style("fill", function(d) { return color(d.group); })
			.call(force.drag)
			.on("click", function(d) {
				// Find previously selected, unselect
				//d3.select(".selected").classed("selected", false);
				// Select current item
				var selectednode = d;
				var e = d3.event;
				if(e.ctrlKey){
					addapoint();
					reallyStart();
					if(selcetdNodes[selectednode.index]===1){
						selcetdNodes[selectednode.index]=0;
						selcetdNodeCount = selcetdNodeCount-1;

						svg.selectAll(".node").style("fill", function(d) {
							if(selcetdNodes[d.index]){
								return "black";
							}
							return color(d.group); });
					}else{
						selcetdNodes[selectednode.index]=1;
						selcetdNodeCount = selcetdNodeCount+1;
						svg.selectAll(".node").style("fill", function(d) {
							if(selcetdNodes[d.index]){
								return "black";
							}
							return color(d.group); });
					}
				}else{
					selcetdNodes = {};
					selcetdNodes[selectednode.index]=1;
					selcetdNodeCount =1;

					svg.selectAll(".node").style("fill", function(d) {
						if(isConnected(d, selectednode)){
							return "grey";
						}
						return color(d.group); });
					svg.selectAll(".link").style("stroke", function(d) { if(d.target.name==selectednode.name||d.source.name==selectednode.name){
						//d3.select(d.target).style("fill", "black"); //.classed("selected", true);;
						//d.source.classed("selected", true);;
						return "black";}
					else{return "grey";} });
					d3.select(this).style("fill", "black");
				}
				//d3.select(this).classed("selected", true);

				//console.log(selectednode.x);
				showNodeInfo(d)});



}

function addD3(labelname, jsonpath, width, height){

	var color = d3.scale.category20();


	//console.log(nodes);
	force = d3.layout.force()
			.nodes(nodes)
			.links(links)
			.charge(-120)
			.linkDistance(60)
			.size([width, height])


	svg = d3.select(labelname).append("svg")
			.attr("width", width)
			.attr("height", height)
			.call(d3.behavior.zoom().scaleExtent([0.5, 8]).on("zoom", zoom))
			.on("mousedown.zoom",null)
			.append("g");

	var linkG = svg.append("g"),
			nodeG = svg.append("g");

	node = nodeG.selectAll(".node"),
			link = linkG.selectAll(".link");

	start(force, jsonpath);


	/*force
	 .nodes(nodes)
	 .links(links)
	 .start();


	 var linkedByIndex = {};
	 links.forEach(function(d) {
	 linkedByIndex[d.source.index + "," + d.target.index] = 1;
	 });
	 function isConnected(a, b) {
	 return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
	 }

	 link = svg.selectAll(".link")
	 .data(links)
	 .enter().append("line")
	 .attr("class", "link")
	 .style("stroke-width", function(d) { return Math.sqrt(d.value); })
	 .on("click", function(d) {
	 var selectededge = d;
	 svg.selectAll(".node").style("fill", function(d) {
	 if(selectededge.target.name==d.name||selectededge.source.name==d.name){
	 return "grey"}
	 return color(d.group); });
	 svg.selectAll(".link").style("stroke", function(d) { return "grey"; });
	 //d3.select(this).classed("selected", true);
	 d3.select(this).style("stroke", "black");

	 showEdgeInfo(d)});

	 var selcetdNodes = {};
	 var selcetdNodeCount = 0;
	 var node = svg.selectAll(".node")
	 .data(nodes)
	 .enter().append("circle")
	 .attr("class", "node")
	 .attr("r", 5)
	 .style("fill", function(d) { return color(d.group); })
	 .call(force.drag)
	 .on("click", function(d) {
	 // Find previously selected, unselect
	 //d3.select(".selected").classed("selected", false);
	 // Select current item
	 var selectednode = d;
	 var e = d3.event;
	 if(e.ctrlKey){
	 if(selcetdNodes[selectednode.index]===1){
	 selcetdNodes[selectednode.index]=0;
	 selcetdNodeCount = selcetdNodeCount-1;

	 svg.selectAll(".node").style("fill", function(d) {
	 if(selcetdNodes[d.index]){
	 return "black";
	 }
	 return color(d.group); });
	 }else{
	 selcetdNodes[selectednode.index]=1;
	 selcetdNodeCount = selcetdNodeCount+1;
	 svg.selectAll(".node").style("fill", function(d) {
	 if(selcetdNodes[d.index]){
	 return "black";
	 }
	 return color(d.group); });
	 }
	 }else{
	 selcetdNodes = {};
	 selcetdNodes[selectednode.index]=1;
	 selcetdNodeCount =1;

	 svg.selectAll(".node").style("fill", function(d) {
	 if(isConnected(d, selectednode)){
	 return "grey";
	 }
	 return color(d.group); });
	 svg.selectAll(".link").style("stroke", function(d) { if(d.target.name==selectednode.name||d.source.name==selectednode.name){
	 //d3.select(d.target).style("fill", "black"); //.classed("selected", true);;
	 //d.source.classed("selected", true);;
	 return "black";}
	 else{return "grey";} });
	 d3.select(this).style("fill", "black");
	 }
	 //d3.select(this).classed("selected", true);

	 //console.log(selectednode.x);
	 showNodeInfo(d)});

	 svg.on("mousedown", function(d) {
	 console.log("haha");
	 }).on("dbclick",function(d) {
	 alert("kekek");
	 });

	 node.append("title")
	 .text(function(d) { return d.name; });*/

	tick(force, node,link);

}

function addTheD3Map(labelname, jsonpath){
	var width = 800,
			height = 610;
	width = window.screen.width*0.72;
	addD3(labelname, jsonpath, width, height);

}