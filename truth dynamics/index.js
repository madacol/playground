class NetworkSimulation {
    constructor() {
        /**
         * @type {Array<{id: number, state: string, factChecked: boolean, degree: number}>}
         */
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.svg = d3.select("#network");
        this.width = this.svg.node().parentElement.clientWidth;
        this.height = 600;
        this.svg.attr("viewBox", [0, 0, this.width, this.height]);
        
        this.initializeSimulation();
        this.setupEventListeners();
    }

    initializeSimulation() {
        const alpha = parseFloat(document.getElementById("alpha").value);
        const beta = parseFloat(document.getElementById("beta").value);
        const numNodes = parseInt(document.getElementById("nodes").value);

        // Generate network
        this.nodes = Array.from({length: numNodes}, (_, i) => new Node(i));

        this.links = this.generateLinks(alpha, beta);

        // Update node degrees
        this.nodes.forEach(node => {
            node.degree = this.links.filter(l => 
                l.source === node.id || l.target === node.id
            ).length;
        });

        // Create force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links)
                .id(d => d.id)
                .distance(50))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .on("tick", () => this.tick());

        this.drawNetwork();
        this.updateStatistics();
    }

    generateLinks(alpha, beta) {
        const links = [];
        const n = this.nodes.length;
        const maxLinks = (n * (n - 1)) / 2;
        const targetLinks = Math.floor(maxLinks * beta);

        // Helper function to add a link
        const addLink = (source, target) => {
            if (source !== target && !links.some(l => 
                (l.source === source && l.target === target) || 
                (l.source === target && l.target === source))) {
                links.push({source, target});
            }
        };

        // Create initial random links
        while (links.length < targetLinks) {
            if (Math.random() < alpha) {
                // Preferential attachment
                const degrees = this.nodes.map(n => 
                    links.filter(l => l.source === n.id || l.target === n.id).length + 1);
                const sum = degrees.reduce((a, b) => a + b, 0);
                let r = Math.random() * sum;
                let source = 0;
                for (let i = 0; i < degrees.length; i++) {
                    r -= degrees[i];
                    if (r <= 0) {
                        source = i;
                        break;
                    }
                }
                const target = Math.floor(Math.random() * n);
                addLink(source, target);
            } else {
                // Random attachment
                const source = Math.floor(Math.random() * n);
                const target = Math.floor(Math.random() * n);
                addLink(source, target);
            }
        }

        return links;
    }

    drawNetwork() {
        this.svg.selectAll("*").remove();

        const link = this.svg.append("g")
            .selectAll("line")
            .data(this.links)
            .join("line")
            .attr("class", "link");

        const node = this.svg.append("g")
            .selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("class", "node")
            .attr("r", d => 5 + d.degree / 2)
            .attr("fill", d => {
                if (d.state === 'infected') return '#ff0000';
                if (d.state === 'factChecked') return '#00ff00';
                return '#69b3a2';
            });

        node.append("title")
            .text(d => `Node ${d.id}\nDegree: ${d.degree}`);

        this.link = link;
        this.node = node;
    }

    tick() {
        this.link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        this.node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    updateStatistics() {
        // Calculate average degree
        const avgDegree = this.nodes.reduce((sum, node) => sum + node.degree, 0) / this.nodes.length;
        document.getElementById("avg-degree").textContent = avgDegree.toFixed(2);

        // Calculate clustering coefficient
        let totalClustering = 0;
        this.nodes.forEach(node => {
            const neighbors = this.links
                .filter(l => l.source.id === node.id || l.target.id === node.id)
                .map(l => l.source.id === node.id ? l.target.id : l.source.id);
            
            let triangles = 0;
            for (let i = 0; i < neighbors.length; i++) {
                for (let j = i + 1; j < neighbors.length; j++) {
                    if (this.links.some(l => 
                        (l.source.id === neighbors[i] && l.target.id === neighbors[j]) ||
                        (l.source.id === neighbors[j] && l.target.id === neighbors[i])
                    )) {
                        triangles++;
                    }
                }
            }
            const possibleTriangles = (neighbors.length * (neighbors.length - 1)) / 2;
            totalClustering += possibleTriangles > 0 ? triangles / possibleTriangles : 0;
        });
        const clustering = totalClustering / this.nodes.length;
        document.getElementById("clustering").textContent = clustering.toFixed(3);

        // Calculate centralization
        const maxDegree = Math.max(...this.nodes.map(n => n.degree));
        const centralization = this.nodes.reduce((sum, node) => 
            sum + (maxDegree - node.degree), 0) / 
            ((this.nodes.length - 1) * (this.nodes.length - 2));
        document.getElementById("centralization").textContent = centralization.toFixed(3);

        // Calculate spread statistics
        const infected = this.nodes.filter(n => n.state === 'infected').length;
        const factChecked = this.nodes.filter(n => n.factChecked).length;
        document.getElementById("spread").textContent = 
            `${((infected / this.nodes.length) * 100).toFixed(1)}%`;
        document.getElementById("fact-checked").textContent = 
            `${((factChecked / this.nodes.length) * 100).toFixed(1)}%`;
    }

    startInformationSpread() {
        const spreadRate = parseFloat(document.getElementById("spread-rate").value);
        const factCheckDelay = parseInt(document.getElementById("fact-check-delay").value);
        
        // Infect a random node
        const startNode = Math.floor(Math.random() * this.nodes.length);
        this.nodes[startNode].state = 'infected';
        
        const spread = () => {
            // Spread information
            this.nodes.forEach(node => {
                if (node.state === 'infected') {
                    const neighbors = this.links
                        .filter(l => l.source.id === node.id || l.target.id === node.id)
                        .map(l => l.source.id === node.id ? l.target : l.source);
                    
                    neighbors.forEach(neighbor => {
                        if (neighbor.state === 'susceptible' && Math.random() < spreadRate) {
                            neighbor.state = 'infected';
                        }
                    });
                }
            });

            // Update visualization
            this.node.attr("fill", d => {
                if (d.state === 'infected') return '#ff0000';
                if (d.factChecked) return '#00ff00';
                return '#69b3a2';
            });

            this.updateStatistics();

            // Continue spreading if there are still susceptible nodes
            if (this.nodes.some(n => n.state === 'susceptible')) {
                setTimeout(spread, 1000);
            }
        };

        // Start fact-checking after delay
        setTimeout(() => {
            const factCheck = () => {
                this.nodes.forEach(node => {
                    if (node.state === 'infected' && !node.factChecked && Math.random() < 0.2) {
                        node.factChecked = true;
                    }
                });

                this.updateStatistics();

                if (this.nodes.some(n => !n.factChecked)) {
                    setTimeout(factCheck, 1000);
                }
            };
            factCheck();
        }, factCheckDelay * 1000);

        spread();
    }

    setupEventListeners() {
        document.getElementById("reset").addEventListener("click", () => {
            this.initializeSimulation();
        });

        document.getElementById("start-spread").addEventListener("click", () => {
            this.startInformationSpread();
        });

        ['alpha', 'beta', 'nodes'].forEach(id => {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(`${id}-value`);
            input.addEventListener("input", (e) => {
                valueSpan.textContent = e.target.value;
                this.initializeSimulation();
            });
        });

        ['spread-rate', 'fact-check-delay'].forEach(id => {                                                                                                                    
             const input = document.getElementById(id);                                                                                                                         
             const valueSpan = document.getElementById(`${id}-value`);                                                                                                          
             input.addEventListener("input", (e) => {                                                                                                                           
                 valueSpan.textContent = e.target.value;                                                                                                                        
             });                                                                                                                                                                
         });                                                                                                                                                                    
     }                                                                                                                                                                          
 }                                                                                                                                                                              
                                                                                                                                                                                
 // Initialize simulation when page loads                                                                                                                                       
 const simulation = new NetworkSimulation();