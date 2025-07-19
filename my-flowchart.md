graph TD
    A[User Opens Browser] --> B(Accesses login.html)

    subgraph Frontend (Browser)
        B -- Redirects from index.html if accessed --> B
        B -- User Enters Credentials --> C{Login Attempt (login.js)}
        C -- Invalid Credentials --> D(Display Error Message)
        C -- Valid Credentials --> E(Redirect to homePage.html)

        E -- Page Loads --> F(DOMContentLoaded Event)
        F --> G(script.js: fetchTransactions())
        G -- User Enters Transaction Data --> H(script.js: Submit Form Event)

        H --> I{Validate Input?}
        I -- Invalid --> J(Alert: Invalid Input)
        I -- Valid --> K(Prepare Transaction Data for POST)

        N --> H_Error(script.js: Display API Error)
        Q --> H_Error
        P --> V(script.js: Re-fetch Transactions)
        V --> G
        T --> W(script.js: Update Transaction Table)
        W --> X(script.js: Recalculate and Display Balance)
        U --> W_Error(script.js: Display Fetch Error)
    end

    subgraph Backend (PHP Server)
        K -- AJAX POST Request (script.js) --> L(api/index.php: POST Handler)
        L -- Parse JSON Input --> M{Validate API Input?}
        M -- Invalid --> N(API Response: 400 Bad Request)
        M -- Valid --> O(Database: Insert Transaction)
        O -- Insert Success --> P(API Response: 200 OK with Saved Transaction Data)
        O -- Insert Failure --> Q(API Response: 500 Internal Server Error)

        G -- AJAX GET Request (script.js) --> R(api/index.php: GET Handler)
        R -- Fetch All Transactions --> S(Database: Select All Transactions)
        S -- Fetch Success --> T(API Response: 200 OK with Transactions Array)
        S -- Fetch Failure --> U(API (Response: 500 Internal Server Error)
    end


    %% Styling (optional, but makes it look better)
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#add8e6,stroke:#333,stroke-width:2px
    style G fill:#add8e6,stroke:#333,stroke-width:2px
    style H fill:#add8e6,stroke:#333,stroke-width:2px
    style I fill:#ffe0b2,stroke:#333,stroke-width:2px
    style J fill:#ffcdd2,stroke:#f00,stroke-width:2px
    style K fill:#add8e6,stroke:#333,stroke-width:2px
    style L fill:#d3e0ea,stroke:#333,stroke-width:2px
    style M fill:#ffe0b2,stroke:#333,stroke-width:2px
    style N fill:#ffcdd2,stroke:#f00,stroke-width:2px
    style O fill:#c2e0c6,stroke:#333,stroke-width:2px
    style P fill:#d3e0ea,stroke:#333,stroke-width:2px
    style Q fill:#ffcdd2,stroke:#f00,stroke-width:2px
    style R fill:#d3e0ea,stroke:#333,stroke-width:2px
    style S fill:#c2e0c6,stroke:#333,stroke-width:2px
    style T fill:#d3e0ea,stroke:#333,stroke-width:2px
    style U fill:#ffcdd2,stroke:#f00,stroke-width:2px
    style V fill:#add8e6,stroke:#333,stroke-width:2px
    style W fill:#add8e6,stroke:#333,stroke-width:2px
    style X fill:#add8e6,stroke:#333,stroke-width:2px
    style H_Error fill:#ffcdd2,stroke:#f00,stroke-width:2px
    style W_Error fill:#ffcdd2,stroke:#f00,stroke-width:2px