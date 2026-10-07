---
layout: page
title: dApps and the E3 Interface
seo_title: "dApps and the E3 Interface: Real-Time AI Control in Open RAN – Michele Polese"
description: "dApps are distributed applications for real-time inference and control in O-RAN, connected to the RAN through the E3 interface. Papers, open-source code, O-RAN nGRG report, and adoption in NVIDIA Aerial, Nokia, Cohere, and Radisys."
tags: [dApps, E3, Open RAN, O-RAN, Michele Polese]
date: 2026-10-07
comments: false
---

The O-RAN architecture enables data-driven control through xApps and rApps running on the near-real-time and non-real-time RAN Intelligent Controllers (RICs). These control loops operate at timescales of 10 ms and above, and do not have access to low-level data such as I/Q samples. **dApps** are distributed applications that run at the edge, alongside the CU and DU, to support real-time inference and control (below 10 ms) on data that cannot leave the base station. dApps interact with the RAN through the **E3 interface** and can coordinate with xApps on the near-real-time RIC.

We introduced dApps in 2022 and have since built open implementations on OpenAirInterface and NVIDIA Aerial. dApps and the E3 interface are now part of major commercial protocol stacks, including **NVIDIA Aerial, Nokia, Cohere, and Radisys**.

## Standardization

* I am editor and rapporteur for the O-RAN ALLIANCE next Generation Research Group (nGRG) research item on dApps. The nGRG research report on dApps is [available here](https://tinyurl.com/oran-dapps-report).
* dApps were presented at the O-RAN ALLIANCE all-members meeting in October 2025.

## Code

* [OpenRAN Gym](https://openrangym.com) includes dApp and E3 implementations for OpenAirInterface and NVIDIA Aerial.

## Key papers

* S. D'Oro, M. Polese, L. Bonati, H. Cheng, and T. Melodia, "dApps: Distributed Applications for Real-time Inference and Control in O-RAN," IEEE Communications Magazine, vol. 60, no. 11, pp. 52-58, Nov 2022. [arXiv](https://arxiv.org/abs/2203.02370)
* A. Lacava, L. Bonati, N. Mohamadi, R. Gangula, F. Kaltenberger, P. Johari, S. D'Oro, F. Cuomo, M. Polese, and T. Melodia, "dApps: Enabling Real-Time AI-Based Open RAN Control," Computer Networks, 2025. [arXiv](https://arxiv.org/abs/2501.16502)
* N. Neasamoni Santhi, D. Villa, M. Polese, and T. Melodia, "InterfO-RAN: Real-Time In-band Cellular Uplink Interference Detection with GPU-Accelerated dApps," ACM MobiHoc 2025. [arXiv](https://arxiv.org/abs/2507.23177)
* R. Gangula, A. Lacava, M. Polese, S. D'Oro, L. Bonati, F. Kaltenberger, P. Johari, and T. Melodia, "Listen-While-Talking: Toward dApp-based Real-Time Spectrum Sharing in O-RAN," IEEE MILCOM 2024 (demo). [arXiv](https://arxiv.org/abs/2407.05027)
* D. Villa, M. Belgiovine, N. Hedberg, M. Polese, C. Dick, and T. Melodia, "Programmable and GPU-Accelerated Edge Inference for Real-Time ISAC on NVIDIA Aerial Testbed," 2025. [arXiv](https://arxiv.org/abs/2512.06493)
* M. Polese, R. Gangula, and T. Melodia, "Enabling Programmable Inference and ISAC at the 6GR Edge with dApps," 2026. [arXiv](https://arxiv.org/abs/2603.29146)
* M. Elkael, M. Polese, Y. Lee, K. Furueda, and T. Melodia, "AUGUSTE: Online-Learning dApp for Predictive URLLC Scheduling," 2026. [arXiv](https://arxiv.org/abs/2606.03664)

See also: [AI-RAN](/research/ai-ran/), [spectrum sharing](/research/spectrum-sharing/), and the full [publication list](/publications/).
