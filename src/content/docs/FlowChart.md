---
title: Projektets flödesschema
layout: "../layouts/SidebarLayout.astro"
---

# Projektets arbetsflöde

Detta flödesschema illustrerar de huvudsakliga faserna i projektets livscykel.

```mermaid
flowchart TD
    A[Start: Projektinitiering] --> B{Kravinsamling};

    B --> C[Designfas];
    C --> D[Utvecklingsfas];
    D --> E[Testfas];
    E --> F[Driftsättning];
    F --> G[Slut: Projektpresentation];

    style A fill:#66bb6a,stroke:#388e3c,stroke-width:2px;
    style G fill:#ff5252,stroke:#d32f2f,stroke-width:2px;