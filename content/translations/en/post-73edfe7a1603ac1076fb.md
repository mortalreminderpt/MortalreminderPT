---
title: 'Computer Networking (Part 1): The Physical Layer'
description: ''
---

1. Table of Contents
{:toc}

### **Role of the Physical Layer**
The physical layer is responsible for transmitting raw data bit streams over different physical media. It provides electrical, mechanical, functional, and procedural interfaces to support communication between devices. The physical layer also defines signal encoding, transmission rate, transmission direction, topology, and more.

**Examples**:
- In optical fiber, the physical layer uses optical signals to transmit data.
- On twisted pair, electrical signals are used to transmit data.

---

### **Bandwidth and Delay**

#### **Bandwidth**
- Bandwidth represents the maximum data rate a channel can transmit, measured in bits per second (bps).
- High bandwidth means more data can be transmitted at the same time.

**Examples**:
- **Voice transmission**: A call requires about 1 Kbps of bandwidth.
- **Single-mode fiber**: Provides up to 1 Tbit/sec of bandwidth, suitable for long-distance high-speed communication.

#### **Delay**
- Delay refers to the time required for data to travel from the sender to the receiver.
- **Delay formula**:
  $
  \text{Latency} = T\text{-delay} + P\text{-delay}
  $
  - **Transmission delay (T-delay)**: message length (bits) / transmission rate (bits/sec)
  - **Propagation delay (P-delay)**: channel length (meters) / signal speed (meters/sec)

**Example 1**:
A home computer connects to an ISP server via a 56 Kbps modem:
- Frame size = 5600 bits, signal speed = $ \frac{2}{3}C = 200,000 $ km/sec, link length = 5 km.
- $ T\text{-delay} = \frac{5600}{56,000} \approx 0.1 $ seconds.
- $ P\text{-delay} = \frac{5}{200,000} \approx 25 $ microseconds.

**Example 2**:
A nationwide optical broadband link:
- Link length = 1000 km, bandwidth = 100 Mbps.
- $ T\text{-delay} = \frac{5600}{100,000,000} = 0.000056 $ seconds.
- $ P\text{-delay} = \frac{1000}{300,000} \approx 3.33 $ milliseconds.

---

### **Transmission Media**

#### **Wired Transmission**
- **Types**: twisted pair, coaxial cable, optical fiber.
- **Pros and cons**:
  - **Twisted pair**: low cost, low bandwidth, weak interference resistance.
  - **Coaxial cable**: high bandwidth, strong interference resistance.
  - **Optical fiber**: high bandwidth, low delay, high security, but expensive.

#### **Wireless Transmission**
- **Types**: electromagnetic waves, satellites.
- **Pros and cons**:
  - **Radio waves**: high mobility, but limited bandwidth and large delay fluctuations.
  - **Satellites**: wide coverage, but high delay and signals are susceptible to interference.

---

### **Link Types**

- **Simplex**: data can only be transmitted in one direction (e.g., broadcast).
- **Half-Duplex**: data can be transmitted in both directions, but not simultaneously (e.g., walkie-talkie).
- **Full-Duplex**: data can be transmitted in both directions simultaneously (e.g., telephone).

---

### **Multiplexing**

- **TDM (Time Division Multiplexing)**: time slots are divided in time, and users take turns using the channel.
- **FDM (Frequency Division Multiplexing)**: different users use different frequency bands.
- **CDMA (Code Division Multiple Access)**: different codes are used to distinguish users.

**Examples**:
- **TDM**: time slots are allocated to each user to avoid conflicts.
- **FDM**: FM radio allocates different frequency bands to each station.
- **CDMA**: an important technology in mobile communications.

---

### **Modulation**

Modulation is the process of converting digital signals into analog signals suitable for transmission.

- **Baseband signal**: an unmodulated low-frequency signal.
- **Passband signal**: a modulated high-frequency signal.

**Modulation methods**:
1. **ASK (Amplitude Shift Keying)**: uses different amplitudes to represent 0 and 1.
2. **FSK (Frequency Shift Keying)**: uses different frequencies to represent 0 and 1.
3. **PSK (Phase Shift Keying)**: uses different phases to represent 0 and 1.

---

### **Baud Rate and Bit Rate**

- **Symbol Rate (Baud Rate)**: the number of symbols transmitted per second.
- **Bit Rate**: the number of bits transmitted per second.

Relationship formula:
$
\text{Bit Rate} = \text{Baud Rate} \times \text{bits per symbol}
$

**Example**:
If 1200 symbols are transmitted per second and each symbol carries 2 bits, the bit rate is 2400 bps.

---

### **Nyquist Theorem**

- In a noiseless channel, the maximum data rate is:
$
\text{Max Data Rate} = 2B \cdot \log_2(V)
$
- $ B $: channel bandwidth.
- $ V $: number of signal levels.

**Example**:
If the channel bandwidth is 3000 Hz and the number of signal levels is 8, the maximum data rate is:
$
2 \cdot 3000 \cdot \log_2(8) = 18,000 \text{ bps}
$

---

### **Shannon Theorem**

In a noisy channel, the maximum data rate is:
$
\text{Max Data Rate} = B \cdot \log_2(1 + \frac{S}{N})
$
- $ S/N $: signal-to-noise ratio.

**Example**:
If the channel bandwidth is 3000 Hz and the signal-to-noise ratio is 100, the maximum data rate is:
$
3000 \cdot \log_2(1 + 100) \approx 19,931 \text{ bps}
$

--- 

### Summary
The physical layer plays a crucial role in communication systems. It connects hardware with the other protocols in the network stack and ensures that data is transmitted reliably and efficiently over the transmission medium.
