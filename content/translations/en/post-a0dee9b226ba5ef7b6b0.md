---
title: Computer Networking (V) Routing Algorithms
description: ''
---

1. Table of Contents
{:toc}


### Classification of Routing Algorithms

1. **Non-Adaptive Algorithms**
   - A static decision process: the algorithm has already determined the routes at design time and does not adjust them based on the actual network conditions.
   - Example: Static Routing.

2. **Adaptive Algorithms**
   - A dynamic decision process: the algorithm adjusts routes based on dynamic changes such as network topology and traffic load.
   - Example: Dynamic Routing.

---

### Non-Adaptive Algorithms

1. **Shortest Path Routing**
   - Uses Dijkstra's algorithm to compute the shortest path between two points in the network.
   - Dijkstra's algorithm is based on the principle of minimizing weights (such as distance, delay, cost, etc.), progressively updating paths until the shortest paths for all nodes have been computed.

2. **Flooding**
   - Whenever a node receives a data packet, it sends that packet to all neighboring nodes except the sender.
   - Characteristics:
     - Simple and direct, requiring no complex routing table.
     - Drawback: generates a large number of duplicate packets, wasting bandwidth resources.

---

### Adaptive Algorithms

1. **Distance Vector Routing**
   - Each router maintains a table recording its estimated distance to all other nodes (called a distance vector table).
   - Routers periodically advertise their distance vector tables to neighbors and update their own tables based on the distance vector tables received from neighbors.
   - Example: J estimates the delay to C
     ```
     JAC: 25 + 8 = 33  
     JIC: 18 + 10 = 28  
     JHC: 19 + 12 = 31  
     JKC: 36 + 6 = 42  
     因此，J -> I -> C 的延迟最低，为28。
     ```

2. **Link State Routing**
   - By broadcasting link state information, all routers share the topology map of the entire network and use Dijkstra's algorithm to compute shortest paths.
   - Basic steps:
     1. Discover directly connected neighbor nodes.
     2. Determine link costs (such as delay or the inverse of bandwidth).
     3. Construct link state packets (LSPs).
     4. Send the LSPs to all other routers in the network.
     5. Use Dijkstra's algorithm to compute the shortest paths to other nodes.

---

### Other Routing Algorithms

1. **Hierarchical Routing**
   - Divides the network into multiple regions or levels; each router only needs to maintain detailed routing information for its own region and summary information for other regions.
   - Advantages:
     - Reduced routing table size and lower memory requirements.
     - Reduced time required to compute optimal routes.
   - Disadvantages:
     - Paths may not be globally optimal, but they are close to optimal.

2. **Broadcasting Routing**
   - Goal: send data packets to all hosts in the network.
   - Basic method:
     - Flooding: send to all neighbors, which may generate a large number of duplicate packets.
   - Improved method: Reverse Path Forwarding (RPF)
     - Check whether the data packet arrived from the source via the best path.
     - If so, forward it to other nodes; otherwise, discard the duplicate packet.

3. **Multicasting Routing**
   - Divides nodes in the network into groups; each group constructs a spanning tree, and nodes within the group share data packets.
   - Suitable for scenarios that require delivering information to a specific small group, such as video conferencing or multicast communication.

---

### Example Questions and Answers

#### Why does the network layer need routing algorithms? What are the main categories of routing algorithms?

Routing algorithms help the network layer decide which output line incoming data packets should be transmitted over, ensuring that data packets reach their destination correctly and efficiently.
- **Main categories**:
  - Non-adaptive algorithms (such as Shortest Path Routing and Flooding).
  - Adaptive algorithms (such as Distance Vector Routing and Link State Routing).

#### Basic Steps of Dijkstra's Algorithm

Dijkstra's algorithm is used to compute the shortest paths from one node to all other nodes in the network.
Basic steps:
1. Initialization: set an initial distance for each node (usually infinity), and set the distance of the starting point to 0.
2. Select the unvisited node with the smallest distance and mark it as visited.
3. Update the distances of neighboring nodes; if the path through the current node is shorter, update the shortest path value of the neighboring node.
4. Repeat steps 2 and 3 until all nodes have been visited.
