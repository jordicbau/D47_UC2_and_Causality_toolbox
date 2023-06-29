function causal_graph(data){
    console.log(d3)
    var json = data;
    var nodes = json.nodes;
    var links = json.links;
    var compare = false;
  
    if(compare){
      var sign = json.sign;
    }
    var width = 920,
        color = d3.scale.category20c()

    if(compare){
        var weight_color = d3.scale.linear().domain([0, 1, 1, 2])
                            .range(["red", "lightcoral", "lightblue", "midnightblue"]);
    }
    else{
         var weight_color = d3.scale.linear().domain([0, 1])
                            .range(["lightblue", "midnightblue"]);
    }

    if(nodes.length <= 20) {
        var height = 500
    }
    else if(nodes.length <=80){
        var height = 700
    }else{
        var height = 900
    }

    if(nodes.length <= 6){
        var node_radius = 15
        var node_text = 22
        var refX = 20.5
        var refY = -1.2
        var linkDistance = 150
        var force_charge = -1000
        var font_size = "15"
        var markerWidth =  2.7
        var markerHeight =  2.7
        var stroke_width = 5
        var link_font_size = "13"
    }
    else if(nodes.length <= 20){
        var node_radius = 9
        var node_text = 17
        var refX = 20.3
        var refY = -0.6
        var linkDistance = 125
        var force_charge = -300
        var font_size = "12"
        var markerWidth =  2.9
        var markerHeight =  2.9
        var stroke_width = 3
        var link_font_size = "10"
    }
    else{
        var node_radius = 5
        var node_text = 12
        var refX = 17
        var refY = -1.2
        var linkDistance = 100
        var force_charge = -200
        var font_size = "10"
        var markerWidth =  5
        var markerHeight =  5
        var stroke_width = 1.5
        var link_font_size = "9"
    }

    
    
    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(linkDistance)
        .charge(force_charge)
        .on("tick", tick)
        .start();
    
    // Set the range
    var  v = d3.scale.linear().range([0, 1]);
    
    // Scale the range of the data
    v.domain([0, d3.max(links, function(d) { return d.weight; })]);
    
    d3.select("#graph").select("svg").remove();
    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // build the arrow.
    var arrow = svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", refX)
        .attr("refY", refY)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
    .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
    
    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
    .enter().append("svg:path")
        .attr("class", function(d, i) { return "link " + d.type; })
        .attr("marker-end", "url(#end"+")")
        .style("stroke", function(d) { if(d.sign){ return weight_color(d.weight*d.sign+1); }else{ return weight_color(d.weight) } })
        .style("stroke-width", stroke_width);

        links.forEach(function(l, i){
            path[0][i].id = 'link'+'_'+ i;
        })
    


    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
    .enter().append("g")
        .attr("class", "node")
        //.on("click", click)
        .on("dblclick", dblclick)
        .call(force.drag);
    
    // add the nodes
    node.append("circle")
        .attr("r", node_radius)
        .style("fill", function(d) { return color(d.name); });
    
    
    // add the text 
    node.append("text")
        .attr("x", node_text)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; })
        .style("font", font_size+"px sans-serif");

    var link_label = svg.selectAll(".link_label")
        .data(links)
        .enter()
        .append("text")
        .attr("paint-order", "stroke")
        .attr("stroke-width", 5)
        .attr("stroke-opacity", 1)
        .attr("stroke-linecap", "butt")
        .attr("stroke-linejoin", "miter")
        .style("font", link_font_size+"px sans-serif")
        .style("fill", function(d) { if(d.sign){ return weight_color(d.weight*d.sign+1); }else{ return weight_color(d.weight) } })
        .attr("dy", -5)
        .append("textPath")
        //.attr("startOffset", "40%")
        .attr("startOffset", function(d){
          if(d.sign){
              if(d.sign < 0){
                return "55%"
              }else{
                  return "25%"
              }
          }else{
              return "40%"
          }
        })
        .attr("xlink:href", function(d, i) {
        return "#link"+"_" + i;
    })
    .text(function(d, i) {
        return d.weight;
    });


    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + 
                d.source.x + "," + 
                d.source.y + "A" + 
                dr + "," + dr + " 0 0,1 " + 
                d.target.x + "," + 
                d.target.y;
        });
    
        node
            .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; });
    }
    
    // action to take on mouse double click
    function dblclick(l) {
        if(link_label.style('fill') == 'none'){
            link_label.style("fill", function(d) { if(d.sign){ return weight_color(d.weight*d.sign+1); }else{ return weight_color(d.weight) } })
        }
        else{
            link_label.attr("fill", "none")
        }
            
    }
    
    // action to take on mouse click
    function click() {
        link_label.attr("fill", "black")
    }

}


