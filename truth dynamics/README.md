# Network Structure

## Network Generation Model
- Single generative model G(N, E, α, β) where:
  - N = number of nodes (people)
  - E = edges (connections)
  - α = centralization parameter (0-1)
  - β = density parameter (0-1)

### Algorithm
1. Start with N nodes
2. For each new edge:
   - With probability α, use preferential attachment
   - With probability (1-α), create random connection
3. Continue until reaching target density determined by β

### Parameter Mappings
- Pre-social media: 
  - Low α (≈0.2) = mostly random connections
  - Low β (≈0.1) = sparse connections
  - Results in:
    - More normal-like degree distribution
    - Lower average degree (k ≈ 10-15)
    - Higher clustering coefficient
    - More local community structure

- Post-social media:
  - High α (≈0.8) = mostly preferential attachment
  - High β (≈0.4) = dense connections
  - Results in:
    - More power-law-like degree distribution
    - Higher average degree (k ≈ 150-300)
    - Lower clustering coefficient
    - More hub-and-spoke structure

### Network Metrics
- Degree distribution P(k)
- Clustering coefficient C
- Average path length L
- Centralization index
- Community modularity Q

# Node (Person) Properties

## Individual Characteristics
1. Verification tendency (v): 0-1
   - Probability of personally fact-checking information
   - Cost of verification: c_v (time/effort required)
   - Verification accuracy: a_v (0-1)

2. Share threshold (s): 0-1
   - Lower value = more likely to share
   - Modified by emotional valence of content
   - Share probability = min(1, s * emotional_impact)

3. Source memory (m): 0-1
   - How well they track information sources
   - Decay rate for source memory: d_m
   - Recent source weight: w_recent

4. Trust update rate (τ): 0-1
   - How quickly they update trust in sources
   - Based on verified accuracy of past information

## Node States
- Belief state for each piece of information: b_i ∈ [0,1]
- Trust values for each source: t_s ∈ [0,1]
- Memory of recent sources: M = {(source, time, accuracy)}
- Share history: H = {(info_id, time, recipients)}

# Information Dynamics

## Content Properties
1. Verifiability (f): 0-1
   - How easily fact-checkable the information is
   - Affects verification cost: c_v * (1/f)

2. Emotional impact (e): 0-2
   - How emotionally triggering the content is
   - Multiplier for share probability
   - Values >1 increase share probability

3. Truth value (t): 0-1
   - Ground truth accuracy of the information
   - Unknown to nodes until verification

## Spread Mechanics
1. Time-based dynamics:
   - Information spread rate: r_s
   - Fact-check publication delay: d_fc
   - Attention decay rate: λ
   - Information lifetime until saturation: T_sat

2. Belief Formation:
   - Initial belief b_0 based on source trust
   - Belief update function:
     b_new = w_p * b_old + w_r * repetition_factor + w_v * verification_result
     where w_p + w_r + w_v = 1

3. Share Decision:
   P(share) = min(1, s * e * b_i * trust_factor)

# Model Parameters for Simulation

## Network Parameters
- N: Number of nodes (e.g., 10000)
- h: Hub influence (0-1)
- k_pre: Pre-social media average degree
- k_post: Post-social media average degree

## Time Parameters
- Δt: Time step size
- T: Total simulation time
- d_fc: Fact-checking delay

## Population Parameters
- μ_v, σ_v: Mean and std of verification tendency
- μ_s, σ_s: Mean and std of share threshold
- μ_m, σ_m: Mean and std of source memory
- μ_τ, σ_τ: Mean and std of trust update rate

## Content Parameters
- μ_f, σ_f: Mean and std of verifiability
- μ_e, σ_e: Mean and std of emotional impact
- p_true: Proportion of true information

# Implementation Notes

1. Initialize network structure with configurable h parameter
2. Generate population with distributed characteristics
3. Simulate information spread in discrete time steps
4. Track and measure:
   - Information spread patterns
   - Belief distribution
   - Verification rates
   - Share patterns
   - Trust evolution
   - Fact-checker impact

5. Key Metrics:
   - Time to saturation
   - Final belief distribution
   - Verification rate
   - Share rate
   - Trust accuracy
   - Network centralization
   - Information cascade sizes
