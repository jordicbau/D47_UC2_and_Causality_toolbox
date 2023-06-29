//Network Graph Function

function causal_graph(data, compare=false, lags = false){
    
    var json = data
    var nodes = json.nodes;
    var links = json.links;
    var neighbors = []
    
        for(let i = 0; i < data['nodes'].length; i++){
            
            var neighbor = []
            for(let j = 0; j < data['links'].length; j++){
                if(data['links'][j]['source'] === i){
                    if(!neighbor.includes(data['links'][j]['target'])){
                        neighbor.push(data['links'][j]['target'])
                    }
                }
                else if(data['links'][j]['target'] == i){
                    if(! neighbor.includes(data['links'][j]['source'])){
                        neighbor.push(data['links'][j]['source'])
                    }
                }
            }
            neighbors.push({'var':i, 'neighbor': neighbor})
        }
    var lags = lags;
    
    var width = 1080,
        color = d3.scale.category20c(),
        node_color = d3.scale.linear().domain([0, 1])
                            .range(["firebrick", "orange"]);

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
        var node_radius = 23
        var node_text = 27
        var refX = 24
        var refY = -1.2
        var linkDistance = 250
        var force_charge = -1000
        var font_size = "15"
        var markerWidth =  3.7
        var markerHeight =  3.7
        var stroke_width = 4
        var link_font_size = "15"
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
    
    function marker(color, opacity) {

        svg.append("svg:defs").append("svg:marker")
            .data(["end"]) 
            .attr("id", color.replace("#", "")+"_"+opacity+"_")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", refX) // This sets how far back it sits, kinda
            .attr("refY", refY)
            .attr("markerWidth", markerWidth)
            .attr("markerHeight", markerHeight)
            .attr("orient", "auto")
            .attr('fill-opacity', opacity)
            .style('stroke-width',1.6)
            .style("stroke", "white")
            .style("stroke-opacity", opacity)
            //.attr("markerUnits", "userSpaceOnUse")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .style("fill", color);
        
        return "url(" + color + "_" + opacity + "_" +")";
    };
    
    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("class", function(d, i) { return "link " + d.type; })
        //.attr("marker-end", "url(#end"+id+")")
        .each(function(d) {
            if(d.sign){ color = weight_color(d.weight*d.sign+1); }else{ color = weight_color(d.weight) }
            var opacity = 1
            d3.select(this).style("stroke", color)
                           .attr("marker-end", marker(color, opacity));
        })
        .style("stroke",function(d){if(d.sign){ return weight_color(d.weight*d.sign+1);}else{return weight_color(d.weight)}})
        .style("stroke-width", stroke_width)
        .style('fill-opacity', 0)
        .style('stroke-opacity',1);

        links.forEach(function(l, i){
            path[0][i].id = 'link_'+ i;
        })
    


    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
    .enter().append("g")
        .attr("class", "node")
        //.on("click", click)
        //.on("dblclick", dblclick)
        .call(force.drag);
    
    // add the nodes
    node.append("circle")
        .attr("r", node_radius)
        .style("fill", function(d) { return node_color(d.node_value); });
    
    
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
        return "#link_" + i;
    })
    .text(function(d, i) {
        if(lags){return d.lag}else{return d.weight};
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
    


    

}