function edge_graph(json){
    console.log(d3)
    var compare=false;

    var diameter = 620,
        radius = diameter / 2,
        innerRadius = radius - 120;
    
    var cluster = d3.cluster()
        .size([360, innerRadius]);
    
    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });
    
    d3.select("#edge").select("svg").remove();
    var svg = d3.select("#edge").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");
    
    var link = svg.append("g").selectAll(".link"),
        node = svg.append("g").selectAll(".node");
        
        var classes = json
        var root = packageHierarchy(classes)
            .sum(function(d) { return d.size; });
        
        cluster(root);
        
        if(compare){
          var imports = packageImports(root.leaves()).imports
          var signs = packageImports(root.leaves()).sign
        }else{
          var imports = packageImports(root.leaves()).imports
        }

        

        link = link
        .data(imports)
        .enter().append("path")
            .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line);
    
        node = node
        .data(root.leaves())
        .enter().append("text")
            .attr("class", "node")
            .attr("dy", "0.31em")
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .text(function(d) { return d.data.key; })
            .on("mouseover", mouseovered)
            .on("mouseout", mouseouted);
            
    
        // build the arrow.
    var arrows_end = svg.append("svg:defs").selectAll("marker")
                        .data(["end-1"])      // Different link/path types can be defined here
                    .enter().append("svg:marker")    // This section adds in the arrows
                        .attr("id", String)
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 7)
                        .attr("refY", -0.3)
                        .attr("markerWidth", 5)
                        .attr("markerHeight", 5)
                        .attr("orient", "auto")
                    .append("svg:path")
                        .attr("d", "M0,-5L10,0L0,5")
                        .attr('class', 'marker--source');

    var arrows_start = svg.append("svg:defs").selectAll("marker")
                        .data(["end-2"])      // Different link/path types can be defined here
                    .enter().append("svg:marker")    // This section adds in the arrows
                        .attr("id", String)
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 7)
                        .attr("refY", -0.3)
                        .attr("markerWidth", 5)
                        .attr("markerHeight", 5)
                        .attr("orient", "auto")
                    .append("svg:path")
                        .attr("d", "M0,-5L10,0L0,5")
                        .attr('class', 'marker--target');
    function mouseovered(d) {

        node
            .each(function(n) { n.target = n.source = false; });
        
        if(signs){
            link
                .classed("link--target", function(l, i) { if(signs[i]>0){ if (l.target === d) return l.source.source = true;} })
                .classed("link--source", function(l, i) { if(signs[i]>0){if (l.source === d) return l.target.target = true;} })
                .classed("link--target--2", function(l, i) { if(signs[i]<0){ if (l.target === d) return l.source.source = true;} })
                .classed("link--source--2", function(l, i) { if(signs[i]<0){if (l.source === d) return l.target.target = true;} })
            .filter(function(l) { return l.target === d || l.source === d; })
                .raise();
        }else{
          link
              .classed("link--target", function(l, i) { if (l.target === d) return l.source.source = true; })
              .classed("link--source", function(l, i) { if (l.source === d) return l.target.target = true; })
          .filter(function(l) { return l.target === d || l.source === d; })
              .raise();
        }

        link
            .attr("marker-start", function(l, i) { if(true){if (l.target === d) return "url(#end-1)";} })
            .attr("marker-end", function(l, i) { if(true){if (l.source === d) return "url(#end-2)";} })
        .filter(function(l) { return l.target === d || l.source === d; })
            .raise();
    
        node
            .classed("node--source", function(n, i) { return n.source; })
            .classed("node--target", function(n, i) {  return n.target; });
            //.classed("node--source", function(n, i) { if(signs[i]<0){return n.source;} })
            //.classed("node--target", function(n, i) { if(signs[i]<0){ return n.target;} });
    }
    
    function mouseouted(d) {
        link
            .attr("marker-end", null)
            .attr("marker-start", null)
            .attr("marker-end--2", null)
            .attr("marker-start--2", null)
            .classed("link--target", false)
            .classed("link--source", false)
            .classed("link--target--2", false)
            .classed("link--source--2", false);
    
        node
            .classed("node--target", false)
            .classed("node--source", false)
            .classed("node--target--2", false)
            .classed("node--source--2", false);
    }
    
    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
        var map = {};
    
        function find(name, data) {
          var node = map[name], i;
          if (!node) {
              node = map[name] = data || {name: name, children: []};
              if (name.length) {
              node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
              node.parent.children.push(node);
              node.key = name.substring(i + 1);
              if(compare){node.sign = data.sign}
              }
          }
          return node;
        }
    
        classes.forEach(function(d) {
          find(d.name, d);
        });
    
        return d3.hierarchy(map[""]);
    }
    
    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        var map = {},
            imports = [];
            sign = [];
        // Compute a map from name to node.
        nodes.forEach(function(d, i) {
          //alert(d.data.sign[i])
        map[d.data.name] = d;
        });
        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
        if (d.data.imports) d.data.imports.forEach(function(i) {
              imports.push(map[d.data.name].path(map[i]));
          });
          if(compare){
            if (d.data.sign) d.data.sign.forEach(function(i) {
              sign.push(i);
            })
          }
        });
        var dict = {}
        dict['imports'] = imports;
        if(compare){dict['sign'] = sign};

        return dict;
    }

    // Handmade legend
    svg.append("circle").attr("cx",250).attr("cy",-180).attr("r", 6).style("fill", "#eb8510")
    svg.append("circle").attr("cx",250).attr("cy",-150).attr("r", 6).style("fill", "#3f7ccc")
    svg.append("text").attr("x", 270).attr("y", -180).text("Source").style("font-size", "12px").style("fill", "#eb8510").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 270).attr("y", -150).text("Target").style("font-size", "12px").style("fill", "#3f7ccc").attr("alignment-baseline","middle")


}