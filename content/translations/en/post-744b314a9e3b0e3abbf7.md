---
title: Computer Networking (7) Application Layer
description: ''
---

1. Table of Contents
{:toc}

## Domain Name System (DNS)

### Query Mechanisms

#### 1. Recursive Query
- The server obtains the mapping on behalf of the client, rather than returning a partial answer
- DNS clients typically send recursive queries to the local name server
- The local name server then issues a series of iterative queries to resolve the domain name

#### 2. Iterative Query
- The contacted server replies with the name of the server to contact
- If the queried server is not authoritative for the queried domain, the query issuer will accept a referral to another name server

### Potential Challenges of DNS Queries
- Single point of failure
- Traffic congestion
- Remote queries
- Service maintenance issues
- Query response speed may be limited
- Front-end scaling presents computational challenges

## HTTP (Hypertext Transfer Protocol)

### HTTP Connection Types

#### 1. Non-persistent HTTP
- Each TCP connection transmits only one object
- A new TCP connection is established for each request/response pair

#### 2. Persistent HTTP
- A single TCP connection can send multiple objects
- Advantages:
  - Reduces the overhead of establishing connections
  - Shortens response time
  - Reduces server load

### Connection Establishment Process
- First RTT: TCP three-way handshake establishes the connection
- Second RTT: Send the HTTP request and receive the response

### Cookies
- HTTP servers are essentially stateless
- Cookies store a small amount of information (<4KB) on the user's computer

#### Advantages of Cookies
- Authorization
- User session state management
- Shopping cart functionality
- Personalized recommendations

#### Considerations
- There may be controversy over user tracking

## Email Protocols

### Key Components
- User agent: allows users to read and send email (e.g., Microsoft Outlook)
- Message transfer agent: transfers messages from source to destination
- Message transfer protocol

### Main Protocols
#### 1. SMTP (Simple Mail Transfer Protocol)
- Used for mail submission and transfer
- Transfers between the user agent and the message transfer agent

#### 2. Final Delivery Protocols
- POP3 (Post Office Protocol 3): downloads to a single device
- IMAP (Internet Message Access Protocol): supports multi-device access

## Multimedia Data Transmission

### Limitations of Simple Download
- Media files must be fully downloaded before playback
- Users must wait for the download to complete
- Primarily assumes point-to-point data distribution

### Multimedia Protocols
- HTTP: application layer protocol
- RTSP (Real Time Streaming Protocol): application layer protocol
- RTP (Real-time Transport Protocol): transport layer protocol, based on UDP
- MPEG-4: media compression

### Perceptual Coding
- Uses the limitations of the human perceptual system for lossy compression
- For example:
  - Frequency masking: certain frequencies can mask other sounds
  - Temporal masking: after a loud sound, the human ear temporarily cannot perceive soft sounds
